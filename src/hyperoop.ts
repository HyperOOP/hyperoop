export {
    h,
    IVirtualNode,
    JSXFactory,
    LazyVirtualNode,
    PlainComponent,
    LazyComponent,
    Component,
} from "./vdom";

export { IRenderer } from "./render";

export {Actions, IActionsParent, SubActions} from "./actions";

import { IActionInitializer, IRenderer, Renderer } from "./render";
import { LazyVirtualNode } from "./vdom";

/** Initialize DOM element `container` with virtual node `view` and optional
 *  `Actions` object `actions`. Calling this function is the only and necessary
 *  method of attaching a virtual tree to a DOM element.
 */
export function init(container: HTMLElement, view: LazyVirtualNode, action?: IActionInitializer): IRenderer {
    const renderer = new Renderer(container, view, action);
    renderer.scheduleRender();
    return renderer;
}
