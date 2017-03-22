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

//Example 1

// ql`*: Review().limit(10)`
//   .exec()
//   .then(result => console.log(result));

// Review
//   .find()
//   .limit(10)
//   .lean()
//   .exec()
//   .then(reviews => console.log(reviews));

//Example 2

// Review
//   .find()
//   .limit(10)
//   .lean()
//   .exec()
//   .then(reviews => {
//     return Promise.all(
//       reviews.map(review => new Promise((resolve, reject) => {
//         User.findOne({
//           _id: review.author
//         })
//         .lean()
//         .exec()
//         .then(user => {
//           review.authorDetail = user;
//           resolve(review);
//         })
//         .catch(err => eject(err))
//       }))
//     )
//   })
//   .then(reviews => console.log(reviews));

// ql`*: Review().limit(10)
//   authorDetail: User[this.author]`
// .exec()
// .then(result => console.log(result));

// Example 3

// Review
//   .find()
//   .select({
//     content: true,
//     rating: true,
//     author: true,
//     likes: {
//       $slice: 3
//     }
//   })
//   .limit(10)
//   .lean()
//   .exec()
//   .then(reviews => {
//     return Promise.all(
//       reviews.map(review => new Promise((resolve, reject) => {
//         User.findOne({
//           _id: review.author
//         })
//         .select({
//           displayName: true,
//           email: true
//         })
//         .lean()
//         .exec()
//         .then(user => {
//           review.author = user;
//           resolve(review);
//         })
//         .catch(err => eject(err))
//       }))
//     )
//   })
//   .then(reviews => console.log(reviews));

// ql`*: Review().limit(10)
//   content
//   rating
//   likes(slice: 3)
//   author:= User[this.author]
//     displayName
//     email`
// .exec()
// .then(reviews => console.log(reviews));

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