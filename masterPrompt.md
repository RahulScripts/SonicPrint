\# SonicPrint — Personal Music Listening Analytics



\## 1. Project overview



Build \*\*SonicPrint\*\*, a personal website that visualizes and explores my Spotify listening history using the personal data export I requested and received from Spotify.



The concept is a \*\*digital footprint of my musical life\*\*.



I want to understand my listening habits through interactive visualizations, historical trends, rankings, and data-driven insights. The website should make it easy to explore what I listen to, what I replay obsessively, which artists dominate my history, and how my listening behavior changes over time.



This is a personal data visualization project, not a Spotify clone, streaming application, social network, or multi-user SaaS product.



The project repository will remain private.



\## 2. Initial task: inspect before implementing



Before writing application code:



1\. Inspect the existing repository and its configuration.

2\. Locate and inspect the Spotify data export files available in the workspace.

3\. Identify the actual file formats, schemas, fields, timestamps, and available metadata.

4\. Determine which files need to be combined and whether their date ranges overlap.

5\. Identify the metrics and visualizations that can be calculated reliably from the available data.

6\. Review the existing `DESIGN.md` and the installed shadcn skill.

7\. Present a concise implementation plan based on these findings.



Do not assume a particular Spotify export schema. Do not fabricate data, invent unavailable metadata, or introduce mock statistics into the finished application.



If the export files cannot be located, ask me where they are.



\## 3. Suggested technology stack



Use the following stack unless the existing repository provides a compelling reason to retain a different configuration:



\- \*\*React + TypeScript\*\* for the application.

\- \*\*Vite\*\* for development and production builds.

\- \*\*Tailwind CSS\*\* for styling.

\- \*\*shadcn/ui\*\* for reusable, accessible UI components.

\- \*\*Recharts\*\*, using shadcn's chart integration where appropriate, for data visualizations.

\- \*\*Lucide icons\*\* for interface icons.

\- \*\*date-fns\*\* or an equivalent lightweight date utility for time-based analysis.

\- A suitable CSV/JSON parsing library only if required by the actual export format.



Use the installed shadcn skill and official documentation when implementing components.



Do not install an additional UI component library or unnecessary backend infrastructure.



\## 4. Data architecture



Build a dedicated data-processing layer that separates raw export parsing from visualization and presentation.



Responsibilities include:



\- Parsing the actual export files.

\- Normalizing listening records into a consistent internal schema.

\- Handling missing values and malformed records.

\- Parsing timestamps consistently.

\- Combining files without accidental double-counting.

\- Calculating derived metrics through documented, testable functions.

\- Supporting filtering by date range, track, and artist.

\- Efficiently handling a large number of listening records.



Distinguish recorded playback events from qualified plays and actual listening duration wherever those distinctions matter.



Do not silently discard short listening events. Document any thresholds used in metrics, and make the calculation rules understandable.



Do not assume that the export includes genre, album artwork, audio features, or other metadata unless the files actually contain it.



\## 5. Product information architecture



Design a cohesive experience around the following proposed sections. Implement and prioritize them according to the available data.



\### A. Overview



Create a compelling summary of my listening history.



Potential metrics:



\- Total recorded plays.

\- Total listening time.

\- Unique tracks and artists.

\- Most-played track and artist.

\- Average daily listening.

\- Listening activity over time.

\- Date range covered by the export.



Include a small number of interesting, evidence-based findings rather than filling the page with every possible metric.



\### B. Listening timeline



Explore my listening activity chronologically.



Potential features:



\- Daily, weekly, monthly, and yearly activity.

\- Listening duration trends.

\- Hour-of-day and day-of-week patterns.

\- Listening streaks where reliably calculable.

\- Periods of unusually high activity.

\- Date-range selection and interactive chart inspection.



\### C. Track analysis



Explore individual tracks and replay behavior.



Potential features:



\- Most-played tracks.

\- Most-listened-to tracks by duration.

\- Repeated listening over short periods.

\- Tracks that dominated specific months.

\- Listening frequency versus listening duration.

\- Searchable and sortable track rankings.



\### D. Artist analysis



Explore listening preferences across artists.



Potential features:



\- Most-listened-to artists.

\- Artist rankings by play count and listening time.

\- Artists that dominated specific periods.

\- Changes in artist preferences over time.

\- First recorded appearance and return patterns where supported.



\### E. Listening habits and discoveries



Surface meaningful patterns that can be demonstrated from the data.



Examples:



\- Tracks with unusually high replay frequency.

\- Artists I repeatedly return to.

\- Changes in listening intensity.

\- Listening habits by time of day.

\- Songs that dominated particular periods.

\- Unusual spikes in listening activity.



Explain the data behind each insight. Avoid unsupported claims about personality, mood, or emotional state.



\### F. Listening history explorer



Provide a detailed interface for browsing individual listening records.



Include:



\- Search.

\- Sorting and filtering.

\- Date-range selection.

\- Pagination or virtualization when necessary.

\- Relevant event details.

\- Clear handling of missing metadata.



Keep the experience responsive even with large exports.



\## 6. Interaction and usability



Use meaningful interactions rather than decorative controls.



\- Charts should have informative tooltips.

\- Rankings should be searchable and sortable.

\- Filters should update the displayed data.

\- Date-range controls should affect all relevant views consistently.

\- Empty and error states should explain what happened.

\- Loading states should be provided when necessary.

\- Keyboard navigation and accessible control labels should be supported.



Avoid adding a fake music player, streaming controls, authentication, or social features unless a genuine requirement emerges.



\## 7. Privacy and data handling



My listening history is personal data.



\- Prefer local, browser-side processing.

\- Do not transmit raw listening records to external services.

\- Do not introduce analytics or tracking services.

\- Do not commit raw exports, private datasets, or secrets to Git.

\- Add appropriate exclusions to `.gitignore`.

\- Keep the repository private.

\- Do not expose personal records through a publicly accessible deployment.



A private repository does not make a deployed website private. Before deployment, explain the access-control implications and obtain my direction.



\## 8. Implementation workflow



Proceed incrementally.



\*\*Phase 1:\*\* Audit the repository, data export, design document, and installed skills.



\*\*Phase 2:\*\* Define the normalized data model, processing functions, metric definitions, and validation tests.



\*\*Phase 3:\*\* Establish the UI foundation using the supplied design system and shadcn skill.



\*\*Phase 4:\*\* Implement the overview and the most valuable data exploration views.



\*\*Phase 5:\*\* Add filtering, detailed history exploration, tooltips, and other interactions.



\*\*Phase 6:\*\* Validate calculations, responsive layouts, accessibility, and production builds.



Do not stop at a static mockup. Build a functioning application using the real export.



\## 9. Definition of done



The finished application should:



\- Run locally using documented commands.

\- Use my actual Spotify data export.

\- Produce reproducible metrics.

\- Present meaningful, interactive visualizations.

\- Support searching and exploring listening records.

\- Follow the supplied design system.

\- Handle missing data and large datasets.

\- Keep personal data out of version control.

\- Include clear setup and usage documentation.



Start by auditing the existing project and export files. Report what you find and propose the implementation plan before making major changes. Once the plan is established, proceed with implementation in verifiable stages.

