if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
}

var _ = require('lodash');
var mql = require('./src/mql');

mql.init({
  models: require('./db')
});
var query = mql`
  reviews: Review(rating< 2).limit(10)
    rating
    likes
  `;

query.exec()
  .then(v => {
    console.log("result:", JSON.stringify(v, null, 4));
  })
  .catch(ex => console.log(ex));
