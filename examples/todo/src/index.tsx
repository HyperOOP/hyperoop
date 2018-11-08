import * as ui from 'hyperoop';

import './index.scss'

type FilterName = "All" | "Todo" | "Done";

let Filters: {[name in FilterName]: (Item)=>boolean} = {
    All:  () => true,
    Todo: it => !it.State.done,
    Done: it => it.State.done
};

type TodoState = {
    filter:      FilterName,
    input:       string,
    placeholder: string
}

class Todo extends ui.Actions<TodoState> {
    Todos: Item[];

    constructor(start: TodoState) {
        super(start);
        this.Todos = [];
    }

    get Filtered(): Item[] {
        return this.Todos.filter(Filters[this.State.filter]);    
    }

    get UnusedFilters(): FilterName[] {
        return (Object.keys(Filters) as FilterName[])
            .filter(key => key !== todo.State.filter);
    }

    add() {
        let newItem = new Item({
            done:  false,
            value: this.State.input,
            id:    this.Todos.length + 1
        });

        newItem.init(this.Renderer);
        this.Todos.push(newItem);
        this.State.input = "";
    }

    input(value: string){
        this.State.input = value;
    }

    filter(value: FilterName) {
        this.State.filter = value;
    }
}

const todo = new Todo({
    filter:      "All",
    input:       "",
    placeholder: "Do that thing..."
});

type ItemState = {
    id:    number,
    done:  boolean,
    value: string
}

class Item extends ui.Actions<ItemState> {
    toggle() {
        this.State.done = !this.State.done;
    }
}

const TodoItem = ui.component(({ item }: { item: Item }) => (
    <li
        class = {item.State.done && "done"}
        onclick = {() => item.toggle()}
    >
        { item.State.value }
    </li>
))

const FilterButton = ui.component(({ filter }: { filter: FilterName }) => (
    <span>
    <a href = "#" onclick = {() => todo.filter(filter)}>
        {filter}
    </a>
    {" "}
  </span>
))

const view = ui.view(todo, () => (
    <div>
        <h1>Todo</h1>
        <p>{todo.UnusedFilters.map(key => <FilterButton filter={key}/>)}</p>

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