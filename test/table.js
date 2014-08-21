var assert = require('assert');
var Elo = require('../index.js');

describe.skip('Basic Usage', function() {
  it("should allow creation of K-factor tables", function() {
    var elo = new Elo();

    elo.setMethod('table');

    var uscf_table = {
      0: 32,
      2100: 24,
      2400: 16
    };

    elo.setTable(uscf_table);
  });
});
