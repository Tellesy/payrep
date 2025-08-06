-- Direct Database Fix for TPP 901 File Processing Issues
-- Run this SQL to fix the fileType mismatch and ensure all configs exist

-- Step 1: Check current TPP 901 configurations
SELECT 'Current TPP 901 Configurations:' as info;
SELECT 
    fpc.id,
    fpc.file_type,
    fpc.file_name_pattern,
    fpc.directory_path,
    bot.code as tpp_code
FROM file_processing_config fpc
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901';

-- Step 2: Update existing configs to use fileType "CSV"
UPDATE file_processing_config 
SET file_type = 'CSV', schedule_time = '0 */2 * * * ?'
WHERE id IN (
    SELECT fpc.id 
    FROM file_processing_config fpc
    JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
    WHERE bot.code = '901'
);

-- Step 3: Ensure all three configs exist for TPP 901
-- Get TPP 901 ID first
SET @tpp_901_id = (SELECT id FROM bank_or_tpp WHERE code = '901');

-- Insert missing configs if they don't exist
INSERT IGNORE INTO file_processing_config (bank_or_tpp_id, directory_path, file_name_pattern, file_type, schedule_time, created_at)
SELECT 
    @tpp_901_id,
    'sample-data/901',
    'ecommerce_card_activity_\\d{4}-\\d{2}-\\d{2}\\.csv',
    'CSV',
    '0 */2 * * * ?',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM file_processing_config fpc
    JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
    WHERE bot.code = '901' AND fpc.file_name_pattern LIKE '%ecommerce_card_activity%'
);

INSERT IGNORE INTO file_processing_config (bank_or_tpp_id, directory_path, file_name_pattern, file_type, schedule_time, created_at)
SELECT 
    @tpp_901_id,
    'sample-data/901',
    'pos_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv',
    'CSV',
    '0 */2 * * * ?',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM file_processing_config fpc
    JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
    WHERE bot.code = '901' AND fpc.file_name_pattern LIKE '%pos_terminal_data%'
);

INSERT IGNORE INTO file_processing_config (bank_or_tpp_id, directory_path, file_name_pattern, file_type, schedule_time, created_at)
SELECT 
    @tpp_901_id,
    'sample-data/901',
    'pos_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv',
    'CSV',
    '0 */2 * * * ?',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM file_processing_config fpc
    JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
    WHERE bot.code = '901' AND fpc.file_name_pattern LIKE '%pos_transaction_data%'
);

-- Step 4: Clear PENDING import logs to allow reprocessing
UPDATE import_log 
SET status = 'FAILED', error_message = 'Cleared for reprocessing after config fix'
WHERE status = 'PENDING' 
AND file_processing_config_id IN (
    SELECT fpc.id 
    FROM file_processing_config fpc
    JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
    WHERE bot.code = '901'
);

-- Step 5: Verify the fix
SELECT 'Fixed TPP 901 Configurations:' as info;
SELECT 
    fpc.id,
    fpc.file_type,
    fpc.file_name_pattern,
    fpc.directory_path,
    fpc.schedule_time,
    bot.code as tpp_code
FROM file_processing_config fpc
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901'
ORDER BY fpc.file_name_pattern;

-- Step 6: Check column mappings exist
SELECT 'Column Mappings for TPP 901:' as info;
SELECT 
    COUNT(*) as mapping_count,
    fpc.file_name_pattern
FROM column_mapping cm
JOIN file_processing_config fpc ON cm.file_processing_config_id = fpc.id
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901'
GROUP BY fpc.id, fpc.file_name_pattern;
