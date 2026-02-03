"""
crewAI Agent Definitions for AI Agent Feature

Defines specialized agents for:
- Intent routing
- Data querying and analysis
- Narrative generation
"""

import os
import json
import logging
from typing import Optional
from crewai import Agent, Task, Crew, Process
from crewai.tools import BaseTool
from data_tools import get_all_tools, QueryAdsCampaignsTool, CalculateMetricsTool
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure logging for debug visibility
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AI_AGENT")
logger.setLevel(logging.DEBUG)

# Create console handler with formatting
if not logger.handlers:
    ch = logging.StreamHandler()
    ch.setLevel(logging.DEBUG)
    formatter = logging.Formatter('[%(name)s] %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)


class GeminiLLM:
    """Simple wrapper to use Gemini as the LLM for crewAI agents."""
    
    def __init__(self, model_name: str = "gemini-3-flash-preview"):
        self.model = genai.GenerativeModel(model_name)
        self.model_name = model_name
    
    def __call__(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)
        return response.text


# Initialize Gemini LLM
gemini_llm = GeminiLLM()


def create_router_agent() -> Agent:
    """Create the Router Agent that classifies user intent."""
    return Agent(
        role="Intent Router",
        goal="Accurately classify user queries into intent categories and route to appropriate handlers",
        backstory="""You are an expert at understanding user intent in the context of 
        affiliate marketing and ads management. You analyze queries to determine if users 
        want data analysis, explanations, or follow-up on previous responses.""",
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )


def create_data_analyst_agent() -> Agent:
    """Create the Data Analyst Agent that queries and analyzes data."""
    return Agent(
        role="Data Analyst",
        goal="Query relevant data and provide insightful analysis of ads performance",
        backstory="""You are a skilled data analyst specializing in digital advertising metrics.
        You can query campaign data, calculate KPIs, identify trends, and spot anomalies.
        You always provide data in formats suitable for visualization.""",
        tools=get_all_tools(),
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )


def create_narrative_agent() -> Agent:
    """Create the Narrative Agent that generates empathetic, contextual responses."""
    return Agent(
        role="Narrative Writer",
        goal="Generate empathetic, contextual narratives that introduce data insights",
        backstory="""You are an expert communicator who transforms data insights into 
        compelling narratives. You write in Vietnamese, using a friendly yet professional tone.
        You always provide context before showing data and highlight key takeaways.""",
        verbose=True,
        allow_delegation=False,
        llm=gemini_llm
    )


def classify_intent(query: str, conversation_history: str = "") -> dict:
    """Classify user query intent using Gemini."""
    
    logger.info(f"🔍 CLASSIFYING INTENT for query: '{query}'")
    
    prompt = f"""Bạn là một bộ phân loại intent cho một ứng dụng quản lý quảng cáo affiliate.

Phân loại câu hỏi của người dùng vào MỘT trong các loại sau:

1. **data_analysis** - Người dùng muốn xem dữ liệu, biểu đồ, metrics về quảng cáo
   Ví dụ: "Chi phí tháng 11", "Hiển thị clicks tuần này", "ROAS của tôi thế nào?", "CPC", "Cost per click"
   
2. **data_query** - Người dùng muốn danh sách, bảng dữ liệu cụ thể về campaigns/accounts
   Ví dụ: "Liệt kê các chiến dịch", "Campaigns nào có CPC cao nhất?", "Tài khoản nào đang active?"

3. **comparison** - Người dùng muốn so sánh dữ liệu giữa các khoảng thời gian hoặc đối tượng
   Ví dụ: "So sánh tháng 10 và 11", "Campaign nào tốt hơn?", "Tuần này vs tuần trước"
   
4. **explanation** - Người dùng cần giải thích, hướng dẫn, hoặc hiểu một khái niệm
   Ví dụ: "CPC là gì?", "Tại sao chi phí tăng?", "Giải thích ROAS"

5. **followup** - Người dùng hỏi tiếp về response trước đó
   Ví dụ: "Chi tiết hơn", "Tại sao ngày 15 lại cao?", "Giải thích thêm"

6. **research** - Người dùng muốn TÌM KIẾM chương trình affiliate, niche, hoặc cơ hội kiếm tiền
   Ví dụ: "Crypto", "Forex", "Finance", "Gaming", "Tìm affiliate program", "Ngách nào tốt?"

Câu hỏi: "{query}"

Lịch sử hội thoại: {conversation_history if conversation_history else "Chưa có"}

Trả lời CHÍNH XÁC theo format JSON:
{{"intent": "<loại>", "entities": {{"time_range": "<khoảng thời gian nếu có>", "metrics": ["<metrics được nhắc đến>"], "campaigns": ["<campaigns nếu có>"], "niche": "<ngách/lĩnh vực nếu có>"}}}}
"""
    
    model = genai.GenerativeModel("gemini-3-flash-preview")
    response = model.generate_content(prompt)
    
    try:
        # Clean up response
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        result = json.loads(text)
        logger.info(f"✅ INTENT CLASSIFIED: {result.get('intent')} | Entities: {result.get('entities')}")
        return result
    except (json.JSONDecodeError, IndexError) as e:
        logger.warning(f"⚠️ Failed to parse intent response: {e}, defaulting to data_analysis")
        return {"intent": "data_analysis", "entities": {}}


async def execute_data_analysis_crew(query: str, entities: dict) -> dict:
    """Execute the data analysis crew for data visualization requests."""
    
    logger.info(f"📊 EXECUTING DATA ANALYSIS for: '{query}'")
    logger.debug(f"   Entities: {entities}")
    
    # Step 1: Query the data
    query_tool = QueryAdsCampaignsTool()
    calc_tool = CalculateMetricsTool()
    
    time_range = entities.get("time_range", "last 30 days")
    logger.info(f"📅 Time range: {time_range}")
    
    # Get campaign data
    data_result = query_tool._run(json.dumps({
        "date_range": time_range,
        "group_by": "day"
    }))
    data_parsed = json.loads(data_result)
    logger.debug(f"   Data points retrieved: {len(data_parsed['data'])}")
    
    # Calculate metrics
    metrics_result = calc_tool._run(json.dumps({
        "data": data_parsed["data"],
        "metrics": ["cpc", "roas", "ctr"]
    }))
    metrics_parsed = json.loads(metrics_result)
    
    # Step 2: Generate narrative
    narrative_prompt = f"""Bạn là một chuyên gia phân tích quảng cáo thân thiện.

Dựa trên dữ liệu sau, viết một đoạn giới thiệu ngắn gọn (2-3 câu) bằng tiếng Việt:

Thời gian: {time_range}
Tổng clicks: {data_parsed['summary']['totalClicks']:,}
Tổng chi phí: {data_parsed['summary']['totalCost']:,.0f} VND
Tổng doanh thu: {data_parsed['summary']['totalRevenue']:,.0f} VND
CPC trung bình: {metrics_parsed['metrics'].get('cpc', 0):,.0f} VND
ROAS: {metrics_parsed['metrics'].get('roas', 0):.2f}

Yêu cầu:
- Thân thiện nhưng chuyên nghiệp
- Highlight điểm quan trọng nhất
- Kết thúc bằng câu dẫn vào biểu đồ

Chỉ trả về đoạn văn, không có format markdown phức tạp."""

    model = genai.GenerativeModel("gemini-3-flash-preview")
    narrative_response = model.generate_content(narrative_prompt)
    narrative = narrative_response.text.strip()
    
    # Determine chart type and series based on query
    query_lower = query.lower()
    
    # Build dynamic series based on what user is asking about
    series = []
    chart_title = "Hiệu suất quảng cáo"
    chart_type = "area"  # Default
    
    # Check for specific metrics mentioned
    if "cpc" in query_lower or "cost per click" in query_lower:
        series.append({"dataKey": "cpc", "name": "CPC", "color": "#3b82f6"})
        chart_title = "Chi phí mỗi click (CPC)"
        chart_type = "line"
    if "roas" in query_lower:
        series.append({"dataKey": "roas", "name": "ROAS", "color": "#8b5cf6"})
        chart_title = "ROAS - Return on Ad Spend"
        chart_type = "line"
    if "ctr" in query_lower:
        series.append({"dataKey": "ctr", "name": "CTR %", "color": "#06b6d4"})
        chart_title = "Click-Through Rate (CTR)"
        chart_type = "line"
    if "click" in query_lower or "lượt" in query_lower:
        series.append({"dataKey": "clicks", "name": "Clicks", "color": "#3b82f6"})
        chart_title = "Lượt click"
        chart_type = "line"
    if "impression" in query_lower or "hiển thị" in query_lower:
        series.append({"dataKey": "impressions", "name": "Impressions", "color": "#8b5cf6"})
        chart_title = "Lượt hiển thị"
        chart_type = "area"
    if "chi phí" in query_lower or "cost" in query_lower:
        series.append({"dataKey": "cost", "name": "Chi phí", "color": "#ef4444"})
        if "chi phí" in query_lower:
            chart_title = "Chi phí quảng cáo"
    if "doanh thu" in query_lower or "revenue" in query_lower:
        series.append({"dataKey": "revenue", "name": "Doanh thu", "color": "#22c55e"})
        if "doanh thu" in query_lower:
            chart_title = "Doanh thu từ quảng cáo"
    if "conversion" in query_lower or "chuyển đổi" in query_lower:
        series.append({"dataKey": "conversions", "name": "Chuyển đổi", "color": "#f59e0b"})
        chart_title = "Lượt chuyển đổi"
        chart_type = "bar"
    
    # Default: show cost and revenue if nothing specific mentioned
    if not series:
        series = [
            {"dataKey": "cost", "name": "Chi phí", "color": "#ef4444"},
            {"dataKey": "revenue", "name": "Doanh thu", "color": "#22c55e"}
        ]
        chart_title = "Chi phí và Doanh thu"
    
    # Log the selected series
    series_names = [s["dataKey"] for s in series]
    logger.info(f"📈 CHART TYPE: {chart_type} | SERIES: {series_names} | TITLE: {chart_title}")
    
    return {
        "type": "composite",
        "content": {
            "sections": [
                {
                    "type": "narrative",
                    "content": narrative
                },
                {
                    "type": "chart",
                    "content": {
                        "chartType": chart_type,
                        "title": f"{chart_title} - {time_range}",
                        "data": data_parsed["data"],
                        "config": {
                            "xAxis": "date",
                            "series": series
                        }
                    }
                }
            ],
            "summary": metrics_parsed
        },
        "context": {
            "filters": {"timeRange": time_range},
            "followupSuggestions": [
                "So sánh với tháng trước",
                "Phân tích theo chiến dịch", 
                "Chi tiết hơn về dữ liệu này"
            ]
        }
    }



async def execute_explanation_crew(query: str, conversation_history: str = "") -> dict:
    """Execute explanation response for conceptual questions."""
    
    prompt = f"""Bạn là một chuyên gia affiliate marketing thân thiện.

Trả lời câu hỏi sau bằng tiếng Việt một cách dễ hiểu:

Câu hỏi: {query}

Ngữ cảnh trước đó: {conversation_history if conversation_history else "Chưa có"}

Yêu cầu:
- Giải thích rõ ràng, dễ hiểu
- Dùng ví dụ thực tế khi cần
- Format với markdown khi phù hợp
- Thân thiện nhưng chuyên nghiệp"""

    model = genai.GenerativeModel("gemini-3-flash-preview")
    response = model.generate_content(prompt)
    
    return {
        "type": "text",
        "content": response.text.strip()
    }


async def execute_data_query_crew(query: str, entities: dict) -> dict:
    """Execute data query for table/list requests."""
    
    from data_tools import QueryCampaignListTool, QueryAccountsTool
    
    # Determine what data to query
    query_lower = query.lower()
    
    if "campaign" in query_lower or "chiến dịch" in query_lower:
        tool = QueryCampaignListTool()
        result = tool._run("{}")
        data = json.loads(result)
        table_data = data["campaigns"]
        narrative = f"Đây là danh sách {len(table_data)} chiến dịch hiện có trong hệ thống của bạn:"
    elif "account" in query_lower or "tài khoản" in query_lower:
        tool = QueryAccountsTool()
        result = tool._run("")
        data = json.loads(result)
        table_data = data["accounts"]
        narrative = f"Bạn đang có {data['activeAccounts']} tài khoản đang hoạt động trong tổng số {data['totalAccounts']} tài khoản:"
    else:
        # Default to campaigns
        tool = QueryCampaignListTool()
        result = tool._run("{}")
        data = json.loads(result)
        table_data = data["campaigns"]
        narrative = f"Đây là dữ liệu bạn yêu cầu:"
    
    return {
        "type": "composite",
        "content": {
            "sections": [
                {
                    "type": "narrative",
                    "content": narrative
                },
                {
                    "type": "table",
                    "content": table_data
                }
            ]
        }
    }


async def execute_research_crew(query: str, entities: dict, conversation_history: str = "") -> dict:
    """Execute affiliate program research - returns table of program recommendations.
    
    This reuses the old research functionality to find affiliate programs in a niche.
    """
    
    niche = entities.get("niche", query)  # Use query as niche if not extracted
    
    # Research prompt template (same as old generator.py)
    prompt = f"""Research Niche: {niche}
Context from previous conversation (if any):
{conversation_history if conversation_history else ""}

Generate 5-10 high-quality affiliate programs (native or network) relevant to this niche in Vietnam (or global programs popular in Vietnam).
If the niche is vague (e.g. "more", "others"), use the Context to determine the actual topic.

For each program, provide:
- brand: Name of the brand.
- program_url: Direct link to affiliate page.
- commission_percent: Commission percentage as number (e.g., 10 for 10%, 15 for 15%). If CPA/flat rate, use 0.
- commission_type: Type of commission ("percentage", "cpa", "hybrid").
- can_use_brand: Boolean (true/false) - whether affiliates can use brand name in ads.
- traffic_3m: Estimated monthly visits or trend (e.g., "500k/tháng", "12M+").
- legitimacy_score: A confidence score (0-10) based on brand reputation.

Return ONLY the JSON array.
"""
    
    model = genai.GenerativeModel("gemini-3-flash-preview")
    response = model.generate_content(prompt)
    
    # Parse the response
    buffer = response.text.strip()
    
    # Post-process: Strip markdown wrappers if present
    if buffer.startswith('```'):
        lines = buffer.split('\n')
        if lines[0].startswith('```'):
            lines = lines[1:]
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        buffer = '\n'.join(lines).strip()
    
    try:
        parsed = json.loads(buffer)
        if isinstance(parsed, dict) and 'content' in parsed:
            table_data = parsed['content']
        elif isinstance(parsed, list):
            table_data = parsed
        else:
            table_data = []
    except json.JSONDecodeError:
        table_data = [{"error": "Không thể parse kết quả từ AI"}]
    
    # Generate a brief narrative introduction
    narrative = f"Đây là các chương trình affiliate trong lĩnh vực **{niche}** mà tôi tìm được cho bạn:"
    
    return {
        "type": "composite",
        "content": {
            "sections": [
                {
                    "type": "narrative",
                    "content": narrative
                },
                {
                    "type": "table",
                    "content": table_data
                }
            ]
        },
        "context": {
            "niche": niche,
            "followupSuggestions": [
                f"Thêm programs trong lĩnh vực {niche}",
                "So sánh commission rates",
                "Ngách liên quan khác"
            ]
        }
    }


async def run_agent_workflow(messages: list) -> dict:
    """Main entry point for the agent workflow.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Returns:
        Response dict with type and content
    """
    
    logger.info("=" * 60)
    logger.info("🤖 AI AGENT WORKFLOW STARTED")
    logger.info("=" * 60)
    
    # Get the latest user message
    user_messages = [m for m in messages if m.get('role') == 'user']
    if not user_messages:
        return {"type": "text", "content": "Không tìm thấy tin nhắn từ người dùng."}
    
    query = user_messages[-1].get('content', '')
    logger.info(f"📝 USER QUERY: '{query}'")
    logger.debug(f"   Total messages in context: {len(messages)}")
    
    # Build conversation history for context
    conversation_history = ""
    for msg in messages[:-1]:
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if isinstance(content, str):
            conversation_history += f"{role}: {content}\n"
        elif isinstance(content, dict):
            # Summarize previous response
            conversation_history += f"{role}: [Previous data/chart response]\n"
    
    # Step 1: Classify intent
    intent_result = classify_intent(query, conversation_history)
    intent = intent_result.get("intent", "data_analysis")
    entities = intent_result.get("entities", {})
    
    logger.info(f"🎯 ROUTING TO: {intent.upper()}")
    
    # Step 2: Route to appropriate crew
    if intent == "data_analysis" or intent == "comparison":
        return await execute_data_analysis_crew(query, entities)
    elif intent == "data_query":
        return await execute_data_query_crew(query, entities)
    elif intent == "explanation":
        return await execute_explanation_crew(query, conversation_history)
    elif intent == "research":
        return await execute_research_crew(query, entities, conversation_history)
    elif intent == "followup":
        # For followup, try to understand what type of followup
        if any(word in query.lower() for word in ["tại sao", "why", "giải thích", "explain"]):
            return await execute_explanation_crew(query, conversation_history)
        else:
            return await execute_data_analysis_crew(query, entities)
    
    # Default fallback
    return await execute_explanation_crew(query, conversation_history)

