"""
Data Access Tools for crewAI Agents

Provides tools for querying application data sources:
- Ads campaigns and performance metrics
- Ad accounts
- Projects
"""

import json
from datetime import datetime, timedelta
from typing import Any, Optional
from crewai.tools import BaseTool
from mock_data_generator import get_db

# Initialize mock database
db = get_db()

import re

def parse_date_range(query: str) -> tuple[str, str]:
    """Parse natural language date ranges into start/end dates.
    
    Supports:
    - "last N days/ngay/ngày" (e.g., "last 5 days", "7 ngày qua")
    - Specific month names (Vietnamese)
    - "this week", "this month"
    """
    today = datetime.now()
    query_lower = query.lower()
    
    # 1. Regex for "last N days" / "N ngày"
    # Matches: "last 5 days", "5 days", "5 ngay", "5 ngày", "trong 5 ngày"
    match = re.search(r'(\d+)\s*(days?|ngay|ngày|ngảy)', query_lower)
    if match:
        days = int(match.group(1))
        start = today - timedelta(days=days)
        return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")

    # 2. Vietnamese month names
    vn_months = {
        "tháng 1": 1, "tháng 01": 1, "thang 1": 1,
        "tháng 2": 2, "tháng 02": 2, "thang 2": 2,
        "tháng 3": 3, "tháng 03": 3, "thang 3": 3,
        "tháng 4": 4, "tháng 04": 4, "thang 4": 4,
        "tháng 5": 5, "tháng 05": 5, "thang 5": 5,
        "tháng 6": 6, "tháng 06": 6, "thang 6": 6,
        "tháng 7": 7, "tháng 07": 7, "thang 7": 7,
        "tháng 8": 8, "tháng 08": 8, "thang 8": 8,
        "tháng 9": 9, "tháng 09": 9, "thang 9": 9,
        "tháng 10": 10, "thang 10": 10,
        "tháng 11": 11, "thang 11": 11,
        "tháng 12": 12, "thang 12": 12,
    }
    
    # Check for specific months
    for month_name, month_num in vn_months.items():
        if month_name in query_lower:
            year = today.year
            if month_num > today.month:
                year -= 1
            start = datetime(year, month_num, 1)
            if month_num == 12:
                end = datetime(year + 1, 1, 1) - timedelta(days=1)
            else:
                end = datetime(year, month_num + 1, 1) - timedelta(days=1)
            return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")
    
    # 3. Common patterns
    if "this week" in query_lower or "tuần này" in query_lower:
        start = today - timedelta(days=today.weekday())
        return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")
        
    if "this month" in query_lower or "tháng này" in query_lower:
        start = datetime(today.year, today.month, 1)
        return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")
    
    # Default: last 30 days
    start = today - timedelta(days=30)
    return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")


class QueryAdsCampaignsTool(BaseTool):
    """Tool for querying ads campaign data."""
    
    name: str = "query_ads_campaigns"
    description: str = """Query ads campaign performance data. 
    Input should be a JSON string with optional filters:
    - date_range: natural language like "tháng 11", "last 30 days"
    - account_ids: list of account IDs to filter
    - campaign_ids: list of campaign IDs to filter
    - program: affiliate program name (e.g. "Shopee", "Binance")
    - keywords: list of keywords to filter campaigns by (partial match)
    - group_by: "day", "week", or "month"
    
    Returns aggregated performance data suitable for charts."""
    
    def _run(self, query: str) -> str:
        try:
            params = json.loads(query) if query.strip().startswith("{") else {"date_range": query}
        except json.JSONDecodeError:
            params = {"date_range": query}
        
        date_range = params.get("date_range", "last 30 days")
        account_ids = params.get("account_ids", [])
        campaign_ids = params.get("campaign_ids", [])
        program_filter = params.get("program")
        keyword_filters = params.get("keywords", [])
        group_by = params.get("group_by", "day")
        
        start_date, end_date = parse_date_range(date_range)
        
        # Get all campaigns first to filter
        filtered_campaigns = db.campaigns
        
        if account_ids:
            filtered_campaigns = [c for c in filtered_campaigns if c["accountId"] in account_ids]
        
        if campaign_ids:
            filtered_campaigns = [c for c in filtered_campaigns if c["id"] in campaign_ids]
            
        if program_filter:
            filtered_campaigns = [c for c in filtered_campaigns if program_filter.lower() in c["program"].lower()]
            
        if keyword_filters:
            # Campaign matches if ANY of its keywords match ANY of the filter keywords
            filtered_campaigns = [
                c for c in filtered_campaigns 
                if any(
                    k_filter.lower() in k_camp.lower() 
                    for k_camp in c["keywords"] 
                    for k_filter in keyword_filters
                ) or any(k_filter.lower() in c["name"].lower() for k_filter in keyword_filters)
            ]
            
        filtered_camp_ids = set(c["id"] for c in filtered_campaigns)
        
        # Filter daily data
        relevant_data = [
            d for d in db.daily_data 
            if d["campaignId"] in filtered_camp_ids 
            and start_date <= d["date"] <= end_date
        ]
        
        # Aggregate by date
        aggregated = {}
        for record in relevant_data:
            date_key = record["date"]
            if date_key not in aggregated:
                aggregated[date_key] = {
                    "date": date_key,
                    "clicks": 0,
                    "impressions": 0,
                    "cost": 0,
                    "conversions": 0,
                    "revenue": 0
                }
            aggregated[date_key]["clicks"] += record["clicks"]
            aggregated[date_key]["impressions"] += record["impressions"]
            aggregated[date_key]["cost"] += record["cost"]
            aggregated[date_key]["conversions"] += record["conversions"]
            aggregated[date_key]["revenue"] += record["revenue"]
        
        # Add calculated metrics to each day
        for date_key, day in aggregated.items():
            clicks = day["clicks"]
            impressions = day["impressions"]
            cost = day["cost"]
            revenue = day["revenue"]
            conversions = day["conversions"]
            
            # Calculate CPC, CTR, ROAS, CPA
            day["cpc"] = round(cost / clicks, 0) if clicks > 0 else 0
            day["ctr"] = round((clicks / impressions * 100), 2) if impressions > 0 else 0
            day["roas"] = round(revenue / cost, 2) if cost > 0 else 0
            day["cpa"] = round(cost / conversions, 0) if conversions > 0 else 0
        
        result = sorted(aggregated.values(), key=lambda x: x["date"])
        
        # Group by week/month if needed
        # Group by week/month/account/campaign if needed
        if group_by == "week":
            weekly = {}
            for day in result:
                dt = datetime.strptime(day["date"], "%Y-%m-%d")
                week_start = dt - timedelta(days=dt.weekday())
                week_key = week_start.strftime("%Y-%m-%d")
                if week_key not in weekly:
                    weekly[week_key] = {"date": week_key, "clicks": 0, "impressions": 0, "cost": 0, "conversions": 0, "revenue": 0}
                for metric in ["clicks", "impressions", "cost", "conversions", "revenue"]:
                    weekly[week_key][metric] += day[metric]
            # Calculate metrics for weekly
            for week in weekly.values():
                week["cpc"] = round(week["cost"] / week["clicks"], 0) if week["clicks"] > 0 else 0
                week["ctr"] = round((week["clicks"] / week["impressions"] * 100), 2) if week["impressions"] > 0 else 0
                week["roas"] = round(week["revenue"] / week["cost"], 2) if week["cost"] > 0 else 0
                week["cpa"] = round(week["cost"] / week["conversions"], 0) if week["conversions"] > 0 else 0
            result = sorted(weekly.values(), key=lambda x: x["date"])
        elif group_by == "month":
            monthly = {}
            for day in result:
                month_key = day["date"][:7] + "-01"
                if month_key not in monthly:
                    monthly[month_key] = {"date": month_key, "clicks": 0, "impressions": 0, "cost": 0, "conversions": 0, "revenue": 0}
                for metric in ["clicks", "impressions", "cost", "conversions", "revenue"]:
                    monthly[month_key][metric] += day[metric]
            # Calculate metrics for monthly
            for month in monthly.values():
                month["cpc"] = round(month["cost"] / month["clicks"], 0) if month["clicks"] > 0 else 0
                month["ctr"] = round((month["clicks"] / month["impressions"] * 100), 2) if month["impressions"] > 0 else 0
                month["roas"] = round(month["revenue"] / month["cost"], 2) if month["cost"] > 0 else 0
                month["cpa"] = round(month["cost"] / month["conversions"], 0) if month["conversions"] > 0 else 0
            result = sorted(monthly.values(), key=lambda x: x["date"])
        elif group_by == "account":
            # Re-aggregate original data by account
            by_account = {}
            # We need to map campaign IDs back to account names
            camp_to_acc = {c["id"]: next((a["name"] for a in db.accounts if a["id"] == c["accountId"]), "Unknown") for c in db.campaigns}
            
            for record in relevant_data:
                acc_name = camp_to_acc.get(record["campaignId"], "Unknown")
                if acc_name not in by_account:
                    by_account[acc_name] = {"date": acc_name, "clicks": 0, "impressions": 0, "cost": 0, "conversions": 0, "revenue": 0}
                for metric in ["clicks", "impressions", "cost", "conversions", "revenue"]:
                    by_account[acc_name][metric] += record[metric]
            
            for acc in by_account.values():
                acc["cpc"] = round(acc["cost"] / acc["clicks"], 0) if acc["clicks"] > 0 else 0
                acc["ctr"] = round((acc["clicks"] / acc["impressions"] * 100), 2) if acc["impressions"] > 0 else 0
                acc["roas"] = round(acc["revenue"] / acc["cost"], 2) if acc["cost"] > 0 else 0
                acc["cpa"] = round(acc["cost"] / acc["conversions"], 0) if acc["conversions"] > 0 else 0
            result = list(by_account.values())

        elif group_by == "campaign":
             # Re-aggregate original data by campaign
            by_campaign = {}
            camp_map = {c["id"]: c["name"] for c in db.campaigns}
            
            for record in relevant_data:
                camp_name = camp_map.get(record["campaignId"], "Unknown")
                if camp_name not in by_campaign:
                    by_campaign[camp_name] = {"date": camp_name, "clicks": 0, "impressions": 0, "cost": 0, "conversions": 0, "revenue": 0}
                for metric in ["clicks", "impressions", "cost", "conversions", "revenue"]:
                    by_campaign[camp_name][metric] += record[metric]
            
            for camp in by_campaign.values():
                camp["cpc"] = round(camp["cost"] / camp["clicks"], 0) if camp["clicks"] > 0 else 0
                camp["ctr"] = round((camp["clicks"] / camp["impressions"] * 100), 2) if camp["impressions"] > 0 else 0
                camp["roas"] = round(camp["revenue"] / camp["cost"], 2) if camp["cost"] > 0 else 0
                camp["cpa"] = round(camp["cost"] / camp["conversions"], 0) if camp["conversions"] > 0 else 0
            
            # Sort by spend (cost) desc to show top campaigns
            result = sorted(by_campaign.values(), key=lambda x: x["cost"], reverse=True)[:10]

        
        # Helper to get entity name
        def get_entity_name(camp_id, breakdown_type):
            if breakdown_type == "account":
                return camp_to_acc.get(camp_id, "Unknown")
            elif breakdown_type == "campaign":
                return camp_map.get(camp_id, "Unknown")
            return "Unknown"

        # Handle Breakdown (Granular Data for Multi-line Charts)
        breakdown_by = params.get("breakdown")
        if breakdown_by in ["account", "campaign"]:
            # Need granular data: Date + Entity + Metrics
            camp_map = {c["id"]: c["name"] for c in db.campaigns}
            camp_to_acc = {c["id"]: next((a["name"] for a in db.accounts if a["id"] == c["accountId"]), "Unknown") for c in db.campaigns}
            
            granular_data = {} # Key: date_entity
            
            for record in relevant_data:
                date_key = record["date"]
                entity_name = get_entity_name(record["campaignId"], breakdown_by)
                key = f"{date_key}_{entity_name}"
                
                if key not in granular_data:
                    granular_data[key] = {
                        "date": date_key,
                        "entity": entity_name,
                        "clicks": 0, "impressions": 0, "cost": 0, "conversions": 0, "revenue": 0
                    }
                
                for metric in ["clicks", "impressions", "cost", "conversions", "revenue"]:
                    granular_data[key][metric] += record[metric]
            
            # Convert to list and calculate derived metrics
            result = []
            for item in granular_data.values():
                item["cpc"] = round(item["cost"] / item["clicks"], 0) if item["clicks"] > 0 else 0
                item["ctr"] = round((item["clicks"] / item["impressions"] * 100), 2) if item["impressions"] > 0 else 0
                item["roas"] = round(item["revenue"] / item["cost"], 2) if item["cost"] > 0 else 0
                item["cpa"] = round(item["cost"] / item["conversions"], 0) if item["conversions"] > 0 else 0
                result.append(item)
            
            result.sort(key=lambda x: x["date"])
            
            # Return granular data directly
            # Summary calculation remains the same
            total_clicks = sum(d["clicks"] for d in result)
            total_cost = sum(d["cost"] for d in result)
            total_revenue = sum(d["revenue"] for d in result)
            total_conversions = sum(d["conversions"] for d in result)
            total_impressions = sum(d["impressions"] for d in result)
            
            return json.dumps({
                "data": result,
                "dateRange": {"start": start_date, "end": end_date},
                "totalRecords": len(result),
                "is_granular": True,
                "breakdown": breakdown_by,
                "summary": {
                    "totalClicks": total_clicks,
                    "totalCost": total_cost,
                    "totalRevenue": total_revenue,
                    "totalConversions": total_conversions,
                    "totalImpressions": total_impressions,
                    "avgCPC": round(total_cost / total_clicks, 0) if total_clicks > 0 else 0,
                    "avgCTR": round((total_clicks / total_impressions * 100), 2) if total_impressions > 0 else 0,
                    "avgROAS": round(total_revenue / total_cost, 2) if total_cost > 0 else 0,
                    "avgCPA": round(total_cost / total_conversions, 0) if total_conversions > 0 else 0
                }
            }, ensure_ascii=False)

        
        # Calculate summary
        total_clicks = sum(d["clicks"] for d in result)
        total_cost = sum(d["cost"] for d in result)
        total_revenue = sum(d["revenue"] for d in result)
        total_conversions = sum(d["conversions"] for d in result)
        total_impressions = sum(d["impressions"] for d in result)
        
        return json.dumps({
            "data": result,
            "dateRange": {"start": start_date, "end": end_date},
            "totalRecords": len(result),
            "summary": {
                "totalClicks": total_clicks,
                "totalCost": total_cost,
                "totalRevenue": total_revenue,
                "totalConversions": total_conversions,
                "totalImpressions": total_impressions,
                "avgCPC": round(total_cost / total_clicks, 0) if total_clicks > 0 else 0,
                "avgCTR": round((total_clicks / total_impressions * 100), 2) if total_impressions > 0 else 0,
                "avgROAS": round(total_revenue / total_cost, 2) if total_cost > 0 else 0,
                "avgCPA": round(total_cost / total_conversions, 0) if total_conversions > 0 else 0
            }
        }, ensure_ascii=False)


class QueryAccountsTool(BaseTool):
    """Tool for querying ad account information."""
    
    name: str = "query_accounts"
    description: str = """Query ad account information.
    Returns list of connected ad accounts with their status and platform."""
    
    def _run(self, query: str = "") -> str:
        accounts = db.accounts
        return json.dumps({
            "accounts": accounts,
            "totalAccounts": len(accounts),
            "activeAccounts": len([a for a in accounts if a["status"] == "active"])
        }, ensure_ascii=False)


class QueryCampaignListTool(BaseTool):
    """Tool for listing campaigns with their metadata."""
    
    name: str = "query_campaign_list"
    description: str = """List all campaigns with their metadata.
    Input can be a JSON with filters:
    - account_id: filter by account
    - program: filter by affiliate program name
    - keyword: filter by keyword (partial match)
    
    Returns campaign list with names, programs, and keywords."""
    
    def _run(self, query: str = "") -> str:
        try:
            params = json.loads(query) if query.strip().startswith("{") else {}
        except json.JSONDecodeError:
            params = {}
        
        campaigns = db.campaigns
        
        if params.get("account_id"):
            campaigns = [c for c in campaigns if c["accountId"] == params["account_id"]]
        if params.get("program"):
            campaigns = [c for c in campaigns if params["program"].lower() in c["program"].lower()]
        if params.get("keyword"):
            kw = params["keyword"].lower()
            campaigns = [c for c in campaigns if any(kw in k.lower() for k in c["keywords"]) or kw in c["name"].lower()]
        
        result = [{
            "id": c["id"],
            "name": c["name"],
            "program": c["program"],
            "keywords": c["keywords"],
            "accountId": c["accountId"],
            "status": c.get("status", "active")
        } for c in campaigns]
        
        return json.dumps({
            "campaigns": result,
            "totalCampaigns": len(result)
        }, ensure_ascii=False)


class CalculateMetricsTool(BaseTool):
    """Tool for calculating derived metrics from data."""
    
    name: str = "calculate_metrics"
    description: str = """Calculate derived metrics from campaign data.
    Input should be a JSON with:
    - data: array of data points with clicks, cost, revenue, conversions
    - metrics: list of metrics to calculate (cpc, ctr, roas, cpa, roi)
    
    Returns calculated metrics."""
    
    def _run(self, query: str) -> str:
        try:
            params = json.loads(query)
        except json.JSONDecodeError:
            return json.dumps({"error": "Invalid JSON input"})
        
        data = params.get("data", [])
        metrics_to_calc = params.get("metrics", ["cpc", "roas", "cpa"])
        
        total_clicks = sum(d.get("clicks", 0) for d in data)
        total_impressions = sum(d.get("impressions", 0) for d in data)
        total_cost = sum(d.get("cost", 0) for d in data)
        total_revenue = sum(d.get("revenue", 0) for d in data)
        total_conversions = sum(d.get("conversions", 0) for d in data)
        
        result = {}
        
        if "cpc" in metrics_to_calc:
            result["cpc"] = total_cost / total_clicks if total_clicks > 0 else 0
        if "ctr" in metrics_to_calc:
            result["ctr"] = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
        if "roas" in metrics_to_calc:
            result["roas"] = total_revenue / total_cost if total_cost > 0 else 0
        if "cpa" in metrics_to_calc:
            result["cpa"] = total_cost / total_conversions if total_conversions > 0 else 0
        if "roi" in metrics_to_calc:
            result["roi"] = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        return json.dumps({
            "metrics": result,
            "totals": {
                "clicks": total_clicks,
                "impressions": total_impressions,
                "cost": total_cost,
                "revenue": total_revenue,
                "conversions": total_conversions
            }
        }, ensure_ascii=False)


# Export all tools
def get_all_tools() -> list:
    """Return all available data tools."""
    return [
        QueryAdsCampaignsTool(),
        QueryAccountsTool(),
        QueryCampaignListTool(),
        CalculateMetricsTool(),
    ]
