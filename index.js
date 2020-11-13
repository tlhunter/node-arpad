'use strict';

const DEFAULT_K_FACTOR = 32;

/**
 * Instantiates a new ELO instance
 *
 * @param {Number|Object} k_factor The maximum rating change, defaults to 32
 * @param {Number} min The minimum value a calculated rating can be
 * @param {Number} max Integer The maximum value a calculated rating can be
 */
module.exports = class ELO {
  /**
   * This is some magical constant used by the ELO system
   *
   * @link http://en.wikipedia.org/wiki/Elo_rating_system#Performance_rating
   */
  static #PERF = 400;

  static #OUTCOME_LOST = 0;
  static #OUTCOME_TIED = 0.5;
  static #OUTCOME_WON = 1;

  #minimum = -Infinity;
  #maximum = Infinity;
  #k_factor = DEFAULT_K_FACTOR;

  constructor(k_factor, min, max) {
    if (k_factor) {
      this.#k_factor = k_factor;
    }

    if (typeof min !== 'undefined') {
      this.#minimum = min;
    }

    if (typeof max !== 'undefined') {
      this.#maximum = max;
    }
  }

  /**
   * Returns the K-factor depending on the provided rating
   *
   * @arg {Number} rating A players rating, e.g. 1200
   * @return {Number} The determined K-factor, e.g. 32
   */
  getKFactor(rating) {
    let k_factor = null;

    if (typeof this.#k_factor === 'number') {
      return this.#k_factor;
    }

    if (!rating) {
      rating = 0;
    }

    if (this.#k_factor.default) {
      k_factor = this.#k_factor.default;
    }

    Object.keys(this.#k_factor).forEach((minimum_rating) => {
      let current_k_factor = this.#k_factor[minimum_rating];

      if (minimum_rating <= rating) {
        k_factor = current_k_factor;
      }
    });

    return k_factor;
  }

  /**
   * Returns the minimum acceptable rating value
   *
   * @return {Number} The minimum rating value, e.g. 100
   */
  getMin() {
    return this.#minimum;
  }

  /**
   * Returns the maximum acceptable rating value
   *
   * @return {Number} The maximum rating value, e.g. 2700
   */
  getMax() {
    return this.#maximum;
  }

  /**
   * When setting the K-factor, you can do one of three things.
   * Provide a falsey value, and we'll default to using 32 for everything.
   * Provide a number, and we'll use that for everything.
   * Provide an object where each key is a numerical lower value.
   *
   * @arg {Number|Object} k_factor The K-factor to use
   * @return {Object} The current object for chaining purposes
   */
  setKFactor (k_factor) {
    if (k_factor) {
      this.#k_factor = k_factor;
    } else {
      this.#k_factor = DEFAULT_K_FACTOR;
    }

    return this;
  }

  /**
   * Sets the minimum acceptable rating
   *
   * @arg {Number} minimum The minimum acceptable rating, e.g. 100
   * @return {Object} The current object for chaining purposes
   */
  setMin(minimum) {
    this.#minimum = minimum;

    return this;
  }

  /**
   * Sets the maximum acceptable rating
   *
   * @arg {Number} maximum The maximum acceptable rating, e.g. 2700
   * @return {Object} The current object for chaining purposes
   */
  setMax(maximum) {
    this.#maximum = maximum;

    return this;
  }

  /**
   * Determines the expected "score" of a match
   *
   * @param {Number} rating The rating of the person whose expected score we're looking for, e.g. 1200
   * @param {Number} opponent_rating the rating of the challening person, e.g. 1200
   * @return {Number} The score we expect the person to recieve, e.g. 0.5
   *
   * @link http://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details
   */
  expectedScore(rating, opponent_rating) {
    const difference = opponent_rating - rating;

    return 1 / (1 + Math.pow(10, difference/ELO.#PERF));
  }

  /**
   * Returns an array of anticipated scores for both players
   *
   * @param {Number} player_1_rating The rating of player 1, e.g. 1200
   * @param {Number} player_2_rating The rating of player 2, e.g. 1200
   * @return {Array} The anticipated scores, e.g. [0.25, 0.75]
   */
  bothExpectedScores(player_1_rating, player_2_rating) {
    return [
      this.expectedScore(player_1_rating, player_2_rating),
      this.expectedScore(player_2_rating, player_1_rating)
    ];
  }

  /**
   * The calculated new rating based on the expected outcone, actual outcome, and previous score
   *
   * @param {Number} expected_score The expected score, e.g. 0.25
   * @param {Number} actual_score The actual score, e.g. 1
   * @param {Number} previous_rating The previous rating of the player, e.g. 1200
   * @return {Number} The new rating of the player, e.g. 1256
   */
  newRating(expected_score, actual_score, previous_rating) {
    const difference = actual_score - expected_score;
    let rating = Math.round(previous_rating + this.getKFactor(previous_rating) * difference);

    if (rating < this.#minimum) {
      rating = this.#minimum;
    } else if (rating > this.#maximum) {
      rating = this.#maximum;
    }

    return rating;
  }

  /**
   * Calculates a new rating from an existing rating and opponents rating if the player won
   *
   * This is a convenience method which skips the score concept
   *
   * @param {Number} rating The existing rating of the player, e.g. 1200
   * @param {Number} opponent_rating The rating of the opponent, e.g. 1300
   * @return {Number} The new rating of the player, e.g. 1300
   */
  newRatingIfWon(rating, opponent_rating) {
    const odds = this.expectedScore(rating, opponent_rating);

    return this.newRating(odds, ELO.#OUTCOME_WON, rating);
  }

  /**
   * Calculates a new rating from an existing rating and opponents rating if the player lost
   *
   * This is a convenience method which skips the score concept
   *
   * @param {Number} rating The existing rating of the player, e.g. 1200
   * @param {Number} opponent_rating The rating of the opponent, e.g. 1300
   * @return {Number} The new rating of the player, e.g. 1180
   */
  newRatingIfLost(rating, opponent_rating) {
    const odds = this.expectedScore(rating, opponent_rating);

    return this.newRating(odds, ELO.#OUTCOME_LOST, rating);
  }

  /**
   * Calculates a new rating from an existing rating and opponents rating if the player tied
   *
   * This is a convenience method which skips the score concept
   *
   * @param {Number} rating The existing rating of the player, e.g. 1200
   * @param {Number} opponent_rating The rating of the opponent, e.g. 1300
   * @return {Number} The new rating of the player, e.g. 1190
   */
  newRatingIfTied(rating, opponent_rating) {
    const odds = this.expectedScore(rating, opponent_rating);

    return this.newRating(odds, ELO.#OUTCOME_TIED, rating);
  }
};
