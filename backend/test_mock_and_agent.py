import sys
import asyncio
import json
import os
from datetime import datetime

# Adjust path to include backend
sys.path.insert(0, os.path.join(os.getcwd(), 'backend'))

from mock_data_generator import get_db
from data_tools import QueryAdsCampaignsTool, QueryCampaignListTool

def test_mock_data():
    print("="*60)
    print("TEST: Mock Data Generator")
    print("="*60)
    
    db = get_db()
    print(f"Accounts: {len(db.accounts)}")
    print(f"Campaigns: {len(db.campaigns)}")
    print(f"Daily Records: {len(db.daily_data)}")
    
    # Verify programs
    programs = set(c['program'] for c in db.campaigns)
    print(f"Programs found: {programs}")
    
    # Verify keywords
    keywords = set()
    for c in db.campaigns:
        keywords.update(c['keywords'])
    print(f"Sample keywords: {list(keywords)[:5]}...")
    
    if len(db.campaigns) > 0 and len(db.daily_data) > 0:
        print("✅ Mock Data Generation looks good.")
    else:
        print("❌ Mock Data Generation failed.")

def test_tools():
    print("\n" + "="*60)
    print("TEST: Data Tools Filtering")
    try:
        # Test 1: Filter by Program
        print("\n--- Test 1: Filter by Program 'Shopee' ---")
        tool = QueryAdsCampaignsTool()
        query = json.dumps({"program": "Shopee", "group_by": "day"})
        result = tool._run(query)
        data = json.loads(result)
        
        print(f"Total Records: {data['totalRecords']}")
        print(f"Total Revenue: {data['summary']['totalRevenue']:,}")
        
        # Verify that we actually got data (unless Shopee wasn't generated randomly, but it should be)
        if data['totalRecords'] > 0:
            print("✅ Program filter returned data.")
        else:
            print("⚠️ Program filter returned no data (might be random chance if set is small).")

        # Test 2: Filter by Keyword
        print("\n--- Test 2: Filter by Keyword 'crypto' ---")
        query = json.dumps({"keywords": ["crypto"], "group_by": "day"})
        result = tool._run(query)
        data = json.loads(result)
        print(f"Total Records: {data['totalRecords']}")
        
        # Test 3: Campaign List by Keyword
        print("\n--- Test 3: List Campaigns with keyword 'forex' ---")
        list_tool = QueryCampaignListTool()
        query = json.dumps({"keyword": "forex"})
        result = list_tool._run(query)
        data = json.loads(result)
        print(f"Campaigns found: {len(data['campaigns'])}")
        for c in data['campaigns'][:3]:
            print(f"  - {c['name']} (Program: {c['program']})")
            
        # Test 4: Filter by Niche 'Fashion'
        print("\n--- Test 4: Filter by Program 'Uniqlo' (Fashion Niche) ---")
        tool = QueryAdsCampaignsTool()
        query = json.dumps({"program": "Uniqlo", "group_by": "day"})
        result = tool._run(query)
        data = json.loads(result)
        
        print(f"Total Records: {data['totalRecords']}")
        if data['totalRecords'] > 0:
            print("✅ Fashion niche (Uniqlo) returned data.")
        else:
             # Retrying with Adidas if Uniqlo wasn't generated
            query = json.dumps({"program": "Adidas", "group_by": "day"})
            result = tool._run(query)
            data = json.loads(result)
            if data['totalRecords'] > 0:
                print("✅ Fashion niche (Adidas) returned data.")
            else:
                print("⚠️ Fashion niche returned no data (check generator).")

        # Test 5: Dynamic Date Range "last 5 days"
        print("\n--- Test 5: Dynamic Date Range 'last 5 days' ---")
        query = json.dumps({"date_range": "last 5 days", "group_by": "day"})
        result = tool._run(query)
        data = json.loads(result)
        
        start_date = data["dateRange"]["start"]
        end_date = data["dateRange"]["end"]
        
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Total Days in Data: {len(data['data'])}")
        
        # We expect roughly 5 days of data (aggregated)
        # However, data['data'] is a list of aggregated days.
        if 4 <= len(data['data']) <= 6:
             print("✅ Date range 'last 5 days' works correctly.")
        else:
             print(f"⚠️ Date range look odd: {len(data['data'])} days returned.")

        # Test 6: Group by Account
        print("\n--- Test 6: Group by Account ---")
        query = json.dumps({"date_range": "last 30 days", "group_by": "account"})
        result = tool._run(query)
        data = json.loads(result)
        
        print(f"Records by Account: {len(data['data'])}")
        # Verify keys are account names
        if len(data['data']) > 0:
             print(f"Sample Account: {data['data'][0]['date']}") # date field holds name for group_by
             print("✅ Group by 'account' returned data.")
        else:
             print("⚠️ Group by 'account' returned no data.")

        # Test 7: Breakdown Analysis (Granular for Multi-line)
        print("\n--- Test 7: Breakdown Analysis (Granular) ---")
        query = json.dumps({"date_range": "last 7 days", "breakdown": "account"})
        result = tool._run(query)
        data = json.loads(result)
        
        print(f"Total Granular Records: {len(data['data'])}")
        print(f"Is Granular: {data.get('is_granular', False)}")
        
        if data.get('is_granular') and len(data['data']) > 0:
            sample = data['data'][0]
            if "entity" in sample and "date" in sample:
                 print(f"Sample: Date={sample['date']}, Entity={sample['entity']}, Cost={sample['cost']}")
                 print("✅ Breakdown returned granular data correctly.")
            else:
                 print("❌ Granular data missing 'entity' or 'date' fields.")
        else:
             print("❌ Breakdown failed to return granular data.")

        # Test 8: Regression Test - No Time Range (Should default to 30 days, not crash)
        print("\n--- Test 8: Regression Test (No Time Range) ---")
        # Simulate params where date_range might be missing or None
        query = json.dumps({"group_by": "day"}) 
        # Note: In agents.py we handle the default. Here we test if tool handles missing date_range gracefully if passed directly.
        # But real bug was passing None explicitly.
        # Let's test agents.py fix via simulation in agents.py context, but here we test tool robustness.
        # Tool defaults date_range to "last 30 days" if missing from params keys.
        result = tool._run(query)
        data = json.loads(result)
        print(f"Records returned (default 30 days): {len(data['data'])}")
        if len(data['data']) > 0:
            print("✅ Tool handled missing date_range gracefully.")
        else:
             print("⚠️ Tool returned no data for default date range.")

        print("✅ Tool tests completed.")

    except Exception as e:
        print(f"❌ Tool test failed: {e}")
        import traceback
        traceback.print_exc()

async def test_agent_intent():
    print("\n" + "="*60)
    print("TEST: Agent Intent Classification")
    try:
        from agents import classify_intent
        
        queries = [
            "Hiệu quả quảng cáo Shopee tháng này",
            "Thống kê từ khóa crypto",
            "Tìm các chiến dịch về forex",
            "Doanh thu tài khoản Google Ads"
        ]
        
        for q in queries:
            print(f"\nQuery: '{q}'")
            result = classify_intent(q)
            print(f"Intent: {result.get('intent')}")
            print(f"Entities: {result.get('entities')}")
            
    except Exception as e:
        print(f"❌ Agent test failed: {e}")

if __name__ == "__main__":
    test_mock_data()
    test_tools()
    asyncio.run(test_agent_intent())
