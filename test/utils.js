const ui = require("./dist/hyperoop");

const mockDelay = () => new Promise((resolve) => setTimeout(resolve, 50));

class Actions extends ui.Actions {
    up() { this.State.value++; }
}

class AsyncActions extends Actions {
    async upAsync() {
        await mockDelay();
        this.up();
    }
}

class FooActions extends ui.Actions {
    up() { this.State.value++; }
    foo() { this.State.foo = true; }
    upAndFoo() { this.up(); this.foo(); }
}

module.exports = {
    mockDelay,
    Actions,
    AsyncActions,
    FooActions
}