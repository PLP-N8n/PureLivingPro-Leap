-- Performance indexes for AI service queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id_created ON ai_conversations(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_confidence ON ai_recommendations(confidence_score DESC);

-- Additional performance indexes for existing tables
CREATE INDEX IF NOT EXISTS idx_ai_conversations_tokens_used ON ai_conversations(tokens_used);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_response_time ON ai_conversations(response_time_ms);