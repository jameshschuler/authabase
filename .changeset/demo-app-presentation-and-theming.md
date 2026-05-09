---
'@authabase/demo': patch
---

Enhance demo app presentation and user experience for public deployment.

- Restructure layout into a full-viewport 3-column design:
  - Left sidebar (360px): theme customization controls
  - Center column: auth component showcase
  - Right sidebar (360px): demo behavior and configuration
- Implement live theme controls with 6 presets: Default, Ocean, Sunset, Forest, Midnight (dark), and Graphite.
- Add theme color pickers for all `--auth-*` variables including background and foreground for complete page theming.
- Generate and display copyable CSS snippet for users to apply themes to their own apps.
- Add marketing header with navigation links to npm, GitHub, README, Contributing guide, and changelog.
- Add hero section with package branding, description, and call-to-action.
- Add footer with resource links and package callout.
- Reorganize demo controls into clear stacked sections: Presets, Integration, OTP Endpoints, Enabled Methods, OTP Options, Links, Copy and Validation.
- Use sticky sidebar positioning on desktop for better UX.
- Remove page-width constraints so the layout utilizes the full viewport.
