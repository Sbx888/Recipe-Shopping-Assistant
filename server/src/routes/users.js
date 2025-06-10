import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, country, postcode, preferredSupermarket, useMetric } = req.body;
    
    // Validate input
    if (!name || !email || !password || !country || !postcode || !preferredSupermarket) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate username from email (everything before @)
    let username = email.toLowerCase().split('@')[0];
    let usernameTaken = true;
    let attempts = 0;
    
    // Keep trying until we find an available username
    while (usernameTaken && attempts < 10) {
      const existingUsername = await User.findOne({ username });
      if (!existingUsername) {
        usernameTaken = false;
      } else {
        // If username exists, append a random number
        const randomNum = Math.floor(Math.random() * 1000);
        username = `${email.toLowerCase().split('@')[0]}${randomNum}`;
        attempts++;
      }
    }

    if (usernameTaken) {
      return res.status(400).json({ error: 'Could not generate a unique username. Please try again.' });
    }

    // Create new user
    const user = new User({
      username,
      name,
      email: email.toLowerCase(),
      password,
      country,
      postcode,
      preferredSupermarket,
      useMetric: useMetric ?? true
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        country: user.country,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Error creating user',
      details: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        country: user.country,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error logging in',
      details: error.message
    });
  }
});

// Get user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        country: user.country,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching profile',
      details: error.message
    });
  }
});

export default router; 