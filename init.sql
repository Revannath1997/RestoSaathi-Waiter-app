-- RestoSaathi Database Initialization Script
-- This script runs automatically when the PostgreSQL container starts

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic restaurant for testing
INSERT INTO "public"."Restaurant" (id, name, email, phone, address, "createdAt", "updatedAt")
VALUES (
  'test-rest-1',
  'Test Restaurant',
  'test@restaurant.com',
  '9876543210',
  '123 Test Street, Test City',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create basic branch
INSERT INTO "public"."Branch" (id, "restaurantId", name, address, "createdAt", "updatedAt")
VALUES (
  'test-branch-1',
  'test-rest-1',
  'Main Branch',
  '123 Test Street, Test City',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- Create sample menu items
INSERT INTO "public"."MenuItem" (id, "restaurantId", name, description, price, category, "isAvailable", "createdAt", "updatedAt")
VALUES
  ('item-1', 'test-rest-1', 'Paneer Tikka', 'Marinated paneer cubes grilled to perfection', 250.00, 'Starters', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-2', 'test-rest-1', 'Tandoori Chicken', 'Tender chicken marinated in yogurt and spices', 280.00, 'Starters', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-3', 'test-rest-1', 'Butter Chicken', 'Succulent chicken pieces in creamy tomato gravy', 350.00, 'Main Course', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-4', 'test-rest-1', 'Biryani (Chicken)', 'Fragrant rice with tender chicken pieces', 300.00, 'Main Course', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-5', 'test-rest-1', 'Dal Makhani', 'Creamy lentil preparation', 220.00, 'Vegetarian', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-6', 'test-rest-1', 'Paneer Butter Masala', 'Paneer in rich tomato and cream sauce', 280.00, 'Vegetarian', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-7', 'test-rest-1', 'Garlic Naan', 'Traditional Indian bread with garlic', 50.00, 'Bread', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-8', 'test-rest-1', 'Butter Naan', 'Soft naan brushed with butter', 60.00, 'Bread', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-9', 'test-rest-1', 'Raita', 'Yogurt-based side dish', 40.00, 'Side', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-10', 'test-rest-1', 'Coke 300ml', 'Cold soft drink', 40.00, 'Beverages', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-11', 'test-rest-1', 'Lassi', 'Traditional yogurt drink', 60.00, 'Beverages', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('item-12', 'test-rest-1', 'Gulab Jamun', 'Sweet milk solids in sugar syrup', 80.00, 'Desserts', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Create sample tables
INSERT INTO "public"."Table" (id, "branchId", "tableNumber", capacity, "isActive", "createdAt", "updatedAt")
VALUES
  ('table-1', 'test-branch-1', 1, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('table-2', 'test-branch-1', 2, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('table-3', 'test-branch-1', 3, 4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('table-4', 'test-branch-1', 4, 6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('table-5', 'test-branch-1', 5, 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("branchId", "tableNumber") DO NOTHING;
