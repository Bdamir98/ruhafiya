-- Analytics and Performance Monitoring Schema
-- Run this in your Supabase SQL editor

-- Create web_vitals table for Core Web Vitals tracking
CREATE TABLE IF NOT EXISTS web_vitals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_name VARCHAR(50) NOT NULL, -- CLS, FID, FCP, LCP, TTFB
    metric_value DECIMAL(10,3) NOT NULL,
    metric_id VARCHAR(255),
    url TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create error_logs table for error tracking
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    message TEXT NOT NULL,
    filename TEXT,
    line_number INTEGER,
    column_number INTEGER,
    stack_trace TEXT,
    reason TEXT,
    url TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics_events table for custom event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    parameters JSONB,
    url TEXT NOT NULL,
    user_id UUID REFERENCES admin_users(id),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_views table for page view tracking
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20), -- mobile, tablet, desktop
    browser VARCHAR(50),
    os VARCHAR(50),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    entry_page TEXT,
    exit_page TEXT,
    page_views_count INTEGER DEFAULT 0,
    session_duration INTEGER, -- in seconds
    is_bounce BOOLEAN DEFAULT false,
    conversion_events JSONB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Create conversion_funnels table for funnel analysis
CREATE TABLE IF NOT EXISTS conversion_funnels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create performance_metrics table for custom performance tracking
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- navigation, resource, custom
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,3) NOT NULL,
    url TEXT NOT NULL,
    resource_name TEXT,
    resource_type VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_web_vitals_url ON web_vitals(url);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_url ON error_logs(url);
CREATE INDEX IF NOT EXISTS idx_error_logs_message ON error_logs(message);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_url ON analytics_events(url);

CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_device_type ON user_sessions(device_type);

CREATE INDEX IF NOT EXISTS idx_conversion_funnels_session_id ON conversion_funnels(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_step_name ON conversion_funnels(step_name);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_completed_at ON conversion_funnels(completed_at);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON performance_metrics(url);

-- Enable Row Level Security
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics tables (allow all for system tracking)
CREATE POLICY "Allow analytics data insertion" ON web_vitals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow analytics data reading" ON web_vitals FOR SELECT USING (true);

CREATE POLICY "Allow error log insertion" ON error_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow error log reading" ON error_logs FOR SELECT USING (true);

CREATE POLICY "Allow event tracking insertion" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow event tracking reading" ON analytics_events FOR SELECT USING (true);

CREATE POLICY "Allow page view insertion" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow page view reading" ON page_views FOR SELECT USING (true);

CREATE POLICY "Allow session tracking insertion" ON user_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow session tracking reading" ON user_sessions FOR SELECT USING (true);

CREATE POLICY "Allow funnel tracking insertion" ON conversion_funnels FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow funnel tracking reading" ON conversion_funnels FOR SELECT USING (true);

CREATE POLICY "Allow performance tracking insertion" ON performance_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow performance tracking reading" ON performance_metrics FOR SELECT USING (true);

-- Create functions for analytics aggregation
CREATE OR REPLACE FUNCTION get_web_vitals_summary(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    metric_name VARCHAR(50),
    avg_value DECIMAL(10,3),
    p75_value DECIMAL(10,3),
    p90_value DECIMAL(10,3),
    p95_value DECIMAL(10,3),
    sample_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        wv.metric_name,
        AVG(wv.metric_value)::DECIMAL(10,3) as avg_value,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY wv.metric_value)::DECIMAL(10,3) as p75_value,
        PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY wv.metric_value)::DECIMAL(10,3) as p90_value,
        PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY wv.metric_value)::DECIMAL(10,3) as p95_value,
        COUNT(*) as sample_count
    FROM web_vitals wv
    WHERE wv.created_at BETWEEN start_date AND end_date
    GROUP BY wv.metric_name
    ORDER BY wv.metric_name;
END;
$$ LANGUAGE plpgsql;

-- Create function for error rate calculation
CREATE OR REPLACE FUNCTION get_error_rate(
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '24 hours',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
    hour_bucket TIMESTAMP WITH TIME ZONE,
    error_count BIGINT,
    error_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH hourly_errors AS (
        SELECT 
            DATE_TRUNC('hour', created_at) as hour_bucket,
            COUNT(*) as error_count
        FROM error_logs
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY DATE_TRUNC('hour', created_at)
    ),
    hourly_page_views AS (
        SELECT 
            DATE_TRUNC('hour', created_at) as hour_bucket,
            COUNT(*) as page_view_count
        FROM page_views
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY DATE_TRUNC('hour', created_at)
    )
    SELECT 
        he.hour_bucket,
        he.error_count,
        CASE 
            WHEN hpv.page_view_count > 0 
            THEN (he.error_count::DECIMAL / hpv.page_view_count * 100)::DECIMAL(5,2)
            ELSE 0::DECIMAL(5,2)
        END as error_rate
    FROM hourly_errors he
    LEFT JOIN hourly_page_views hpv ON he.hour_bucket = hpv.hour_bucket
    ORDER BY he.hour_bucket;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS void AS $$
BEGIN
    -- Keep only last 90 days of web vitals
    DELETE FROM web_vitals WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Keep only last 30 days of error logs
    DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Keep only last 60 days of analytics events
    DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '60 days';
    
    -- Keep only last 90 days of page views
    DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Keep only last 90 days of user sessions
    DELETE FROM user_sessions WHERE started_at < NOW() - INTERVAL '90 days';
    
    -- Keep only last 60 days of conversion funnels
    DELETE FROM conversion_funnels WHERE completed_at < NOW() - INTERVAL '60 days';
    
    -- Keep only last 30 days of performance metrics
    DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * 0', 'SELECT cleanup_old_analytics_data();');
