const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, '../users.json');

// Helper to read users
const getUsers = () => {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
};

// Helper to save users
const saveUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = getUsers();

    // Check if user exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already registered!' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    users.push({ id: Date.now(), name, email, password: hashedPassword });
    saveUsers(users);

    res.status(201).json({ message: 'Registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = getUsers();

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password!' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id },
      'musicappsecretkey123',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;