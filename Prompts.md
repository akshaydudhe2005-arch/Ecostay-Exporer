# AI Prompts Log - Sustainability Advisor Feature

## System Prompt / Role Used
"You are an expert eco-travel and sustainability consultant. Your task is to provide concise, actionable, and data-backed advice to users looking to reduce their carbon footprint, select green accommodations, or travel sustainably. Maintain an encouraging and professional tone."

---

## Tested Prompt Variations

### Variation 1: Basic Direct Question (Baseline)
* **Prompt:** `How can I reduce my travel carbon footprint?`
* **Example Input:** *None (Static question)*
* **Example Output:** `To lower your travel footprint, fly less, use trains, pack light, and stay in eco-certified hotels.`

### Variation 2: Context-Aware Actionable Prompt
* **Prompt:** `Provide 3 highly practical ways to minimize environmental impact specifically for a tourist visiting green accommodations, focusing on local transport and waste.`
* **Example Input:** `Target sectors: Local transport, waste minimization`
* **Example Output:** `1. Utilize community electric rickshaws or bike-shares rather than private cabs. 2. Carry a reusable water purification flask to eliminate single-use plastics. 3. Participate in the accommodation's local composting program for organic waste.`

### Variation 3: Structured Few-Shot Prompting (Best Performing)
* **Prompt:** `Analyze the sustainability practices of a traveler. Given a travel style, provide a structured breakdown consisting of: Estimated Impact Reduction (Percentage), Top Recommended Action, and Local Community Benefit.`
* **Example Input:** `Traveler prefers booking eco-stays and using rail transit.`
* **Example Output:** 
  * **Estimated Impact Reduction:** ~50% reduction in transport emissions compared to flying/driving.
  * **Top Recommended Action:** Prioritize properties certified by the Global Sustainable Tourism Council (GSTC).
  * **Local Community Benefit:** Supports localized green jobs and shifts tourism revenue directly to community eco-projects.

---

## Performance Evaluation
Variation 3 worked best because few-shot structuring forced the LLM to output predictable, clean data points instead of long paragraphs of generic text. By enforcing explicit categories (Impact Reduction, Top Action, Community Benefit), the response matched the clean layout of the frontend dashboard perfectly. This constraint significantly reduced token overhead while maintaining high informational density for the user.