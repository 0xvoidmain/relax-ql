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
The code above is a simple query. And now, we will do with a more complex query. We will get 10 reviews from database and each review contain information of reviewer.

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
ql`
  *: Review().limit(10)
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
ql`
  *: Review().limit(10)
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
## Begin with Find or FindOne

Find 10 reviews with rating = 5
```javascript
ql`*: Review(rating == 5).limit(10)`
.exec()
.then(reviews => console.log(reviews));
```
or
```javascript
ql`*: Review.find(rating == 5).limit(10)`
```

FindOne review with rating >= 3
```javascript
ql`*: Review[rating == 5]`
```
or
```javascript
ql`*: Review.findOne(rating == 5)`
```

## Support query selectors
### Comparison
```
== : $eq
!= : $ne
< : $lt
> : $gt
<= : $lte
>= : $gte
IN : $in
NIN : $nin
in : $in
nin : $nin
```

### Logical
```
&& : $and
```

### Element
```
EXISTS : $exists
TYPE : $type
exists : $exists
type : $type
```

### Evaluation
```
MOD : $mod
REGEX : $regex
TEXT : $text
WHERE : $where
mod : $mod
regex : $regex
text : $text
where : $where
```
### Array
```
ALL : $all
MATCH : $elemMatch
SIZE: $size
all : $all
match : $elemMatch
size: $size
```

## Example query selectors

### Example 1
```
likeNumber >= 5 && likeNumber < 100 && rating IN [2, 3] && comments EXISTS true
```

parse to

```javascript
{
  likeNumber: {
    $gte: 5,
    $lt: 100
  },
  rating: {
    $in: [2, 3]
  },
  comments: {
    $exists: true
  }
}
```

## How to write a query selector

The bellow is rules for write query selector.

1. Attribute always is left side of operator and value to compare must be right side of operator
2. Currently, relax-ql not support OR logical operation. Only use and. But we absolutely write a complex query selector. I will show to you in next session.
3. relax-ql support some type like: String, Number, Boolean, Array, Object, Regex. Example: "abc" or 'abc' is string, [1, 2, 3] is array of number, {a : 1} is an object, true or TRUE or False is booleam type and /abcd/ig is regex type.
4. Can pass value by params, also pass a query selector by params. I'll show to you in next session.

## Advance Find and FindOne
### Find with complex query selector
1.
```javascript
ql`reviews: Review(likeNumber >= 5 && likeNumber < 100 && rating IN [2, 3] && comments EXISTS true)`
```
2.
```javascript
ql`reviews: Review(${{
    $or: [{
      likeNumber: 5
    }, {
      likeNumber: 4
    }]
  }})`
```
or use param
```javascript
var reviewQuery = {
  $or: [{
    likeNumber: 5
  }, {
    likeNumber: 4
  }],
  rating: {
    $in: [1, 2]
  },
  comments: {
    $all: [
      { "$elemMatch" : { likeNumber: { $gt: 50, $lt: 100} } },
      { "$elemMatch" : { content : { $regex: /abcd/i } } }
    ]
  }
}
ql`reviews: Review(${reviewQuery})`
```

### Find with options
relax-ql support limit, skip, sort (ASC, DESC)
```javascript
ql`reviews: Review(likeNumber >= 5).limit(10).skip(10).DESC('rating').ASC('createdAt')`
```

Note: Sepecial support *unlean* optional. Because the query default call .lean() function. When we use unlean option, the query will not call .lean(). It very usefull when you defined some virtual atributes. Example:

Model:
```javascript
var PersonSchema = new Schema({
  name: {
    first: String,
    last: String
  }
}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});
PersonSchema
  .virtual('displayName')
  .get(function () {
    return this.name.first + ' ' + this.name.last;
  });

var Person = mongoose.model('Person', PersonSchema);
```
Don't use unlean()
```javascript
ql`*: Person[]`
.exec()
.then(p => console.log(p));
// display on screen
/*
{
  name: {
    first: 'abc',
    last: 'def'
  }
}
*/
```

Use unlean() optional
```javascript
ql`*: Person[].unlean()`
.exec()
.then(p => console.log(p));
// display on screen
/*
{
  name: {
    first: 'abc',
    last: 'def'
  },
  displayName: 'abc def'
}
*/
```

## Selection and projection

### Selection
```javascript
ql`
  reviews: Review(likeNumber >= 5)
    comments
    content
    rating
`
```
or
```javascript
ql`
  status: Status[]
    content
    user
      name
      gender

`
```
It'll be
```javascript
Status.findOne()
  .select({
    content: true,
    user: true,
    'user.name': true,
    'user.gender': true
  })
```

### Projection
Support
```
slice : $slice
SLICE : $slice
match : $elemMatch
MATCH : $elemMatch
meta : $meta
META : $meta
```
Example:
```javascript
ql`
  status: Status[]
    content
    likes(3)
    comments(slice: 3)
`
```
=>
```javascript
Status.findOne()
  .select({
    content: true,
    'likes.$': 3,
    comments: {
      $slice: 3
    }
  })
```

## Nested query

Example:
```javascript
ql`
  reviews: Review(rating >= 3).limit(5)
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
```

### Keyword:
- *this*: The pointer to parent
- *this.$value*: The value of parent
- := is select this attribute and result of query will overide to old value.
- '*' is result of child query will overide to parent value

### How to access data of parent
Can you see the format of relax-ql like this:
```javascript
ql`
  key_name: Model.function(query_selector).optional().optional()
    attr_selected
    attr_selected
    key_name: Model.function(query_selector).optional().optional()
      attr_selected
      attr_selected

    attr_selected:= Model.function(query_selector).optional().optional()
      attr_selected
        key_name: Model.function(query_selector).optional().optional()
          attr_selected
          attr_selected
    attr_selected
      *: Model.function(query_selector).optional().optional()
        attr_selected
        attr_selected

`
```
We have two way to access to parent data.
1. Use *this*
- It will access to nearest parent data
2. Use key_name
- It will access to first parent match with key_name

## Roadmap

- Support all logical: AND, OR, NOT
- Optimize query findOne