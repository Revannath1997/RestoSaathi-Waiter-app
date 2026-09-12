const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

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

router.post('/create', verifyToken, async (req, res) => {
  try {
    const { restaurant_id, table_id, items, special_notes, voice_order_url } = req.body;
    const waiterId = req.waiterId;

    if (!restaurant_id || !table_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax;

    const order = await prisma.order.create({
      data: {
        restaurantId: restaurant_id,
        waiterId,
        tableId: table_id,
        orderNumber: `ORD-${Date.now()}`,
        subtotal,
        tax,
        total,
        specialNotes: special_notes,
        voiceOrderUrl: voice_order_url,
        items: {
          create: items.map(item => ({
            menuItemId: item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          }))
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    await prisma.orderNotification.create({
      data: {
        orderId: order.id,
        type: 'KITCHEN_RECEIVED',
        message: 'Order received in kitchen'
      }
    });

    await prisma.orderNotification.create({
      data: {
        orderId: order.id,
        type: 'MANAGER_NOTIFIED',
        message: 'Order sent to manager'
      }
    });

    res.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        items: order.items
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        notifications: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pending', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'SENT_TO_KITCHEN', 'PREPARING']
        }
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:orderId/status', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        sentToKitchenAt: status === 'SENT_TO_KITCHEN' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    });

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:orderId/send-to-kitchen', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SENT_TO_KITCHEN',
        sentToKitchenAt: new Date()
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Order sent to kitchen',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
