<p align="center">
<a href="https://travis-ci.org/HyperOOP/hyperoop"><img src="https://travis-ci.org/HyperOOP/hyperoop.svg?branch=master" alt="Build Status"></a>
<a href="https://codecov.io/gh/HyperOOP/hyperoop"><img src="https://codecov.io/gh/HyperOOP/hyperoop/branch/master/graph/badge.svg" alt="codecov"/></a>
<a href="https://www.npmjs.com/package/hyperoop"><img src="https://img.shields.io/npm/v/hyperoop.svg" alt="npm"/></a>
<a href="https://github.com/HyperOOP/hyperoop"><img src="https://img.shields.io/github/languages/top/HyperOOP/hyperoop.svg" alt="GitHub top language"/></a>
<a href="https://www.npmjs.com/package/hyperoop"><img src="https://img.shields.io/npm/dt/hyperoop.svg" alt="npm"/></a>
<a href="https://snyk.io/test/npm/hyperoop"><img src="https://snyk.io/test/npm/hyperoop/badge.svg" alt="Known Vulnerabilities"/></a>
<a href="https://gitter.im/hyper-oop/hyperoop?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"><img src="https://badges.gitter.im/hyper-oop/hyperoop.svg" alt="Join the chat at https://gitter.im/hyper-oop"/></a>
</p>

<p align="center"><a href="https://www.patreon.com/algebrain"><img src="https://img.shields.io/badge/patreon-donate-orange.svg" alt="Patreon"/></a></p>
<p align="center"><a href="https://liberapay.com/algebrain/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"></a></p>

#
<p align="center"><img width=50 src="https://github.com/HyperOOP/hyperoop/blob/master/misc/logo.png?raw=true"/>
<h1 align="center">hyperoop</h1>
</p>

Hyperoop is OOP-style SPA micro-framework.

## Contents
 * [Motivation](#motivation)
 * [Quick start](#quick-start)
 * [Installation](#installation)
 * [Getting help](#getting-help)
 * [HyperOOP application: basics](#hyperoop-application-basics)
   * [`Actions` class and state](#actionsss-class-and-state)
   * [Rendering a page](#rendering-a-page)
   * [State](#state)
   * [SubActions](#subactions)
   * [Components](#components)
 * [Examples](#examples)
   * [Run example](#run-example)
 * [Router](#router)

> __Note!__ In the following text I assume you know [TypeScript](https://www.typescriptlang.org/) and how to configure, build and bundle it.

## Motivation

- __Modularity__ &mdash; the main idea was to implement my understanding of OOP, modularity and invariant development. It is achieved by implementing of system of Actions/SubActions, wich will be explained below.

- __Minimalism__ &mdash; I tried to isolate and implement only the most necessary functions of the state machine. In addition, the finished distribution is quite small - version 1.0.0 in the form of minified and gz-compressed bundle has a size of only 2.6K

- __Simple but sufficient VDOM__ &mdash; HyperOOP inherits it from the brilliant [hyperapp](https://github.com/jorgebucaran/hyperapp).

## Quick start

Type the following commands in the shell:

```bash
git clone https://github.com/HyperOOP/starter myapp
cd myapp
npm i
npm start
```

Then open `src/index.tsx` for editing and implement what you want. This starter code uses [Faqtor](https://github.com/faqtor/faqtor/) task runner and [Rollup](https://rollupjs.org) module bundler.

## Installation

Type the following command in the shell:
```bash
npm i --save hyperoop
```
Then, using your usual bundler, import HyperOOP into your application:

```TypeScript
import * as ui from "hyperoop"
```

Note that if you want to use the jsx syntax, then the `jsxFactory` field in your` tsconfig.json` should be `ui.h`

If you do not plan to set up the build step, you can import Hyperapp into the <script> tag as a module:
  
 ```html
<script type="module">
  import * as ui from "https://unpkg.com/hyperoop?module"
</script>
```

## Getting help

Any question about using the framework you can ask [here](https://gitter.im/hyper-oop/hyperoop) in gitter, welcome.

## HyperOOP application: basics

An application consists of states that are managed by action classes organized as a tree, and a view that defines a user interface. Every time a state changes, HyperOOP creates a new virtual DOM and uses it to update the actual DOM.

### `Actions` class and state

First you need to define a class of actions, inherited from HyperOOP `Actions` class. Let's see how this is implemented on the example of the [counter](https://github.com/HyperOOP/hyperoop-examples/blob/master/counter/src/index.tsx):

```TypeScript
class Counter extends ui.Actions<{count: number}> {}
```

As you see, the parameter of the class `ui.Actions` is type of our counter state: `{count: number}`. Then after instantiating `Counter` we may use the memeber `State` for accessing `count`:

```TypeScript
const counter = new Counter({ count: 0 });

//counter.State.count = 2;
```
But it is pointless to do this until we initialize the view and associate the view with the action class.

### Rendering a page

When describing the page content, we use the `h` function to create a virtual DOM. However, thanks to the `jsx` (`tsx`) syntax, it is possible to describe the VDOM as if we were writing the code for an html page:

```tsx
const view = () => (
<div>
    <h1>{counter.State.count}</h1>
    <button onclick={() => counter.State.count--}>-</button>
    <button onclick={() => counter.State.count++}>+</button>
</div>
);
```
Here, `view` is a function that will be called each time a state changes and form a new VDOM, which will then be displayed on the page by creating a real DOM.

Let's analyze this code in more detail.

```tsx
    <h1>{counter.State.count}</h1>
```

Here the `h1` tag displays the current value of the counter. Each time `counter.State.count` changes, a new virtual DOM will be generated, and then it will be displayed on the page with the new counter value.

```tsx
    <button onclick={() => counter.State.count--}>-</button>
    <button onclick={() => counter.State.count++}>+</button>
```

These two buttons allow to increase and decrease the counter value. Thanks to the magic of the `Actions` class, this will lead to a redraw of the page with a new counter value.

But all this will not work unless we bind an instance of the `Actio`n class and the view function to the required DOM element. This is done by calling the `init` function:

```tsx
    ui.init(document.body, view, counter);
```

Here is the full code for this example ([try online](https://codepen.io/algebrain/pen/OaNgMv)):

```tsx
import * as ui from 'hyperoop';

class Counter extends ui.Actions<{count: number}> {}

const counter = new Counter({ count: 0 });

const view = () => (
<div>
    <h1>{counter.State.count}</h1>
    <button onclick={() => counter.State.count--}>-</button>
    <button onclick={() => counter.State.count++}>+</button>
</div>
);

ui.init(document.body, view, counter);
```

### State

Unlike many other frameworks, HyperOOP does not have a single state tree. Each class instance controls its state, which can be any regular JavaScript object:

```tsx
const state = {
    top: {
        count: 0
    },
    bottom: {
        count: 0
    }
}

counter = new ui.Actions(state);
```

However, the rules for changing states remain the same as in other frameworks: the state can only be changed as a whole:

```tsx
counter.State.top.count = 10; //WRONG! This code will not cause new rendering

counter.State = {counter.State..., top: {count: 10}}; //CORRECT!
```

### SubActions

Sometimes it is convenient to organize in the form of a tree not states, but instances of the `Actions` class. Imagine that we need to program a list that can be filtered by some boolean attribute of a list element:

```tsx
import * as ui from 'hyperoop';

interface IElementState = {
    filtered: boolean;
    ...
}

class Element extends ui.SubActions<IElementState> {}

interface IMainState = {
   showFiltered: boolean;
   items:        Element[];
   ...
}

class List extends ui.Actions<IMainState> {
    addItem() {
        const newItem = new Element(true, this);
    }
}

...

ui.init(document.body, view, new List());

```

Note that since we inherit every element of the list from the `SubActions` class, we do not need to call `ui.init` for each such element, since this initialization is inherited from the parent list when it is created:

```tsx
        const newItem = new Element(true, this);
```

### Components

Since the idea and implementation of components is completely inherited from [hyperapp](https://github.com/jorgebucaran/hyperapp), it is best to read the component documentation [here](https://github.com/jorgebucaran/hyperapp/tree/1.2.9#components).

## Examples

See [examples](https://github.com/HyperOOP/hyperoop-examples).

More advanced example is [source code](https://github.com/HyperOOP/hyperoop-site) of our site [hyperoop.github.io](https://hyperoop.github.io).

### Run example

To run `todo-hist` example:

```bash
git clone https://github.com/HyperOOP/hyperoop-examples
cd hyperoop-examples/todo-hist
npm i && npm run serve
```

Then open localhost:10001 in browser. Or simply [try it online](https://codepen.io/algebrain/pen/GwZWLg)

## Router

Use our [official router](https://www.npmjs.com/package/hyperoop-router)
