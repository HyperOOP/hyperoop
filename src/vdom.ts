
/** The VDOM representation of an `HTMLElement`. */
export interface IVirtualNode<A = {}> {
    nodeName:    string;
    attributes?: A;
    children:    ChildVirtualNode[];
    key?:        string;
}

/** This is a lazy analog of `IVirtualNode`. The difference between two is that the lazy
 *  virtual node calculates its properties immediately before rendering of the corresponding
 *  DOM node, while any instance of `IVirtualNode` is known in the very beginning of the rendering.
 */
export type LazyVirtualNode = () => IVirtualNode;

/** Plain component is a function that returns a custom `IVirtualNode`. */
export type PlainComponent<A = {}> = (attributes: A, children: ChildVirtualNode[]) =>
    IVirtualNode<A>;

/** Lazy component function that returns a custom `LazyVirtualNode`. */
export type LazyComponent<A = {}> = (attributes: A, children: ChildVirtualNode[]) =>
    LazyVirtualNode;

/** A component can be plain or lazy. */
export type Component<A = {}> = LazyComponent<A> | PlainComponent<A>;

/** Possible types of child nodes of VDOM tree. */
export type ChildVirtualNode<A = {}> = IVirtualNode<A> | string | number | null;

/** Type of JSX Factory's `children` argument. */
export type ChildLike = ChildVirtualNode | ChildVirtualNode[];

function isChildren(x: ChildLike): x is ChildVirtualNode {
    return !(x as ChildVirtualNode[]).pop;
}

/** A JSX factory function that creates an `IVirtualNode` based on a given `name`, which
 * can be of type `string` or `PlainComponent`, an optional `attributes` and a `children`
 * argument  that describes some set of child virtual nodes.
 */
export function h<A>(
    name: string | PlainComponent<A>,
    attributes?: A,
    ...children: ChildLike[]): IVirtualNode<A>;

/** A JSX factory function that creates an `LazyVirtualNode` based on `comp` -- a given `LazyComponent`,
 *  an optional `attributes` and a `children` argument that describes some set of child virtual nodes.
 */
export function h<A>(
    comp: LazyComponent<A>,
    attributes?: A,
    ...children: ChildLike[]): LazyVirtualNode;

export function h<A>(
    name: string | Component<A>,
    attributes?: A,
    ...rest: ChildLike[]): IVirtualNode<A> | LazyVirtualNode {

    const ch = [];
    rest.reverse();

    while (rest.length) {
        const nod = rest.pop();
        if (nod && !isChildren(nod)) {
            for (let i = nod.length - 1; i >= 0; i--) {
                rest.push(nod[i]);
            }
        } else if (nod != null && (nod as any as boolean) !== true && (nod as any as boolean) !== false) {
            ch.push(nod);
        }
    }

    if (typeof name === "function") {
        return name(attributes || ({} as A), ch);
    }

    const node = {
        attributes: attributes || ({} as A),
        children: ch,
        key: attributes && (attributes as any).key,
        nodeName: name,
    };

    return node;
}

export type JSXFactory = typeof h;
