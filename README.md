# hyperoop

Hyperoop is OOP-style web micro-framework over [hyperapp](https://github.com/jorgebucaran/hyperapp)

## Install

```bash
npm i --save hyperoop
```

## Examples

See [examples](https://github.com/algebraic-brain/hyperoop/tree/master/examples).

### Run example

```bash
cd examples/todo-hist
npm i && npm run serve
```

Then open localhost:10001 in browser.

### Example `counter`

`TypeScript` code:

```typescript
import * as ui from 'hyperoop';

class Counter extends ui.Actions<{count: number}> {
    down(value: number) {
        this.State.count -= value;
    }

    up(value: number) {
        this.State.count += value;
    }
}

const counter = new Counter({
    count: 0
});

const view = ui.view(counter, () => (
<div>
    <h1>{counter.State.count}</h1>
    <button onclick={() => counter.down(1)}>-</button>
    <button onclick={() => counter.up(1)}>+</button>
</div>
))

ui.init(document.body, view);
```
