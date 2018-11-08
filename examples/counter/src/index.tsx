import * as ui from 'hyperoop';

class Counter extends ui.Actions<{count: number}> {}

const counter = new Counter({ count: 0 });

const view = ui.view(counter, () => (
<div>
    <h1>{counter.State.count}</h1>
    <button onclick={() => counter.State.count--}>-</button>
    <button onclick={() => counter.State.count++}>+</button>
</div>
))

ui.init(document.body, view);
