import os
import base64
from flask import Flask, request, jsonify, render_template_string
from google import genai
from google.genai import types

app = Flask(__name__)

# System instructions with detailed visual analysis and safety protocols
SYSTEM_INSTRUCTION = """You are an elite Personal Trainer, Kinesiologist, and deeply empathetic Fitness Coach. Your mission is to take a user's desired exercise or workout routine, analyze their current form or equipment if they provide an image, and completely personalize the exercise/routine based on their physical constraints, space/time limitations, mental energy levels, and a target intensity level (from 1 to 10).

Target Intensity Scale:
- 1-3: Low/Gentle. Extremely safe, highly rehabilitative, passive or low-load alternatives with very low risk.
- 4-7: Moderate. Balanced loading, moderate cardiovascular effort, stable and controlled form.
- 8-10: High/Peak Challenge. Advanced progressional pathways, higher mechanical loading, higher pacing, or challenging bodyweight variations that target elite fitness levels safely.

THE PERFORMANCE PROGRAMMER (When no specific limitations are provided):
- If the user asks for a workout routine or program directly (e.g., "30-day plan", "30-minute chest workout", "full body routine") without mentioning any physical limitations, injuries, or constraints, pivot to acting as an elite workout programmer.
- Create highly structured, balanced daily routines or multi-day plans that follow professional progressive overload principles, emphasizing rep ranges, sets, rest times, and progressive intensity triggers.
- Tone: Professional, authoritative, and results-oriented.

THE PERFORMANCE NUTRITIONIST:
- At the end of every response (whether a constraint-based modification or a pure workout routine), you must provide a dedicated section titled "🍎 Post-Workout Refuel" recommendation.
- Suggest a quick, accessible, and healthy snack, macronutrient-balanced snack, or small meal to aid recovery, explicitly keeping in mind the intensity of the workout (e.g. higher carbs for high-intensity, lighter protein rehydrations for gentle rehab sessions).

ADDITIONAL VISUAL ANALYSIS & SAFETY PROTOCOLS:
1. VISUAL FORM & EQUIPMENT ANALYSIS: If the user uploads/provides a photo of their equipment or current exercise form, you MUST analyze it at the very beginning of your response:
   - First, describe exactly what you see (e.g., 'I see a dumbbell press on an incline bench' or 'I see the lower back is hyperextended').
   - Compare the visual form against elite kinesiology standards.
   - Point to the specific joint or body part where the error occurs, providing an 'Annotation-style' description (e.g., 'Focus your attention on the knee joint—it is collapsing inward').
2. SAFETY LOCK:
   - If the user's form is dangerous, incorrect, or likely to cause immediate injury, you MUST prioritize a bold, urgent SAFETY WARNING at the very top of your response (before any other section, including the Coach's Encouragement or Muscle Identification).
   - Use clear, authoritative language to stop them before they continue the movement.
   - Example format: "⚠️ SAFETY ALERT: STOP IMMEDIATELY. Your spine is hyperextended, which risks injury. Reset your position."
3. SEVERE PAIN SAFELOCK:
   - If the user reports severe, sharp, or acute pain (e.g., sharp joint pain, back nerve pain, torn muscles), you MUST prioritize REST over any exercise. Advise them directly that no exercise modification can replace physical healing or medical attention right now, and order them to rest.

When a user interacts with you, process their request using these steps:
1. CHECK SEVERE PAIN FIRST: If acute or severe pain is reported, immediately prioritize rest and safety advice.
2. CHECK VISUAL SAFETY: If an image is provided and shows unsafe form, output the SAFETY WARNING block first.
3. CHECK EMOTION & ENERGY: If the user mentions they are feeling down, tired, unmotivated, sick, or discouraged, start your response with 1-2 sentences of genuine, warm, and highly energetic encouragement to lift their spirits before giving any fitness advice. (If the SAFETY WARNING is triggered, place this right below the safety alert).
4. DETERMINE MODE: 
   - If they have no limitations/constraints, use THE PERFORMANCE PROGRAMMER mode.
   - If they have physical/environmental limitations, modify the exercise/routine safely to target the same muscle groups.
5. RECOMMEND NUTRITION: Formulate the Post-Workout Refuel recommendations based on the intensity and target duration.

Format your final response into these clean, scannable sections:
- ⚠️ SAFETY ALERT / RECOVERY NOTICE (Include this section FIRST and ONLY if their visual form/equipment setup is dangerous, or if they report severe/acute pain where REST must be prioritized over exercise)
- 📝 Visual Form & Equipment Breakdown (Include this section ONLY if the user uploaded an image)
- ✨ Coach's Encouragement (Include this section ONLY if the user expresses low energy, negative emotions, or mental struggles)
- 🎯 Target Muscle Group & Intensity: Briefly name the primary muscles we are working (or the program's target if following Programmer Mode) and clarify how it maps to their target intensity (1-10).
- ⚡ Safe Modification / Routine: Daily breakdown or clear, step-by-step instructions on how to perform the alternative movement or full routine safely with sets, reps, and progressive parameters.
- 💡 Coach's Tip: A brief piece of expert advice on form, breathing, or pacing to ensure they stay safe.
- 🍎 Post-Workout Refuel: Dynamic healthy snack or recovery meal tailored to the intensity.

Tone: Deeply encouraging, professional, safety-first, and energetic. Always include a standard friendly disclaimer at the very end reminding them to listen to their body and consult a professional if they experience sharp pain."""

def get_genai_client():
    # Read Gemini API Key securely from GOOGLE_API_KEY or GEMINI_API_KEY env variables
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Google API key is missing. Please set GOOGLE_API_KEY env variable.")
    return genai.Client(api_key=api_key)

# Render HTML client interface directly
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form & Progression Lab</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        h1, h2, h3 {
            font-family: 'Space Grotesk', sans-serif;
        }
        code, pre {
            font-family: 'JetBrains Mono', monospace;
        }
        .markdown-body h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #38bdf8;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
        }
        .markdown-body p {
            margin-bottom: 1rem;
            line-height: 1.6;
            color: #cbd5e1;
        }
        .markdown-body ul {
            list-style-type: disc;
            padding-left: 1.5rem;
            margin-bottom: 1rem;
            color: #cbd5e1;
        }
        .markdown-body li {
            margin-bottom: 0.5rem;
        }
        .markdown-body blockquote {
            border-left: 4px solid #f43f5e;
            padding-left: 1rem;
            color: #fda4af;
            font-style: italic;
            margin: 1.5rem 0;
            background-color: rgba(244, 63, 94, 0.1);
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            border-radius: 0 0.375rem 0.375rem 0;
        }
    </style>
</head>
<body class="min-h-screen py-10 px-4">
    <div class="max-w-3xl mx-auto">
        <header class="text-center mb-10">
            <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-400 to-rose-400">
                🏋️‍♂️ Form & Progression Lab
            </h1>
            <p class="text-slate-400 mt-2 text-sm md:text-base">
                An elite Personal Trainer & Kinesiologist adjusting your workouts to fit your physical, environmental, and mental limitations.
            </p>
        </header>

        <main class="space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-5">
                <!-- Inputs Section -->
                <div>
                    <label for="exercise" class="block text-sm font-medium text-sky-400 mb-2">
                        What exercise or routine do you want to modify?
                    </label>
                    <input type="text" id="exercise" placeholder="e.g., Pull-ups, Front squats, Kettlebell swings, 5k run"
                           class="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition duration-150">
                </div>

                <div>
                    <label for="constraint" class="block text-sm font-medium text-teal-400 mb-2">
                        What is your specific physical limitation, environmental constraint, or mood today?
                    </label>
                    <textarea id="constraint" rows="3" placeholder="e.g., feeling low energy/discouraged, sharp shoulder impingement, no equipment (at home), bad wrist pain on flexion"
                              class="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition duration-150"></textarea>
                </div>

                <!-- Action Button -->
                <button id="submitBtn" onclick="submitModification()"
                        class="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 active:scale-[0.98] text-slate-950 font-bold py-3 px-6 rounded-xl shadow-lg shadow-sky-500/10 cursor-pointer transition duration-150 flex items-center justify-center space-x-2">
                    <span>Generate Modified Routine</span>
                    <svg id="loadingSpinner" class="hidden animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </button>
            </div>

            <!-- Output Container -->
            <div id="outputCard" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl hidden animate-fadeIn">
                <div class="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-5">
                    <span class="text-xl">📋</span>
                    <h2 class="text-lg font-semibold text-slate-200">Personalized Workout Prescription</h2>
                </div>
                
                <div id="resultContainer" class="markdown-body"></div>
            </div>

            <!-- Error Notification -->
            <div id="errorBox" class="bg-red-950/20 border border-red-900/50 rounded-xl p-4 text-rose-400 text-sm hidden"></div>
        </main>

        <footer class="mt-12 text-center text-xs text-slate-500 space-y-1">
            <p>Listen to your body. Rest when needed. If pain persists, seek medical supervision.</p>
            <p class="font-mono text-[10px] text-slate-600">Formulated dynamically via Gemini 3.5 Core</p>
        </footer>
    </div>

    <script>
        async function submitModification() {
            const exercise = document.getElementById('exercise').value.trim();
            const constraint = document.getElementById('constraint').value.trim();
            const submitBtn = document.getElementById('submitBtn');
            const spinner = document.getElementById('loadingSpinner');
            const outputCard = document.getElementById('outputCard');
            const resultContainer = document.getElementById('resultContainer');
            const errorBox = document.getElementById('errorBox');

            if (!exercise) {
                showError("Please enter an exercise or workout routine.");
                return;
            }

            // Reset UI states
            errorBox.classList.add('hidden');
            submitBtn.disabled = true;
            spinner.classList.remove('hidden');

            try {
                const response = await fetch('/api/modify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exercise, constraint })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to customize workout");
                }

                // Render dynamic Markdown output nicely
                resultContainer.innerHTML = marked.parse(data.result);
                outputCard.classList.remove('hidden');
                
                // Scroll to output smoothly
                outputCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (err) {
                showError(err.message);
            } finally {
                submitBtn.disabled = false;
                spinner.classList.add('hidden');
            }
        }

        function showError(msg) {
            const errorBox = document.getElementById('errorBox');
            errorBox.innerText = "⚠️ Error: " + msg;
            errorBox.classList.remove('hidden');
        }
    </script>
</body>
</html>
"""

# Route to serve the SPA
@app.route("/")
def index():
    return render_template_string(HTML_TEMPLATE)

# Route to process requests from the client
@app.route("/api/modify", methods=["POST"])
def modify():
    try:
        data = request.get_json() or {}
        exercise = data.get("exercise", "").strip()
        constraint = data.get("constraint", "").strip()
        intensity = data.get("intensity", 5)
        image = data.get("image", None)

        if not exercise:
            return jsonify({"error": "Please enter an exercise or routine to modify."}), 400

        client = get_genai_client()
        
        contents_payload = []
        
        if image and image.get("data") and image.get("mimeType"):
            img_data = image["data"]
            if ";base64," in img_data:
                img_data = img_data.split(";base64,")[1]
            try:
                decoded_bytes = base64.b64decode(img_data)
                contents_payload.append(
                    types.Part.from_bytes(
                        data=decoded_bytes,
                        mime_type=image["mimeType"]
                    )
                )
            except Exception as e:
                app.logger.error(f"Failed to decode image: {e}")

        prompt_text = f"Original Exercise/Workout Routine: {exercise}\nUser's Limitations/Constraints/Mood: {constraint or 'None specified.'}\nTarget Intensity Level: {intensity} out of 10"
        contents_payload.append(prompt_text)

        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=contents_payload,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.7
            )
        )

        return jsonify({
            "result": response.text or "Could not generate customized prescription."
        })

    except Exception as e:
        app.logger.error(f"Error modifying routine: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Standard Cloud Run port 8080 configuration
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)
