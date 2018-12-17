import * as proxperty from "./proxperty";
import { IRenderer } from "./render";

import Hist from "redoundo";

/** Interface of a parental `Actions` object that keeps information which
 *  is necessary to initialize `SubActions` object.
 */
export interface IActionsParent {
    /** Renderer that should be called by any `Actions` object for page re-rendering. */
    readonly Renderer: IRenderer;
    /** Object of `redoundo.Hist` class is needed for redo/undo functionality. */
    readonly History: Hist;
}

/** Class of `hyperoop` top-level actions. When you properly set new values
 *  to entries of the `State` property then the corresponding DOM element will
 *  be redrawn automatically. The correspondence between `Actions` object
 *  and this DOM element is established by `init` function call.
 */
export class Actions<S extends {}> {

    /** This property, along with the `Remember` property, is used to change
     *  the state of an application and automatically redraw the user interface.
     */
    get State(): S { return this.state; }

    /** This property has almost the same functionality as the `State` property,
     *  with the difference that changes made to it can be undone by calling the
     *  `History.undo` method.
     */
    get Remember(): S { return this.remember; }

    /** You can force redraw of the user interface by calling the `sheduleRender`
     *  method provided by this property. Usually you do not need to call it directly.
     */
    get Renderer(): IRenderer { return this.renderer; }

    /** Object of `redoundo.Hist` class is needed for redo/undo functionality. */
    public readonly History: Hist;

    private orig:     S;
    private state:    S;
    private remember: S;
    private renderer: IRenderer;

    /** Construct an `Action` object, setting the initial `state` to it and optionally describing
     *  the `hist` object of type `redoundo.Hist`. If the `hist` argument is of the `number`
     *  type, the constructor will itself create the `History` object of the given length.
     */
    constructor(start: S, hist?: number | Hist) {
        this.orig    = start;
        this.History = typeof hist === "number" ? new Hist(hist) : hist;
        this.init({scheduleRender: () => null});
    }

    /** The page is redrawn automatically every time you set a new value for any entry of the `State`
     *  property. To set values for several inputs at once with only one automatic redraw, use
     *  this method, passing it a partial description of the new state and the optional parameter
     *  `remember` (`false` by default). If the value of the parameter `remember` is set to `true`, then
     *  the changes can be undone by calling `History.undo` method.
     */
    public set(s: Partial<S>, remember: boolean = false) {
        let keys: Array<string|number>;
        if (Array.isArray(s)) {
            keys = Array.from(s.keys());
        } else {
            keys = Object.getOwnPropertyNames(s);
        }
        keys = keys.filter((k) => !(k in this.orig) || this.orig[k] !== s[k]);
        const change = keys.length > 0;
        if (!change) { return; }
        const self = this;
        if (remember && this.History) {
            const was: Partial<S> = {};
            const wasnt: Array<string|number> = [];
            for (const k of keys) {
                if (k in this.orig) {
                    was[k] = this.orig[k];
                } else { wasnt.push(k); }
            }
            this.History.add({
                Redo: () => {
                    for (const k of keys) { self.orig[k] = s[k]; }
                    self.renderer.scheduleRender();
                },
                Undo: () => {
                    for (const k in was) { self.orig[k] = was[k]; }
                    for (const k of wasnt) { delete self.orig[k]; }
                    self.renderer.scheduleRender();
                },
            });
        } else {
            for (const k of keys) { this.orig[k] = s[k]; }
            this.renderer.scheduleRender();
        }
    }

    /** This method is used to initialize the `Actions` object by an instance of the `IRenderer` interface.
     *  Usually you do not need to call it directly.
     */
    public init(r: IRenderer) {
        this.renderer = r;
        const self    = this;
        this.state    = proxperty.make(this.orig, () => self.renderer.scheduleRender());
        this.remember = proxperty.makeH(this.orig, () => self.renderer.scheduleRender(), this.History);
    }
}

/** Usually, you only need to manually initialize top-level `Action` objects (by calling the `init` function).
 * This class is used for lower level action-objects that inherit the necessary properties from higher level
 * objects. Thus, you do not need to initialize the `SubActions` of the lower levels manually.
 */
export class SubActions<S extends {}> extends Actions<S> {

    /** Construct an `Action` object, setting the initial `state` and parental `Actions`
     *  object. The last will be used for initializing new instance by renderer and history objects.
     */
    constructor(start: S, parent: IActionsParent) {
        super(start, parent.History);
        if (parent.Renderer) {
            this.init({scheduleRender: () => parent.Renderer.scheduleRender()});
        }
    }
}
