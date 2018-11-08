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

const HistoryLength = 50;

class Todo extends ui.Actions<TodoState> {
    Todos: Item[];

    constructor(start: TodoState) {
        super(start, HistoryLength);
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
        }, this.History);

        newItem.init(this.Renderer);

        let self = this;
        let wasInput = this.State.input;

        this.History.add({
            Redo: () => {
                self.Todos.push(newItem);
                let was = self.State.input;
                self.State.input = "";
                if (was === "") self.Renderer.render();
            },
            Undo: () => {
                self.Todos = self.Todos.slice(0, -1);
                let was = self.State.input;
                self.State.input = wasInput;
                if (was === wasInput) self.Renderer.render();
            }
        })
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
        this.Remember.done = !this.State.done;
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

const ControlButton = ui.component(({ name, onclick }: { name: string, onclick: ()=>void }) => (
    <span>
        <a href = "#" onclick = {onclick}>
            {name}
        </a>
        {" "}
    </span>
))

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