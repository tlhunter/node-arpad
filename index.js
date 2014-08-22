'use strict';

// Methods for determining the K-Factor
var METHODS = [
  'simple',     // Constant K-factor
  'table',      // Variable K-factor based on score
  'function'    // Something magical I'm inventing
];

var OUTCOMES = {
  'won': 1,
  'lost': 0,
  'tied': 0.5
};

/**
 * This is some magical constant used by the ELO system
 *
 * @link http://en.wikipedia.org/wiki/Elo_rating_system#Performance_rating
 */
var PERFORMANCE_CONSTANT = 400;

/**
 * Instantiates a new ELO instance
 *
 * @param k_factor Integer The maximum rating change, defaults to 32
 * @param min Integer The minimum value a calculated rating can be
 * @param max Integer The maximum value a calculated rating can be
 */
var ELO = function(k_factor, min, max) {
  this.k_factor = k_factor ? k_factor : 32;
  this.minimum = typeof min !== 'undefined' ? min : -Infinity;
  this.maximum = typeof max !== 'undefined' ? max : Infinity;

  // Which K-Factor method to use
  this.method = METHODS[0];
};

ELO.prototype.getMethods = function() {
  return METHODS;
};

ELO.prototype.getKFactor = function() {
  return this.k_factor;
};

ELO.prototype.getMin = function() {
  return this.minimum;
};

ELO.prototype.getMax = function() {
  return this.maximum;
};

ELO.prototype.setKFactor = function(k_factor) {
  this.k_factor = k_factor;

  return this;
};

ELO.prototype.setMin = function(minimum) {
  this.minimum = minimum;

  return this;
};

ELO.prototype.setMax = function(maximum) {
  this.maximum = maximum;

  return this;
};

/**
 * Determines the expected "score" of a match
 *
 * @param rating Number The rating of the person whose expected score we're looking for, e.g. 1200
 * @param opponent_rating Number the rating of the challening person, e.g. 1200
 * @return Number The score we expect the person to recieve, e.g. 0.5
 *
 * @link http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
 */
ELO.prototype.expectedScore = function(rating, opponent_rating) {
  var difference = opponent_rating - rating;

  return 1 / (1 + Math.pow(10, difference/PERFORMANCE_CONSTANT));
};

/**
 * Returns an array of anticipated scores for both players
 *
 * @param player_1_rating Number The rating of player 1, e.g. 1200
 * @param player_2_rating Number The rating of player 2, e.g. 1200
 * @return Array The anticipated scores, e.g. [0.25, 0.75]
 */
ELO.prototype.bothExpectedScores = function(player_1_rating, player_2_rating) {
  return [
    this.expectedScore(player_1_rating, player_2_rating),
    this.expectedScore(player_2_rating, player_1_rating)
  ];
};

/**
 * The calculated new rating based on the expected outcone, actual outcome, and previous score
 *
 * @param expected Number The expected score, e.g. 0.25
 * @param score Number The actual score, e.g. 1
 * @param previous Number The previous rating of the player, e.g. 1200
 * @return Number The new rating of the player, e.g. 1256
 */
ELO.prototype.newRating = function(expected, score, previous) {
  var difference = score - expected;
  var rating = Math.round(previous + this.k_factor * difference);

  if (rating < this.minimum) {
    rating = this.minimum;
  } else if (rating > this.maximum) {
    rating = this.maximum;
  }

  return rating;
};

/**
 * Calculates a new rating from an existing rating and opponents rating if the player won
 *
 * This is a convenience method which skips the score concept
 *
 * @param rating Number The existing rating of the player, e.g. 1200
 * @param rating Number The rating of the opponent, e.g. 1300
 * @return Number The new rating of the player, e.g. 1300
 */
ELO.prototype.newRatingIfWon = function(rating, opponent_rating) {
  var odds = this.expectedScore(rating, opponent_rating);

  return this.newRating(odds, OUTCOMES.won, rating);
};

/**
 * Calculates a new rating from an existing rating and opponents rating if the player lost
 *
 * This is a convenience method which skips the score concept
 *
 * @param rating Number The existing rating of the player, e.g. 1200
 * @param rating Number The rating of the opponent, e.g. 1300
 * @return Number The new rating of the player, e.g. 1180
 */
ELO.prototype.newRatingIfLost = function(rating, opponent_rating) {
  var odds = this.expectedScore(rating, opponent_rating);

  return this.newRating(odds, OUTCOMES.lost, rating);
};

/**
 * Calculates a new rating from an existing rating and opponents rating if the player tied
 *
 * This is a convenience method which skips the score concept
 *
 * @param rating Number The existing rating of the player, e.g. 1200
 * @param rating Number The rating of the opponent, e.g. 1300
 * @return Number The new rating of the player, e.g. 1190
 */
ELO.prototype.newRatingIfTied = function(rating, opponent_rating) {
  var odds = this.expectedScore(rating, opponent_rating);

  return this.newRating(odds, OUTCOMES.tied, rating);
};

module.exports = ELO;
