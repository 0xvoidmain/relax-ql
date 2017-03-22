# What is relax-ql?
A simple query language for mongoodb. It base on mongoosejs. Everything is too easy to getting done your job.
Write LESS, do MORE and Let's RELAX (after done :v)

# Models
```javascript
var ReviewSchema = Schema({
  author: ObjectId,
	localBiz: ObjectId,
	postedTime: Date,
	content: String,
	rating: Number,
	likes: [ObjectId]   //Array of users id liked this review
});
const LocalBizSchema = new Schema({
	name: String,
	categories: [String],
	address: String,
	rating: Number
});

const UserSchema = new Schema({
	email: String,
	displayName: String
});

const BrandSchema = new Schema({
	name: String,
	localBizs: [ObjectId] //Array of localbizs id of this brand
});

var Review = mongoose.model('Review', ReviewSchema);
var LocalBiz = mongoose.model('LocalBiz', LocalBizSchema);
var User = mongoose.model('User', UserSchema);
var Brand = mongoose.model('Brand', BrandSchema);

module.exports = {
  Review,
  LocalBiz,
  User,
  Brand
}
```

# Setup relax-ql
```javascript
var ql = require('relax-ql');
ql.add({
  models: require('./db')
});
```

# Example 1
You want get 10 reviews from database.

With mongoosejs:
```javascript
Review
  .find()
  .limit(10)
  .lean()
  .exec()
  .then(reviews => console.log(reviews));
```

With relax-ql:
```javascript
ql`*: Review().limit(10)`
  .exec()
  .then(result => console.log(result));
```

# Example 2
Bellow is a simple query. And now, we will do with a more complex query. We will get 10 reviews from database and each review contain information of reviewer.

With mongoosejs:
```javascript
Review
  .find()
  .limit(10)
  .lean()
  .exec()
  .then(reviews => {
    return Promise.all(
      reviews.map(review => new Promise((resolve, reject) => {
        User.findOne({
          _id: review.author
        })
        .lean()
        .exec()
        .then(user => {
          review.authorDetail = user;
          resolve(review);
        })
        .catch(err => eject(err))
      }))
    )
  })
  .then(reviews => console.log(reviews));
```

With relax-ql:
```javascript
ql`*: Review().limit(10)
  authorDetail: User[this.author]`
.exec()
.then(reviews => console.log(reviews));
```

# Example 3
Select and projection data

With mongoosejs:
```javascript
Review
  .find()
  .limit(10)
  .lean()
  .exec()
  .select({
    content: true,
    rating: true,
    author: true,
    likes: {
      $slice: 3
    }
  })
  .then(reviews => {
    return Promise.all(
      reviews.map(review => new Promise((resolve, reject) => {
        User.findOne({
          _id: review.author
        })
        .lean()
        .exec()
        .select({
          displayName: true,
          email: true
        })
        .then(user => {
          review.author = user;
          resolve(review);
        })
        .catch(err => eject(err))
      }))
    )
  })
  .then(reviews => console.log(reviews));
```

With relax-ql:
```javascript
ql`*: Review().limit(10)
  content
  rating
  likes(slice: 3)
  author:= User[this.author]
    displayName
    email`
.exec()
.then(reviews => console.log(reviews));
```

# So, what is relax-ql can do?
