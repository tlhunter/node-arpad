# Arpad: ELO Rating System for Node.js

This is an implementation of [ELO](http://en.wikipedia.org/wiki/Elo_rating_system) for Node.js (ELO is named after Arpad Elo, hence the package name).
This module is heavily tested and has many features used in real-world ELO situations.

## Installation

```bash
$ npm install arpad
```

## Simple Usage

This is a fairly simple example showing the most common usage for Arpad:

```javascript
const Elo = require('arpad');

const elo = new Elo();

let alice = 1_600;
let bob = 1_300;

let new_alice = elo.newRatingIfWon(alice, bob);
console.log("Alice's new rating if she won:", new_alice); // 1,605

let new_bob = elo.newRatingIfWon(bob, alice);
console.log("Bob's new rating if he won:", new_bob); // 1,327
```

## Complex Usage

This is a more complex example, making use of K-factor tables and score values:

```javascript
const Elo = require('arpad');

const uscf = {
  default: 32,
  2100: 24,
  2400: 16
};

const min_score = 100;
const max_score = 10_000;

const elo = new Elo(uscf, min_score, max_score);

let alice = 2_090;
let bob = 2_700;

let odds_alice_wins = elo.expectedScore(alice, bob);
console.log("The odds of Alice winning are about:", odds_alice_wins); // 0.029
alice = elo.newRating(odds_alice_wins, 1.0, alice);
console.log("Alice's new rating after she won:", alice); // 2121

odds_alice_wins = elo.expectedScore(alice, bob);
console.log("The odds of Alice winning again are about:", odds_alice_wins); // 0.034
alice = elo.newRating(odds_alice_wins, 1.0, alice);
console.log("Alice's new rating if she won again:", alice); // 2144
```

## Running Tests

If you'd like to contribute be sure to run `npm install` to get the required packages and then make changes.
Afterwards simply run the tests.
If everything passes your Pull Request should be ready.

```bash
$ npm test
```

## License

MIT
