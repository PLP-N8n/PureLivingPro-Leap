CREATE TABLE health_checks (
  id BIGSERIAL PRIMARY KEY,
  service VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  response_time INTEGER NOT NULL,
  message TEXT,
  details JSONB,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_checks_service ON health_checks(service);
CREATE INDEX idx_health_checks_checked_at ON health_checks(checked_at DESC);
CREATE INDEX idx_health_checks_service_checked_at ON health_checks(service, checked_at DESC);