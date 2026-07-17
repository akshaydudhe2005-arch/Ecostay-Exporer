# Prompts Log: EcoStay Advisor Integration

This log documents the testing, structure, and implementation of the generative AI prompts utilized in the EcoStay Explorer Sustainability Advisor system.

---

## Tested Prompt Variations

### Variation 1: Simple Baseline Prompt
* **System Role:** None.
* **Prompt Structure:**
  > "Give me some quick, easy tips to save energy and water when staying at a hotel or eco-lodge based on this inquiry: {user_input}."
* **Example Input:** "I am staying at a beach resort for 3 days."
* **Example Output:** 
  > "Reuse your towels to save water. Turn off the air conditioning when you leave the room. Keep showers under 5 minutes."

---

### Variation 2: Persona & Role-Based Prompt
* **System Role:** You are a professional environmental scientist and eco-travel consultant.
* **Prompt Structure:**
  > "As an expert eco-travel consultant, analyze the following travel query: {user_input}. Provide 3 highly professional, scientifically sound recommendations to reduce carbon footprint. Keep your tone encouraging and authoritative."
* **Example Input:** "I am staying at a beach resort for 3 days."
* **Example Output:**
  > "1. **Mitigate HVAC Load:** Adjust your coastal lodging's thermostat to 24°C to optimize compressor efficiency in humid environments.  
  > 2. **Local Ecological Protection:** Avoid single-use plastics to prevent maritime debris.  
  > 3. **Linen Conservation:** Actively decline daily housekeeping to conserve gallons of greywater."

---

### Variation 3: Structured Markdown Prompt with Constraints (Selected)
* **System Role:** You are the EcoStay Explorer Smart Assistant—a friendly, concise sustainability expert.
* **Prompt Structure:**
  > "You are the EcoStay Explorer Smart Assistant. Your job is to provide highly actionable, localized sustainability advice. Analyze this request: '{user_input}'.
  > 
  > Structure your output exactly as follows:
  > - **Primary Objective**: One punchy sentence.
  > - **Actionable Checklist**: 3 bullet points with bold headers.
  > - **Estimated Impact**: A brief calculation or projection of carbon saved.
  > 
  > Constraint: Do not exceed 120 words. Use emojis sparingly."
* **Example Input:** "I am staying at a beach resort for 3 days."
* **Example Output:**
  > "### Primary Objective  
  > Minimize coastal energy drain and plastic waste during your beachfront escape.
  > 
  > ### Actionable Checklist  
  > * **Thermostat Management**: Set your AC to 24°C when in-room; turn it off when stepping onto the beach.  
  > * **Refuse & Reuse**: Use your own reusable water bottle to bypass single-use plastic cups.  
  > * **Laundering Cycle**: Hang your towels to skip resource-heavy daily laundry runs.  
  > 
  > ### Estimated Impact  
  > Saves approximately 12kg of CO₂ and over 150 liters of water over your 3-day stay."

---

## Selected Prompt Evaluation
Variation 3 was selected as the optimal prompt configuration. It strictly controls formatting, ensuring that output layouts remain visually clean and highly readable within the dashboard's layout container. Furthermore, setting a strict 120-word constraint prevents the AI engine from generating excessively verbose text, keeping token consumption low and response times fast. Finally, the inclusion of a structured 'Estimated Impact' section matches the ecological tracking theme of the application perfectly.