#!/bin/bash

# Fix TPP 901 File Processing Configurations
# This script fixes the fileType mismatch and ensures all configs are properly set up

BASE_URL="http://localhost:8080"
TOKEN=""

echo "🔧 Fixing TPP 901 File Processing Configurations..."
echo "=" * 60

# Step 1: Login and get JWT token
echo "🔐 Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Login successful"
else
    echo "❌ Login failed: $LOGIN_RESPONSE"
    echo "Trying with admin123 password..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123"}')
    
    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Login successful with admin123"
    else
        echo "❌ Login failed with both passwords: $LOGIN_RESPONSE"
        exit 1
    fi
fi

# Step 2: Get TPP 901 ID
echo ""
echo "🏦 Getting TPP 901 ID..."
BANKS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/banks" \
  -H "Authorization: Bearer $TOKEN")

echo "Banks response: $BANKS_RESPONSE"

TPP_901_ID=$(echo "$BANKS_RESPONSE" | grep -o '"id":[0-9]*[^}]*"code":"901"' | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$TPP_901_ID" ]; then
    echo "✅ TPP 901 found with ID: $TPP_901_ID"
else
    echo "❌ TPP 901 not found in response"
    exit 1
fi

# Step 3: Get existing file processing configs for TPP 901
echo ""
echo "📋 Checking existing file processing configs..."
CONFIGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

echo "Configs response: $CONFIGS_RESPONSE"

# Step 4: Update existing configs to use fileType "CSV"
echo ""
echo "🔧 Updating file processing configs to use fileType 'CSV'..."

# Find and update E-commerce config
ECOMMERCE_CONFIG_ID=$(echo "$CONFIGS_RESPONSE" | grep -o '"id":[0-9]*[^}]*"fileType":"E-Commerce Card Activity"' | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$ECOMMERCE_CONFIG_ID" ]; then
    echo "   📊 Updating E-commerce config (ID: $ECOMMERCE_CONFIG_ID)..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/file-configs/$ECOMMERCE_CONFIG_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"ecommerce_card_activity_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ E-commerce config updated: $UPDATE_RESPONSE"
else
    echo "   ❌ E-commerce config not found"
fi

# Find and update POS Terminal config
POS_TERMINAL_CONFIG_ID=$(echo "$CONFIGS_RESPONSE" | grep -o '"id":[0-9]*[^}]*"fileType":"POS Terminal Data"' | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$POS_TERMINAL_CONFIG_ID" ]; then
    echo "   🏪 Updating POS Terminal config (ID: $POS_TERMINAL_CONFIG_ID)..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/file-configs/$POS_TERMINAL_CONFIG_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"pos_terminal_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ POS Terminal config updated: $UPDATE_RESPONSE"
else
    echo "   ❌ POS Terminal config not found"
fi

# Find and update POS Transaction config
POS_TRANSACTION_CONFIG_ID=$(echo "$CONFIGS_RESPONSE" | grep -o '"id":[0-9]*[^}]*"fileType":"POS Transaction Data"' | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$POS_TRANSACTION_CONFIG_ID" ]; then
    echo "   💳 Updating POS Transaction config (ID: $POS_TRANSACTION_CONFIG_ID)..."
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/file-configs/$POS_TRANSACTION_CONFIG_ID" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"pos_transaction_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ POS Transaction config updated: $UPDATE_RESPONSE"
else
    echo "   ❌ POS Transaction config not found"
fi

# Step 5: Create missing configs if needed
echo ""
echo "🆕 Creating any missing configs..."

if [ -z "$ECOMMERCE_CONFIG_ID" ]; then
    echo "   📊 Creating E-commerce config..."
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"ecommerce_card_activity_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ E-commerce config created: $CREATE_RESPONSE"
fi

if [ -z "$POS_TERMINAL_CONFIG_ID" ]; then
    echo "   🏪 Creating POS Terminal config..."
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"pos_terminal_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ POS Terminal config created: $CREATE_RESPONSE"
fi

if [ -z "$POS_TRANSACTION_CONFIG_ID" ]; then
    echo "   💳 Creating POS Transaction config..."
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"bankOrTPPId\": $TPP_901_ID,
        \"directoryPath\": \"sample-data/901\",
        \"fileNamePattern\": \"pos_transaction_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
        \"scheduleTime\": \"0 */2 * * * ?\",
        \"fileType\": \"CSV\"
      }")
    echo "   ✅ POS Transaction config created: $CREATE_RESPONSE"
fi

# Step 6: Trigger manual processing to test
echo ""
echo "🚀 Triggering manual file processing to test..."
PROCESS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bi/process-reports?directory=sample-data/901" \
  -H "Authorization: Bearer $TOKEN")

echo "Process response: $PROCESS_RESPONSE"

# Step 7: Check import logs
echo ""
echo "📊 Checking recent import logs..."
LOGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/import-logs" \
  -H "Authorization: Bearer $TOKEN")

echo "Recent import logs: $LOGS_RESPONSE"

echo ""
echo "🎉 TPP 901 configuration fix completed!"
echo "   - Updated all configs to use fileType 'CSV'"
echo "   - Updated cron schedule to every 2 minutes"
echo "   - Triggered manual processing test"
echo ""
echo "Monitor the logs to verify file processing is now working correctly."
