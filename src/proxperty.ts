import Hist from "redoundo";

/**
 * Creates Proxy that calls `after` callback after set or delete entries of a `target`.
 *
 *
 * @param target target object
 * @param after callback to execute after set or delete entries of `target`
 */
export function make<T extends object>(target: T, after: () => void): T {
    return new Proxy<T>(target, {
        set: (t, k, v) => {
            if (k in t && t[k] === v) { return true; }
            t[k] = v;
            after();
            return true;
        },

        deleteProperty: (t, k) => {
            if (k in t) {
                delete t[k];
                after();
            }
            return true;
        },
    });
}

/**
 * Creates Proxy that calls `after` callback after set or delete entries of a `target`.
 * Set or delete actions can be (re, un)done using `redoundo.Hist` argument.
 *
 * @param target target object
 * @param after callback to execute after set or delete entries of `target`
 * @param hist `redoundo.Hist` object
 */
export function makeH<T extends object>(target: T, after: () => void, hist: Hist): T {
    if (!hist) { return null; }
    return new Proxy<T>(target, {
        set: (t, k, v) => {
            const was = k in target;
            let oldVal = null;
            if (was) {
                oldVal = target[k];
                if (oldVal === v) { return true; }
            }
            const redo = () => {
                target[k] = v;
                after();
            };
            const undo = () => {
                if (was) {
                    target[k] = oldVal;
                } else { delete target[k]; }
                after();
            };
            hist.add({ Redo: redo, Undo: undo });
            return true;
        },

        deleteProperty: (t, k) => {
            if (!(k in t)) { return true; }
            const v = t[k];
            const redo = () => {
                delete t[k];
                after();
            };
            const undo = () => {
                t[k] = v;
                after();
            };
            hist.add({ Redo: redo, Undo: undo });
            return true;
        },
    });
}
