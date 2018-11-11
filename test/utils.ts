import * as ui    from '../src/hyperoop'

export const mockDelay = () => new Promise(resolve => setTimeout(resolve, 50));

export class Actions extends ui.Actions<{value: number}> {
    up() { this.State.value++ }
}

export class AsyncActions extends Actions {
    async upAsync(){
        await mockDelay();
        this.up();
    }
}

export class FooActions extends ui.Actions<{value: number, foo: boolean}> {
    up() { this.State.value++ }
    foo() { this.State.foo = true }
    upAndFoo() { this.up(); this.foo() }
}

