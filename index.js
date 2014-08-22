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

// http://en.wikipedia.org/wiki/Elo_rating_system#Performance_rating
var PERFORMANCE_CONSTANT = 400;

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

// http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
ELO.prototype.expectedScore = function(score, opponent_score) {
  var difference = opponent_score - score;

  var performance = 1 / (1 + Math.pow(10, difference/PERFORMANCE_CONSTANT));

  return performance;
};

ELO.prototype.bothExpectedScores = function(player_1, player_2) {
  return [
    this.expectedScore(player_1, player_2),
    this.expectedScore(player_2, player_1)
  ];
};

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

ELO.prototype.newRatingIfWon = function(score, opponent_score) {
  var odds = this.expectedScore(score, opponent_score);

  return this.newRating(odds, OUTCOMES.won, score);
};

ELO.prototype.newRatingIfLost = function(score, opponent_score) {
  var odds = this.expectedScore(score, opponent_score);

  return this.newRating(odds, OUTCOMES.lost, score);
};

ELO.prototype.newRatingIfTied = function(score, opponent_score) {
  var odds = this.expectedScore(score, opponent_score);

  return this.newRating(odds, OUTCOMES.tied, score);
};

module.exports = ELO;
