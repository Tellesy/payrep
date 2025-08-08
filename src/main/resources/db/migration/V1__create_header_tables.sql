-- Flyway Migration: Create tables for dynamic header management
-- Creates: header_definition, header_alias

-- header_definition table
CREATE TABLE IF NOT EXISTS header_definition (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  entity_type VARCHAR(255) NOT NULL,
  header_key VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT uk_header_definition_entity_key UNIQUE (entity_type, header_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- header_alias table
CREATE TABLE IF NOT EXISTS header_alias (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  header_definition_id BIGINT NOT NULL,
  alias VARCHAR(255) NOT NULL,
  CONSTRAINT fk_header_alias_definition FOREIGN KEY (header_definition_id)
    REFERENCES header_definition(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Helpful indexes
CREATE INDEX idx_header_alias_definition_id ON header_alias(header_definition_id);
CREATE INDEX idx_header_alias_alias ON header_alias(alias);
