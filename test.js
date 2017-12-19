if (typeof Promise === 'undefined') {
  require('es6-promise').polyfill();
}

var _ = require('lodash');
var db = require('./db');
var { Review, User, LocalBiz, Brand } = db;

var ql = require('./src/mql');
ql.add({
  models: require('./db')
});

ql`
  reviews: Review(rating >= 3).limit(10)
    author
    authorDetail: User[this.author]
      displayName
    localBiz:= LocalBiz[this.localBiz]
      name
      address
    likes
      *: User[this.$value]
        displayName
    relatedReviews: Review(localBiz == this.localBiz).limit(3)
      content
      author:= User[this.author]
        displayName
`
.exec()
.then(result => console.log(JSON.stringify(result, null, 4)));