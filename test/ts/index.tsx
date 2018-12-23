import * as ui from "hyperoop";
import Hist from "redoundo";

export const ref1: ui.IVirtualNode<{href: string}> = (<a href="#"/>);
export const ref2: ui.LazyVirtualNode = () => (<a href="#"/>);
export const ref3: ui.Component<{href: string}> = (a: {href: string}) => (<a/>);
export const ref4: ui.Component<{href: string}> = (a: {href: string}) => () => (<a/>);
export const ref5: ui.Component<{href: string}> = (a: {href: string}) => (<ref3 href={a.href}/>);
export const ref6: ui.Component<{href: string}> = (a: {href: string}) => (<ref4 href={a.href}/>);
export const ref7: ui.Component<{href: string}> = (a: {href: string}) => () => (<ref3 href={a.href}/>);
export const ref8: ui.Component<{href: string}> = (a: {href: string}) => () => (<ref4 href={a.href}/>);

interface IState {
    x: string;
}

class SubActions extends ui.SubActions<any> {}

class Actions extends ui.Actions<IState> {
    public sub: SubActions;
    constructor(s: IState) {
        super(s, new Hist(50));
        this.sub = new SubActions({}, this);
    }
}

const actions = new Actions({x: "Hello"});
const view: ui.LazyVirtualNode = () => (
    <ref8 href="#">
        <ref7 href="#">
            <ref6 href="#">
                <ref5 href="#">
                    <ref4 href="#">
                        <ref3 href="#">
                            <ref2 href="#">
                                <ref1 href="#">
                                </ref1>
                            </ref2>
                        </ref3>
                    </ref4>
                </ref5>
            </ref6>
        </ref7>
    </ref8>);

ui.init(document.body, view, actions);

actions.State.x = "OK";
actions.Remember.x = "OK";
actions.Renderer.scheduleRender();
actions.set({x: "OK"});
actions.History.redo();
actions.History.undo();
actions.sub.State.y = "OK";
actions.sub.Remember.y = "OK";
actions.sub.Renderer.scheduleRender();
actions.sub.init(actions.Renderer);
actions.sub.set({y: "OK"});
actions.sub.History.redo();
actions.sub.History.undo();
