---
'@authabase/react': patch
---

Improve package reliability and consumer integration.

- Remove remaining FontAwesome usage and switch to internal SVG icons.
- Fix ESM output to avoid runtime `require("react")` issues in environments like TanStack Start.
- Exclude tests and stories from published package artifacts.
- Add a release contents check to prevent test/story files from being published.
- Emit and export package CSS (`@authabase/react/styles.css`) for consumer apps.
- Declare Tailwind CSS 4.x as a peer dependency and update install docs.
- Refine auth container spacing and input placeholder padding for better default UI layout.
