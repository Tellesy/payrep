#!/bin/bash

echo "🔧 Configuring Column Mappings for TPP 901"
echo "==========================================="
echo ""
echo "Issue: No column mappings configured for TPP 901 file processing configs"
echo "Solution: Create column mappings for E-commerce Card Activity, POS Terminal Data, and POS Transaction Data"
echo ""

# Get admin token
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
fi

echo "✅ Admin token obtained"
echo ""

# Function to create column mappings
create_column_mapping() {
    local config_id=$1
    local column_name=$2
    local field_name=$3
    local transformation=$4
    
    echo "Creating mapping: $column_name -> $field_name (transform: $transformation)"
    
    MAPPING_DATA=$(cat <<EOF
{
    "fileProcessingConfigId": $config_id,
    "columnName": "$column_name",
    "fieldName": "$field_name",
    "transformation": "$transformation"
}
EOF
)
    
    RESPONSE=$(curl -s -X POST "http://localhost:8080/api/admin/column-mappings" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$MAPPING_DATA")
    
    if echo $RESPONSE | grep -q '"id"'; then
        echo "  ✅ Mapping created successfully"
    else
        echo "  ❌ Failed to create mapping: $RESPONSE"
    fi
}

echo "📋 Creating Column Mappings for TPP 901 Configurations..."
echo ""

# E-Commerce Card Activity (Config ID: 133)
echo "🛒 E-Commerce Card Activity Mappings (Config ID: 133):"
create_column_mapping 133 "institution_id" "institutionId" ""
create_column_mapping 133 "institution_name" "institutionName" "trim"
create_column_mapping 133 "card_product_code" "cardProductCode" "trim"
create_column_mapping 133 "ecommerce_enabled_cards" "ecommerceEnabledCards" "number"
create_column_mapping 133 "ecommerce_activity_cards" "ecommerceActivityCards" "number"
create_column_mapping 133 "report_date" "reportDate" "date:yyyy-mm-dd"
echo ""

# POS Terminal Data (Config ID: 134)
echo "🏪 POS Terminal Data Mappings (Config ID: 134):"
create_column_mapping 134 "institution_id" "institutionId" ""
create_column_mapping 134 "institution_name" "institutionName" "trim"
create_column_mapping 134 "mcc_code" "mccCode" "trim"
create_column_mapping 134 "mcc_description" "mccDescription" "trim"
create_column_mapping 134 "terminals_issued_count" "terminalsIssuedCount" "number"
create_column_mapping 134 "terminals_reissued_count" "terminalsReissuedCount" "number"
create_column_mapping 134 "terminals_decom_count" "terminalsDecomCount" "number"
create_column_mapping 134 "terminals_activity_count" "terminalsActivityCount" "number"
create_column_mapping 134 "terminals_total_count" "terminalsTotalCount" "number"
create_column_mapping 134 "report_date" "reportDate" "date:yyyy-mm-dd"
echo ""

# POS Transaction Data (Config ID: 135)
echo "💳 POS Transaction Data Mappings (Config ID: 135):"
create_column_mapping 135 "bank_name" "bankName" "trim"
create_column_mapping 135 "txn_success_count" "txnSuccessCount" "number"
create_column_mapping 135 "txn_failed_count" "txnFailedCount" "number"
create_column_mapping 135 "total_transaction_amount" "totalTransactionAmount" "number"
create_column_mapping 135 "transaction_category" "transactionCategory" "trim"
create_column_mapping 135 "report_date" "reportDate" "date:yyyy-mm-dd"
echo ""

echo "🔍 Verifying Column Mappings..."
echo ""

# Verify mappings for each config
for CONFIG_ID in 133 134 135; do
    echo "Config ID $CONFIG_ID mappings:"
    MAPPINGS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/admin/column-mappings?configId=$CONFIG_ID" \
      -H "Authorization: Bearer $TOKEN")
    
    echo $MAPPINGS_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        print(f'  Found {len(data)} mappings:')
        for mapping in data:
            print(f'    • {mapping.get(\"columnName\", \"N/A\")} -> {mapping.get(\"fieldName\", \"N/A\")} (transform: {mapping.get(\"transformation\", \"none\")})')
    else:
        print(f'  Response: {data}')
except Exception as e:
    print(f'  Error parsing response: {e}')
"
    echo ""
done

echo "✅ Column Mapping Configuration Completed!"
echo ""
echo "🔄 The cron job should now be able to process TPP 901 files successfully."
echo "📊 Monitor the next cron cycle (every 2 minutes) to see successful processing."
echo ""
echo "📝 Next Steps:"
echo "1. Wait for next cron execution (every 2 minutes)"
echo "2. Check import logs for SUCCESS status"
echo "3. Verify files are moved to archive directory"
echo "4. Check database for imported data"
