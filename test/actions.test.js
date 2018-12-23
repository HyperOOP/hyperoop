const ui = require("./dist/hyperoop");
const utils = require("./utils");
const Hist = require("redoundo")

test("sync updates simple", (done) => {
    const actions = new utils.Actions({value: 1});
    const view = () => 
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.up();
});

test("wrong update", (done) => {
    const actions = new ui.Actions({value: {counter: 1}});
    const view = () => 
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    actions.State.value.counter++;
                    setTimeout(done, 1000);
                },
                onupdate: () => {
                    expect(true).toBe(false);
                }
            },
            actions.State.value.counter
        );

    ui.init(document.body, view, actions);
    actions.State.value = {counter: actions.State.value.counter + 1};
});

test("sync updates / set", (done) => {
    const actions = new utils.Actions({value: 1});
    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                },
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.set({value: 2});
});

test("sync updates array / set", (done) => {

    const actions = new ui.Actions([]);

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
            actions.State[0]
        );

    ui.init(document.body, view, actions);
    actions.set([2]);
});

test("async updates", (done) => {
    const actions = new utils.AsyncActions({value: 2});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div>3</div>`);
                    done();
                },
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.upAsync();
});

test("call action within action", (done) => {
    const actions = new utils.FooActions({value: 1, foo: false});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(actions.State).toEqual({
                        foo:   true,
                        value: 2,
                    });
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.upAndFoo();
});

test("sub-actions", (done) => {
    class Actions extends ui.Actions {}
    class SubActions extends ui.SubActions {
        up() { this.State.value++; }
    }

    const actions = new Actions({});
    const subActions = new SubActions({value: 1}, actions);

    const view = () => 
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
            subActions.State.value
        );

    ui.init(document.body, view, actions);
    subActions.up();
});

test("history / set", async (done) => {
    class HistActions extends ui.Actions {
        constructor(v) { super(v, new Hist(1)); }
        up() { this.set({value: this.State.value + 1}, true); }
    }

    const actions = new HistActions({value: 2});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>3</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
        
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.up();
    await utils.mockDelay();
    actions.History.undo();
});

test("history / undo set new", async (done) => {
    class HistActions extends ui.Actions {
        constructor(v) { super(v, new Hist(1)); }
        addNew() { this.set({value: 1}, true); }
    }

    const actions = new HistActions({});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>1</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div></div>`);
                    done();
                },
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.addNew();
    await utils.mockDelay();
    actions.History.undo();
});

test("history / undo Remember new", async (done) => {
    class HistActions extends ui.Actions {
        constructor(v) { super(v, new Hist(1)); }
        addNew() { this.Remember.value = 1; }
    }

    const actions = new HistActions({});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>1</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div></div>`);
                    done();
                }
            },
            actions.State.value
        )


    ui.init(document.body, view, actions);
    actions.addNew();
    await utils.mockDelay();
    actions.History.undo();
});

test("history / remember", async (done) => {
    class HistActions extends ui.Actions {
        constructor(v) { super(v, new Hist(1)); }
        up() { this.Remember.value++; }
    }

    const actions = new HistActions({value: 2});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>3</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div>2</div>`);
                    done();
                }
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.up();
    await utils.mockDelay();
    actions.History.undo();
});

test("delete", async (done) => {
    const key = "x";
    class Actions extends ui.Actions {
        constructor(v) { super(v); }
        del() { delete this.State[key]; }
    }

    const actions = new Actions({x: 1});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>0</div>`);
                    done();
                }
            },
            Object.getOwnPropertyNames(actions.State).length
        );

    ui.init(document.body, view, actions);
    actions.del();
});

test("history / undo delete", async (done) => {
    const key = "x";
    class HistActions extends ui.Actions {
        constructor(v) { super(v, new Hist(1)); }
        del() { delete this.Remember[key]; }
    }

    const actions = new HistActions({x: 1});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe(`<div>0</div>`);
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe(`<div>1</div>`);
                    done();
                }
            },
            Object.getOwnPropertyNames(actions.State).length
        );

    ui.init(document.body, view, actions);
    actions.del();
    await utils.mockDelay();
    actions.History.undo();
});
