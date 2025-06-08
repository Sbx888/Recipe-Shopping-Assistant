import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const supermarketsByCountry = {
  UK: ['tesco', 'asda', 'sainsburys', 'morrisons', 'waitrose', 'aldi', 'lidl'],
  AU: ['woolworths', 'coles', 'aldi', 'iga', 'foodland', 'harris_farm', 'costco'],
  US: ['walmart', 'kroger', 'costco', 'target', 'wholeFoods', 'traderjoes', 'safeway'],
  NZ: ['countdown', 'newworld', 'paknsave', 'foursquare', 'freshchoice', 'supervalue']
};

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    enum: Object.keys(supermarketsByCountry),
    default: 'UK'
  },
  postcode: {
    type: String,
    trim: true
  },
  preferredSupermarket: {
    type: String,
    validate: {
      validator: function(v) {
        return supermarketsByCountry[this.country].includes(v);
      },
      message: props => `${props.value} is not a valid supermarket for the selected country!`
    }
  },
  useMetric: {
    type: Boolean,
    default: true
  },
  dietaryRequirements: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher']
  }],
  preferences: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Preference'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Hide sensitive data when converting to JSON
UserSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create preferences on user creation
UserSchema.post('save', async function(doc) {
  if (!doc.preferences) {
    const Preference = mongoose.model('Preference');
    const preferences = new Preference({ userId: doc._id });
    await preferences.save();
    doc.preferences = preferences._id;
    await doc.save();
  }
});

const User = mongoose.model('User', UserSchema);

export default User; 