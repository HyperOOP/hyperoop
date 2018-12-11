const ui = require("./dist/hyperoop");

beforeEach(() => {
  document.body.innerHTML = ""
})

test("headless", done => {
  ui.init(undefined, () => done(), null);
})

test("container", done => {
  document.body.innerHTML = "<main></main>"
  ui.init(
    document.body.firstChild,
    () => (
      <div
        oncreate={() => {
          expect(document.body.innerHTML).toBe("<main><div>foo</div></main>")
          done()
        }}
      >
        foo
      </div>
    ),
    null
  )
})

test("nested container", done => {
  document.body.innerHTML = "<main><section></section><div></div></main>"
  ui.init(
    document.body.firstChild.lastChild,
    () => (
      <p
        oncreate={() => {
          expect(document.body.innerHTML).toBe(
            `<main><section></section><div><p>foo</p></div></main>`
          )
          done()
        }}
      >
        foo
      </p>
    ),
    null
  )
})

test("container with mutated host", done => {
  document.body.innerHTML = "<main><div></div></main>"

  const host = document.body.firstChild
  const container = host.firstChild

  const actions = new ui.Actions({value: "foo"});

  const view = () => (
    <p
      oncreate={() => {
        expect(document.body.innerHTML).toBe(
          `<main><div><p>foo</p></div></main>`
        )
        host.insertBefore(document.createElement("header"), host.firstChild)
        host.appendChild(document.createElement("footer"))

        actions.State.value = "bar";
      }}
      onupdate={() => {
        expect(document.body.innerHTML).toBe(
          `<main><header></header><div><p>bar</p></div><footer></footer></main>`
        )
        done()
      }}
    >
      {actions.State.value}
    </p>
  )

  ui.init(container, view, actions);
})
