-- Analytics Dashboard Schema
-- Run this in your Supabase SQL editor

-- Create sales_analytics table for tracking daily sales
CREATE TABLE IF NOT EXISTS sales_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_analytics table for customer insights
CREATE TABLE IF NOT EXISTS customer_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_phone VARCHAR(20) NOT NULL,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    first_order_date DATE,
    last_order_date DATE,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    customer_type VARCHAR(20) DEFAULT 'new', -- 'new', 'returning', 'vip'
    customer_segment VARCHAR(50), -- 'high_value', 'frequent', 'at_risk', 'new'
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_phone)
);

-- Create product_analytics table for product performance
CREATE TABLE IF NOT EXISTS product_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    units_sold INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_name, date)
);

-- Create inventory table for stock management
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    current_stock INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 10,
    maximum_stock INTEGER DEFAULT 1000,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    selling_price DECIMAL(10,2) DEFAULT 0,
    supplier_name VARCHAR(255),
    supplier_contact VARCHAR(100),
    last_restocked_date DATE,
    last_restocked_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'low_stock', 'out_of_stock', 'discontinued'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stock_movements table for inventory history
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    movement_type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason VARCHAR(255), -- 'sale', 'restock', 'adjustment', 'damage', 'return'
    reference_id UUID, -- order_id or other reference
    notes TEXT,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table for admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'low_stock', 'out_of_stock', 'new_order', 'system'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sales_analytics_date ON sales_analytics(date);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_phone ON customer_analytics(customer_phone);
CREATE INDEX IF NOT EXISTS idx_customer_analytics_type ON customer_analytics(customer_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(date);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_name);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON admin_notifications(is_read);

-- Enable Row Level Security
ALTER TABLE sales_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to sales_analytics" ON sales_analytics FOR ALL USING (true);
CREATE POLICY "Admin full access to customer_analytics" ON customer_analytics FOR ALL USING (true);
CREATE POLICY "Admin full access to product_analytics" ON product_analytics FOR ALL USING (true);
CREATE POLICY "Admin full access to inventory" ON inventory FOR ALL USING (true);
CREATE POLICY "Admin full access to stock_movements" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Admin full access to notifications" ON admin_notifications FOR ALL USING (true);

-- Insert initial inventory data
INSERT INTO inventory (product_name, current_stock, minimum_stock, maximum_stock, unit_cost, selling_price, supplier_name, supplier_contact) 
VALUES 
('রুহাফিয়া ব্যথানাশক তেল (50ml)', 100, 20, 500, 400.00, 890.00, 'Herbal Suppliers Ltd', '+8801712345678'),
('রুহাফিয়া ব্যথানাশক তেল (100ml)', 50, 10, 200, 750.00, 1590.00, 'Herbal Suppliers Ltd', '+8801712345678')
ON CONFLICT (product_name) DO NOTHING;

-- Function to update sales analytics daily
CREATE OR REPLACE FUNCTION update_daily_sales_analytics()
RETURNS void AS $$
DECLARE
    target_date DATE := CURRENT_DATE;
    daily_revenue DECIMAL(10,2);
    daily_orders INTEGER;
    daily_customers INTEGER;
    daily_new_customers INTEGER;
    daily_returning_customers INTEGER;
    daily_avg_order_value DECIMAL(10,2);
BEGIN
    -- Calculate daily metrics from orders
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*),
        COUNT(DISTINCT customer_phone),
        COUNT(DISTINCT CASE WHEN ca.customer_type = 'new' THEN o.customer_phone END),
        COUNT(DISTINCT CASE WHEN ca.customer_type = 'returning' THEN o.customer_phone END),
        CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(total_amount), 0) / COUNT(*) ELSE 0 END
    INTO daily_revenue, daily_orders, daily_customers, daily_new_customers, daily_returning_customers, daily_avg_order_value
    FROM orders o
    LEFT JOIN customer_analytics ca ON o.customer_phone = ca.customer_phone
    WHERE DATE(o.created_at) = target_date;

    -- Insert or update sales analytics
    INSERT INTO sales_analytics (date, total_revenue, total_orders, total_customers, new_customers, returning_customers, average_order_value)
    VALUES (target_date, daily_revenue, daily_orders, daily_customers, daily_new_customers, daily_returning_customers, daily_avg_order_value)
    ON CONFLICT (date) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_orders = EXCLUDED.total_orders,
        total_customers = EXCLUDED.total_customers,
        new_customers = EXCLUDED.new_customers,
        returning_customers = EXCLUDED.returning_customers,
        average_order_value = EXCLUDED.average_order_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update customer analytics
CREATE OR REPLACE FUNCTION update_customer_analytics()
RETURNS void AS $$
BEGIN
    INSERT INTO customer_analytics (
        customer_phone, customer_name, customer_email, first_order_date, last_order_date,
        total_orders, total_spent, average_order_value, customer_type, last_activity_date
    )
    SELECT 
        o.customer_phone,
        o.customer_name,
        o.customer_email,
        MIN(DATE(o.created_at)) as first_order_date,
        MAX(DATE(o.created_at)) as last_order_date,
        COUNT(*) as total_orders,
        SUM(o.total_amount) as total_spent,
        AVG(o.total_amount) as average_order_value,
        CASE WHEN COUNT(*) = 1 THEN 'new' ELSE 'returning' END as customer_type,
        MAX(DATE(o.created_at)) as last_activity_date
    FROM orders o
    GROUP BY o.customer_phone, o.customer_name, o.customer_email
    ON CONFLICT (customer_phone) DO UPDATE SET
        customer_name = EXCLUDED.customer_name,
        customer_email = EXCLUDED.customer_email,
        last_order_date = EXCLUDED.last_order_date,
        total_orders = EXCLUDED.total_orders,
        total_spent = EXCLUDED.total_spent,
        average_order_value = EXCLUDED.average_order_value,
        customer_type = EXCLUDED.customer_type,
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock and create notifications
CREATE OR REPLACE FUNCTION check_low_stock_notifications()
RETURNS void AS $$
DECLARE
    low_stock_item RECORD;
BEGIN
    FOR low_stock_item IN 
        SELECT product_name, current_stock, minimum_stock 
        FROM inventory 
        WHERE current_stock <= minimum_stock AND status = 'active'
    LOOP
        -- Create notification if not already exists for today
        INSERT INTO admin_notifications (type, title, message, priority, metadata)
        SELECT 
            'low_stock',
            'Low Stock Alert',
            'Product "' || low_stock_item.product_name || '" is running low. Current stock: ' || low_stock_item.current_stock || ', Minimum: ' || low_stock_item.minimum_stock,
            CASE WHEN low_stock_item.current_stock = 0 THEN 'urgent' ELSE 'high' END,
            jsonb_build_object('product_name', low_stock_item.product_name, 'current_stock', low_stock_item.current_stock)
        WHERE NOT EXISTS (
            SELECT 1 FROM admin_notifications 
            WHERE type = 'low_stock' 
            AND metadata->>'product_name' = low_stock_item.product_name 
            AND DATE(created_at) = CURRENT_DATE
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update analytics
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update customer analytics when order is inserted/updated
    PERFORM update_customer_analytics();
    
    -- Update daily sales analytics
    PERFORM update_daily_sales_analytics();
    
    -- Check for low stock notifications
    PERFORM check_low_stock_notifications();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS orders_analytics_trigger ON orders;
CREATE TRIGGER orders_analytics_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_analytics();
