# Project UI/UX, Design System & Development Guidelines

Whenever you are building, creating, or modifying ANY feature in this application (both User portal and Admin panel), you **MUST STRICTLY** adhere to the following permanent rules without exception:

---

### 1. 🛑 STRICT LIGHT THEME MANDATE (NO DARK THEMES)
- **Always use Pure Light Themes** across the entire application (Admin Panel, User Pages, Dashboards, Modals, Forms, and Tables).
- **FORBIDDEN:** Do NOT use dark themes, dark cards (`bg-slate-900`, `bg-black`, `bg-gray-900`), black backdrops, or dark navigation bars.
- **Allowed Colors:** Use crisp white cards (`bg-white`), subtle off-white backgrounds (`bg-slate-50`, `bg-[#F1F5F9]`), soft light borders (`border-slate-200/80`, `border-slate-100`), and light neutral accent badges (`bg-indigo-50`, `bg-emerald-50`, `bg-amber-50`).

---

### 2. 🛑 LIGHTWEIGHT TYPOGRAPHY & FONT RULES (NO HEAVY/BOLD/OVERSIZED FONTS)
- **Font Weights:** Keep font weights light and clean.
  - Standard body text, labels, and descriptions: use `font-normal` or `font-medium` (e.g. `font-normal text-slate-500`, `font-medium text-slate-700`).
  - Section titles, headers, and primary metric numbers: use `font-medium` or `font-semibold` at most.
  - **STRICTLY FORBIDDEN:** Do NOT use `font-black`, `font-extrabold`, or heavy `font-bold` across text, buttons, and badges. Fonts must look refined, crisp, and clean—never heavy or thick.
- **Font Sizes:**
  - Standard text / sub-details: `text-[9px]`, `text-[10px]`, or `text-[11px]`.
  - Body & compact buttons: `text-xs` (12px).
  - Main titles / primary values: `text-sm` (14px) or maximum `text-base` (16px).
  - **STRICTLY FORBIDDEN:** Do NOT use oversized fonts (`text-2xl`, `text-3xl`, `text-4xl`, etc.) in standard dashboard cards, tables, or navigation components.

---

### 3. 📱 ULTRA-COMPACT, HIGH-DENSITY "SMALL SIZE" UI
- **Zero Wasted Space:** The UI must always be ultra-compact, high-density, and structured to fit screens without unnecessary vertical scrolling.
- **Dense Spacing:** Use tight container paddings (`p-2`, `p-2.5`, `px-3 py-1.5`), small icon sizes (`w-3 h-3`, `w-3.5 h-3.5`), and narrow table cell heights (`py-1.5`, `py-2`).
- **Compact Form Controls:** Inputs, select boxes, filter pills, and buttons must be compact and space-efficient (`px-2 py-1`, `text-[11px]`, `h-8`).

---

### 4. 🎰 CASINO GAME DESIGN (AVIATOR, SUPER ACE, FORTUNE GEMS, MINES)
- All games must maintain a 100% authentic, realistic casino game layout (mirroring Spribe Aviator, JILI, Pragmatic Play).
- Game controls must be ultra-dense and mobile-optimized so that bets and actions fit cleanly without requiring viewport scrolling.
- Ensure instant balance deduction upon bet placement and correct refund handling on cancellations.
