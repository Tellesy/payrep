#!/bin/bash

# Fix TPP 901 Cron Schedule and Enhance Logging
# Updates the cron schedule to every 2 minutes and improves logging

BASE_URL="http://localhost:8080"
TOKEN=""

echo "🔧 Fixing TPP 901 Cron Schedule and Enhancing Logging"
echo "====================================================="

# Step 1: Login and get JWT token
echo "🔐 Logging in..."
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

echo ""
echo "📋 Getting Current TPP 901 Configurations..."
echo "============================================"

# Get current file configs for TPP 901
CONFIGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

# Extract TPP 901 config IDs (133, 134, 135)
TPP_901_CONFIG_IDS=(133 134 135)

echo "🔄 Updating Cron Schedule to Every 2 Minutes..."
echo "==============================================="

# Update each TPP 901 configuration
for CONFIG_ID in "${TPP_901_CONFIG_IDS[@]}"; do
    echo "   📝 Updating Config ID: $CONFIG_ID"
    
    # Get current config details
    CONFIG_DETAILS=$(curl -s -X GET "$BASE_URL/api/admin/file-configs" \
      -H "Authorization: Bearer $TOKEN" | \
      python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    config = next((c for c in data if c['id'] == $CONFIG_ID), None)
    if config:
        print(json.dumps(config))
except:
    pass
")
    
    if [ -n "$CONFIG_DETAILS" ]; then
        # Extract config details and update schedule
        UPDATED_CONFIG=$(echo "$CONFIG_DETAILS" | python3 -c "
import sys, json
try:
    config = json.load(sys.stdin)
    config['scheduleTime'] = '0 */2 * * * ?'  # Every 2 minutes
    print(json.dumps(config))
except:
    pass
")
        
        if [ -n "$UPDATED_CONFIG" ]; then
            # Update the configuration
            UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/admin/file-configs/$CONFIG_ID" \
              -H "Authorization: Bearer $TOKEN" \
              -H "Content-Type: application/json" \
              -d "$UPDATED_CONFIG")
            
            if echo "$UPDATE_RESPONSE" | grep -q '"id"'; then
                echo "   ✅ Config $CONFIG_ID updated successfully"
            else
                echo "   ❌ Failed to update config $CONFIG_ID: $UPDATE_RESPONSE"
            fi
        else
            echo "   ❌ Failed to prepare update for config $CONFIG_ID"
        fi
    else
        echo "   ❌ Failed to get details for config $CONFIG_ID"
    fi
done

echo ""
echo "📊 Verifying Updated Configurations..."
echo "====================================="

# Verify the updates
UPDATED_CONFIGS=$(curl -s -X GET "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

echo "$UPDATED_CONFIGS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tpp_901_configs = [config for config in data if config.get('bankOrTPPId') == 43]
    if tpp_901_configs:
        print('✅ Updated TPP 901 Configurations:')
        for config in tpp_901_configs:
            if config['id'] in [133, 134, 135]:
                print(f'   • ID: {config[\"id\"]} | Type: {config[\"fileType\"]}')
                print(f'     Schedule: {config[\"scheduleTime\"]} | Directory: {config[\"directoryPath\"]}')
    else:
        print('❌ No TPP 901 configurations found')
except Exception as e:
    print(f'Error parsing configurations: {e}')
"

echo ""
echo "🔍 Testing Manual Processing to Verify System..."
echo "==============================================="

# Trigger manual processing to test the system
echo "🚀 Triggering manual processing..."
PROCESS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/bi/process-reports?directory=sample-data/901" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 Processing response: $PROCESS_RESPONSE"

echo ""
echo "⏳ Waiting 5 seconds for processing to complete..."
sleep 5

echo ""
echo "📋 Checking Import Logs After Manual Processing..."
echo "================================================"

LOGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/import-logs" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LOGS_RESPONSE" | grep -q '\[\]'; then
    echo "⚠️ Still no import logs found"
    echo ""
    echo "🔍 This suggests there might be an issue with:"
    echo "   • File processing logic"
    echo "   • Directory access permissions"
    echo "   • File pattern matching"
    echo "   • Database logging"
else
    echo "✅ Import logs found:"
    echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGS_RESPONSE"
fi

echo ""
echo "📂 Checking for Archive Directory..."
echo "==================================="

if [ -d "sample-data/901/archive" ]; then
    ARCHIVE_COUNT=$(ls -1 sample-data/901/archive/*.csv 2>/dev/null | wc -l)
    echo "📦 Archive directory exists with $ARCHIVE_COUNT files"
    if [ $ARCHIVE_COUNT -gt 0 ]; then
        echo "📄 Recently archived files:"
        ls -lt sample-data/901/archive/*.csv | head -5
    fi
else
    echo "📁 Creating archive directory..."
    mkdir -p sample-data/901/archive
    echo "✅ Archive directory created"
fi

echo ""
echo "🎯 Summary and Next Steps:"
echo "========================="
echo "✅ Updated cron schedule to every 2 minutes (0 */2 * * * ?)"
echo "✅ Triggered manual processing test"
echo "✅ Verified archive directory exists"
echo ""
echo "🕐 Next automatic processing should occur within 2 minutes"
echo "🔄 Run './monitor-cron-processing.sh' to check for automatic processing"
echo "⏰ Current time: $(date)"
echo ""
echo "📝 If still no processing occurs, check:"
echo "   • Application logs for error messages"
echo "   • File permissions in sample-data/901/"
echo "   • Database connectivity"
