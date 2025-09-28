-- Performance indexes for AI service queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- AI messages performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_role ON ai_messages(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at DESC);

-- Composite indexes for conversation queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_messages_conversation_role ON ai_messages(conversation_id, role);