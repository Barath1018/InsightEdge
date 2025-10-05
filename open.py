from openai import OpenAI

client = OpenAI()

print("🥗 Meal Buddy: Hi! I can just LISTEN to your food struggles, or help PLAN meals.")
print("Would you like to TALK or PLAN?")
mode = "talk"

session_history = [
    {"role": "system", "content": 
     "You are Meal Buddy, a warm and empathetic AI who helps with mindful eating. "
     "If in TALK mode: listen, validate feelings, and ask caring questions about food/mood. "
     "Never give recipes until user asks. "
     "If in PLAN mode: give specific, simple, personalized meal ideas based on their situation, "
     "considering mood, budget, time, and pantry. Keep tone supportive and friendly, never judgmental."}
]

while True:
    user_input = input("You: ").strip()

    if user_input.lower() in ["bye", "quit", "exit"]:
        print("Meal Buddy: Thanks for chatting. Be kind to yourself 💚")
        break

    if "plan" in user_input.lower() or "switch" in user_input.lower():
        mode = "plan"
        print("Meal Buddy: Got it! Let’s plan some meals together.")
        continue

    session_history.append({"role": "user", "content": f"[Mode: {mode.upper()}] {user_input}"})

    response = client.chat.completions.create(
        model="gpt-4",
        messages=session_history
    )

    reply = response.choices[0].message.content
    print("Meal Buddy:", reply)
    session_history.append({"role": "assistant", "content": reply})
