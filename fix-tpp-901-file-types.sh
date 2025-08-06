#!/bin/bash

echo "🔧 Fixing TPP 901 File Type Configuration Issue"
echo "=============================================="
echo ""
echo "Issue: File processing configs use descriptive fileType names but parser expects 'CSV'"
echo "Solution: Update TPP 901 configs to use fileType 'CSV' instead of descriptive names"
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

# Get TPP 901 file configs
echo "📋 Getting current TPP 901 file processing configurations..."
CONFIGS_RESPONSE=$(curl -s -X GET "http://localhost:8080/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

echo "Current TPP 901 configurations:"
echo $CONFIGS_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for config in data:
        if config.get('bankOrTPPId') == 43:  # TPP 901
            print(f\"  • ID: {config['id']} | Type: {config['fileType']} | Directory: {config['directoryPath']}\")
except:
    print('Failed to parse configs')
"
echo ""

# Update each TPP 901 config to use fileType "CSV"
echo "🔄 Updating TPP 901 configurations to use fileType 'CSV'..."

# Get the specific config IDs for TPP 901
CONFIG_IDS=$(echo $CONFIGS_RESPONSE | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    ids = []
    for config in data:
        if config.get('bankOrTPPId') == 43:  # TPP 901
            ids.append(str(config['id']))
    print(' '.join(ids))
except:
    print('')
")

if [ -z "$CONFIG_IDS" ]; then
    echo "❌ No TPP 901 configurations found"
    exit 1
fi

echo "Found TPP 901 config IDs: $CONFIG_IDS"
echo ""

# Update each configuration
for CONFIG_ID in $CONFIG_IDS; do
    echo "Updating config ID: $CONFIG_ID"
    
    # Get current config details
    CURRENT_CONFIG=$(curl -s -X GET "http://localhost:8080/api/admin/file-configs" \
      -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for config in data:
        if config['id'] == $CONFIG_ID:
            print(json.dumps(config))
            break
except:
    pass
")
    
    if [ -z "$CURRENT_CONFIG" ]; then
        echo "  ❌ Could not get current config for ID $CONFIG_ID"
        continue
    fi
    
    # Extract current values and update fileType to "CSV"
    UPDATED_CONFIG=$(echo $CURRENT_CONFIG | python3 -c "
import sys, json
try:
    config = json.load(sys.stdin)
    # Keep original fileType as reportType for reference
    config['reportType'] = config['fileType']
    # Update fileType to CSV
    config['fileType'] = 'CSV'
    print(json.dumps(config))
except Exception as e:
    print('{}')
")
    
    if [ "$UPDATED_CONFIG" = "{}" ]; then
        echo "  ❌ Failed to prepare updated config for ID $CONFIG_ID"
        continue
    fi
    
    # Send update request
    UPDATE_RESPONSE=$(curl -s -X PUT "http://localhost:8080/api/admin/file-configs/$CONFIG_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$UPDATED_CONFIG")
    
    # Check if update was successful
    if echo $UPDATE_RESPONSE | grep -q '"id"'; then
        echo "  ✅ Successfully updated config ID $CONFIG_ID to use fileType 'CSV'"
    else
        echo "  ❌ Failed to update config ID $CONFIG_ID"
        echo "  Response: $UPDATE_RESPONSE"
    fi
done

echo ""
echo "🔍 Verifying updated configurations..."
UPDATED_CONFIGS=$(curl -s -X GET "http://localhost:8080/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

echo "Updated TPP 901 configurations:"
echo $UPDATED_CONFIGS | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for config in data:
        if config.get('bankOrTPPId') == 43:  # TPP 901
            print(f\"  • ID: {config['id']} | Type: {config['fileType']} | Directory: {config['directoryPath']}\")
except:
    print('Failed to parse updated configs')
"

echo ""
echo "✅ File type configuration fix completed!"
echo ""
echo "🔄 The cron job should now be able to process TPP 901 files successfully."
echo "📊 Monitor the next cron cycle (every 2 minutes) to see successful processing."
