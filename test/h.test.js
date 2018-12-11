const ui = require("./dist/hyperoop");

test("empty vnode", () => {
  expect(ui.h("div")).toEqual({
    nodeName: "div",
    attributes: {},
    children: []
  })
})

test("vnode with a single child", () => {
  expect(ui.h("div", {}, ["foo"])).toEqual({
    nodeName: "div",
    attributes: {},
    children: ["foo"]
  })

  expect(ui.h("div", {}, "foo")).toEqual({
    nodeName: "div",
    attributes: {},
    children: ["foo"]
  })
})

test("positional String/Number children", () => {
  expect(ui.h("div", {}, "foo", "bar", "baz")).toEqual({
    nodeName: "div",
    attributes: {},
    children: ["foo", "bar", "baz"]
  })

  expect(ui.h("div", {}, 0, "foo", 1, "baz", 2)).toEqual({
    nodeName: "div",
    attributes: {},
    children: [0, "foo", 1, "baz", 2]
  })

  expect(ui.h("div", {}, "foo", ui.h("div", {}, "bar"), "baz", "quux")).toEqual({
    nodeName: "div",
    attributes: {},
    children: [
      "foo",
      {
        nodeName: "div",
        attributes: {},
        children: ["bar"]
      },
      "baz",
      "quux"
    ]
  })
})

test("vnode with attributes", () => {
  const attributes = {
    id: "foo",
    class: "bar",
    style: {
      color: "red"
    }
  }

  expect(ui.h("div", attributes, "baz")).toEqual({
    nodeName: "div",
    attributes,
    children: ["baz"]
  })
})

test("skip null and Boolean children", () => {
  const expected = {
    nodeName: "div",
    attributes: {},
    children: []
  }

  expect(ui.h("div", {}, true)).toEqual(expected)
  expect(ui.h("div", {}, false)).toEqual(expected)
  expect(ui.h("div", {}, null)).toEqual(expected)
})

test("nodeName as a function (JSX components)", () => {
  const Component = (props, children) => ui.h("div", props, children)

  expect(ui.h(Component, { id: "foo" }, "bar")).toEqual({
    nodeName: "div",
    attributes: { id: "foo" },
    children: ["bar"]
  })

  expect(ui.h(Component, { id: "foo" }, [ui.h(Component, { id: "bar" })])).toEqual({
    nodeName: "div",
    attributes: { id: "foo" },
    children: [
      {
        nodeName: "div",
        attributes: { id: "bar" },
        children: []
      }
    ]
  })
})
