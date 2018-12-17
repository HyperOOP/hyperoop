import { ChildVirtualNode, IVirtualNode, LazyVirtualNode } from "./vdom";

function isVNode<A>(n: ChildVirtualNode<A>): n is IVirtualNode<A> {
    return !!(n as IVirtualNode<A>).nodeName;
}

interface IHTMLElementExt extends HTMLElement {
    events: {[name in string]: (event: Event) => void};
}

function clone(target: any, source?: any): any {
    const out = {};

    for (const i in target) { out[i] = target[i]; }
    for (const i in source) { out[i] = source[i]; }

    return out;
}

function elementToVNode(element: ChildNode): IVirtualNode {
    return {
        attributes: {},
        children: [].map.call(element.childNodes,
            (el) => el.nodeType === 3 // Node.TEXT_NODE
                ? el.nodeValue
                : elementToVNode(el)),
        nodeName: element.nodeName.toLowerCase(),
    };
}

function resolveNode(node: ChildVirtualNode | LazyVirtualNode) {
    return typeof node === "function"
        ? resolveNode(node())
        : node != null
            ? node
            : "";
}

function getKey(node: ChildVirtualNode) {
    return node && isVNode(node) ? node.key : null;
}

function eventListener(event: Event) {
    return (event.currentTarget as any).events[event.type](event);
}

function updateStyle(element: IHTMLElementExt, value: any, oldValue: any) {
    if (typeof value === "string") {
        element.style.cssText = value;
    } else {
        if (typeof oldValue === "string") { oldValue = element.style.cssText = ""; }

        for (const key in clone(oldValue, value)) {
            const style = value == null || value[key] == null ? "" : value[key];
            if (key[0] === "-") {
                element.style.setProperty(key, style);
            } else {
                element.style[key] = style;
            }
        }
    }
}

function updateEventProperty(element: IHTMLElementExt, name: string, value: any, oldValue: any) {
    name = name.slice(2);

    if (element.events) {
        if (!oldValue) { oldValue = element.events[name]; }
    } else {
        element.events = {};
    }

    element.events[name] = value;

    if (value) {
        if (!oldValue) { element.addEventListener(name, eventListener); }
    } else {
        element.removeEventListener(name, eventListener);
    }
}

const specialAttrNames = {
    draggable  : 1,
    list       : 1,
    spellcheck : 1,
    translate  : 1,
    type       : 1,
};

function updateAttribute(element: IHTMLElementExt, name: string, value: any, oldValue: any, isSvg: boolean) {
    if (name === "key") { return; }
    if (name === "style") {
        updateStyle(element, value, oldValue);
    } else {
        if (name[0] === "o" && name[1] === "n") {
            updateEventProperty(element, name, value, oldValue);
        } else if (name in element && !(name in specialAttrNames) && !isSvg) {
            element[name] = value == null ? "" : value;
        } else if (value != null && value !== false) {
            element.setAttribute(name, value);
        }

        if (value == null || value === false) {
            element.removeAttribute(name);
        }
    }
}

function removeChildren(element: ChildNode, node: ChildVirtualNode): ChildNode {
    if (isVNode(node)) {
        const attributes = node.attributes;
        for (let i = 0; i < node.children.length; i++) {
            removeChildren(element.childNodes[i], node.children[i]);
        }

        if ((attributes as any).ondestroy) {
            (attributes as any).ondestroy(element);
        }
    }
    return element;
}

function removeElement(parent: ChildNode, element: ChildNode, node: ChildVirtualNode) {
    function done() {
        parent.removeChild(removeChildren(element, node));
    }

    const cb = isVNode(node) && node.attributes && (node.attributes as any).onremove;
    if (cb) {
        cb(element, done);
    } else {
        done();
    }
}

export class Renderer {
    private skipRender = false;
    private isRecycling = true;
    private lifecycle = [];
    private rootElement: ChildNode;
    private oldNode: IVirtualNode;
    private view: LazyVirtualNode;
    private container: HTMLElement | null;
    private action: IActionInitializer;

    constructor(container: HTMLElement | null, view: LazyVirtualNode, action: IActionInitializer) {
        this.container = container;
        this.view = view;
        this.rootElement = (container && container.children[0]) || null;
        this.oldNode = this.rootElement && elementToVNode(this.rootElement);
        this.action = action;
    }

    public render(): IVirtualNode {
        this.skipRender = !this.skipRender;

        const node = resolveNode(() => {
            if (this.action) { this.action.init(this); }
            return this.view();
        });

        if (this.container && !this.skipRender) {
            this.rootElement = this.patch(this.container, this.rootElement, this.oldNode, (this.oldNode = node));
        }

        this.isRecycling = false;
        while (this.lifecycle.length) {
            this.lifecycle.pop()();
        }
        return node;
    }

    public scheduleRender() {
        if (!this.skipRender) {
            this.skipRender = true;
            setTimeout(this.render.bind(this));
        }
    }

    private createElement(node: ChildVirtualNode, isSvg: boolean) {
        let element: HTMLElement | SVGElement | Text = null;
        if (typeof node === "string" || typeof node === "number") {
            element = document.createTextNode("" + node);
        } else {
            isSvg = isSvg || node.nodeName === "svg";
            if (isSvg) {
                element = document.createElementNS("http://www.w3.org/2000/svg", node.nodeName);
            } else {
                element = document.createElement(node.nodeName);
            }
        }

        if (isVNode(node)) {
            const attributes = node.attributes;
            if (attributes) {
                if ((attributes as any).oncreate) {
                    this.lifecycle.push(() => (attributes as any).oncreate(element));
                }

                for (let i = 0; i < node.children.length; i++) {
                    element.appendChild(
                        this.createElement(
                            (node.children[i] = resolveNode(node.children[i])),
                            isSvg,
                        ),
                    );
                }

                for (const name in attributes) {
                    updateAttribute(element as IHTMLElementExt, name, attributes[name], null, isSvg);
                }
            }
        }

        return element;
    }

    private updateElement<A>(element: ChildNode, oldAttributes: A, attributes: A, isSvg: boolean) {
        for (const name in clone(oldAttributes, attributes)) {
            const needUpdate = attributes[name] !==
                (name === "value" || name === "checked" ? element[name] : oldAttributes[name]);

            if (needUpdate) {
                updateAttribute(element as IHTMLElementExt, name, attributes[name], oldAttributes[name], isSvg);
            }
        }

        const cb = this.isRecycling ? (attributes as any).oncreate : (attributes as any).onupdate;
        if (cb) {
            this.lifecycle.push(() => cb(element, oldAttributes));
        }
    }

    private patchNewNode(
        parent: ChildNode, element: ChildNode, oldNode: ChildVirtualNode,
        node: ChildVirtualNode, isSvg: boolean,
    ): ChildNode {

        const newElement = this.createElement(node, isSvg);
        parent.insertBefore(newElement, element);

        if (oldNode != null) {
            removeElement(parent, element, oldNode);
        }

        return newElement;
    }

    private patchChildren(
        element: ChildNode, oldNode: IVirtualNode, node: IVirtualNode, isSvg: boolean = false,
    ): ChildNode {

        isSvg = isSvg || node.nodeName === "svg";
        this.updateElement(element, oldNode.attributes, node.attributes, isSvg);

        const oldKeyed = {};
        const newKeyed = {};
        const oldElements = [];
        const oldChildren = oldNode.children;
        const children = node.children;

        for (let j = 0; j < oldChildren.length; j++) {
            oldElements[j] = element.childNodes[j];

            const oldKey = getKey(oldChildren[j]);
            if (oldKey != null) {
                oldKeyed[oldKey] = [oldElements[j], oldChildren[j]];
            }
        }

        let i = 0;
        let k = 0;

        while (k < children.length) {
            const oldKey = getKey(oldChildren[i]);
            const newKey = getKey((children[k] = resolveNode(children[k])));

            if (newKeyed[oldKey]) {
                i++;
                continue;
            }

            if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
                if (oldKey == null) {
                    removeElement(element, oldElements[i], oldChildren[i]);
                }
                i++;
                continue;
            }

            if (newKey == null || this.isRecycling) {
                if (oldKey == null) {
                    this.patch(element, oldElements[i], oldChildren[i], children[k], isSvg);
                    k++;
                }
                i++;
            } else {
                const keyedNode = oldKeyed[newKey] || [];

                if (oldKey === newKey) {
                    this.patch(element, keyedNode[0], keyedNode[1], children[k], isSvg);
                    i++;
                } else if (keyedNode[0]) {
                    const el = element.insertBefore(keyedNode[0], oldElements[i]);
                    this.patch(element, el, keyedNode[1], children[k], isSvg);
                } else {
                    this.patch(element, oldElements[i], null, children[k], isSvg);
                }

                newKeyed[newKey] = children[k];
                k++;
            }
        }

        while (i < oldChildren.length) {
            if (getKey(oldChildren[i]) == null) {
                removeElement(element, oldElements[i], oldChildren[i]);
            }
            i++;
        }

        for (const j in oldKeyed) {
            if (!newKeyed[j]) {
                removeElement(element, oldKeyed[j][0], oldKeyed[j][1]);
            }
        }

        return element;
    }

    private patch(
        parent: ChildNode, element: ChildNode, oldNode: ChildVirtualNode,
        node: ChildVirtualNode, isSvg: boolean = false,
    ) {
        if (node === oldNode) { return element; }

        if (oldNode == null || ((oldNode as any).nodeName !== (node as any).nodeName)) {
            element = this.patchNewNode(parent, element, oldNode, node, isSvg);
        } else if ((!isVNode(oldNode) || oldNode.nodeName == null) && !isVNode(node)) {
            element.nodeValue = "" + node;
        } else if (isVNode(node) && isVNode(oldNode)) {
            element = this.patchChildren(element, oldNode, node, isSvg);
        } else {
            throw new Error("Mom, what this 'patch' wants???");
        }
        return element;
    }
}

/** Renderer interface. You may use it in order to manually shedule re-rendering. */
export interface IRenderer {
    scheduleRender();
}

export interface IActionInitializer {
    init(r: IRenderer);
}
