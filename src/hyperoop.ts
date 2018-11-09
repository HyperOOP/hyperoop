import * as hyperapp  from 'hyperapp';
import * as proxperty from './proxperty';

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

export function view<S extends object, A extends Actions<S>>(a: A, v: ()=>VNode<object>): (spin: Spin, render: Renderer) => VNode<object>{
    return (spin, renderer) => {
        a.init(renderer);
        return v();
    }
}

export function component<T>(f: (args: T)=>any): (args: T)=>(spin: Spin, render: Renderer)=>any {
    return (args: T)=>(spin: Spin, render: Renderer)=>f(args);
}

export function init(el: HTMLElement, view: View) {
    let r_: Renderer = {
        render: () => (spin: Spin) => {
          return { Value: !spin.Value };
        }
    }
    hyperapp.app({Value: true}, r_, view, el)
}

export interface ActionsParentI {
    readonly Renderer: Renderer ;
    readonly History:  Hist;
}

export class Actions<S extends object> {
    private orig_:     S;
    private state_:    S;
    private remember_: S;
    private renderer_: Renderer;

    get State():    S { return this.state_ }
    get Remember(): S { return this.remember_ }
    get Renderer(): Renderer { return this.renderer_ }
    
    readonly History:  Hist;

    constructor(start: S, hist: number | Hist = null) {
        this.state_    = start;
        this.orig_     = start;
        this.remember_ = start;
        this.renderer_ = null;
        this.History   = typeof hist === 'number' ? new Hist(hist) : hist;
    }

    set(s: Partial<S>, remember: boolean = false) {
        let change = Object.getOwnPropertyNames(s).filter(
            k => !(k in this.orig_) || this.orig_[k] !== s[k]
        ).length > 0;
        if (!change) return;
        if (remember && this.History) {
            let was: Partial<S> = {};
            for (let k in this.state_) {
                if (k in s) was[k] = this.orig_[k];
            }
            let self = this;
            this.History.add({
                Redo: ()=>{
                    for (let k in s) self.orig_[k] = s[k];
                    self.Renderer.render();
                },
                Undo: ()=>{
                    for (let k in was) self.orig_[k] = was[k];
                    self.Renderer.render();
                }
            })
        }
        else {
            for (let k in s) this.orig_[k] = s[k];
            this.Renderer.render();
        }
    }

    init(renderer: Renderer) {
        if (this.renderer_) return;

        this.renderer_ = renderer;
        this.state_    = proxperty.make(this.orig_, renderer.render);
        this.remember_ = proxperty.makeH(this.orig_, renderer.render, this.History);
    }
}

export class SubActions<S extends object> extends Actions<S> {
    constructor(start: S, parent: ActionsParentI) {
        super(start, parent.History);
        if (parent.Renderer) {
            this.init(parent.Renderer);
        }
    }
}