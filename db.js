var mongoose = require('mongoose');
var Schema = mongoose.Schema
mongoose.Promise = global.Promise;
const { Types: { ObjectId } } = Schema;
mongoose.connect('mongodb://localhost:27017/cityme');

var ReviewSchema = Schema({
  author: ObjectId,
  localBiz: ObjectId,
  postedTime: Date,
  content: String,
  rating: Number,
  likes: [ObjectId]
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
  localBizs: [ObjectId]
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