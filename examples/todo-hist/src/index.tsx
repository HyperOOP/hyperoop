import * as ui from 'hyperoop';

import './index.scss'

type FilterName = "All" | "Todo" | "Done";

let Filters: {[name in FilterName]: (Item)=>boolean} = {
    All:  () => true,
    Todo: it => !it.State.done,
    Done: it => it.State.done
};

type TodoState = {
    todos:       Item[],
    filter:      FilterName,
    input:       string,
    placeholder: string
}

const HistoryLength = 50;

class Todo extends ui.Actions<TodoState> {
    constructor(start: TodoState) {
        super(start, HistoryLength);
    }

    get Filtered(): Item[] {
        return this.State.todos.filter(Filters[this.State.filter]);    
    }

    get UnusedFilters(): FilterName[] {
        return (Object.keys(Filters) as FilterName[])
            .filter(key => key !== todo.State.filter);
    }

    add() {
        let newItem = new Item({
            done:  false,
            value: this.State.input,
            id:    this.State.todos.length + 1
        }, this);

        this.set({
            todos: [...this.State.todos, newItem],
            input: ""
        }, true)
    }

    input(value: string){
        this.State.input = value;
    }

    filter(value: FilterName) {
        this.State.filter = value;
    }
}

const todo = new Todo({
    todos:       [],
    filter:      "All",
    input:       "",
    placeholder: "Do that thing..."
});

type ItemState = {
    id:    number,
    done:  boolean,
    value: string
}

class Item extends ui.SubActions<ItemState> {}

const TodoItem = ({ item }: { item: Item }) => (
    <li
        class = {item.State.done && "done"}
        onclick = {() => item.Remember.done = !item.State.done}
    >
        { item.State.value }
    </li>
)

const FilterButton = ({ filter }: { filter: FilterName }) => (
    <span>
        <a href = "#" onclick = {() => todo.filter(filter)}>
            {filter}
        </a>
        {" "}
  </span>
)

const ControlButton = ({ name, onclick }: { name: string, onclick: ()=>void }) => (
    <span>
        <a href = "#" onclick = {onclick}>
            {name}
        </a>
        {" "}
    </span>
)

const view = ui.view(todo, () => (
    <div>
        <h1>Todo</h1>
        <p>
            {
                todo.UnusedFilters.map(key => <FilterButton filter={key}/>)
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
                onkeyup     = {e => (e.keyCode === 13 ? todo.add() : "")}
                oninput     = {e => todo.input(e.target.value)}
                value       = {todo.State.input}
                placeholder = {todo.State.placeholder}
            />
            <button onclick = {() => todo.add()}>＋</button>
        </div>

        <p>
            <ul> {todo.Filtered.map(t => <TodoItem item={t}/>)} </ul>
        </p>
  </div>
))

ui.init(document.body, view);