#!/bin/bash

# TPP 901 Cron Processing Monitor
# This script monitors the automatic file processing for TPP 901

BASE_URL="http://localhost:8080"
TOKEN=""

echo "🔍 TPP 901 Cron Processing Monitor"
echo "=================================="

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
echo "📋 Checking Import Logs for Automatic Processing..."
echo "=================================================="

# Get import logs
LOGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/import-logs" \
  -H "Authorization: Bearer $TOKEN")

# Check if we have any logs
if echo "$LOGS_RESPONSE" | grep -q '\[\]'; then
    echo "ℹ️ No import logs found yet"
    echo ""
    echo "🕐 This could mean:"
    echo "   • Cron job hasn't run yet (runs every 5 minutes)"
    echo "   • Files are already processed and archived"
    echo "   • Configuration needs verification"
else
    echo "📊 Import Logs Found:"
    echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGS_RESPONSE"
fi

echo ""
echo "📁 Checking TPP 901 File Configurations..."
echo "=========================================="

# Get file configs for TPP 901
CONFIGS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/file-configs" \
  -H "Authorization: Bearer $TOKEN")

echo "⚙️ File Processing Configurations:"
echo "$CONFIGS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tpp_901_configs = [config for config in data if 'bankOrTPPId' in config and config['bankOrTPPId'] == 43]
    if tpp_901_configs:
        print(f'Found {len(tpp_901_configs)} TPP 901 configurations:')
        for config in tpp_901_configs:
            print(f'  • ID: {config[\"id\"]} | Type: {config[\"fileType\"]} | Schedule: {config[\"scheduleTime\"]}')
            print(f'    Directory: {config[\"directoryPath\"]} | Pattern: {config[\"fileNamePattern\"]}')
    else:
        print('No TPP 901 configurations found')
except:
    print('Error parsing configurations')
" 2>/dev/null || echo "Error parsing response"

echo ""
echo "📂 Checking Files in TPP 901 Directory..."
echo "========================================"

# Check if files exist in the directory
if [ -d "sample-data/901" ]; then
    FILE_COUNT=$(ls -1 sample-data/901/*.csv 2>/dev/null | wc -l)
    echo "📊 Files in sample-data/901/: $FILE_COUNT"
    
    if [ $FILE_COUNT -gt 0 ]; then
        echo "📄 Available files:"
        ls -la sample-data/901/*.csv | while read line; do
            echo "   $line"
        done
        
        # Check if there's an archive directory (processed files get moved there)
        if [ -d "sample-data/901/archive" ]; then
            ARCHIVE_COUNT=$(ls -1 sample-data/901/archive/*.csv 2>/dev/null | wc -l)
            echo ""
            echo "📦 Archived (processed) files: $ARCHIVE_COUNT"
            if [ $ARCHIVE_COUNT -gt 0 ]; then
                echo "📄 Archived files:"
                ls -la sample-data/901/archive/*.csv | while read line; do
                    echo "   $line"
                done
            fi
        fi
    else
        echo "⚠️ No CSV files found in sample-data/901/"
    fi
else
    echo "❌ Directory sample-data/901/ does not exist"
fi

echo ""
echo "🕐 Next Steps for Monitoring:"
echo "============================"
echo "1. Wait for the next cron cycle (every 5 minutes)"
echo "2. Run this script again to see new import logs"
echo "3. Check if files moved to archive directory"
echo "4. Look for processing messages in application logs"

echo ""
echo "⏰ Current time: $(date)"
echo "🔄 Next cron execution should be within 5 minutes"
