const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/generate-waiter-code', async (req, res) => {
  try {
    const { restaurant_id, branch_id } = req.body;

    if (!restaurant_id || !branch_id) {
      return res.status(400).json({
        success: false,
        error: 'restaurant_id and branch_id are required'
      });
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const signupCode = await prisma.waiterSignupCode.create({
      data: {
        code,
        restaurantId: restaurant_id,
        branchId: branch_id,
        expiresAt
      }
    });

    res.json({
      success: true,
      code: signupCode.code,
      expiresAt: signupCode.expiresAt
    });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { signup_code, full_name, phone, password } = req.body;

    if (!signup_code || !full_name || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const codeRecord = await prisma.waiterSignupCode.findUnique({
      where: { code: signup_code.toUpperCase() }
    });

    if (!codeRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid signup code'
      });
    }

    if (codeRecord.isUsed) {
      return res.status(400).json({
        success: false,
        error: 'This code has already been used'
      });
    }

    if (new Date() > codeRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Signup code has expired'
      });
    }

    const existingWaiter = await prisma.waiter.findUnique({
      where: { phone }
    });

    if (existingWaiter) {
      return res.status(400).json({
        success: false,
        error: 'Phone number already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const waiter = await prisma.waiter.create({
      data: {
        branchId: codeRecord.branchId,
        fullName: full_name,
        phone,
        password: hashedPassword
      }
    });

    await prisma.waiterSignupCode.update({
      where: { id: codeRecord.id },
      data: { isUsed: true }
    });

    const token = jwt.sign(
      {
        waiterId: waiter.id,
        phone: waiter.phone,
        branchId: waiter.branchId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '30d' }
    );

    await prisma.waiterSession.create({
      data: {
        waiterId: waiter.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      message: 'Account created successfully',
      waiter: {
        id: waiter.id,
        fullName: waiter.fullName,
        phone: waiter.phone,
        branchId: waiter.branchId
      },
      token
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        error: 'Phone and password are required'
      });
    }

    const waiter = await prisma.waiter.findUnique({
      where: { phone }
    });

    if (!waiter) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, waiter.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        waiterId: waiter.id,
        phone: waiter.phone,
        branchId: waiter.branchId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '30d' }
    );

    await prisma.waiterSession.create({
      data: {
        waiterId: waiter.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      waiter: {
        id: waiter.id,
        fullName: waiter.fullName,
        phone: waiter.phone,
        branchId: waiter.branchId
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    res.json({
      success: true,
      waiter: {
        id: decoded.waiterId,
        phone: decoded.phone,
        branchId: decoded.branchId
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;
