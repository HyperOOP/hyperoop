const ui = require("./dist/hyperoop");

beforeEach(() => {
  document.body.innerHTML = ""
})

test("oncreate", done => {
  ui.init(
    document.body,
    () => (
      <div
        oncreate={element => {
          element.className = "foo"
          expect(document.body.innerHTML).toBe(`<div class="foo">foo</div>`)
          done()
        }}
      >
        foo
      </div>
    ),
    null
  )
})

test("onupdate", done => {
  const actions = new ui.Actions({ value: "foo" })

  const view = () => (
    <div
      class={actions.State.value}
      oncreate={() => {
        actions.State.value = "bar";
      }}
      onupdate={(element, oldProps) => {
        expect(element.textContent).toBe("bar")
        expect(oldProps.class).toBe("foo")
        done()
      }}
    >
      {actions.State.value}
    </div>
  )

  ui.init(document.body, view, actions);
})

test("onremove", done => {
  const actions = new ui.Actions({value: true});

  const view = () =>
    actions.State.value ? (
      <ul
        oncreate={() => {
          expect(document.body.innerHTML).toBe("<ul><li></li><li></li></ul>")
          actions.State.value = !actions.State.value;
        }}
      >
        <li />
        <li
          onremove={(element, remove) => {
            remove()
            expect(document.body.innerHTML).toBe("<ul><li></li></ul>")
            done()
          }}
        />
      </ul>
    ) : (
      <ul>
        <li />
      </ul>
    )

    ui.init(document.body, view, actions);
})

test("ondestroy", done => {
  let removed = false

  const actions = new ui.Actions({value: true});

  const view = () =>
    actions.State.value ? (
      <ul
        oncreate={() => {
          actions.State.value = !actions.State.value;
        }}
      >
        <li />
        <li>
          <span
            ondestroy={() => {
              expect(removed).toBe(false)
              done()
            }}
          />
        </li>
      </ul>
    ) : (
      <ul>
        <li />
      </ul>
    )

    ui.init(document.body, view, actions);
})

test("onremove/ondestroy", done => {
  let detached = false

  const actions = new ui.Actions({value: true});

  const view = () =>
    actions.State.value ? (
      <ul
        oncreate={() => {
          actions.State.value = !actions.State.value;
        }}
      >
        <li />
        <li
          ondestroy={() => {
            detached = true
          }}
          onremove={(element, remove) => {
            expect(detached).toBe(false)
            remove()
            expect(detached).toBe(true)
            done()
          }}
        />
      </ul>
    ) : (
      <ul>
        <li />
      </ul>
    )

    ui.init(document.body, view, actions);
})

test("event bubbling", done => {
  let count = 0

  const actions = new ui.Actions({value: true});

  const view = () => (
    <main
      oncreate={() => {
        expect(count++).toBe(3)
        actions.State.value = !actions.State.value;
      }}
      onupdate={() => {
        expect(count++).toBe(7)
        done()
      }}
    >
      <p
        oncreate={() => {
          expect(count++).toBe(2)
        }}
        onupdate={() => {
          expect(count++).toBe(6)
        }}
      />

      <p
        oncreate={() => {
          expect(count++).toBe(1)
        }}
        onupdate={() => {
          expect(count++).toBe(5)
        }}
      />

      <p
        oncreate={() => {
          expect(count++).toBe(0)
        }}
        onupdate={() => {
          expect(count++).toBe(4)
        }}
      />
    </main>
  )

  ui.init(document.body, view, actions);
})
