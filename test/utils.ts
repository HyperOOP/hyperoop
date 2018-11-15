import * as ui from "../src/hyperoop";

export const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 50));

export class Actions extends ui.Actions<{value: number}> {
    public up() { this.State.value++; }
}

export class AsyncActions extends Actions {
    public async upAsync() {
        await mockDelay();
        this.up();
    }
}

export class FooActions extends ui.Actions<{value: number, foo: boolean}> {
    public up() { this.State.value++; }
    public foo() { this.State.foo = true; }
    public upAndFoo() { this.up(); this.foo(); }
}
