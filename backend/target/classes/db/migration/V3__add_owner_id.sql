ALTER TABLE loyalty_programs ADD COLUMN owner_id UUID;
CREATE INDEX idx_loyalty_programs_owner_id ON loyalty_programs(owner_id);
