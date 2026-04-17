# Design System Specification: The Academic Atelier

## 1. Overview & Creative North Star
This design system moves away from the "cluttered classroom" aesthetic of traditional Learning Management Systems (LMS). Our Creative North Star is **"The Digital Curator."** 

Imagine a high-end university archives room or a modern architectural studio: it is quiet, intentional, and intellectually stimulating. We achieve this through "Atmospheric Minimalist" principles—using vast amounts of white space (breathing room), sophisticated tonal layering, and an editorial typographic approach. We break the rigid, boxed-in "template" look by favoring organic asymmetrical layouts and overlapping elements that suggest a fluid, continuous journey of learning rather than a series of disconnected tasks.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, authoritative blues and "Lab-Chassis" grays. However, the application is where we differentiate.

### The "No-Line" Rule
To maintain a premium, editorial feel, **1px solid borders for sectioning are strictly prohibited.** We define boundaries through background color shifts. For example, a main content area using `surface` should be distinguished from a sidebar using `surface-container-low`. The transition should be seamless, relying on the eye to perceive the change in depth rather than a "fence" drawn around content.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack of fine paper or frosted glass.
*   **Base Layer:** `background` (#f8f9fa)
*   **Secondary Context (Sidebars/Nav):** `surface-container-low` (#f3f4f5)
*   **Interactive Cards:** `surface-container-lowest` (#ffffff) to create a natural, soft "pop" against the background.
*   **Tertiary Overlays:** `surface-container-highest` (#e1e3e4) for tooltips or temporary states.

### The "Glass & Gradient" Rule
Standard flat colors feel static. To inject "soul," apply a subtle **Atmospheric Gradient** to primary surfaces (like Hero sections or deep-dive modules). Transition from `primary` (#004085) to `primary_container` (#1d57a7) at a 135-degree angle. For floating navigation or modal overlays, use **Glassmorphism**: 
*   **Fill:** `surface` at 80% opacity.
*   **Effect:** `backdrop-blur` (12px to 20px).
*   **Result:** The interface feels integrated and deeply layered.

---

## 3. Typography
We use a dual-font system to balance academic authority with modern readability.

*   **The Intellectual Voice (Display & Headlines):** We use **Manrope**. Its geometric but slightly condensed nature feels architectural and bespoke. Use `display-lg` for landing moments to create a "Museum Header" effect.
*   **The Functional Voice (Body & Titles):** We use **Inter**. It is the gold standard for legibility in dense academic material. 

**Hierarchy Strategy:** 
Maximize the contrast between `display-sm` (for module titles) and `label-md` (for metadata). By using extreme scale differences, we guide the student’s eye to the most important "Focus Point" first, reducing cognitive load during intensive study.

---

## 4. Elevation & Depth
In this system, elevation is a tool for focus, not just decoration.

*   **Tonal Layering:** Avoid shadows for static elements. Place a `surface-container-lowest` card on a `surface-container` background. The shift from #ffffff to #edeeef provides all the "lift" required.
*   **Ambient Shadows:** For active states or floating modules (like a vocabulary pop-up), use a "Whisper Shadow." 
    *   *Spec:* `0px 12px 32px rgba(25, 28, 29, 0.04)`. Note the 4% opacity; it should be felt, not seen.
*   **The "Ghost Border" Fallback:** If a layout requires a boundary for accessibility, use the `outline-variant` token (#c2c6d4) at **15% opacity**. This creates a "breath" of a line that suggests a container without locking the content in a cage.

---

## 5. Components

### Cards (The Learning Module)
Forbid dividers. Use `surface-container-lowest` for the card body. Distinguish the "Header" of the card from the "Body" using a vertical spacing shift of `1.5rem` rather than a line. Use `xl` (0.75rem) roundedness for a friendly, modern touch.

### Buttons
*   **Primary:** A gradient fill from `primary` to `primary_container`. No border. White text. `md` roundedness.
*   **Secondary:** `surface-container-high` background with `on_surface` text. This feels integrated into the "lab" environment.
*   **Tertiary (Ghost):** No background. Use `primary` text. Use for low-emphasis actions like "View Details."

### Input Fields
To maintain the "Modern Lab" feel, use **Underline-Only** inputs in focus modes, or "Soft Box" inputs using `surface-container-low` backgrounds. Avoid the "box-within-a-box" look. Labels should use `label-md` in `on_surface_variant` to stay humble and clear.

### Language-Specific Components
*   **The "Phonetic Chip":** Use `secondary_container` with `on_secondary_container` text. These should be `full` rounded (pill-shaped) to represent "floating bits of information."
*   **Focus-Mode Quiz Cards:** Increase the padding to `2.5rem`. When a student is in a quiz, the UI should recede. Use `surface_bright` to eliminate all visual noise.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. A wider left margin on a desktop view creates an editorial "magazine" feel that feels premium.
*   **Do** use "Success Green" (`on_tertiary_fixed_variant` equivalent for feedback) only for final results. Keep the learning environment neutral to maximize focus.
*   **Do** leverage the `manrope` font for numbers (scores/percentages) to give them a custom, designed look.

### Don't
*   **Don't** use black (#000000). Always use `on_surface` (#191c1d) for text to maintain a softer, more sophisticated contrast.
*   **Don't** use standard "Drop Shadows" from a UI kit. Use our Ambient Shadow spec to maintain the "frosted glass" aesthetic.
*   **Don't** use icons as the primary way to communicate. In an academic portal, clear `label-md` text is more "Trustworthy" than ambiguous iconography. Use icons only as supportive "Visual Anchors."