import Hist from 'redoundo';

export function make<T extends object>(target: T, after: ()=>void): T {
    return new Proxy<T>(target, {
        set: (target, k, v) => {
            if (k in target && target[k] === v) return true;
            target[k] = v;
            after();
            return true;
        },

        deleteProperty: (target, k) => {
            if (k in target) {
                delete target[k];
                after();
            }
            return true;
        }
    });
}

export function makeH<T extends object>(target: T, after: ()=>void, hist: Hist): T {
    if (!hist) return null;
    return new Proxy<T>(target, {
        set: (target, k, v) => {
            let was = k in target;
            let oldVal = null;
            if (was) {
                oldVal = target[k];
                if (oldVal === v) return true;
            }
            let redo = ()=>{
                target[k] = v;
                after();
            };
            let undo = ()=>{
                if (was) target[k] = oldVal;
                else delete target[k];
                after();
            };
            hist.add({ Redo: redo, Undo: undo })
            return true;
        },

        deleteProperty: (target, k) => {
            if (!(k in target)) return true;
            let v = target[k];
            let redo = ()=>{
                delete target[k];
                after();
            };
            let undo = ()=>{
                target[k] = v;
                after();
            };
            hist.add({ Redo: redo, Undo: undo })
            return true;
        }
    });
}