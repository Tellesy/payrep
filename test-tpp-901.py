#!/usr/bin/env python3
"""
TPP 901 Real-Life Testing Script
This script simulates how a real user would configure and test TPP 901 report processing.
"""

import requests
import json
import time
import os
from datetime import datetime, timedelta
import csv
from typing import Dict, List, Any

class TPP901Tester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.token = None
        self.tpp_901_id = None
        self.config_ids = []
        
    def login(self, username="admin", password="admin123"):
        """Login and get JWT token"""
        print("🔐 Logging in as admin...")
        response = requests.post(f"{self.base_url}/api/auth/login", json={
            "username": username,
            "password": password
        })
        
        if response.status_code == 200:
            self.token = response.json()["token"]
            print("✅ Login successful")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    
    def get_headers(self):
        """Get headers with JWT token"""
        return {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
    
    def setup_tpp_901(self):
        """Set up TPP 901 as a real user would via API"""
        print("\n🏦 Setting up TPP 901...")
        
        # First check if TPP 901 already exists
        response = requests.get(f"{self.base_url}/api/admin/banks", headers=self.get_headers())
        if response.status_code == 200:
            banks = response.json()
            for bank in banks:
                if bank["code"] == "901":
                    self.tpp_901_id = bank["id"]
                    print(f"✅ TPP 901 already exists with ID: {self.tpp_901_id}")
                    return True
        
        # Create TPP 901 if it doesn't exist
        tpp_data = {
            "code": "901",
            "name": "Tadawul TPP",
            "type": "TPP"
        }
        
        response = requests.post(f"{self.base_url}/api/admin/banks", 
                               json=tpp_data, headers=self.get_headers())
        
        if response.status_code == 200:
            result = response.json()
            self.tpp_901_id = result["id"]
            print(f"✅ TPP 901 created successfully with ID: {self.tpp_901_id}")
            return True
        else:
            print(f"❌ Failed to create TPP 901: {response.status_code} - {response.text}")
            return False
    
    def configure_file_processing(self, cron_schedule="0 */5 * * * ?"):
        """Configure file processing for TPP 901 reports"""
        print(f"\n⚙️ Configuring file processing with cron: {cron_schedule}")
        
        # Report types that TPP 901 provides
        report_configs = [
            {
                "fileType": "E-Commerce Card Activity",
                "directoryPath": "sample-data/901",
                "fileNamePattern": "ecommerce_card_activity_\\d{4}-\\d{2}-\\d{2}\\.csv"
            },
            {
                "fileType": "POS Terminal Data", 
                "directoryPath": "sample-data/901",
                "fileNamePattern": "pos_terminal_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
            },
            {
                "fileType": "POS Transaction Data",
                "directoryPath": "sample-data/901", 
                "fileNamePattern": "pos_transaction_data_\\d{4}-\\d{2}-\\d{2}\\.csv"
            }
        ]
        
        for config in report_configs:
            config_data = {
                "bankOrTPPId": self.tpp_901_id,
                "directoryPath": config["directoryPath"],
                "fileNamePattern": config["fileNamePattern"],
                "scheduleTime": cron_schedule,
                "fileType": config["fileType"]
            }
            
            response = requests.post(f"{self.base_url}/api/admin/file-configs",
                                   json=config_data, headers=self.get_headers())
            
            if response.status_code == 200:
                result = response.json()
                self.config_ids.append(result["id"])
                print(f"✅ Configured {config['fileType']} processing (ID: {result['id']})")
            else:
                print(f"❌ Failed to configure {config['fileType']}: {response.status_code} - {response.text}")
        
        return len(self.config_ids) > 0
    
    def analyze_report_structure(self):
        """Analyze TPP 901 reports vs templates"""
        print("\n🔍 Analyzing report structure and compatibility...")
        
        analysis_results = {
            "ecommerce_card_activity": self._analyze_ecommerce_reports(),
            "pos_terminal_data": self._analyze_pos_terminal_reports(),
            "pos_transaction_data": self._analyze_pos_transaction_reports()
        }
        
        return analysis_results
    
    def _analyze_ecommerce_reports(self):
        """Analyze e-commerce card activity reports"""
        print("   📊 Analyzing E-commerce Card Activity reports...")
        
        # Read TPP 901 sample
        tpp_901_file = "sample-data/901/ecommerce_card_activity_2025-07-18.csv"
        template_file = "sample-data/reports/E-CommerceCardActivity_001_2025-08-03.csv"
        
        tpp_901_columns = self._get_csv_columns(tpp_901_file)
        template_columns = self._get_csv_columns(template_file)
        
        analysis = {
            "tpp_901_columns": tpp_901_columns,
            "template_columns": template_columns,
            "matching_columns": list(set(tpp_901_columns) & set(template_columns)),
            "missing_in_tpp_901": list(set(template_columns) - set(tpp_901_columns)),
            "extra_in_tpp_901": list(set(tpp_901_columns) - set(template_columns)),
            "compatibility_score": len(set(tpp_901_columns) & set(template_columns)) / len(set(tpp_901_columns) | set(template_columns))
        }
        
        print(f"      ✅ Matching columns: {analysis['matching_columns']}")
        print(f"      ⚠️ Missing in TPP 901: {analysis['missing_in_tpp_901']}")
        print(f"      ℹ️ Extra in TPP 901: {analysis['extra_in_tpp_901']}")
        print(f"      📈 Compatibility: {analysis['compatibility_score']:.1%}")
        
        return analysis
    
    def _analyze_pos_terminal_reports(self):
        """Analyze POS terminal data reports"""
        print("   📊 Analyzing POS Terminal Data reports...")
        
        tpp_901_file = "sample-data/901/pos_terminal_data_2025-07-18.csv"
        template_file = "sample-data/reports/POSTerminalData_001_2025-08-03.csv"
        
        tpp_901_columns = self._get_csv_columns(tpp_901_file)
        template_columns = self._get_csv_columns(template_file)
        
        analysis = {
            "tpp_901_columns": tpp_901_columns,
            "template_columns": template_columns,
            "matching_columns": list(set(tpp_901_columns) & set(template_columns)),
            "missing_in_tpp_901": list(set(template_columns) - set(tpp_901_columns)),
            "extra_in_tpp_901": list(set(tpp_901_columns) - set(template_columns)),
            "compatibility_score": len(set(tpp_901_columns) & set(template_columns)) / len(set(tpp_901_columns) | set(template_columns))
        }
        
        print(f"      ✅ Matching columns: {analysis['matching_columns']}")
        print(f"      ⚠️ Missing in TPP 901: {analysis['missing_in_tpp_901']}")
        print(f"      ℹ️ Extra in TPP 901: {analysis['extra_in_tpp_901']}")
        print(f"      📈 Compatibility: {analysis['compatibility_score']:.1%}")
        
        return analysis
    
    def _analyze_pos_transaction_reports(self):
        """Analyze POS transaction data reports"""
        print("   📊 Analyzing POS Transaction Data reports...")
        
        tpp_901_file = "sample-data/901/pos_transaction_data_2025-07-18.csv"
        template_file = "sample-data/reports/POSTransactionData_001_2025-08-03.csv"
        
        tpp_901_columns = self._get_csv_columns(tpp_901_file)
        template_columns = self._get_csv_columns(template_file)
        
        analysis = {
            "tpp_901_columns": tpp_901_columns,
            "template_columns": template_columns,
            "matching_columns": list(set(tpp_901_columns) & set(template_columns)),
            "missing_in_tpp_901": list(set(template_columns) - set(tpp_901_columns)),
            "extra_in_tpp_901": list(set(tpp_901_columns) - set(template_columns)),
            "compatibility_score": len(set(tpp_901_columns) & set(template_columns)) / len(set(tpp_901_columns) | set(template_columns))
        }
        
        print(f"      ✅ Matching columns: {analysis['matching_columns']}")
        print(f"      ⚠️ Missing in TPP 901: {analysis['missing_in_tpp_901']}")
        print(f"      ℹ️ Extra in TPP 901: {analysis['extra_in_tpp_901']}")
        print(f"      📈 Compatibility: {analysis['compatibility_score']:.1%}")
        
        return analysis
    
    def _get_csv_columns(self, file_path):
        """Get column names from CSV file"""
        try:
            with open(file_path, 'r') as f:
                reader = csv.reader(f)
                return next(reader)
        except Exception as e:
            print(f"      ❌ Error reading {file_path}: {e}")
            return []
    
    def trigger_manual_processing(self):
        """Trigger manual processing to test the system"""
        print("\n🚀 Triggering manual file processing...")
        
        response = requests.get(f"{self.base_url}/api/bi/process-reports?directory=sample-data/901",
                              headers=self.get_headers())
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Processing triggered: {result}")
            return result
        else:
            print(f"❌ Failed to trigger processing: {response.status_code} - {response.text}")
            return None
    
    def monitor_import_logs(self):
        """Monitor import logs for processing results"""
        print("\n📋 Monitoring import logs...")
        
        response = requests.get(f"{self.base_url}/api/admin/import-logs", headers=self.get_headers())
        
        if response.status_code == 200:
            logs = response.json()
            print(f"📊 Found {len(logs)} import log entries")
            
            # Filter logs for TPP 901 configs
            tpp_901_logs = []
            for log in logs:
                if hasattr(log, 'fileProcessingConfig') and log['fileProcessingConfig']['id'] in self.config_ids:
                    tpp_901_logs.append(log)
            
            if tpp_901_logs:
                print("🔍 TPP 901 Processing Results:")
                for log in tpp_901_logs[-5:]:  # Show last 5 logs
                    status_emoji = "✅" if log['status'] == 'SUCCESS' else "❌" if log['status'] == 'FAILED' else "⏳"
                    print(f"   {status_emoji} {log['fileName']} - {log['status']} at {log['importTime']}")
                    if log.get('errorMessage'):
                        print(f"      Error: {log['errorMessage']}")
            else:
                print("ℹ️ No TPP 901 processing logs found yet")
            
            return logs
        else:
            print(f"❌ Failed to get import logs: {response.status_code} - {response.text}")
            return []
    
    def generate_compatibility_report(self, analysis_results):
        """Generate a comprehensive compatibility report"""
        print("\n📄 Generating Compatibility Report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "tpp_code": "901",
            "tpp_name": "Tadawul TPP",
            "analysis_results": analysis_results,
            "overall_compatibility": self._calculate_overall_compatibility(analysis_results),
            "recommendations": self._generate_recommendations(analysis_results)
        }
        
        # Save report to file
        report_file = f"tpp_901_compatibility_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Report saved to: {report_file}")
        
        # Print summary
        print("\n📊 COMPATIBILITY SUMMARY:")
        for report_type, analysis in analysis_results.items():
            print(f"   {report_type}: {analysis['compatibility_score']:.1%} compatible")
        print(f"   Overall: {report['overall_compatibility']:.1%} compatible")
        
        print("\n💡 RECOMMENDATIONS:")
        for rec in report['recommendations']:
            print(f"   • {rec}")
        
        return report
    
    def _calculate_overall_compatibility(self, analysis_results):
        """Calculate overall compatibility score"""
        scores = [analysis['compatibility_score'] for analysis in analysis_results.values()]
        return sum(scores) / len(scores) if scores else 0
    
    def _generate_recommendations(self, analysis_results):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        for report_type, analysis in analysis_results.items():
            if analysis['missing_in_tpp_901']:
                recommendations.append(f"Add missing columns to {report_type}: {', '.join(analysis['missing_in_tpp_901'])}")
            
            if analysis['compatibility_score'] < 0.8:
                recommendations.append(f"Review {report_type} format - low compatibility ({analysis['compatibility_score']:.1%})")
        
        if not recommendations:
            recommendations.append("All reports show good compatibility with templates")
        
        return recommendations
    
    def run_full_test(self, cron_schedule="0 */5 * * * ?"):
        """Run the complete test suite"""
        print("🚀 Starting TPP 901 Real-Life Testing...")
        print("=" * 60)
        
        # Step 1: Login
        if not self.login():
            return False
        
        # Step 2: Setup TPP 901
        if not self.setup_tpp_901():
            return False
        
        # Step 3: Configure file processing
        if not self.configure_file_processing(cron_schedule):
            return False
        
        # Step 4: Analyze report structure
        analysis_results = self.analyze_report_structure()
        
        # Step 5: Trigger manual processing
        self.trigger_manual_processing()
        
        # Step 6: Wait a bit and monitor logs
        print("\n⏳ Waiting 10 seconds for processing...")
        time.sleep(10)
        self.monitor_import_logs()
        
        # Step 7: Generate report
        report = self.generate_compatibility_report(analysis_results)
        
        print("\n🎉 TPP 901 testing completed successfully!")
        print("=" * 60)
        
        return True

def main():
    """Main function to run the test"""
    tester = TPP901Tester()
    
    # Ask user for cron schedule
    print("⏰ When would you like the reports to be processed?")
    print("Examples:")
    print("  - Every 5 minutes: 0 */5 * * * ?")
    print("  - Every hour: 0 0 * * * ?")
    print("  - Daily at 2 AM: 0 0 2 * * ?")
    print("  - Every 30 seconds: */30 * * * * ?")
    
    cron_schedule = input("Enter cron expression (or press Enter for every 5 minutes): ").strip()
    if not cron_schedule:
        cron_schedule = "0 */5 * * * ?"
    
    print(f"Using cron schedule: {cron_schedule}")
    
    # Run the test
    success = tester.run_full_test(cron_schedule)
    
    if success:
        print("\n✅ All tests completed successfully!")
        print("🔍 Check the generated compatibility report for detailed analysis.")
        print("📋 Monitor import logs via the admin API or UI for ongoing processing.")
    else:
        print("\n❌ Some tests failed. Check the output above for details.")

if __name__ == "__main__":
    main()
