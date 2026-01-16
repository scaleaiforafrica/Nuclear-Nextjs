-- Blockchain Traceability System Database Schema
-- Version: 1.0
-- Description: Tables and indexes for blockchain event recording and verification

-- ============================================================================
-- Blockchain Events Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS blockchain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Actor information
  actor_id VARCHAR(100) NOT NULL,
  actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('user', 'system', 'iot_sensor', 'api')),
  actor_name VARCHAR(255) NOT NULL,
  actor_role VARCHAR(100),
  actor_organization VARCHAR(255),
  actor_device_id VARCHAR(100),
  
  -- Location information
  location_name VARCHAR(255) NOT NULL,
  location_type VARCHAR(50) NOT NULL CHECK (location_type IN ('facility', 'checkpoint', 'vehicle', 'port', 'customs', 'destination', 'unknown')),
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  location_address TEXT,
  location_country VARCHAR(100),
  location_country_code VARCHAR(3),
  
  -- Blockchain integrity
  data_hash VARCHAR(64) NOT NULL,
  previous_hash VARCHAR(64) NOT NULL,
  transaction_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,
  signature TEXT,
  
  -- Event data
  metadata JSONB DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Chain Verification Results Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS chain_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id VARCHAR(50) NOT NULL,
  is_valid BOOLEAN NOT NULL,
  event_count INTEGER NOT NULL,
  first_event TIMESTAMPTZ NOT NULL,
  last_event TIMESTAMPTZ NOT NULL,
  broken_links JSONB DEFAULT '[]',
  invalid_hashes JSONB DEFAULT '[]',
  verified_by VARCHAR(100),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes on foreign keys
  CONSTRAINT fk_shipment FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_number) ON DELETE CASCADE
);

-- ============================================================================
-- IoT Sensor Readings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS iot_sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES blockchain_events(id) ON DELETE CASCADE,
  sensor_id VARCHAR(100) NOT NULL,
  sensor_type VARCHAR(50) NOT NULL,
  reading_value DECIMAL(10, 4) NOT NULL,
  reading_unit VARCHAR(20) NOT NULL,
  threshold_min DECIMAL(10, 4),
  threshold_max DECIMAL(10, 4),
  is_compliant BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Blockchain events indexes
CREATE INDEX IF NOT EXISTS idx_blockchain_events_shipment ON blockchain_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_type ON blockchain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_timestamp ON blockchain_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_actor ON blockchain_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_data_hash ON blockchain_events(data_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_tx_hash ON blockchain_events(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_verified ON blockchain_events(verified);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_created_at ON blockchain_events(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_blockchain_events_shipment_timestamp ON blockchain_events(shipment_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_blockchain_events_type_timestamp ON blockchain_events(event_type, timestamp DESC);

-- Chain verifications indexes
CREATE INDEX IF NOT EXISTS idx_chain_verifications_shipment ON chain_verifications(shipment_id);
CREATE INDEX IF NOT EXISTS idx_chain_verifications_verified_at ON chain_verifications(verified_at DESC);

-- IoT sensor readings indexes
CREATE INDEX IF NOT EXISTS idx_iot_sensor_readings_event ON iot_sensor_readings(event_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_readings_sensor ON iot_sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_iot_sensor_readings_recorded_at ON iot_sensor_readings(recorded_at DESC);

-- ============================================================================
-- Triggers for Updated At
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blockchain_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_blockchain_events_updated_at
  BEFORE UPDATE ON blockchain_events
  FOR EACH ROW
  EXECUTE FUNCTION update_blockchain_events_updated_at();

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON TABLE blockchain_events IS 'Immutable blockchain event records for shipment traceability';
COMMENT ON COLUMN blockchain_events.data_hash IS 'SHA-256 hash of event data for integrity verification';
COMMENT ON COLUMN blockchain_events.previous_hash IS 'Hash of previous event to maintain chain integrity';
COMMENT ON COLUMN blockchain_events.transaction_hash IS 'Blockchain transaction hash from Hyperledger Fabric';
COMMENT ON COLUMN blockchain_events.metadata IS 'Event-specific data stored as JSON';

COMMENT ON TABLE chain_verifications IS 'Results of blockchain chain integrity verifications';
COMMENT ON COLUMN chain_verifications.broken_links IS 'Array of event IDs with broken chain links';
COMMENT ON COLUMN chain_verifications.invalid_hashes IS 'Array of event IDs with invalid data hashes';

COMMENT ON TABLE iot_sensor_readings IS 'IoT sensor data associated with blockchain events';
COMMENT ON COLUMN iot_sensor_readings.is_compliant IS 'Whether reading is within threshold limits';

-- ============================================================================
-- Grant Permissions (adjust as needed for your setup)
-- ============================================================================

-- Grant permissions to application user (replace 'app_user' with your actual user)
-- GRANT SELECT, INSERT ON blockchain_events TO app_user;
-- GRANT SELECT, INSERT ON chain_verifications TO app_user;
-- GRANT SELECT, INSERT ON iot_sensor_readings TO app_user;

-- Blockchain events should be immutable - no UPDATE or DELETE
-- Only system admin should have UPDATE/DELETE rights for corrections
