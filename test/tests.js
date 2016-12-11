#!/usr/bin/env node

'use strict';

var test = require('tape');

var Elo = require('../index.js');

test("sanity check", function(t) {
  t.ok(approximate(1, 1, 0));
  t.ok(approximate(1, 1));
  t.ok(approximate(9999.99999999, 9999.999999998));
  t.notOk(approximate(0.12345, 0.12347));
  t.notOk(approximate(0.12347, 0.12345));
  t.ok(approximate(0.12345, 0.12346));
  t.ok(approximate(0.12346, 0.12345));
  t.end();
});

test("should have expected defaults", function(t) {
  var myElo = new Elo();

  t.equal(myElo.getKFactor(), 32);
  t.equal(myElo.getMin(), -Infinity);
  t.equal(myElo.getMax(), Infinity);
  t.end();
});

test("should allow passing in defaults via the constructor", function(t) {
  var fide = new Elo(20, 2251, 2825);

  t.equal(fide.getKFactor(), 20);
  t.equal(fide.getMin(), 2251);
  t.equal(fide.getMax(), 2825);
  t.end();
});

test("should allow updating of parameters after instantiation", function(t) {
  var uscf = new Elo(31, 0, Infinity);

  t.equal(uscf.getKFactor(), 31);
  t.equal(uscf.getMin(), 0);
  t.equal(uscf.getMax(), Infinity);

  uscf.setMin(100).setMax(2500).setKFactor(27);

  t.equal(uscf.getMin(), 100);
  t.equal(uscf.getMax(), 2500);
  t.equal(uscf.getKFactor(), 27);
  t.end();
});

test("prevents scores leaving boundaries", function(t) {
  var elo = new Elo(32, 100, 2800);

  var alice = 2000;

  for (var i = 0; i < 100; i++) {
    alice = elo.newRating(1, 0, alice);
  }

  t.equal(alice, 100);

  var bob = 200;

  for (var j = 0; j < 100; j++) {
    bob = elo.newRating(0, 1, bob);
  }

  t.equal(bob, 2800);
  t.end();
});

test("should determine the probability that someone will win or lose", function(t) {
  var myElo = new Elo(32, 0, 2500);

  var alice = 1400;
  var bob = 1200;

  var odds_alice_wins = myElo.expectedScore(alice, bob);
  var odds_bob_wins = myElo.expectedScore(bob, alice);

  t.ok(odds_alice_wins <= 1);
  t.ok(odds_alice_wins >= 0);

  t.ok(odds_bob_wins <= 1);
  t.ok(odds_bob_wins >= 0);

  t.ok(odds_alice_wins > odds_bob_wins);
  t.ok(approximate(odds_alice_wins + odds_bob_wins, 1));

  var both_odds = myElo.bothExpectedScores(alice, bob);

  t.equal(odds_alice_wins, both_odds[0]);
  t.equal(odds_bob_wins, both_odds[1]);
  t.end();
});

test("should calculate same scores as WikiPedia", function(t) {
  var elo = new Elo(32);

  var rating = 1613;

  var opponents = [
    {rating: 1609, score: 0.506},
    {rating: 1477, score: 0.686},
    {rating: 1388, score: 0.785},
    {rating: 1586, score: 0.539},
    {rating: 1720, score: 0.351}
  ];

  opponents.forEach(function(pair) {
    var actual = elo.expectedScore(rating, pair.rating);
    t.ok(approximate(actual, pair.score, 0.001));
  });
  t.end();
});

test("should calculate same ratings as WikiPedia", function(t) {
  var elo = new Elo(32);

  var current_rating = 1613;
  var actual_score = 3;
  var expected_score = 2.867;

  t.equal(elo.newRating(expected_score, actual_score, current_rating), 1617);
  t.end();
});

test("should do some end-to-end examples", function(t) {
  var elo = new Elo(24, 200, 3000);

  var alice_rating = 1600;
  var bob_rating = 1300;

  var expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
  var expected_bob_score = elo.expectedScore(bob_rating, alice_rating);

  t.ok(approximate(expected_alice_score, 0.849, 0.001));
  t.ok(approximate(expected_bob_score, 0.151, 0.001));

  // Assuming Alice wins (which is expected)

  var alice_new_rating = elo.newRating(expected_alice_score, 1, alice_rating);
  var bob_new_rating = elo.newRating(expected_bob_score, 0, bob_rating);

  t.equal(alice_new_rating, 1604);
  t.equal(bob_new_rating, 1296);

  // Assuming Bobb wins (which is unexpected)

  alice_new_rating = elo.newRating(expected_alice_score, 0, alice_rating);
  bob_new_rating = elo.newRating(expected_bob_score, 1, bob_rating);

  t.equal(alice_new_rating, 1580);
  t.equal(bob_new_rating, 1320);
  t.end();
});

test("should get same results when using convenience methods", function(t) {
  var elo = new Elo(32);

  var alice_rating = 1275;
  var bob_rating = 1362;

  var expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
  var alice_new_rating = elo.newRating(expected_alice_score, 1, alice_rating);
  var alice_new_rating_convenient = elo.newRatingIfWon(alice_rating, bob_rating);

  t.equal(alice_new_rating, alice_new_rating_convenient);

  expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
  alice_new_rating = elo.newRating(expected_alice_score, 0, alice_rating);
  alice_new_rating_convenient = elo.newRatingIfLost(alice_rating, bob_rating);

  t.equal(alice_new_rating, alice_new_rating_convenient);

  expected_alice_score = elo.expectedScore(alice_rating, bob_rating);
  alice_new_rating = elo.newRating(expected_alice_score, 0.5, alice_rating);
  alice_new_rating_convenient = elo.newRatingIfTied(alice_rating, bob_rating);

  t.equal(alice_new_rating, alice_new_rating_convenient);
  t.end();
});

test("should do valid K-factor lookups with no numeric K-Factor provided", function(t) {
  var elo = new Elo();

  t.equal(elo.getKFactor(), 32);
  t.equal(elo.getKFactor(-Infinity), 32);
  t.equal(elo.getKFactor(Infinity), 32);
  t.equal(elo.getKFactor(0), 32);
  t.equal(elo.getKFactor(1), 32);
  t.end();
});

test("should do valid K-factor lookups with a numeric K-Factor provided", function(t) {
  var elo = new Elo(42);

  t.equal(elo.getKFactor(), 42);
  t.equal(elo.getKFactor(-Infinity), 42);
  t.equal(elo.getKFactor(Infinity), 42);
  t.equal(elo.getKFactor(0), 42);
  t.equal(elo.getKFactor(1), 42);
  t.end();
});

test("table: should perform valid K-factor lookups", function(t) {
  var uscf_table = {
    0: 32,
    2100: 24,
    2400: 16
  };

  var elo = new Elo(uscf_table, 0, Infinity);

  t.equal(elo.getKFactor(), 32);
  t.equal(elo.getKFactor(0), 32);
  t.equal(elo.getKFactor(null), 32);
  t.equal(elo.getKFactor(100), 32);
  t.equal(elo.getKFactor(-Infinity), null); // Or should this throw an error?
  t.equal(elo.getKFactor(-1), null); // Or should this throw an error?
  t.equal(elo.getKFactor(2099), 32);
  t.equal(elo.getKFactor(2100), 24);
  t.equal(elo.getKFactor(Infinity), 16);
  t.end();
});

test("table: should allow default for lower bounds lookups", function(t) {
  var table = {
    0: 32,
    default: 48
  };

  var elo = new Elo(table);

  t.equal(elo.getKFactor(), 32);
  t.equal(elo.getKFactor(0), 32);
  t.equal(elo.getKFactor(1), 32);
  t.equal(elo.getKFactor(-1), 48);
  t.equal(elo.getKFactor(-Infinity), 48);
  t.equal(elo.getKFactor(Infinity), 32);
  t.end();
});

test("table: should use proper table entries when calculating ratings", function(t) {
  var table = {
    default: 100,
    0: 50,
    1000: 25
  };

  var elo = new Elo(table, -2000, 2000);

  var alice = 500;
  var bob = 2000;
  var cathy = -500;

  t.equal(elo.newRatingIfWon(alice, bob), 550);
  t.equal(elo.newRatingIfWon(cathy, bob), -400);

  var derik = 950;

  derik = elo.newRatingIfWon(derik, bob);
  t.equal(derik, 1000); // +50
  derik = elo.newRatingIfWon(derik, bob);
  t.equal(derik, 1025); // +25
  t.end();
});

/**
 * is 0.99999999999999 === 0.99999999999999 ?
 */
function approximate(actual, anticipated, threshold) {
  if (!threshold) {
    threshold = 0.00001;
  }

  var difference = Math.abs(actual - anticipated);

  return difference < threshold;
}
