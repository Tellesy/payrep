#!/bin/bash

# TPP 901 Real-Life Testing Script
# This script simulates how a real user would configure and test TPP 901 report processing

BASE_URL="http://localhost:8080"
TOKEN=""

echo "🚀 Starting TPP 901 Real-Life Testing..."
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
    exit 1
fi

# Step 2: Check if TPP 901 exists
echo ""
echo "🏦 Checking if TPP 901 exists..."
BANKS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/banks" \
  -H "Authorization: Bearer $TOKEN")

TPP_901_ID=$(echo "$BANKS_RESPONSE" | grep -o '"id":[0-9]*[^}]*"code":"901"' | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -n "$TPP_901_ID" ]; then
    echo "✅ TPP 901 already exists with ID: $TPP_901_ID"
else
    echo "🏦 Creating TPP 901..."
    CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/banks" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"code":"901","name":"Tadawul TPP","type":"TPP"}')
    
    TPP_901_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    if [ -n "$TPP_901_ID" ]; then
        echo "✅ TPP 901 created successfully with ID: $TPP_901_ID"
    else
        echo "❌ Failed to create TPP 901: $CREATE_RESPONSE"
        exit 1
    fi
fi

# Step 3: Configure file processing for each report type
echo ""
echo "⚙️ Configuring file processing..."

# E-commerce Card Activity
echo "   📊 Configuring E-commerce Card Activity processing..."
ECOMMERCE_CONFIG=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bankOrTPPId\": $TPP_901_ID,
    \"directoryPath\": \"sample-data/901\",
    \"fileNamePattern\": \"ecommerce_card_activity_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
    \"scheduleTime\": \"0 */5 * * * ?\",
    \"fileType\": \"E-Commerce Card Activity\"
  }")

ECOMMERCE_CONFIG_ID=$(echo "$ECOMMERCE_CONFIG" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$ECOMMERCE_CONFIG_ID" ]; then
    echo "   ✅ E-commerce config created (ID: $ECOMMERCE_CONFIG_ID)"
else
    echo "   ❌ Failed to create e-commerce config: $ECOMMERCE_CONFIG"
fi

# POS Terminal Data
echo "   🏪 Configuring POS Terminal Data processing..."
POS_TERMINAL_CONFIG=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bankOrTPPId\": $TPP_901_ID,
    \"directoryPath\": \"sample-data/901\",
    \"fileNamePattern\": \"pos_terminal_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
    \"scheduleTime\": \"0 */5 * * * ?\",
    \"fileType\": \"POS Terminal Data\"
  }")

POS_TERMINAL_CONFIG_ID=$(echo "$POS_TERMINAL_CONFIG" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$POS_TERMINAL_CONFIG_ID" ]; then
    echo "   ✅ POS Terminal config created (ID: $POS_TERMINAL_CONFIG_ID)"
else
    echo "   ❌ Failed to create POS Terminal config: $POS_TERMINAL_CONFIG"
fi

# POS Transaction Data
echo "   💳 Configuring POS Transaction Data processing..."
POS_TRANSACTION_CONFIG=$(curl -s -X POST "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bankOrTPPId\": $TPP_901_ID,
    \"directoryPath\": \"sample-data/901\",
    \"fileNamePattern\": \"pos_transaction_data_\\\\d{4}-\\\\d{2}-\\\\d{2}\\\\.csv\",
    \"scheduleTime\": \"0 */5 * * * ?\",
    \"fileType\": \"POS Transaction Data\"
  }")

POS_TRANSACTION_CONFIG_ID=$(echo "$POS_TRANSACTION_CONFIG" | grep -o '"id":[0-9]*' | cut -d':' -f2)
if [ -n "$POS_TRANSACTION_CONFIG_ID" ]; then
    echo "   ✅ POS Transaction config created (ID: $POS_TRANSACTION_CONFIG_ID)"
else
    echo "   ❌ Failed to create POS Transaction config: $POS_TRANSACTION_CONFIG"
fi

# Step 4: Trigger manual processing
echo ""
echo "🚀 Triggering manual file processing..."
PROCESS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bi/process-reports?directory=sample-data/901" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Processing response: $PROCESS_RESPONSE"

# Step 5: Wait and check import logs
echo ""
echo "⏳ Waiting 10 seconds for processing..."
sleep 10

echo "📋 Checking import logs..."
LOGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/import-logs" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 Import logs response:"
echo "$LOGS_RESPONSE" | head -500

echo ""
echo "🎉 TPP 901 testing completed!"
echo "=" * 60
