const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pantry = require('../models/Pantry');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, postcode, preferredSupermarket, useMetric } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      name,
      postcode,
      preferredSupermarket,
      useMetric
    });

    await user.save();

    // Create empty pantry for user
    const pantry = new Pantry({ userId: user._id, items: [] });
    await pantry.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
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
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
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
        email: user.email,
        name: user.name,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Error logging in',
      details: error.message
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = req.user;
    const pantry = await Pantry.findOne({ userId: user._id });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      },
      pantry: pantry.items
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching profile',
      details: error.message
    });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'postcode', 'preferredSupermarket', 'useMetric', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    const user = req.user;

    updates.forEach(update => {
      user[update] = req.body[update];
    });

    await user.save();

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        postcode: user.postcode,
        preferredSupermarket: user.preferredSupermarket,
        useMetric: user.useMetric
      }
    });
  } catch (error) {
    res.status(400).json({
      error: 'Error updating profile',
      details: error.message
    });
  }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({
      error: 'Error logging out',
      details: error.message
    });
  }
});

module.exports = router; 