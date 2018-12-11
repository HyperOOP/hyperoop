const ui = require("./dist/hyperoop");

test("recycle markup", done => {
  const SSR_HTML = `<div id="app"><main><p id="foo">foo</p></main></div>`

  document.body.innerHTML = SSR_HTML

  ui.init(
    document.getElementById("app"),
    () => (
      <main>
        <p
          oncreate={element => {
            expect(element.id).toBe("foo")
            expect(document.body.innerHTML).toBe(SSR_HTML)
            done()
          }}
        >
          foo
        </p>
      </main>
    ),
    null
  )
})

test("recycle markup against keyed vdom", done => {
  const SSR_HTML = `<div id="app"><main><p id="foo">foo</p></main></div>`

  document.body.innerHTML = SSR_HTML

  ui.init(
    document.getElementById("app"),
    () => (
      <main>
        <p
          key="someKey"
          oncreate={element => {
            expect(element.id).toBe("foo")
            expect(document.body.innerHTML).toBe(SSR_HTML)
            done()
          }}
        >
          foo
        </p>
      </main>
    ),
    null
  )
})
