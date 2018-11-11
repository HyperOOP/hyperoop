import "jest";
import * as ui    from '../src/hyperoop';
import * as utils from './utils';

beforeEach(() => {
    document.body.innerHTML = ""
})
  
test("debouncing", done => {
    class Actions extends utils.Actions {
        fire() {
            this.up()
            this.up()
            this.up()
            this.up()
        }
    }

    const actions = new Actions({value: 1});
  
    const view = ui.view(actions, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe("<div>5</div>")
                done()
            }}
        >
            {actions.State.value}
        </div>
    ))
  
    ui.init(document.body, view);
    actions.fire()
})

test("components)", done => {
    class Actions extends ui.Actions<{value: string}> {
        update(){ this.State.value = "bar" }
    }

    const actions = new Actions({ value: "foo" });
  
    const Component = () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe("<div>foo</div>")
                actions.update()
            }}
            onupdate={() => {
                expect(document.body.innerHTML).toBe("<div>bar</div>")
                done();
            }}
        >
            {actions.State.value}
        </div>
    )

    ui.init(document.body, ui.view(actions, ()=><Component/>));
})

test("actions in the view", done => {
    const actions = new utils.Actions({value: 0});
    const view = ui.view(actions, (): ui.VNode<{}> => {
        if (actions.State.value < 1) {
            actions.up();
            return;
        }
    
        setTimeout(() => {
            expect(document.body.innerHTML).toBe("<div>1</div>");
            done();
        })
    
        return <div>{actions.State.value}</div>;
    })
  
    ui.init(document.body, view);
})

test("returning null from a component", done => {
    const NullComponent = () => null;
  
    const view = ui.view(null, () => (
        <div
            oncreate={() => {
                expect(document.body.innerHTML).toBe("<div></div>");
                done();
            }}
        >
            <NullComponent />
        </div>
    ))
  
    ui.init(document.body, view);
})