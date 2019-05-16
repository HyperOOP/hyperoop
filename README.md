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

## Quick start

```
git clone https://github.com/HyperOOP/starter myapp
cd myapp
npm i
npm start
```

## Install

```bash
npm i --save hyperoop
```

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

### Example `counter`

`TypeScript` code ([try online](https://codepen.io/algebrain/pen/OaNgMv)):

```typescript
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

## Router

Use our [official router](https://www.npmjs.com/package/hyperoop-router)
