import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  source: {
    type: String,
    default: 'newsletter' // could be 'newsletter', 'registration', 'login'
  }
}, {
  timestamps: true
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
