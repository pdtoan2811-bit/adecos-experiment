import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key found: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")

if not api_key:
    print("Error: API Key is missing!")
    exit(1)

genai.configure(api_key=api_key)

print("\n--- Listing Available Models ---")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error listing models: {e}")

print("\n--- Testing Content Generation with 'gemini-3-flash-preview-exp' ---")
try:
    model = genai.GenerativeModel('gemini-3-flash-preview-exp')
    response = model.generate_content("Hello, can you hear me?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with gemini-3-flash-preview-exp: {e}")

print("\n--- Testing Content Generation with 'models/gemini-1.5-flash' ---")
try:
    model = genai.GenerativeModel('models/gemini-1.5-flash')
    response = model.generate_content("Hello, can you hear me?")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error with models/gemini-1.5-flash: {e}")
