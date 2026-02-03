import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable is not set")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-3-flash-preview")

CHAT_SYSTEM_INSTRUCTION = """You are an expert affiliate marketing consultant with deep knowledge of Vietnamese and global markets.
You provide accurate, data-driven recommendations.
Be concise but comprehensive in your answers."""

PROMPT_TEMPLATE = """
Research Niche: {niche}
Context from previous conversation (if any):
{context}

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


async def generate_research_stream(niche: str):
    """Generate affiliate program research for a niche."""
    """Generate affiliate program research for a niche."""
    prompt = PROMPT_TEMPLATE.format(niche=niche, context="")
    
    try:
        response = await model.generate_content_async(prompt, stream=True)
        buffer = ""
        async for chunk in response:
            if chunk.text:
                buffer += chunk.text
        
        # Post-process: Strip markdown wrappers if present
        cleaned_buffer = buffer.strip()
        if cleaned_buffer.startswith('```'):
            # Remove markdown code block
            lines = cleaned_buffer.split('\n')
            if lines[0].startswith('```'):
                lines = lines[1:]
            if lines and lines[-1].strip() == '```':
                lines = lines[:-1]
            cleaned_buffer = '\n'.join(lines).strip()
        
        # Check if AI returned the full structured response or just the array
        try:
            parsed = json.loads(cleaned_buffer)
            # If it's already structured with "type" and "content", extract content
            if isinstance(parsed, dict) and 'content' in parsed:
                content_array = parsed['content']
                yield f'{{"type": "table", "content": {json.dumps(content_array)}}}'
            # If it's just the array, wrap it
            elif isinstance(parsed, list):
                yield f'{{"type": "table", "content": {json.dumps(parsed)}}}'
            else:
                # Fallback: return as-is
                yield f'{{"type": "table", "content": {cleaned_buffer}}}'
        except json.JSONDecodeError:
            # If JSON is invalid, return error
            yield f'{{"type": "table", "content": [{{"error": "Invalid JSON from AI"}}]}}'
            
    except Exception as e:
        print(f"Error in research generation: {e}")
        yield f'{{"type": "table", "content": [{{"error": "Generation failed: {str(e)}"}}]}}'


async def generate_chat_stream(messages: list):
    """Generate streaming chat response based on conversation history.
    
    This is the LEGACY endpoint that routes to the old simple intent system.
    For the new AI Agent feature, use generate_agent_stream instead.
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Yields:
        JSON-formatted response chunks
    """
    # Get last user message
    user_messages = [m for m in messages if m.get('role') == 'user']
    if not user_messages:
        yield json.dumps({"type": "text", "content": "No user message found"})
        return
    
    user_query = user_messages[-1].get('content', '')
    
    # Build conversation history for context
    conversation_history = ""
    for msg in messages[:-1]:  # Exclude current message
        role = msg.get('role', 'user')
        content = msg.get('content', '')
        if isinstance(content, str):
            conversation_history += f"{role}: {content}\n"
    
    # Classify intent using simple AI
    intent = await classify_intent_ai(user_query, conversation_history)
    
    # Route based on intent
    if intent in ['research', 'followup']:
        try:
            prompt = PROMPT_TEMPLATE.format(niche=user_query, context=conversation_history)
            
            response = await model.generate_content_async(prompt, stream=True)
            buffer = ""
            async for chunk in response:
                if chunk.text:
                    buffer += chunk.text
            
            # Post-process: Strip markdown wrappers if present
            cleaned_buffer = buffer.strip()
            if cleaned_buffer.startswith('```'):
                # Remove markdown code block
                lines = cleaned_buffer.split('\n')
                if lines[0].startswith('```'):
                    lines = lines[1:]
                if lines and lines[-1].strip() == '```':
                    lines = lines[:-1]
                cleaned_buffer = '\n'.join(lines).strip()
            
            # Parse and return JSON
            try:
                parsed = json.loads(cleaned_buffer)
                # If it's already structured with "type" and "content", extract content
                if isinstance(parsed, dict) and 'content' in parsed:
                    content_array = parsed['content']
                    yield json.dumps({"type": "table", "content": content_array})
                # If it's just the array, wrap it
                elif isinstance(parsed, list):
                    yield json.dumps({"type": "table", "content": parsed})
                else:
                    # Fallback: return as-is
                    yield json.dumps({"type": "table", "content": cleaned_buffer})
            except json.JSONDecodeError:
                # If JSON is invalid, return error
                yield json.dumps({"type": "table", "content": [{"error": "Invalid JSON from AI"}]})
                
        except Exception as e:
            yield json.dumps({"type": "table", "content": [{"error": f"Generation failed: {str(e)}"}]})
    else:
        # Generate text response (explanation)
        prompt = f"""{CHAT_SYSTEM_INSTRUCTION}

Previous conversation:
{conversation_history}

Current user request: {user_query}

Provide a helpful explanation in Vietnamese.
"""
        
        try:
            response = await model.generate_content_async(prompt, stream=True)
            buffer = ""
            async for chunk in response:
                if chunk.text:
                    buffer += chunk.text
            
            # Send complete JSON response (same pattern as table)
            yield json.dumps({"type": "text", "content": buffer})
                
        except Exception as e:
            print(f"Error in chat generation: {e}")
            yield json.dumps({"type": "text", "content": f"Xin lỗi, có lỗi xảy ra: {str(e)}"})


async def classify_intent_ai(user_query: str, conversation_history: str = "") -> str:
    """AI-based intent classification using Gemini."""
    
    classifier_prompt = f"""You are an intent classifier for an affiliate marketing research assistant.

Analyze the user's query and classify their intent into ONE of these categories:

1. **research** - User wants to find affiliate programs, search for opportunities, or get program recommendations
   Examples: "Forex", "crypto programs", "beauty ecommerce", "find finance affiliates", "gaming niche"
   
2. **explanation** - User wants to understand, learn about, or get clarification on something
   Examples: "What is affiliate marketing?", "Why is this score high?", "How does this work?", "Explain row 1", "giải thích"
   
3. **followup** - User is asking about a previous response or wants more details on something already discussed
   Examples: "tell me more", "expand on that", "the first one", "details about that program"

User Query: "{user_query}"

Previous Context: {conversation_history if conversation_history else "None (first message)"}

Respond ONLY with ONE word: research, explanation, or followup
"""
    
    try:
        response = await model.generate_content_async(classifier_prompt)
        intent = response.text.strip().lower()
        
        # Validate and default to research if invalid
        if intent not in ['research', 'explanation', 'followup']:
            return 'research'
        
        return intent
    except Exception as e:
        # Default to research on error
        print(f"Intent classification error: {e}")
        return 'research'


async def generate_agent_stream(messages: list):
    """Generate AI Agent response using crewAI workflow.
    
    This is the NEW endpoint for the AI Agent feature with:
    - Multi-agent orchestration
    - Dynamic chart/table rendering
    - Narrative introductions
    - Conversation context
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Yields:
        JSON-formatted response with type (composite, chart, table, text)
    """
    try:
        from agents import run_agent_workflow
        
        # Run the agent workflow
        result = await run_agent_workflow(messages)
        
        # Yield the result as JSON
        yield json.dumps(result, ensure_ascii=False)
        
    except Exception as e:
        print(f"Error in agent workflow: {e}")
        import traceback
        traceback.print_exc()
        
        # Fallback to simple text response
        yield json.dumps({
            "type": "text",
            "content": f"Xin lỗi, có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại.\n\nChi tiết: {str(e)}"
        }, ensure_ascii=False)
