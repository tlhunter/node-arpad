# Arpad: ELO Rating System for Node.js

This is an implementation of [ELO](http://en.wikipedia.org/wiki/Elo_rating_system) for Node.js (ELO is named after Arpad Elo, hence the package name).

There seems to be just one other implementation of ELO for Node.js, but it appears to be overly simple and unmaintained.

## Installation

```
npm install arpad
```

## Simple Usage

```js
var Elo = require('arpad');

var elo = new Elo(32);

var alice = 1600;
var bob = 1300;

alice = elo.newRatingIfWon(alice, bob);
console.log("Alice's new score if she won:", alice); // 1605

bob = elo.newRatingIfWon(bob, alice);
console.log("Bob's new score if he won:", bob); // 1327
```

## Running Tests

First install mocha

```
npm install -g mocha
```

Then run either of the following from the root of the repository

```
npm test
mocha
```

## License

MIT
