const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/menu-cards'));
  },
  filename: (req, file, cb) => {
    cb(null, `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.waiterId = decoded.waiterId;
    req.branchId = decoded.branchId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Simple OCR simulation - in production, use Google Vision API or Tesseract
const simulateOCRProcessing = async (imagePath) => {
  // This is a mock OCR that returns simulated menu items
  // In production, integrate with Google Cloud Vision API or Tesseract
  const mockMenuItems = [
    { name: 'Paneer Tikka', price: 250, category: 'Starters' },
    { name: 'Tandoori Chicken', price: 280, category: 'Starters' },
    { name: 'Butter Chicken', price: 350, category: 'Main Course' },
    { name: 'Biryani (Chicken)', price: 300, category: 'Main Course' },
    { name: 'Biryani (Mutton)', price: 350, category: 'Main Course' },
    { name: 'Dal Makhani', price: 220, category: 'Vegetarian' },
    { name: 'Paneer Butter Masala', price: 280, category: 'Vegetarian' },
    { name: 'Garlic Naan', price: 50, category: 'Bread' },
    { name: 'Butter Naan', price: 60, category: 'Bread' },
    { name: 'Raita', price: 40, category: 'Side' },
    { name: 'Coke 300ml', price: 40, category: 'Beverages' },
    { name: 'Lassi', price: 60, category: 'Beverages' },
    { name: 'Gulab Jamun', price: 80, category: 'Desserts' },
    { name: 'Ice Cream (Vanilla)', price: 100, category: 'Desserts' }
  ];

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return mockMenuItems;
};

// POST upload menu card image
router.post('/upload', verifyToken, upload.single('menu_card'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { restaurant_id, branch_id } = req.body;

    if (!restaurant_id || !branch_id) {
      return res.status(400).json({
        success: false,
        error: 'restaurant_id and branch_id are required'
      });
    }

    // Save upload record
    const upload_record = await prisma.menuCardUpload.create({
      data: {
        restaurantId: restaurant_id,
        branchId: branch_id,
        waiterId: req.waiterId,
        imagePath: req.file.path,
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Menu card uploaded successfully',
      uploadId: upload_record.id,
      filename: upload_record.filename
    });
  } catch (error) {
    console.error('Error uploading menu card:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST process menu card with OCR
router.post('/process/:uploadId', verifyToken, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { restaurant_id } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        error: 'restaurant_id is required'
      });
    }

    // Get upload record
    const upload_record = await prisma.menuCardUpload.findUnique({
      where: { id: uploadId }
    });

    if (!upload_record) {
      return res.status(404).json({ success: false, error: 'Upload not found' });
    }

    // Start processing
    const processing = await prisma.menuProcessing.create({
      data: {
        uploadId,
        restaurantId: restaurant_id,
        status: 'PROCESSING',
        startedAt: new Date()
      }
    });

    // Simulate OCR processing
    const extractedItems = await simulateOCRProcessing(upload_record.imagePath);

    // Save extracted items
    const savedItems = [];
    for (const item of extractedItems) {
      const menuItem = await prisma.menuItem.upsert({
        where: {
          restaurantId_name: {
            restaurantId: restaurant_id,
            name: item.name
          }
        },
        update: {
          price: item.price,
          category: item.category
        },
        create: {
          restaurantId: restaurant_id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: `${item.name} - ${item.category}`,
          isAvailable: true
        }
      });

      await prisma.processedMenuItem.create({
        data: {
          processingId: processing.id,
          menuItemId: menuItem.id,
          extractedName: item.name,
          extractedPrice: item.price,
          extractedCategory: item.category,
          confidence: 95 + Math.random() * 5 // Simulated confidence 95-100%
        }
      });

      savedItems.push(menuItem);
    }

    // Update processing status
    await prisma.menuProcessing.update({
      where: { id: processing.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        itemsExtracted: savedItems.length
      }
    });

    res.json({
      success: true,
      message: 'Menu processing completed',
      processingId: processing.id,
      itemsExtracted: savedItems.length,
      items: savedItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        isAvailable: item.isAvailable
      }))
    });
  } catch (error) {
    console.error('Error processing menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all menu items for restaurant
router.get('/restaurant/:restaurantId', verifyToken, async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menuItems = await prisma.menuItem.findMany({
      where: {
        restaurantId,
        isAvailable: true
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    const groupedByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      items: menuItems,
      groupedByCategory
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET menu item by ID
router.get('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: itemId }
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }

    res.json({
      success: true,
      item: menuItem
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET processing status
router.get('/processing/:processingId', verifyToken, async (req, res) => {
  try {
    const { processingId } = req.params;

    const processing = await prisma.menuProcessing.findUnique({
      where: { id: processingId },
      include: {
        processedItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    if (!processing) {
      return res.status(404).json({ success: false, error: 'Processing not found' });
    }

    res.json({
      success: true,
      processing: {
        id: processing.id,
        status: processing.status,
        itemsExtracted: processing.itemsExtracted,
        startedAt: processing.startedAt,
        completedAt: processing.completedAt,
        items: processing.processedItems.map(pi => ({
          id: pi.menuItem.id,
          name: pi.menuItem.name,
          price: pi.menuItem.price,
          category: pi.menuItem.category,
          confidence: pi.confidence
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
