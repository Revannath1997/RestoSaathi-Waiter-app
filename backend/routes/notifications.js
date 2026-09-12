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

// GET all notifications for an order
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const notifications = await prisma.orderNotification.findMany({
      where: { orderId },
      orderBy: { sentAt: 'desc' }
    });

    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET unread notifications for waiter
router.get('/unread', verifyToken, async (req, res) => {
  try {
    const waiterId = req.waiterId;

    const unreadNotifications = await prisma.orderNotification.findMany({
      where: {
        readAt: null,
        order: {
          waiterId
        }
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            tableId: true,
            status: true
          }
        }
      },
      orderBy: { sentAt: 'desc' }
    });

    res.json({
      success: true,
      count: unreadNotifications.length,
      notifications: unreadNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST mark notification as read
router.post('/:notificationId/read', verifyToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await prisma.orderNotification.update({
      where: { id: notificationId },
      data: { readAt: new Date() }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST mark all notifications as read for waiter
router.post('/waiter/read-all', verifyToken, async (req, res) => {
  try {
    const waiterId = req.waiterId;

    const result = await prisma.orderNotification.updateMany({
      where: {
        readAt: null,
        order: {
          waiterId
        }
      },
      data: { readAt: new Date() }
    });

    res.json({
      success: true,
      message: `${result.count} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET notifications summary for branch
router.get('/branch/:branchId/summary', verifyToken, async (req, res) => {
  try {
    const { branchId } = req.params;

    const orders = await prisma.order.findMany({
      where: {
        waiter: {
          branchId
        }
      },
      include: {
        notifications: {
          orderBy: { sentAt: 'desc' },
          take: 1
        }
      }
    });

    const summary = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'PENDING').length,
      kitchenOrders: orders.filter(o => o.status === 'SENT_TO_KITCHEN').length,
      preparingOrders: orders.filter(o => o.status === 'PREPARING').length,
      readyOrders: orders.filter(o => o.status === 'READY').length,
      servedOrders: orders.filter(o => o.status === 'SERVED').length,
      completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
      recentNotifications: orders
        .filter(o => o.notifications.length > 0)
        .slice(0, 10)
        .map(o => ({
          orderId: o.id,
          orderNumber: o.orderNumber,
          latestNotification: o.notifications[0]
        }))
    };

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// WebSocket simulation - GET notification stream polling endpoint
router.get('/stream/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        notifications: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        notifications: order.notifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
