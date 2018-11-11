import * as hyperapp  from 'hyperapp';
import * as proxperty from './proxperty';

import Hist from 'redoundo';

type Spin = {
    Value: boolean;
}

/** Type of renderer that should be called for page re-rendering. */
export type Renderer = {
    render: ()=>(spin: Spin)=>Spin;
}

/** JSX factory function, creates `VNode`s */
export let h = hyperapp.h;

/** VDOM representation of an `Element`. */
export type VNode<A> = hyperapp.VNode<A>;

/** The view function describes the application UI as a tree of VNodes. */
export type View = hyperapp.View<Spin, Renderer>;

/** Creates `View` object
 * 
 * @param a `Actions` object
 * @param v function that returns a VDOM tree
 */
export function view<S extends object, A extends Actions<S>>(a: A, v: ()=>VNode<object>): View {
    return (spin, renderer) => {
        if (a) a.init(renderer);
        return v();
    }
}

let renderer: Renderer = { render:() => s => ({Value: !s.Value}) };

/** initialize DOM element with a hyperoop `View`
 * 
 * @param el 
 * @param view 
 */
export function init(el: HTMLElement, view: View) {
    hyperapp.app({Value: true}, renderer, view, el)
}

/** Interface of a parental `Actions` */
export interface ActionsParentI {
    /** renderer that should be called for page re-rendering */
    readonly Renderer: Renderer ;
    /** `redoundo.Hist` object for redo/undo functionality */
    readonly History:  Hist;
}

/** Class of hyperoop top-level action */
export class Actions<S extends object> {
    private orig_:     S;
    private state_:    S;
    private remember_: S;
    private renderer_: Renderer;

    /** state object */
    get State():    S { return this.state_ }
    /** state object that remember previous states and has redo/undo functionality */
    get Remember(): S { return this.remember_ }
    /** renderer that should be called for page re-rendering */
    get Renderer(): Renderer { return this.renderer_ }
    
    /** `redoundo.Hist` object implements redo/undo functionality */
    readonly History:  Hist;

    /** Construct an `Actions` object
     * 
     * @param start state on start
     * @param hist `redoundo.Hist` object implements redo/undo functionality
     */
    constructor(start: S, hist: number | Hist = null) {
        this.orig_     = start;
        this.History   = typeof hist === 'number' ? new Hist(hist) : hist;
        this.init(renderer);
    }

    /** Partially sets a new state
     * 
     * @param s new state data
     * @param remember remember previous state using `redoundo.Hist` or not?
     */
    set(s: Partial<S>, remember: boolean = false) {
        let change = Object.getOwnPropertyNames(s).filter(
            k => !(k in this.orig_) || this.orig_[k] !== s[k]
        ).length > 0;
        if (!change) return;
        let self = this;
        if (remember && this.History) {
            let was: Partial<S> = {};
            for (let k in this.state_) {
                if (k in s) was[k] = this.orig_[k];
            }
            this.History.add({
                Redo: ()=>{
                    for (let k in s) self.orig_[k] = s[k];
                    self.renderer_.render();
                },
                Undo: ()=>{
                    for (let k in was) self.orig_[k] = was[k];
                    self.renderer_.render();
                }
            })
        }
        else {
            for (let k in s) this.orig_[k] = s[k];
            this.renderer_.render();
        }
    }

    /** Initialize `Actions` with new renderer
     * 
     * @param r 
     */
    init(r: Renderer) {
        this.renderer_ = r;
        let self = this;
        this.state_    = proxperty.make(this.orig_, ()=>self.renderer_.render());
        this.remember_ = proxperty.makeH(this.orig_, ()=>self.renderer_.render(), this.History);
    }
}

/** Class of hyperoop sub-actions */
export class SubActions<S extends object> extends Actions<S> {
    
    /** Constructs `SubActions` object inheriting `History` and `Renderer` from a parent.
     *  NOTE! If `SubActions` object created before first rendering then you will need 
     *  to call it's `init` manually.
     * 
     * @param start state on start
     * @param parent parent `(Sub)Actions` object.
     */
    constructor(start: S, parent: ActionsParentI) {
        super(start, parent.History);
        if (parent.Renderer) {
            this.init({render: () => parent.Renderer.render()});
        }
    }
}