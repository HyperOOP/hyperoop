import * as hyperapp  from 'hyperapp'
import * as proxperty from './proxperty'
import * as history   from './history'

import History from './history'

type Spin = {
    Value: boolean;
}

export type Renderer = {
    render: ()=>(spin: Spin)=>Spin;
}

export function component<T>(f: (args: T)=>any): (args: T)=>(spin: Spin, render: Renderer)=>any {
    return (args: T)=>(spin: Spin, render: Renderer)=>f(args);
}

export function init(el: HTMLElement, view: hyperapp.View<Spin, Renderer>) {
    let r_: Renderer = {
        render: () => (spin: Spin) => {
          return { Value: !spin.Value };
        }
    }
    hyperapp.app({Value: true}, r_, view, el)
}

export let h = hyperapp.h;

export function view<S extends object, A extends Actions<S>>(a: A, v: ()=>hyperapp.VNode<object>): (spin: Spin, render: Renderer) => hyperapp.VNode<object>{
    return (spin, renderer) => {
        a.init(renderer);
        return v();
    }
}

export class Actions<S extends object> {
    State:    S;
    Remember: S;
    Renderer: Renderer;

    readonly History: History;

    constructor(start: S, hist: number | History = null) {
        this.State = start;
        this.Remember = null;
        this.Renderer = null;
        this.History = null;

        if (!hist) return;
        if (typeof hist === 'number') {
            this.History = history.makeHistory(hist);
        } else {
            this.History = hist;
        }
    }

    init(renderer: Renderer): boolean {
        if (!this.Renderer)  {
            this.Renderer = renderer;
            let s = proxperty.make(this.State, renderer.render);
            let r = proxperty.makeH(this.State, renderer.render, this.History);
            this.State = s;
            this.Remember = r;
        }
        return true;
    }
}
