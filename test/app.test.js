ui = require("./dist/hyperoop");
utils = require("./utils");

beforeEach(() => {
    document.body.innerHTML = "";
});

test("debouncing", (done) => {
    class Actions extends utils.Actions {
        fire() {
            this.up();
            this.up();
            this.up();
            this.up();
        }
    }

    const actions = new Actions({value: 1});

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe("<div>5</div>");
                    done();
                }
            },
            actions.State.value
        );

    ui.init(document.body, view, actions);
    actions.fire();
});

test("components)", (done) => {
    class Actions extends ui.Actions {
        update() { this.State.value = "bar"; }
    }

    const actions = new Actions({ value: "foo" });

    const Component = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe("<div>foo</div>");
                    actions.update();
                },
                onupdate: () => {
                    expect(document.body.innerHTML).toBe("<div>bar</div>");
                    done();
                }
            },
            actions.State.value
        );

    ui.init(document.body, () => Component(), actions);
});

test("actions in the view", (done) => {
    const actions = new utils.Actions({value: 0});
    const view = () => {
        if (actions.State.value < 1) {
            actions.up();
            return;
        }

        setTimeout(() => {
            expect(document.body.innerHTML).toBe("<div>1</div>");
            done();
        });

        return ui.h("div", {}, actions.State.value);
    };

    ui.init(document.body, view, actions);
});

test("returning null from a component", (done) => {
    const NullComponent = () => null;

    const view = () =>
        ui.h("div",
            {
                oncreate: () => {
                    expect(document.body.innerHTML).toBe("<div></div>");
                    done();
                }
            },
            NullComponent()
        );

    ui.init(document.body, view, null);
});
