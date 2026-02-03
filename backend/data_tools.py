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
from pydantic import Field


# Mock data store (in production, this would connect to actual data sources)
# This mirrors the frontend mockAdsData.js structure

def generate_daily_data(start_date: str, end_date: str, base_metrics: dict) -> list:
    """Generate daily performance data with variance."""
    import random
    data = []
    current = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    while current <= end:
        variance = 0.7 + random.random() * 0.6
        data.append({
            "date": current.strftime("%Y-%m-%d"),
            "clicks": int(base_metrics["clicks"] * variance),
            "impressions": int(base_metrics["impressions"] * variance),
            "cost": int(base_metrics["cost"] * variance),
            "conversions": int(base_metrics["conversions"] * variance),
            "revenue": int(base_metrics["revenue"] * variance),
        })
        current += timedelta(days=1)
    
    return data


MOCK_CAMPAIGNS = [
    {
        "id": "camp_001",
        "accountId": "acc_001",
        "name": "Forex Exness - General",
        "program": "Exness",
        "keywords": ["forex vietnam", "forex trading", "exness review"],
        "baseMetrics": {"clicks": 450, "impressions": 12000, "cost": 1350000, "conversions": 15, "revenue": 4200000}
    },
    {
        "id": "camp_002",
        "accountId": "acc_001",
        "name": "Crypto Binance - Brand",
        "program": "Binance",
        "keywords": ["binance vietnam", "crypto exchange", "mua bitcoin"],
        "baseMetrics": {"clicks": 320, "impressions": 9500, "cost": 960000, "conversions": 12, "revenue": 3600000}
    },
    {
        "id": "camp_003",
        "accountId": "acc_002",
        "name": "Beauty Sephora - High Intent",
        "program": "Sephora",
        "keywords": ["sephora vietnam", "mỹ phẩm chính hãng", "beauty products"],
        "baseMetrics": {"clicks": 280, "impressions": 7200, "cost": 1120000, "conversions": 18, "revenue": 2880000}
    },
    {
        "id": "camp_004",
        "accountId": "acc_002",
        "name": "Gaming Razer - Accessories",
        "program": "Razer",
        "keywords": ["razer vietnam", "gaming gear", "chuột gaming"],
        "baseMetrics": {"clicks": 180, "impressions": 5500, "cost": 720000, "conversions": 8, "revenue": 1600000}
    },
    {
        "id": "camp_005",
        "accountId": "acc_003",
        "name": "Forex XM Trading - Broad",
        "program": "XM",
        "keywords": ["xm trading", "forex broker vietnam", "trade forex"],
        "baseMetrics": {"clicks": 220, "impressions": 6800, "cost": 880000, "conversions": 10, "revenue": 3200000}
    },
]

MOCK_ACCOUNTS = [
    {"id": "acc_001", "name": "Tài khoản Chính", "platform": "Google Ads", "status": "active"},
    {"id": "acc_002", "name": "Tài khoản Phụ", "platform": "Google Ads", "status": "active"},
    {"id": "acc_003", "name": "Tài khoản Test", "platform": "Google Ads", "status": "paused"},
]


def parse_date_range(query: str) -> tuple[str, str]:
    """Parse natural language date ranges into start/end dates."""
    today = datetime.now()
    
    query_lower = query.lower()
    
    # Vietnamese month names
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
    
    # Common patterns
    if "last 30" in query_lower or "30 ngày" in query_lower:
        start = today - timedelta(days=30)
        return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")
    
    if "last 7" in query_lower or "7 ngày" in query_lower or "tuần" in query_lower:
        start = today - timedelta(days=7)
        return start.strftime("%Y-%m-%d"), today.strftime("%Y-%m-%d")
    
    if "last 90" in query_lower or "90 ngày" in query_lower or "quý" in query_lower:
        start = today - timedelta(days=90)
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
    - metrics: list of metrics to include (clicks, cost, revenue, conversions, impressions)
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
        group_by = params.get("group_by", "day")
        
        start_date, end_date = parse_date_range(date_range)
        
        # Filter campaigns
        campaigns = MOCK_CAMPAIGNS.copy()
        if account_ids:
            campaigns = [c for c in campaigns if c["accountId"] in account_ids]
        if campaign_ids:
            campaigns = [c for c in campaigns if c["id"] in campaign_ids]
        
        # Generate and aggregate data
        all_data = []
        for campaign in campaigns:
            daily_data = generate_daily_data(start_date, end_date, campaign["baseMetrics"])
            for day in daily_data:
                day["campaign"] = campaign["name"]
                day["program"] = campaign["program"]
                all_data.append(day)
        
        # Aggregate by date
        aggregated = {}
        for day in all_data:
            date_key = day["date"]
            if date_key not in aggregated:
                aggregated[date_key] = {
                    "date": date_key,
                    "clicks": 0,
                    "impressions": 0,
                    "cost": 0,
                    "conversions": 0,
                    "revenue": 0
                }
            aggregated[date_key]["clicks"] += day["clicks"]
            aggregated[date_key]["impressions"] += day["impressions"]
            aggregated[date_key]["cost"] += day["cost"]
            aggregated[date_key]["conversions"] += day["conversions"]
            aggregated[date_key]["revenue"] += day["revenue"]
        
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
        return json.dumps({
            "accounts": MOCK_ACCOUNTS,
            "totalAccounts": len(MOCK_ACCOUNTS),
            "activeAccounts": len([a for a in MOCK_ACCOUNTS if a["status"] == "active"])
        }, ensure_ascii=False)


class QueryCampaignListTool(BaseTool):
    """Tool for listing campaigns with their metadata."""
    
    name: str = "query_campaign_list"
    description: str = """List all campaigns with their metadata.
    Input can be a JSON with filters:
    - account_id: filter by account
    - program: filter by affiliate program name
    
    Returns campaign list with names, programs, and keywords."""
    
    def _run(self, query: str = "") -> str:
        try:
            params = json.loads(query) if query.strip().startswith("{") else {}
        except json.JSONDecodeError:
            params = {}
        
        campaigns = MOCK_CAMPAIGNS.copy()
        
        if params.get("account_id"):
            campaigns = [c for c in campaigns if c["accountId"] == params["account_id"]]
        if params.get("program"):
            campaigns = [c for c in campaigns if c["program"].lower() == params["program"].lower()]
        
        result = [{
            "id": c["id"],
            "name": c["name"],
            "program": c["program"],
            "keywords": c["keywords"],
            "accountId": c["accountId"]
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
