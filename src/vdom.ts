
/** The VDOM representation of an HTMLElement. */
export interface IVirtualNode<A = {}> {
    nodeName:    string;
    attributes?: A;
    children:    ChildVirtualNode[];
    key?:        string;
}

/** A ImmediateComponent is a function that returns a custom VNode. */
export type PlainComponent<A = {}> = (attributes: A, children: ChildVirtualNode[]) =>
    IVirtualNode<A>;

/** A LazyComponent is a function that returns a custom LazyVNode. */
export type LazyComponent<A = {}> = (attributes: A, children: ChildVirtualNode[]) =>
    LazyVirtualNode;

/** A Component can be lazy or immediate. */
export type Component<A = {}> = LazyComponent<A> | PlainComponent<A>;

/** Possible types of child nodes */
export type ChildVirtualNode<A = {}> = IVirtualNode<A> | string | number | null;

/** The view function describes the application UI as a tree of VNodes.
 * @returns A VNode tree.
 */
export type LazyVirtualNode = () => IVirtualNode<object>;

type ChildLike = ChildVirtualNode | ChildVirtualNode[];

function isChildren(x: ChildLike): x is ChildVirtualNode {
    return !(x as ChildVirtualNode[]).pop;
}

export function h<A>(
    name: string | PlainComponent<A>,
    attributes?: A,
    ...rest: ChildLike[]): IVirtualNode<A>;

export function h<A>(
    comp: LazyComponent<A>,
    attributes?: A,
    ...rest: ChildLike[]): LazyVirtualNode;

/** The soft way to create a VNode.
 * @param name      An element name or a Component function
 * @param attributes     Any valid HTML atributes, events, styles, and meta data
 * @param children  The children of the VNode
 * @returns A VNode tree.
 *
 */
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
