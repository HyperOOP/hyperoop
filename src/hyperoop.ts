import * as hyperapp  from 'hyperapp';

import Hist from 'redoundo';

type Spin = {
    Value: boolean;
}

export type Renderer = {
    render: ()=>(spin: Spin)=>Spin;
}

export let h = hyperapp.h;
export type VNode<A> = hyperapp.VNode<A>;
export type View = hyperapp.View<Spin, Renderer>;

export interface ActionsParent {
    readonly Renderer: Renderer ;
    readonly History:  Hist;
}

export interface Actions<S extends object> extends ActionsParent {
    readonly State:    S;
    readonly Remember: S;

    set(s: Partial<S>, remember?: boolean);
    init(renderer: Renderer);
}

export let view = <S extends object, A extends Actions<S>>(a: A, v: ()=>VNode<object>):
    (spin: Spin, render: Renderer) => VNode<object> =>
        (spin, renderer) => {
            a.init(renderer);
            return v();
        }

export let component = <T>(f: (args: T)=>any):
    (args: T)=>(spin: Spin, render: Renderer) => any =>
        (args: T)=>(spin: Spin, render: Renderer)=>f(args);

export let init = (el: HTMLElement, view: View) => 
    hyperapp.app({Value: true}, {
        render: () => (spin: Spin) => ({ Value: !spin.Value })
    }, view, el)

export let actions = <S extends object>(start: S, hist: number | Hist = null): Actions<S> => {
    let orig_     = start;
    let renderer_ = null;
    let hist_     = typeof hist === 'number' ? new Hist(hist) : hist;

    let setOne = (k: keyof S, v: S[keyof S], remember: boolean = false): void => {
        let was = k in orig_;
        let old = was ? orig_[k] : null;
        if (was && old === v) return;
        if (remember) {
            hist_.add({
                Redo() {
                    orig_[k] = v;
                    renderer_.render();
                },
                Undo() {
                    if (was) orig_[k] = old;
                    else delete orig_[k];
                    renderer_.render();
                }
            })
        } else {
            orig_[k] = v;
            renderer_.render();
        }
    }

    return {
        set(s: Partial<S>, remember: boolean = false) {
            let change = Object.getOwnPropertyNames(s).filter(
                k => !(k in orig_) || orig_[k] !== s[k]
            ).length > 0;
            if (!change) return;
            if (remember && hist_) {
                let was: Partial<S> = {};
                for (let k in orig_) {
                    if (k in s) was[k] = orig_[k];
                }
                hist_.add({
                    Redo: ()=>{
                        for (let k in s) orig_[k] = s[k];
                        renderer_.render();
                    },
                    Undo: ()=>{
                        for (let k in was) orig_[k] = was[k];
                        renderer_.render();
                    }
                })
            }
            else {
                for (let k in s) orig_[k] = s[k];
                renderer_.render();
            }
        },

        init(renderer: Renderer) {
            renderer_ = renderer;
        },

        get History() { return hist_ },
        get Renderer() { return renderer_ },
        get Remember() { return new Proxy<S>(orig_, {
                set(target: S, k: keyof S, v: S[keyof S]) {
                    setOne(k, v, true);
                    return true;
                }
            })
        },
        get State(): S {
            return new Proxy<S>(orig_, {
                set(target: S, k: keyof S, v: S[keyof S]) {
                    setOne(k, v);
                    return true;
                }
            });
        }
    }
}

export let subActions = <S extends object>(start: S, parent: ActionsParent) => {
    let self = actions(start, parent.History);
    if (parent.Renderer) self.init(parent.Renderer);
    return self;
}