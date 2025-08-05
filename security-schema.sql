-- Enhanced Security Schema for Ruhafiya Landing Page
-- Run this in your Supabase SQL editor

-- Create admin_sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    user_agent TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create security_logs table for audit trail
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'login', 'logout', 'failed_login', 'admin_action'
    user_id UUID REFERENCES admin_users(id),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rate_limit_violations table
CREATE TABLE IF NOT EXISTS rate_limit_violations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ip_address INET NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    violation_count INTEGER DEFAULT 1,
    first_violation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_violation TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMP WITH TIME ZONE
);

-- Add password policy fields to admin_users
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_session_id ON admin_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_ip ON rate_limit_violations(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limit_violations_endpoint ON rate_limit_violations(endpoint);

-- Enable Row Level Security
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_sessions
CREATE POLICY "Admin users can manage their own sessions" ON admin_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Create policies for security_logs
CREATE POLICY "Admin users can read security logs" ON security_logs
    FOR SELECT USING (true);

-- Create policies for rate_limit_violations
CREATE POLICY "System can manage rate limit violations" ON rate_limit_violations
    FOR ALL USING (true);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW() OR (last_activity < NOW() - INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR(50),
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO security_logs (event_type, user_id, ip_address, user_agent, details)
    VALUES (p_event_type, p_user_id, p_ip_address, p_user_agent, p_details);
END;
$$ LANGUAGE plpgsql;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(p_email VARCHAR(255), p_ip_address INET)
RETURNS BOOLEAN AS $$
DECLARE
    user_record admin_users%ROWTYPE;
    max_attempts INTEGER := 5;
    lockout_duration INTERVAL := '15 minutes';
BEGIN
    -- Get user record
    SELECT * INTO user_record FROM admin_users WHERE email = p_email;
    
    IF FOUND THEN
        -- Increment failed attempts
        UPDATE admin_users 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
                WHEN failed_login_attempts + 1 >= max_attempts 
                THEN NOW() + lockout_duration 
                ELSE locked_until 
            END
        WHERE email = p_email;
        
        -- Log the failed attempt
        PERFORM log_security_event('failed_login', user_record.id, p_ip_address, NULL, 
            jsonb_build_object('email', p_email, 'attempts', user_record.failed_login_attempts + 1));
        
        -- Return whether account is now locked
        RETURN (user_record.failed_login_attempts + 1) >= max_attempts;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(p_email VARCHAR(255))
RETURNS void AS $$
BEGIN
    UPDATE admin_users 
    SET failed_login_attempts = 0, locked_until = NULL 
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired sessions (if pg_cron is available)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
