import * as ui from "hyperoop";

import "./index.scss";

type FilterName = "All" | "Todo" | "Done";

const Filters: {[name in FilterName]: (Item) => boolean} = {
    All:  () => true,
    Done: (it) => it.State.done,
    Todo: (it) => !it.State.done,
};

interface ITodoState {
    todos:       Item[];
    filter:      FilterName;
    input:       string;
    placeholder: string;
}

const HistoryLength = 50;

class Todo extends ui.Actions<ITodoState> {
    constructor(start: ITodoState) {
        super(start, HistoryLength);
    }

    get FilteredItems(): Item[] {
        return this.State.todos.filter(Filters[this.State.filter]);
    }

    get UnusedFilters(): FilterName[] {
        return (Object.keys(Filters) as FilterName[])
            .filter((key) => key !== todo.State.filter);
    }

    public add() {
        const newItem = new Item({
            done:  false,
            id:    this.State.todos.length + 1,
            value: this.State.input,
        }, this);

        this.set({
            input: "",
            todos: [...this.State.todos, newItem],
        }, true);
    }
}

const todo = new Todo({
    filter:      "All",
    input:       "",
    placeholder: "Do that thing...",
    todos:       [],
});

interface IItemState {
    id:    number;
    done:  boolean;
    value: string;
}

class Item extends ui.SubActions<IItemState> {}

const TodoItem = ({ item }: { item: Item }) => (
    <li
        class = {item.State.done && "done"}
        onclick = {() => item.Remember.done = !item.State.done}
    >
        { item.State.value }
    </li>
);

const FilterButton = ({ filter }: { filter: FilterName }) => (
    <span>
        <a href = "#" onclick = {() => todo.State.filter = filter}>
            {filter}
        </a>
        {" "}
  </span>
);

const ControlButton = ({ name, onclick }: { name: string, onclick: () => void }) => (
    <span>
        <a href = "#" onclick = {onclick}>
            {name}
        </a>
        {" "}
    </span>
);

const view = ui.view(todo, () => (
    <div>
        <h1>Todo</h1>
        <p>
            {
                todo.UnusedFilters.map((key) => <FilterButton filter={key}/>)
            }
            {
                todo.History.UndoLength > 0 ?
                    <ControlButton name = "Undo" onclick = {() => todo.History.undo()}/>
                    : ""
            }
            {
                todo.History.RedoLength > 0 ?
                    <ControlButton name = "Redo" onclick = {() => todo.History.redo()}/>
                    : ""
            }
        </p>

        <div class = "flex">
            <input
                type        = "text"
                onkeyup     = {(e) => (e.keyCode === 13 ? todo.add() : "")}
                oninput     = {(e) => todo.State.input = e.target.value}
                value       = {todo.State.input}
                placeholder = {todo.State.placeholder}
            />
            <button onclick = {() => todo.add()}>＋</button>
        </div>

        <p>
            <ul> {todo.FilteredItems.map((t) => <TodoItem item={t}/>)} </ul>
        </p>
  </div>
));

ui.init(document.body, view);
