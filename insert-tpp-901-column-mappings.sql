-- Insert Column Mappings for TPP 901 File Processing Configurations
-- This fixes the issue where no column mappings were configured, causing all files to fail

-- E-Commerce Card Activity Mappings (Config ID: 133)
INSERT INTO column_mapping (file_processing_config_id, column_name, field_name, transformation) VALUES
(133, 'institution_id', 'institutionId', ''),
(133, 'institution_name', 'institutionName', 'trim'),
(133, 'card_product_code', 'cardProductCode', 'trim'),
(133, 'ecommerce_enabled_cards', 'ecommerceEnabledCards', 'number'),
(133, 'ecommerce_activity_cards', 'ecommerceActivityCards', 'number'),
(133, 'report_date', 'reportDate', 'date:yyyy-mm-dd');

-- POS Terminal Data Mappings (Config ID: 134)
INSERT INTO column_mapping (file_processing_config_id, column_name, field_name, transformation) VALUES
(134, 'institution_id', 'institutionId', ''),
(134, 'institution_name', 'institutionName', 'trim'),
(134, 'mcc_code', 'mccCode', 'trim'),
(134, 'mcc_description', 'mccDescription', 'trim'),
(134, 'terminals_issued_count', 'terminalsIssuedCount', 'number'),
(134, 'terminals_reissued_count', 'terminalsReissuedCount', 'number'),
(134, 'terminals_decom_count', 'terminalsDecomCount', 'number'),
(134, 'terminals_activity_count', 'terminalsActivityCount', 'number'),
(134, 'terminals_total_count', 'terminalsTotalCount', 'number'),
(134, 'report_date', 'reportDate', 'date:yyyy-mm-dd');

-- POS Transaction Data Mappings (Config ID: 135)
INSERT INTO column_mapping (file_processing_config_id, column_name, field_name, transformation) VALUES
(135, 'bank_name', 'bankName', 'trim'),
(135, 'txn_success_count', 'txnSuccessCount', 'number'),
(135, 'txn_failed_count', 'txnFailedCount', 'number'),
(135, 'total_transaction_amount', 'totalTransactionAmount', 'number'),
(135, 'transaction_category', 'transactionCategory', 'trim'),
(135, 'report_date', 'reportDate', 'date:yyyy-mm-dd');

-- Verify the insertions
SELECT 
    cm.id,
    cm.file_processing_config_id,
    cm.column_name,
    cm.field_name,
    cm.transformation,
    fpc.file_type
FROM column_mapping cm
JOIN file_processing_config fpc ON cm.file_processing_config_id = fpc.id
WHERE fpc.bank_or_tpp_id = 43  -- TPP 901
ORDER BY cm.file_processing_config_id, cm.column_name;
