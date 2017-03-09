var mongoose = require('mongoose');
var Schema = mongoose.Schema
mongoose.Promise = global.Promise;
const { Types: { ObjectId } } = Schema;
mongoose.connect('mongodb://localhost:27017/cityme');

var ReviewSchema = Schema({
  author: {
		type: ObjectId,
		required: true,
	},
	localBiz: {
		type: ObjectId,
		required: true
	},
	postedTime: {
		type: Date,
		default: Date.now,
	},
	content: String,
	rating: {
		type: Number,
		min: 1,
		max: 5
	},
	likes: [{
		type: ObjectId,
		ref: 'User'
	}],
	// only for reviews collected by editors
	byEditor: String,
	ownerReply: {
		content: {
			type: String,
		},
		createdAt: {
			type: Date,
		},
		updatedAt: {
			type: Date,
		},
	}
});


const LocalBizSchema = new Schema({
	active: {
		type: Boolean,
		default: true,
		index: true,
	},
	name: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	categories: [{
		type: String,
		index: true,
	}],
	serves: [{
		type: String,
		index: true,
	}],
	utilities: [{
		key: String,
		value: Boolean,
	}],
	address: {
		type: String,
	},
	email: String,
	priceRange: String,
	averagePrice: Number,
	city: {
		type: String,
		required: true,
		index: true,
	},
	district: {
		type: String,
		index: true,
	},
	// should be a Vietnamese phone number
	// https://en.wikipedia.org/wiki/Telephone_numbers_in_Vietnam
	phoneNumbers: [String],
	website: String,
	openHours: {
		from: {
			hour: Number,
			minute: Number,
		},
		to: {
			hour: Number,
			minute: Number,
		},
	},
	mainPhoto: String, // ID of the image on the media server
	brand: {
		type: ObjectId,
		index: true,
	},

	likes: [{
		type: ObjectId,
	}],
	rating: { // derived
		type: Number,
		index: true,
	},
});

const UserSchema = new Schema({
	email: {
		type: String,
	},
	emailVerified: Boolean,
	emailVerificationCode: String,
	// may be empty for users that login by facebook
	password: {
		bcrypt: String,
	},
	passwordReset: {
		code: String,
		expiredAt: Date,
		disabledUntil: Date, // if max tries exceeded
		triesRemaining: Number,
	},

	firstName: String,
	middleName: String,
	lastName: String,
	displayName: {
		type: String,
		required: true,
		index: 'text',
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	isEditor: Boolean,
	// moderators can see which review are posted by which editor
	isModerator: Boolean,

	facebook: {
		facebookId: String,
		shortTermToken: {
			tokenExpire: Date,
			accessToken: String
		},
		longTermToken: {
			tokenExpire: Date,
			accessToken: String
		}
	},
	signupSource: String, // email, facebook, google

	// gender is String to be compatible with info retrieved from FB
	gender: String, // male | female
	birthDate: Date,
	locale: String,

	phoneNumber: String,
	city: String,
	profilePicture: String, // ID of the image on the media server

	// Interactions
	followers: [{
		type: ObjectId,
	}],
	savedReviews: [{
		type: ObjectId,
	}],
	savedDeals: [{
		type: ObjectId,
	}],

	createdAt: {
		type: Date,
		default: Date.now,
	},
});


const BrandSchema = new Schema({
	active: {
		type: Boolean,
		default: true,
		index: true,
	},
	name: {
		type: String,
		required: true
	},
	slug: {
		type: String,
		required: true,
		unique: true,
	},
	localBizs: [{ // derived
		type: ObjectId
	}],
	email: String,
	// should be a Vietnamese phone number
	// https://en.wikipedia.org/wiki/Telephone_numbers_in_Vietnam
	phoneNumbers: [String],
	website: String,
	logo: String, // ID of the image on the media server
	categories: [{
		type: String,
		index: true,
	}],
	serves: [{
		type: String,
		index: true,
	}],

	rating: { // derived
		type: Number,
		index: true,
	},
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