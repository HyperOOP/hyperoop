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