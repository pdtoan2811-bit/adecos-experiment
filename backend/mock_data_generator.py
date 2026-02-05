import random
from datetime import datetime, timedelta
import json
import logging

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("MOCK_DATA")

# --- Constants & Lists ---

AD_PLATFORMS = ["Google Search", "Facebook Ads", "TikTok Ads", "YouTube Ads"]

PROGRAMS_AND_NICHES = {
    "Exness": {"niche": "Finance", "keywords": ["forex", "trading", "gold", "xauusd", "đầu tư", "sàn forex"]},
    "Binance": {"niche": "Crypto", "keywords": ["bitcoin", "crypto", "usdt", "mua coin", "sàn binance", "p2p"]},
    "Shopee": {"niche": "E-commerce", "keywords": ["mua sắm", "khuyến mãi", "shopee sale", "voucher", "freeship"]},
    "Lazada": {"niche": "E-commerce", "keywords": ["lazada", "tiki", "điện máy", "gia dụng", "deal hot"]},
    "Sephora": {"niche": "Beauty", "keywords": ["mỹ phẩm", "skincare", "son môi", "nước hoa", "makeup"]},
    "Razer": {"niche": "Gaming", "keywords": ["chuột gaming", "bàn phím cơ", "tai nghe", "laptop gaming"]},
    "Hostinger": {"niche": "Tech", "keywords": ["hosting", "cloud server", "domain", "wordpress", "vps"]},
    "Klook": {"niche": "Travel", "keywords": ["du lịch", "vé tham quan", "tour", "sim 4g", "thuê xe"]},
    "Uniqlo": {"niche": "Fashion", "keywords": ["quần áo", "áo thun", "thời trang nam", "thời trang nữ", "áo khoác"]},
    "Adidas": {"niche": "Fashion", "keywords": ["giày thể thao", "sneaker", "đồ tập gym", "áo bóng đá", "running"]},
}

CAMPAIGN_TYPES = ["Search", "Display", "Video", "Conversion"]

# --- Data Structures ---

class MockDatabase:
    def __init__(self):
        self.accounts = []
        self.campaigns = []
        self.daily_data = [] # List of dicts
        self.generated_at = None

    def generate_data(self, num_accounts=5, campaigns_per_account=8, days_history=90):
        """Generates a fresh set of mock data."""
        logger.info(f"Generating mock data: {num_accounts} accounts, ~{campaigns_per_account} camps/acc, {days_history} days")
        
        self.accounts = self._generate_accounts(num_accounts)
        self.campaigns = self._generate_campaigns(self.accounts, campaigns_per_account)
        self.daily_data = self._generate_daily_data(self.campaigns, days_history)
        self.generated_at = datetime.now()
        
        logger.info(f"Done. Generated {len(self.campaigns)} campaigns and {len(self.daily_data)} daily records.")

    def _generate_accounts(self, count):
        accounts = []
        for i in range(count):
            platform = random.choice(AD_PLATFORMS)
            accounts.append({
                "id": f"acc_{i+1:03d}",
                "name": f"{platform} Account - {i+1}",
                "platform": platform,
                "status": "active"
            })
        return accounts

    def _generate_campaigns(self, accounts, count_per_acc):
        campaigns = []
        camp_id_counter = 1
        
        for account in accounts:
            # Each account focuses on mix of programs
            num_camps = random.randint(count_per_acc - 2, count_per_acc + 3)
            
            for _ in range(num_camps):
                program_name = random.choice(list(PROGRAMS_AND_NICHES.keys()))
                program_info = PROGRAMS_AND_NICHES[program_name]
                
                # Pick 2-3 keywords
                camp_keywords = random.sample(program_info["keywords"], k=min(3, len(program_info["keywords"])))
                
                # Campaign name
                camp_type = random.choice(CAMPAIGN_TYPES)
                name = f"[{program_name}] {camp_type} - {' '.join(camp_keywords[:1])}"
                
                # Base metrics (used for daily generation)
                base_cpc = random.randint(2000, 15000) # VND
                base_ctr = random.uniform(1.5, 8.0) # %
                base_cr = random.uniform(0.5, 5.0) # Conversion Rate %
                avg_order_value = random.randint(200000, 5000000) # VND (revenue per conversion)
                
                # Adjust metrics based on niche
                if program_info["niche"] == "Finance":
                    base_cpc *= 2.5
                    base_cr *= 0.6
                    avg_order_value *= 3
                elif program_info["niche"] == "E-commerce":
                    base_cpc *= 0.6
                    base_cr *= 1.5
                    avg_order_value *= 0.5
                
                campaigns.append({
                    "id": f"camp_{camp_id_counter:04d}",
                    "accountId": account["id"],
                    "name": name,
                    "program": program_name,
                    "niche": program_info["niche"],
                    "keywords": camp_keywords,
                    "status": random.choice(["active", "active", "active", "paused"]),
                    "budget": random.randint(500000, 10000000),
                    "base_config": {
                        "base_cpc": base_cpc,
                        "base_ctr": base_ctr,
                        "base_cr": base_cr,
                        "avg_order_value": avg_order_value
                    }
                })
                camp_id_counter += 1
                
        return campaigns

    def _generate_daily_data(self, campaigns, days):
        all_data = []
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        for camp in campaigns:
            current = start_date
            # Campaign-specific random factors
            camp_volatility = random.uniform(0.8, 1.2)
            
            while current <= end_date:
                # Seasonality (simple)
                is_weekend = current.weekday() >= 5
                seasonality = 0.9 if is_weekend else 1.1
                
                # Random daily variance
                daily_variance = random.uniform(0.7, 1.3)
                
                # Calculate base impressions
                base_imps = random.randint(100, 5000)
                
                # Apply factors
                impressions = int(base_imps * seasonality * daily_variance * camp_volatility)
                
                # Calculate derived metrics
                ctr = camp["base_config"]["base_ctr"] * random.uniform(0.9, 1.1) / 100
                clicks = int(impressions * ctr)
                
                cpc = camp["base_config"]["base_cpc"] * random.uniform(0.9, 1.1)
                cost = int(clicks * cpc)
                
                cr = camp["base_config"]["base_cr"] * random.uniform(0.8, 1.2) / 100
                conversions = int(clicks * cr)
                
                aov = camp["base_config"]["avg_order_value"] * random.uniform(0.9, 1.1)
                revenue = int(conversions * aov)
                
                all_data.append({
                    "date": current.strftime("%Y-%m-%d"),
                    "campaignId": camp["id"],
                    "accountId": camp["accountId"],
                    "clicks": clicks,
                    "impressions": impressions,
                    "cost": cost,
                    "conversions": conversions,
                    "revenue": revenue
                })
                current += timedelta(days=1)
                
        return all_data

# Singleton instance
db = MockDatabase()
# Generate initial data immediately
db.generate_data()

def get_db():
    return db
