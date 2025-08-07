-- Institution ID Converter mappings for TPP 901
-- Maps external institution IDs (as they appear in files) to internal BankOrTPP codes

-- First, delete any existing mappings for TPP 901 to avoid duplicates
DELETE FROM institution_id_converter WHERE processor_code = '901';

-- Insert the new converter mappings for TPP 901
INSERT INTO institution_id_converter (source_institution_id, target_bank_or_tpp_code, processor_code, is_active, created_at, updated_at) VALUES
('000001', '020', '901', 1, NOW(), NOW()), -- ATIB -> ATIB
('000003', '006', '901', 1, NOW(), NOW()), -- SAHARA BANK -> Sahara Bank
('000004', '007', '901', 1, NOW(), NOW()), -- NORTH AFRICA BANK -> North Africa Bank
('000005', '018', '901', 1, NOW(), NOW()), -- MED BANK -> Meditbank Bank
('000006', '004', '901', 1, NOW(), NOW()), -- NCB BANK -> National Commercial Bank
('000007', '002', '901', 1, NOW(), NOW()), -- JOMHOURIA BANK -> Jumhouria Bank
('000008', '012', '901', 1, NOW(), NOW()), -- AL WAHA BANK -> Waha Bank
('000009', '010', '901', 1, NOW(), NOW()); -- BCD BANK -> Bank of Commerce & Development

-- Verify the mappings were inserted correctly
SELECT 
    source_institution_id as 'External ID',
    target_bank_or_tpp_code as 'Internal Code',
    processor_code as 'TPP Code',
    is_active as 'Active'
FROM institution_id_converter 
WHERE processor_code = '901' 
ORDER BY source_institution_id;
