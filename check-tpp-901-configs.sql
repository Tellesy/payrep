-- Check TPP 901 file processing configurations
SELECT 
    fpc.id,
    fpc.file_type,
    fpc.file_name_pattern,
    fpc.directory_path,
    fpc.schedule_time,
    bot.code as tpp_code,
    bot.name as tpp_name
FROM file_processing_config fpc
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901'
ORDER BY fpc.id;

-- Check column mappings for TPP 901 configs
SELECT 
    cm.id,
    cm.column_name,
    cm.entity_type,
    cm.field_name,
    cm.transformation,
    fpc.file_type,
    fpc.file_name_pattern
FROM column_mapping cm
JOIN file_processing_config fpc ON cm.file_processing_config_id = fpc.id
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901'
ORDER BY fpc.file_type, cm.column_name;

-- Check recent import logs for TPP 901
SELECT 
    il.id,
    il.file_name,
    il.status,
    il.error_message,
    il.import_time,
    fpc.file_type,
    fpc.file_name_pattern
FROM import_log il
JOIN file_processing_config fpc ON il.file_processing_config_id = fpc.id
JOIN bank_or_tpp bot ON fpc.bank_or_tpp_id = bot.id
WHERE bot.code = '901'
ORDER BY il.import_time DESC
LIMIT 10;
