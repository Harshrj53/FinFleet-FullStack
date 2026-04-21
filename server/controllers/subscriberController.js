import Subscriber from '../models/Subscriber.js';

export const addSubscriber = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const subscriber = await Subscriber.create({ email, source: source || 'newsletter' });

    res.status(201).json({ message: 'Successfully subscribed', subscriber });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ message: 'Email already subscribed' });
    }
    res.status(500).json({ message: error.message });
  }
};
