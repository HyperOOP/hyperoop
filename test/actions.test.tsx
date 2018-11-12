import "jest";
import * as ui    from '../src/hyperoop';
import * as utils from './utils';

test("sync updates", done => {

    const actions = new utils.Actions({value: 1});
  
    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`)
                done()
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.up()
})


test("sync updates / set", done => {

    const actions = new utils.Actions({value: 1});
  
    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`)
                done()
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.set({value: 2});
})


test("async updates", done => {
    const actions = new utils.AsyncActions({value: 2});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div>3</div>`);
                done();
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.upAsync();
})

test("call action within action", done => {
    const actions = new utils.FooActions({value: 1, foo: false});
  
    const view = state => (
        <div
            oncreate={() => {
                expect(actions.State).toEqual({
                    value: 2,
                    foo:   true
                })
                expect(document.body.innerHTML).toBe(`<div>2</div>`)
                done()
            }}
        >
            {actions.State.value}
        </div>
    )
  
    ui.init(document.body, view);
    actions.upAndFoo();
})

test("sub-actions", done => {
    class Actions extends ui.Actions<{}>{};
    class SubActions extends ui.SubActions<{value: number}>{
        up() { this.State.value++ }
    }

    const actions = new Actions({});
    const subActions = new SubActions({value: 1}, actions);

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`);
                done();
            }}
        >
            {subActions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    subActions.up()
})

test("history / set", async (done) => {
    class HistActions extends ui.Actions<{value: number}> {
        constructor(v) { super(v, 1); }
        up() { this.set({value: this.State.value+1}, true) }
    }
    
    const actions = new HistActions({value: 2});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>3</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`);
                done();
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.up();
    await utils.mockDelay();
    actions.History.undo();
})

test("history / undo set new", async (done) => {
    class HistActions extends ui.Actions<any> {
        constructor(v) { super(v, 1); }
        addNew() { this.set({value: 1}, true) }
    }
    
    const actions = new HistActions({});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>1</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div></div>`);
                done();
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.addNew();
    await utils.mockDelay();
    actions.History.undo();
})

test("history / undo Remember new", async (done) => {
    class HistActions extends ui.Actions<any> {
        constructor(v) { super(v, 1); }
        addNew() { this.Remember.value = 1 }
    }
    
    const actions = new HistActions({});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>1</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div></div>`);
                done();
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.addNew();
    await utils.mockDelay();
    actions.History.undo();
})

test("history / remember", async (done) => {
    class HistActions extends ui.Actions<{value: number}> {
        constructor(v) { super(v, 1); }
        up() { this.Remember.value++ }
    }
    
    const actions = new HistActions({value: 2});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>3</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div>2</div>`);
                done();
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.up();
    await utils.mockDelay();
    actions.History.undo();
})

test("delete", async (done) => {
    class Actions extends ui.Actions<object> {
        constructor(v) { super(v); }
        del() { delete this.State['x'] }
    }
    
    const actions = new Actions({x:1});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>0</div>`);
                done();
            }}
        >
            {Object.getOwnPropertyNames(actions.State).length}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.del();
})

test("history / undo delete", async (done) => {
    class HistActions extends ui.Actions<object> {
        constructor(v) { super(v, 1); }
        del() { delete this.Remember['x'] }
    }
    
    const actions = new HistActions({x:1});

    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe(`<div>0</div>`);
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe(`<div>1</div>`);
                done();
            }}
        >
            {Object.getOwnPropertyNames(actions.State).length}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.del();
    await utils.mockDelay();
    actions.History.undo();
})
