#!/usr/bin/env python3
"""
TPP 901 Compatibility Analysis Script
Analyzes the compatibility between TPP 901 reports and template reports
"""

import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Any

class TPP901CompatibilityAnalyzer:
    def __init__(self):
        self.analysis_results = {}
        
    def analyze_csv_structure(self, file_path: str) -> Dict[str, Any]:
        """Analyze CSV file structure and return metadata"""
        if not os.path.exists(file_path):
            return {"error": f"File not found: {file_path}"}
        
        try:
            with open(file_path, 'r') as f:
                reader = csv.reader(f)
                headers = next(reader)
                
                # Read first few data rows to analyze data types
                sample_rows = []
                for i, row in enumerate(reader):
                    if i >= 5:  # Only read first 5 data rows
                        break
                    sample_rows.append(row)
                
                return {
                    "headers": headers,
                    "header_count": len(headers),
                    "sample_rows": sample_rows,
                    "data_row_count": len(sample_rows)
                }
        except Exception as e:
            return {"error": f"Error reading file: {e}"}
    
    def compare_structures(self, tpp_901_structure: Dict, template_structure: Dict) -> Dict[str, Any]:
        """Compare two CSV structures and return compatibility analysis"""
        if "error" in tpp_901_structure or "error" in template_structure:
            return {"error": "Cannot compare due to file read errors"}
        
        tpp_headers = set(tpp_901_structure["headers"])
        template_headers = set(template_structure["headers"])
        
        matching_headers = tpp_headers & template_headers
        missing_in_tpp = template_headers - tpp_headers
        extra_in_tpp = tpp_headers - template_headers
        
        compatibility_score = len(matching_headers) / len(tpp_headers | template_headers) if (tpp_headers | template_headers) else 0
        
        return {
            "tpp_901_headers": list(tpp_headers),
            "template_headers": list(template_headers),
            "matching_headers": list(matching_headers),
            "missing_in_tpp_901": list(missing_in_tpp),
            "extra_in_tpp_901": list(extra_in_tpp),
            "compatibility_score": compatibility_score,
            "header_count_match": len(tpp_901_structure["headers"]) == len(template_structure["headers"])
        }
    
    def analyze_data_compatibility(self, tpp_901_structure: Dict, template_structure: Dict) -> Dict[str, Any]:
        """Analyze data type and format compatibility"""
        if "error" in tpp_901_structure or "error" in template_structure:
            return {"error": "Cannot analyze data due to file read errors"}
        
        data_analysis = {
            "tpp_901_sample_data": tpp_901_structure.get("sample_rows", []),
            "template_sample_data": template_structure.get("sample_rows", []),
            "data_format_issues": []
        }
        
        # Check for common data format issues
        tpp_headers = tpp_901_structure["headers"]
        template_headers = template_structure["headers"]
        
        # Check date format consistency
        date_columns = [h for h in tpp_headers if 'date' in h.lower()]
        if date_columns and tpp_901_structure["sample_rows"]:
            for date_col in date_columns:
                if date_col in tpp_headers:
                    col_index = tpp_headers.index(date_col)
                    if col_index < len(tpp_901_structure["sample_rows"][0]):
                        sample_date = tpp_901_structure["sample_rows"][0][col_index]
                        data_analysis["data_format_issues"].append({
                            "column": date_col,
                            "sample_value": sample_date,
                            "issue": "Date format should be validated"
                        })
        
        return data_analysis
    
    def analyze_ecommerce_reports(self):
        """Analyze E-commerce Card Activity reports"""
        print("📊 Analyzing E-commerce Card Activity Reports...")
        
        tpp_file = "sample-data/901/ecommerce_card_activity_2025-07-18.csv"
        template_file = "sample-data/reports/E-CommerceCardActivity_001_2025-08-03.csv"
        
        tpp_structure = self.analyze_csv_structure(tpp_file)
        template_structure = self.analyze_csv_structure(template_file)
        
        compatibility = self.compare_structures(tpp_structure, template_structure)
        data_analysis = self.analyze_data_compatibility(tpp_structure, template_structure)
        
        self.analysis_results["ecommerce_card_activity"] = {
            "tpp_901_structure": tpp_structure,
            "template_structure": template_structure,
            "compatibility": compatibility,
            "data_analysis": data_analysis
        }
        
        self._print_analysis_summary("E-commerce Card Activity", compatibility)
    
    def analyze_pos_terminal_reports(self):
        """Analyze POS Terminal Data reports"""
        print("🏪 Analyzing POS Terminal Data Reports...")
        
        tpp_file = "sample-data/901/pos_terminal_data_2025-07-18.csv"
        template_file = "sample-data/reports/POSTerminalData_001_2025-08-03.csv"
        
        tpp_structure = self.analyze_csv_structure(tpp_file)
        template_structure = self.analyze_csv_structure(template_file)
        
        compatibility = self.compare_structures(tpp_structure, template_structure)
        data_analysis = self.analyze_data_compatibility(tpp_structure, template_structure)
        
        self.analysis_results["pos_terminal_data"] = {
            "tpp_901_structure": tpp_structure,
            "template_structure": template_structure,
            "compatibility": compatibility,
            "data_analysis": data_analysis
        }
        
        self._print_analysis_summary("POS Terminal Data", compatibility)
    
    def analyze_pos_transaction_reports(self):
        """Analyze POS Transaction Data reports"""
        print("💳 Analyzing POS Transaction Data Reports...")
        
        tpp_file = "sample-data/901/pos_transaction_data_2025-07-18.csv"
        template_file = "sample-data/reports/POSTransactionData_001_2025-08-03.csv"
        
        tpp_structure = self.analyze_csv_structure(tpp_file)
        template_structure = self.analyze_csv_structure(template_file)
        
        compatibility = self.compare_structures(tpp_structure, template_structure)
        data_analysis = self.analyze_data_compatibility(tpp_structure, template_structure)
        
        self.analysis_results["pos_transaction_data"] = {
            "tpp_901_structure": tpp_structure,
            "template_structure": template_structure,
            "compatibility": compatibility,
            "data_analysis": data_analysis
        }
        
        self._print_analysis_summary("POS Transaction Data", compatibility)
    
    def _print_analysis_summary(self, report_type: str, compatibility: Dict):
        """Print a summary of the analysis"""
        if "error" in compatibility:
            print(f"   ❌ Error: {compatibility['error']}")
            return
        
        score = compatibility["compatibility_score"]
        print(f"   📈 Compatibility Score: {score:.1%}")
        
        if compatibility["matching_headers"]:
            print(f"   ✅ Matching columns ({len(compatibility['matching_headers'])}): {', '.join(compatibility['matching_headers'])}")
        
        if compatibility["missing_in_tpp_901"]:
            print(f"   ⚠️ Missing in TPP 901 ({len(compatibility['missing_in_tpp_901'])}): {', '.join(compatibility['missing_in_tpp_901'])}")
        
        if compatibility["extra_in_tpp_901"]:
            print(f"   ℹ️ Extra in TPP 901 ({len(compatibility['extra_in_tpp_901'])}): {', '.join(compatibility['extra_in_tpp_901'])}")
        
        print()
    
    def generate_recommendations(self) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        for report_type, analysis in self.analysis_results.items():
            compatibility = analysis.get("compatibility", {})
            if "error" in compatibility:
                continue
            
            score = compatibility.get("compatibility_score", 0)
            missing = compatibility.get("missing_in_tpp_901", [])
            
            if score < 0.7:
                recommendations.append(f"❗ {report_type}: Low compatibility ({score:.1%}) - requires significant schema changes")
            elif score < 0.9:
                recommendations.append(f"⚠️ {report_type}: Moderate compatibility ({score:.1%}) - minor adjustments needed")
            else:
                recommendations.append(f"✅ {report_type}: High compatibility ({score:.1%}) - minimal changes required")
            
            if missing:
                recommendations.append(f"🔧 {report_type}: Add missing columns: {', '.join(missing)}")
        
        return recommendations
    
    def generate_processing_issues(self) -> List[str]:
        """Generate list of potential processing issues"""
        issues = []
        
        for report_type, analysis in self.analysis_results.items():
            compatibility = analysis.get("compatibility", {})
            data_analysis = analysis.get("data_analysis", {})
            
            if "error" in compatibility:
                issues.append(f"❌ {report_type}: File structure error - {compatibility['error']}")
                continue
            
            missing = compatibility.get("missing_in_tpp_901", [])
            if missing:
                issues.append(f"🚫 {report_type}: Processing will fail due to missing required columns: {', '.join(missing)}")
            
            # Check for data format issues
            format_issues = data_analysis.get("data_format_issues", [])
            for issue in format_issues:
                issues.append(f"⚠️ {report_type}: {issue['issue']} in column '{issue['column']}' (sample: {issue['sample_value']})")
        
        return issues
    
    def save_detailed_report(self) -> str:
        """Save detailed analysis report to JSON file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"tpp_901_compatibility_analysis_{timestamp}.json"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "tpp_code": "901",
            "tpp_name": "Tadawul TPP",
            "analysis_results": self.analysis_results,
            "recommendations": self.generate_recommendations(),
            "processing_issues": self.generate_processing_issues(),
            "overall_compatibility": self._calculate_overall_compatibility()
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        return filename
    
    def _calculate_overall_compatibility(self) -> float:
        """Calculate overall compatibility score"""
        scores = []
        for analysis in self.analysis_results.values():
            compatibility = analysis.get("compatibility", {})
            if "error" not in compatibility:
                scores.append(compatibility.get("compatibility_score", 0))
        
        return sum(scores) / len(scores) if scores else 0
    
    def run_full_analysis(self):
        """Run complete compatibility analysis"""
        print("🔍 TPP 901 Compatibility Analysis")
        print("=" * 50)
        
        # Analyze all report types
        self.analyze_ecommerce_reports()
        self.analyze_pos_terminal_reports()
        self.analyze_pos_transaction_reports()
        
        # Generate summary
        print("📊 OVERALL ANALYSIS SUMMARY")
        print("-" * 30)
        
        overall_score = self._calculate_overall_compatibility()
        print(f"🎯 Overall Compatibility: {overall_score:.1%}")
        
        print("\n💡 RECOMMENDATIONS:")
        recommendations = self.generate_recommendations()
        for rec in recommendations:
            print(f"   {rec}")
        
        print("\n⚠️ POTENTIAL PROCESSING ISSUES:")
        issues = self.generate_processing_issues()
        if issues:
            for issue in issues:
                print(f"   {issue}")
        else:
            print("   ✅ No critical processing issues detected")
        
        # Save detailed report
        report_file = self.save_detailed_report()
        print(f"\n📄 Detailed report saved to: {report_file}")
        
        return self.analysis_results

def main():
    analyzer = TPP901CompatibilityAnalyzer()
    analyzer.run_full_analysis()

if __name__ == "__main__":
    main()
