
/** The VDOM representation of an HTMLElement.
 */
export interface VNode<A = {}> {
    nodeName: string
    attributes?: A
    children: Array<ChildVNode>
    key?: string
}

/** A ImmediateComponent is a function that returns a custom VNode. */
export type ImmediateComponent<A = {}> = (attributes: A, children: Array<VNode | string>) =>
    VNode<A>;

/** A LazyComponent is a function that returns a custom LazyVNode. */
export type LazyComponent<A = {}> = (attributes: A, children: Array<VNode | string>) =>
    LazyVNode;

/** A Component can be lazy or immediate. */
export type Component<A = {}> = LazyComponent<A> | ImmediateComponent<A>;

/**
 * Possibles children types
 */
export type ChildVNode<A = {}> = VNode<A> | string | number | null


/** The view function describes the application UI as a tree of VNodes.
 * @returns A VNode tree.
 */
export type LazyVNode = () => VNode<object>;

export type ChildLike = ChildVNode | ChildVNode[];

function isChildren(x: ChildLike): x is ChildVNode {
    return !(x as ChildVNode[]).pop;
}

/** The soft way to create a VNode.
 * @param name      An element name or a Component function
 * @param attributes     Any valid HTML atributes, events, styles, and meta data
 * @param children  The children of the VNode
 * @returns A VNode tree.
 *
 */
export function h<A>(
    name: Component<A> | string,
    attributes?: A,
    ...rest: Array<ChildLike>): VNode<A> | LazyVNode {
       
    let ch = [];
    rest.reverse();
  
    while (rest.length) {
        let node = rest.pop();
        if (node && !isChildren(node)) {
            for (let i = node.length - 1; i >= 0; i--) {
                rest.push(node[i]);
            }
        } else if (node != null && (node as any as boolean) !== true && (node as any as boolean) !== false) {
            ch.push(node)
        }
    }

    if (typeof name === "function") {
        return name(attributes || ({} as A), ch);
    }
  
    const node = {
        nodeName: name,
        attributes: attributes || ({} as A),
        children: ch,
        key: attributes && (attributes as any).key
    }

    return node;
}
  
namespace utils {

    function isVNode<A>(n: ChildVNode<A>): n is VNode<A> {
        return !!(n as VNode<A>).nodeName;
    }
    
    interface HTMLElementExt extends HTMLElement {
        events: {[name in string]: (event: Event)=>void}
    };

    function clone(target: any, source: any = undefined): any {
        let out = {}
    
        for (let i in target) out[i] = target[i]
        for (let i in source) out[i] = source[i]
    
        return out
    }

    function elementToVNode(element: ChildNode): VNode {
        return {
            nodeName: element.nodeName.toLowerCase(),
            attributes: {},
            children: [].map.call(element.childNodes, function(element) {
                return element.nodeType === 3 // Node.TEXT_NODE
                ? element.nodeValue
                : elementToVNode(element)
            })
        }
    }

    function resolveNode(node: ChildVNode | LazyVNode) {
        return typeof node === "function"
            ? resolveNode(node())
            : node != null
                ? node
                : ""
    }

    function getKey(node: ChildVNode) {
        return node && isVNode(node) ? node.key : null
    }
    
    function eventListener(event: Event) {
        return (event.currentTarget as any).events[event.type](event);
    }
    
    function updateStyle(element: HTMLElementExt, value: any, oldValue: any) {
        if (typeof value === "string") {
            element.style.cssText = value
        } else {
            if (typeof oldValue === "string") oldValue = element.style.cssText = "";

            for (const key in clone(oldValue, value)) {
                let style = value == null || value[key] == null ? "" : value[key]
                if (key[0] === "-") {
                    element.style.setProperty(key, style)
                } else {
                    element.style[key] = style
                }
            }
        }
    }

    function updateEventProperty(element: HTMLElementExt, name: string, value: any, oldValue: any) {
        name = name.slice(2)

        if (element.events) {
            if (!oldValue) oldValue = element.events[name]
        } else {
            element.events = {}
        }

        element.events[name] = value

        if (value) {
            if (!oldValue) {
            element.addEventListener(name, eventListener)
            }
        } else {
            element.removeEventListener(name, eventListener)
        }
    }

    const specialAttrNames = {
        "list"       :1,
        "type"       :1,
        "draggable"  :1,
        "spellcheck" :1,
        "translate"  :1,
    };

    function updateAttribute(element: HTMLElementExt, name: string, value: any, oldValue: any, isSvg: boolean) {
        if (name === "key") return;
        if (name === "style") {
            updateStyle(element, value, oldValue);
        } else {
            if (name[0] === "o" && name[1] === "n") {
                updateEventProperty(element, name, value, oldValue);
            } else if (name in element && !(name in specialAttrNames) && !isSvg) {
                element[name] = value == null ? "" : value
            } else if (value != null && value !== false) {
                element.setAttribute(name, value)
            }

            if (value == null || value === false) {
                element.removeAttribute(name)
            }
        }
    }
    
    function removeChildren(element: ChildNode, node: ChildVNode): ChildNode {
        if (isVNode(node)) {
            let attributes = node.attributes;
            for (let i = 0; i < node.children.length; i++) {
                removeChildren(element.childNodes[i], node.children[i])
            }

            if ((attributes as any).ondestroy) {
                (attributes as any).ondestroy(element)
            }
        }
        return element
    }
    
    function removeElement(parent: ChildNode, element: ChildNode, node: ChildVNode) {
        function done() {
            parent.removeChild(removeChildren(element, node))
        }

        let cb = isVNode(node) && node.attributes && (node.attributes as any).onremove;
        if (cb) {
            cb(element, done)
        } else {
            done()
        }
    }      

    export class Renderer {
        private skipRender = false;
        private isRecycling = true;
        private lifecycle = [];
        private rootElement: ChildNode;
        private oldNode: VNode;
        private view: LazyVNode;
        private container: HTMLElement | null;
        private action: IActionInitializer;

        constructor(container: HTMLElement | null, view: LazyVNode, action: IActionInitializer) {
            this.container = container;
            this.view = view;
            this.rootElement = (container && container.children[0]) || null
            this.oldNode = this.rootElement && elementToVNode(this.rootElement)
            this.action = action;
        }

        render(): VNode {
            this.skipRender = !this.skipRender

            let node = resolveNode(() => {
                if (this.action) this.action.init(this);
                return this.view();
            });

            
            if (this.container && !this.skipRender) {
                this.rootElement = this.patch(this.container, this.rootElement, this.oldNode, (this.oldNode = node))
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

        private createElement(node: ChildVNode, isSvg: boolean) {
            let element: HTMLElement | SVGElement | Text = null;
            if (typeof node === "string" || typeof node === "number") {
                element = document.createTextNode(""+node)
            } else if (isSvg = isSvg || node.nodeName === "svg") {
                element = document.createElementNS("http://www.w3.org/2000/svg", node.nodeName)
            } else {
                element = document.createElement(node.nodeName);
            }
            
            if (isVNode(node)) {
                let attributes = node.attributes;
                if (attributes) {
                    if ((attributes as any).oncreate) {
                        this.lifecycle.push(() => (attributes as any).oncreate(element));
                    }
              
                    for (let i = 0; i < node.children.length; i++) {
                        element.appendChild(
                            this.createElement(
                                (node.children[i] = resolveNode(node.children[i])),
                                isSvg
                            )
                        )
                    }
              
                    for (let name in attributes) {
                        updateAttribute(element as HTMLElementExt, name, attributes[name], null, isSvg)
                    }
                }
            }
      
            return element;
        }

        private updateElement<A>(element: ChildNode, oldAttributes: A, attributes: A, isSvg: boolean) {
            for (let name in clone(oldAttributes, attributes)) {
                const needUpdate = attributes[name] !== 
                    (name === "value" || name === "checked" ? element[name] : oldAttributes[name]);

                if (needUpdate) {
                    updateAttribute(element as HTMLElementExt, name, attributes[name], oldAttributes[name], isSvg)
                }
            }
      
            let cb = this.isRecycling ? (attributes as any).oncreate : (attributes as any).onupdate;
            if (cb) {
                this.lifecycle.push(() => cb(element, oldAttributes));
            }
        }

        private patchNewNode(parent: ChildNode, element: ChildNode, oldNode: ChildVNode, node: ChildVNode, isSvg: boolean): ChildNode {
            let newElement = this.createElement(node, isSvg)
            parent.insertBefore(newElement, element);

            if (oldNode != null) {
                removeElement(parent, element, oldNode)
            }
  
            return newElement;
        }

        private patchChildren(element: ChildNode, oldNode: VNode, node: VNode, isSvg: boolean = false): ChildNode {
            this.updateElement(element, oldNode.attributes, node.attributes,
                (isSvg = isSvg || node.nodeName === "svg")
            )

            let oldKeyed = {}
            let newKeyed = {}
            let oldElements = []
            let oldChildren = oldNode.children
            let children = node.children

            for (let i = 0; i < oldChildren.length; i++) {
                oldElements[i] = element.childNodes[i]

                let oldKey = getKey(oldChildren[i])
                if (oldKey != null) {
                    oldKeyed[oldKey] = [oldElements[i], oldChildren[i]]
                }
            }

            let i = 0;
            let k = 0;

            while (k < children.length) {
                let oldKey = getKey(oldChildren[i])
                let newKey = getKey((children[k] = resolveNode(children[k])))

                if (newKeyed[oldKey]) {
                    i++
                    continue
                }

                if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
                    if (oldKey == null) {
                        removeElement(element, oldElements[i], oldChildren[i])
                    }
                    i++
                    continue
                }

                if (newKey == null || this.isRecycling) {
                    if (oldKey == null) {
                        this.patch(element, oldElements[i], oldChildren[i], children[k], isSvg)
                        k++
                    }
                    i++
                } else {
                    let keyedNode = oldKeyed[newKey] || []

                    if (oldKey === newKey) {
                        this.patch(element, keyedNode[0], keyedNode[1], children[k], isSvg)
                        i++
                    } else if (keyedNode[0]) {
                        var el = element.insertBefore(keyedNode[0], oldElements[i]);
                        this.patch(
                            element,
                            el,
                            keyedNode[1],
                            children[k],
                            isSvg
                        )
                    } else {
                        this.patch(element, oldElements[i], null, children[k], isSvg)
                    }

                    newKeyed[newKey] = children[k]
                    k++
                }
            }

            while (i < oldChildren.length) {
                if (getKey(oldChildren[i]) == null) {
                    removeElement(element, oldElements[i], oldChildren[i])
                }
                i++
            }

            for (let i in oldKeyed) {
                if (!newKeyed[i]) {
                    removeElement(element, oldKeyed[i][0], oldKeyed[i][1])
                }
            }

            return element;
        }

        private patch(parent: ChildNode, element: ChildNode, oldNode: ChildVNode, node: ChildVNode, isSvg: boolean = false) {
            if (node === oldNode) return element;
    
            if (oldNode == null || ((oldNode as any).nodeName !== (node as any).nodeName)) {
                element = this.patchNewNode(parent, element, oldNode, node, isSvg)
            } else if ((!isVNode(oldNode) || oldNode.nodeName == null) && !isVNode(node)) {
                element.nodeValue = ""+node
            } else if (isVNode(node) && isVNode(oldNode)) {
                element = this.patchChildren(element, oldNode, node, isSvg);
            } else {
                throw new Error("Mom, what this 'patch' wants???")
            }
            return element
        }  
    }
}

export interface IRenderer {
    scheduleRender();
}

export interface IActionInitializer {
    init(r: IRenderer)
}

/** The init() call creates and renders a new application.
 *
 * @param container The DOM element where the app will be rendered to.
 * @param view The view function.
 * @returns The actions wired to the application.
 */
export function init(container: HTMLElement | null, view: LazyVNode, action: IActionInitializer): IRenderer {
    const renderer = new utils.Renderer(container, view, action);
    renderer.scheduleRender();
    return renderer;
}