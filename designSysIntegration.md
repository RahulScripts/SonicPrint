\# SonicPrint — Design System Integration



\## 1. Design objective



Build the SonicPrint interface using two complementary resources:



1\. \*\*The supplied `DESIGN.md`\*\* defines the visual identity, aesthetic, design tokens, typography, spacing, surfaces, and layout principles.

2\. \*\*The installed shadcn/ui skill and official documentation\*\* guide component selection, implementation, composition, accessibility, and theming.



The goal is to combine the Spotify-inspired visual language from `DESIGN.md` with shadcn/ui's reusable components and data visualization capabilities.



\*\*The design reference determines how SonicPrint looks. shadcn/ui determines how suitable interface components are implemented.\*\*



Do not create a competing design system or blindly accept the default shadcn appearance.



\## 2. Mandatory first steps



Before implementing UI:



1\. Read the entire `DESIGN.md`.

2\. Inspect the project's current styling configuration, Tailwind setup, and any existing `components.json`.

3\. Inspect the installed shadcn skill and follow its instructions.

4\. Consult the official shadcn documentation for components and charts that the application actually needs.

5\. Map the existing design tokens to the application's semantic theme variables.

6\. Establish reusable styles before building the main interface.



Do not overwrite existing configuration files without inspecting them first.



\## 3. Visual identity



Preserve the core characteristics of the supplied design document.



\### Color and surfaces



Use the dark-first palette:



\- Base background: `#121212`.

\- Deep black: `#000000`.

\- Standard elevated surface: `#181818`.

\- Strong dark surface: `#141414`.

\- Card surface: `#1F1F1F`.

\- Elevated panels and tooltips: `#282828`.

\- Primary text: `#FFFFFF`.

\- Secondary text: `#B3B3B3`.

\- Tertiary text: `#A7A7A7`.

\- Primary accent: `#1ED760`.



Use subtle surface changes to establish hierarchy. Avoid excessive borders and shadows.



Spotify green should provide focused emphasis for primary actions, selected states, and meaningful data highlights. Do not color every element green.



Use additional chart colors only when they improve distinction and readability.



\### Typography



Follow the typography hierarchy defined in `DESIGN.md`.



\- Strong, prominent page headings.

\- Clear section and card titles.

\- Compact but readable metadata.

\- Consistent labels and captions.

\- Monospaced text for technical values where useful.



Use the specified font stacks only when the required font assets are legitimately available. Otherwise, choose appropriate fallbacks.



\### Shape and spacing



Preserve the supplied spacing scale, compact layout rhythm, small-to-medium radii, and deliberate use of pill-shaped controls.



Use the reference's visual language consistently across the application.



\## 4. shadcn/ui component strategy



Use shadcn/ui for appropriate reusable components, including:



\- Buttons and badges.

\- Inputs and search controls.

\- Select menus and filter controls.

\- Tabs and segmented navigation.

\- Tooltips and popovers.

\- Dialogs and dropdown menus.

\- Tables and sorting controls.

\- Date-range controls.

\- Skeletons, alerts, and empty states.



Customize their appearance using the project's semantic CSS variables and established design tokens.



Avoid mixing unrelated default themes or leaving components with inconsistent border radii, spacing, typography, or hover behavior.



Use the installed shadcn skill rather than guessing component APIs or copying outdated examples.



\## 5. Data visualization strategy



Use shadcn's chart components with Recharts where appropriate.



Select chart types based on the analytical purpose:



\- Line and area charts for listening trends over time.

\- Bar charts for track and artist rankings.

\- Heatmaps for listening patterns by hour and day when the data supports them.

\- Compact summary indicators for headline metrics.

\- Tables for precise, sortable historical records.



A chart must communicate something useful, not merely fill space.



Requirements:



\- Clear axes and labels.

\- Informative tooltips.

\- Responsive sizing.

\- Accessible color contrast.

\- Consistent number and duration formatting.

\- Distinguishable data series.

\- Proper empty states.

\- Correct handling of missing values.

\- Meaningful interactions and date filters.



Use green as a deliberate highlight, not as the only color for every data series.



Never invent data to make a chart appear complete.



\## 6. SonicPrint-specific composition



SonicPrint is a personal music-history explorer, not a generic business dashboard.



Design the page hierarchy around:



\- A memorable listening-history overview.

\- A chronological listening timeline.

\- Track and artist rankings.

\- Replay and listening-habit analysis.

\- Evidence-based discoveries.

\- A detailed listening-record explorer.



Use music-oriented content presentation where actual metadata supports it. Album artwork or artist imagery must not be fabricated or fetched unnecessarily from third-party services.



Avoid unnecessary playback bars, playlist-management controls, business KPI layouts, or generic administrative navigation.



Use compact cards and clear content grouping, but do not put every chart and statistic into an identical card.



\## 7. Theme implementation



Configure semantic CSS variables for:



\- Background and foreground.

\- Card and popover surfaces.

\- Primary and secondary actions.

\- Muted text.

\- Accent states.

\- Borders and inputs.

\- Focus indicators.

\- Chart colors.



Map these roles to the supplied design tokens.



Keep the theme centralized so that the interface remains consistent when components are reused.



Do not scatter raw color values throughout component files. If a design token must be added, document why it is necessary.



\## 8. Responsive behavior and accessibility



Follow the responsive principles in `DESIGN.md`.



\- Desktop should make effective use of available space.

\- Tablet layouts should preserve information hierarchy.

\- Mobile layouts should stack content logically and keep charts legible.

\- Tables should adapt through horizontal scrolling, responsive column selection, or another appropriate strategy.

\- Interactive controls must support keyboard use.

\- Focus states must remain visible against dark surfaces.

\- Honor reduced-motion preferences.

\- Never rely on color alone to communicate important information.



\## 9. Quality requirements



Before considering the UI complete:



1\. Check the page against the supplied `DESIGN.md`.

2\. Verify consistent tokens and component variants.

3\. Inspect charts for readability and correctness.

4\. Test interactions, filters, and responsive layouts.

5\. Remove placeholder content and unused components.

6\. Confirm that no shadcn defaults conflict with the intended visual design.

7\. Document any deliberate additions to the design system.



Do not replace the supplied design direction with a generic SaaS dashboard or a direct copy of Spotify's product interface.



The finished experience should combine the visual familiarity of the supplied Spotify-inspired system with the composability and analytical clarity of shadcn/ui.



Prioritize visual consistency, useful information hierarchy, data accuracy, and maintainability.

