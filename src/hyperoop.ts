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

/** The init() call creates and renders a new application.
 *
 * @param container The DOM element where the app will be rendered to.
 * @param view The view function.
 * @returns The actions wired to the application.
 */
export function init(container: HTMLElement, view: LazyVirtualNode, action: IActionInitializer): IRenderer {
    const renderer = new Renderer(container, view, action);
    renderer.scheduleRender();
    return renderer;
}
