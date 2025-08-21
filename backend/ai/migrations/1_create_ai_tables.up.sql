CREATE TABLE ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  model_used TEXT DEFAULT 'gpt-3.5-turbo',
  tokens_used INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_input TEXT NOT NULL,
  recommended_products JSONB,
  recommendation_reason TEXT,
  confidence_score DOUBLE PRECISION DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX idx_ai_recommendations_created_at ON ai_recommendations(created_at DESC);
