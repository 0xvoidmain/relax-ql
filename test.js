if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
}

var _ = require('lodash');
var mql = require('./src/mql');
var ql = require('./client');

mql.init({
  models: require('./db')
});
var query = mql(`
  reviews: Review[$review_id]
    rating
    likes
  `, {
    review_id: '56606f2cc614fa1100320e61'
  });

query.exec()
  .then(v => {
    console.log("result:", JSON.stringify(v, null, 4));
  })
  .catch(ex => console.log(ex));


query = ql`reviews: Review[${123}]`;

console.log(JSON.stringify(query, null, 4));