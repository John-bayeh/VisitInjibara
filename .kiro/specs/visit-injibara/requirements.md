# Requirements Document

## Introduction

Visit Injibara is a lightweight, mobile-first tourism discovery platform for Injibara and the surrounding Awi region of Ethiopia. The platform is built as a static site (Astro + TypeScript) with a Progressive Web App (PWA) layer, deployed on Vercel or Cloudflare Pages. It targets visitors on budget Android phones with low-bandwidth connections, as well as desktop browsers.

The platform enables visitors to discover local destinations, culture, and ecology; connect with verified local youth guides; and access essential destination information offline. Two primary views — an interactive Leaflet map and an SVG/Canvas relational graph — provide spatial and thematic discovery modes. A validated JSON data file drives all destination content.

---

## Glossary

- **Platform**: The Visit Injibara static web application as a whole.
- **Destination**: A named point of interest in Injibara or the Awi region, represented by a record in `src/data/nodes.json`.
- **Node**: A destination or theme entity rendered in the Relational Graph.
- **Edge**: A directional or undirectional relationship between two Nodes in the Relational Graph.
- **Marker**: A map icon rendered on the Leaflet map representing a Destination.
- **Detail Panel**: The overlay or side panel that displays full Destination details on the Map View.
- **Bottom Sheet**: The mobile-friendly slide-up panel that displays Destination details on the Graph View.
- **Category**: A classification label applied to a Destination (e.g., nature, culture, ecology, viewpoint).
- **Guide**: A verified local youth guide with confirmed contact information associated with one or more Destinations.
- **Service_Worker**: The browser service worker responsible for caching application assets and destination data.
- **App_Shell**: The minimal set of HTML, CSS, and JavaScript assets required to render the Platform's navigation and layout.
- **Data_Validator**: The build-time or load-time component that validates `src/data/nodes.json` against the defined schema.
- **Schema**: The defined structure and constraints for records in `src/data/nodes.json`.
- **Map_View**: The interactive Leaflet map interface showing Destination Markers.
- **Graph_View**: The SVG/Canvas relational graph interface showing Nodes and Edges.
- **View_Switcher**: The header control that toggles between Map_View and Graph_View.
- **Cache**: The browser's service worker cache storage used for offline access.
- **Offline_Indicator**: A visual element that communicates to the user that the Platform is operating without a network connection.
- **Stale_Indicator**: A visual element that communicates that displayed data was loaded from Cache and may not reflect the most recent state.
- **Contact_Action**: A clickable link that initiates a phone call, WhatsApp message, or Telegram message to a Guide.
- **Verified_Contact**: A Guide phone number or messaging handle that has been confirmed as accurate and is marked `last_verified` with a date in the Destination record.

---

## Requirements

### Requirement 1: Destination Data Schema and Validation

**User Story:** As a content maintainer, I want destination data to follow a strict, validated schema, so that invalid records never reach production and coordinates, contacts, and relationships can be trusted.

#### Acceptance Criteria

1. THE Data_Validator SHALL enforce that every Destination record in `src/data/nodes.json` contains all required fields: `id`, `title`, `local_name`, `category`, `description`, `lat`, `lng`, `altitude_m`, `vehicle`, `seasonal_warnings`, `last_verified`, `guide_phone`, and `connections`.
2. THE Data_Validator SHALL enforce that every `id` value is unique across all Destination records.
3. THE Data_Validator SHALL enforce that `lat` values fall within the range −90 to 90 inclusive and `lng` values fall within the range −180 to 180 inclusive.
4. THE Data_Validator SHALL enforce that `last_verified` values conform to the ISO 8601 date format (YYYY-MM-DD).
5. THE Data_Validator SHALL enforce that every entry in a Destination's `connections` array references an `id` that exists in `src/data/nodes.json`.
6. WHEN the Data_Validator detects a schema violation, THE Data_Validator SHALL report the offending field, record `id`, and a human-readable description of the violation.
7. WHEN the Data_Validator detects a schema violation at build time, THE Platform SHALL halt the build and surface the validation error.
8. THE Data_Validator SHALL treat a `guide_phone` value as unverified unless the associated record's `last_verified` date is present and not null.
9. THE Data_Validator SHALL accept `guide_phone` as null or an empty string, indicating no guide contact is available for that Destination.

---

### Requirement 2: Interactive Map View

**User Story:** As a visitor, I want to see all destinations on an interactive map centered on Injibara, so that I can quickly understand what is nearby and choose where to go.

#### Acceptance Criteria

1. WHEN the Map_View is loaded, THE Platform SHALL center the Leaflet map on Injibara (approximately latitude 10.97°N, longitude 36.95°E) at a default zoom level appropriate for the Awi region.
2. THE Map_View SHALL render one Marker for each valid Destination record in `src/data/nodes.json`.
3. THE Map_View SHALL apply distinct visual styling to Markers based on the Destination's `category` field.
4. WHILE the Map_View is loading Destination data, THE Platform SHALL display a visible loading indicator.
5. IF Destination data fails to load, THEN THE Platform SHALL display a human-readable error message and SHALL NOT render a blank or crashed map.
6. WHEN a user selects a Marker, THE Map_View SHALL open the Detail Panel for the corresponding Destination.
7. WHEN the Detail Panel is open, THE Platform SHALL display the Destination's `title`, `local_name`, `description`, `lat`, `lng`, `altitude_m`, `vehicle` accessibility information, `seasonal_warnings`, `last_verified` date, and available Guide Contact Actions.
8. THE Map_View SHALL be navigable by keyboard, allowing focus to move between Markers using standard keyboard controls.
9. THE Map_View SHALL use a map tile provider whose terms of service permit the Platform's intended use, or a legally permitted offline map package.
10. THE Platform SHALL NOT bulk-download or pre-cache tiles from standard OpenStreetMap tile servers in violation of the tile usage policy.

---

### Requirement 3: Relational Graph View

**User Story:** As a visitor, I want to explore connections between destinations and themes visually, so that I can discover thematic groupings and related places I might not find on a map.

#### Acceptance Criteria

1. THE Graph_View SHALL render a Node for each Destination and each theme present in `src/data/nodes.json`.
2. THE Graph_View SHALL render an Edge between two Nodes for each entry in a Destination's `connections` array.
3. WHEN a user selects a Node, THE Graph_View SHALL highlight that Node and all directly connected Nodes and Edges.
4. WHEN a user selects a Node, THE Graph_View SHALL dim all Nodes and Edges that are not directly connected to the selected Node.
5. WHEN a user selects a Destination Node, THE Graph_View SHALL display the Destination's details in the Bottom Sheet.
6. THE Bottom Sheet SHALL display the Destination's `title`, `local_name`, `description`, `seasonal_warnings`, and available Guide Contact Actions.
7. THE Graph_View SHALL support touch interactions for Node selection and graph panning on mobile devices.
8. THE Graph_View SHALL support keyboard navigation, allowing users to move focus between Nodes and activate selection using the keyboard.
9. THE Graph_View SHALL be implemented using SVG, Canvas, or a combination of SVG and Canvas without requiring a third-party graph library that conflicts with the Platform's lightweight constraint.

---

### Requirement 4: Map/Graph View Switcher

**User Story:** As a visitor, I want to switch between the map and the graph without the page reloading, so that I can fluidly explore destinations in both spatial and relational contexts.

#### Acceptance Criteria

1. THE Platform SHALL render a View_Switcher in the page header that is persistently visible on all screen sizes.
2. WHEN a user activates the Map_View option in the View_Switcher, THE Platform SHALL display the Map_View without a full-page reload.
3. WHEN a user activates the Graph_View option in the View_Switcher, THE Platform SHALL display the Graph_View without a full-page reload.
4. THE View_Switcher SHALL clearly indicate which view is currently active.
5. THE View_Switcher SHALL be operable by keyboard and comply with WCAG 2.1 Level AA for focus management and ARIA roles.

---

### Requirement 5: Offline-First Experience

**User Story:** As a visitor with a low-bandwidth connection, I want to access destination information I've already viewed even when offline, so that I can use the platform reliably during trips to areas with poor connectivity.

#### Acceptance Criteria

1. WHEN the Platform is first loaded with a network connection, THE Service_Worker SHALL cache the App_Shell assets (HTML, CSS, JavaScript, fonts) required to render the Platform's navigation and layout.
2. WHEN a Destination detail is loaded with a network connection, THE Service_Worker SHALL cache the Destination's data so it is available for offline access.
3. WHILE the Platform is operating without a network connection, THE Platform SHALL display the Offline_Indicator.
4. WHILE the Platform is displaying data loaded from Cache, THE Platform SHALL display the Stale_Indicator alongside the Destination detail.
5. WHEN a user requests a Destination detail that is available in Cache and the network is unavailable, THE Platform SHALL serve the cached Destination detail.
6. WHEN a user requests a resource that is neither available in Cache nor over the network, THE Platform SHALL display a user-readable message explaining that the content is unavailable offline and SHALL NOT display a browser default error page.
7. IF the Service_Worker fails to update the Cache, THEN THE Platform SHALL continue to serve cached content and SHALL log the cache failure without crashing.
8. THE Platform SHALL NOT pre-cache map tiles from external tile servers in bulk in violation of tile provider usage policies.

---

### Requirement 6: Local Guide Contact Actions

**User Story:** As a visitor, I want to contact a local guide directly from a destination detail, so that I can arrange a guided visit quickly and safely.

#### Acceptance Criteria

1. WHEN a Destination has a Verified_Contact, THE Platform SHALL display Contact Actions for Call, WhatsApp, and Telegram.
2. WHEN a user activates the Call Contact Action, THE Platform SHALL initiate a `tel:` URI using the Guide's verified phone number.
3. WHEN a user activates the WhatsApp Contact Action, THE Platform SHALL open a WhatsApp deep link pre-filled with a concise message referencing the Destination's `title`.
4. WHEN a user activates the Telegram Contact Action, THE Platform SHALL open a Telegram deep link pre-filled with a concise message referencing the Destination's `title`.
5. WHEN a Destination has no Verified_Contact, THE Platform SHALL display a clearly labeled unavailable state for the Guide contact section and SHALL NOT display a Contact Action.
6. THE Platform SHALL NOT publish, invent, or display placeholder phone numbers or handles as Verified_Contacts.
7. THE Platform SHALL derive all Verified_Contact values exclusively from the `guide_phone` field in `src/data/nodes.json` where `last_verified` is present and not null.

---

### Requirement 7: Language and Accessibility

**User Story:** As a visitor who speaks Amharic or English, I want the interface to be readable and navigable in my language, so that I can use the platform confidently regardless of my language background.

#### Acceptance Criteria

1. THE Platform SHALL provide an English-language interface as the default.
2. THE Platform SHALL be structured to support an Amharic-language interface, with string externalization such that Amharic translations can be added without modifying component logic.
3. WHERE verified Awi-language content is available, THE Platform SHALL display Awi-language content alongside or in place of the English equivalent.
4. THE Platform SHALL use semantic HTML5 elements for all structural components (navigation, main content, headers, sections, and footers).
5. THE Platform SHALL meet WCAG 2.1 Level AA contrast requirements for all text and interactive elements.
6. THE Platform SHALL use a minimum touch target size of 44×44 CSS pixels for all interactive elements.
7. THE Platform SHALL declare the active language via the `lang` attribute on the `<html>` element and update it when the language changes.
8. WHERE pronunciation audio is included for a Destination name or term, THE Platform SHALL use audio content only from verified, reliable sources and SHALL provide a text transcript.
9. IF pronunciation audio is not available from a verified source, THEN THE Platform SHALL omit the audio element and SHALL NOT use synthesized or unverified audio.

---

### Requirement 8: Responsive Layout and Navigation

**User Story:** As a visitor on a budget Android phone, I want the platform to be usable on a small screen without horizontal scrolling or tiny tap targets, so that I can explore destinations comfortably on the device I carry.

#### Acceptance Criteria

1. THE Platform SHALL render without horizontal overflow on viewport widths from 320 CSS pixels to 1440 CSS pixels.
2. THE Platform SHALL use a mobile-first CSS approach, defining base styles for small viewports and applying progressive enhancements for wider viewports.
3. THE Platform SHALL provide a persistent navigation element that allows users to return to the main destination list, the Map_View, and the Graph_View from any screen.
4. THE Platform SHALL be operable without JavaScript for basic content discovery, serving static destination content at a minimum.
5. THE Platform SHALL load the initial page with a Lighthouse Performance score of 80 or above on a simulated mobile connection (4G) as measured during CI.

---

### Requirement 9: Progressive Web App (PWA)

**User Story:** As a visitor, I want to install the platform on my home screen and have it work like a native app, so that I can access it quickly and reliably without a browser navigation bar.

#### Acceptance Criteria

1. THE Platform SHALL provide a Web App Manifest (`manifest.webmanifest`) with a `name`, `short_name`, `icons`, `start_url`, `display`, and `theme_color`.
2. THE Platform SHALL register the Service_Worker on browsers that support the Service Worker API.
3. WHEN a browser meets installability criteria, THE Platform SHALL be installable to the device home screen.
4. THE Platform SHALL provide app icons at a minimum of 192×192 and 512×512 pixels in PNG format.
5. IF the Service_Worker registration fails, THEN THE Platform SHALL continue to function as a standard web application without crashing.

---

### Requirement 10: Build, Linting, and Type Checking

**User Story:** As a developer, I want automated checks to run on every change, so that schema violations, type errors, and linting issues are caught before deployment.

#### Acceptance Criteria

1. THE Platform SHALL include a TypeScript build configuration (`tsconfig.json`) with strict mode enabled.
2. WHEN the build command is executed, THE Platform SHALL complete a TypeScript type check with zero errors before producing output artifacts.
3. THE Platform SHALL include an ESLint configuration targeting TypeScript and Astro files.
4. WHEN the lint command is executed, THE Platform SHALL report zero lint errors.
5. WHEN the build command is executed, THE Data_Validator SHALL run as a pre-build step and SHALL halt the build on any schema violation.
6. THE Platform SHALL include a test suite with automated tests covering the Data_Validator, the View_Switcher logic, and the Contact Action URL construction.
7. WHEN the test command is executed, THE Platform SHALL report the actual test results — pass/fail counts and any failure details — and SHALL NOT suppress or omit results.

---

### Requirement 11: Learning Documentation

**User Story:** As a developer learning AI-assisted software engineering, I want structured documentation in `docs/learning/`, so that I can understand the architecture, data flow, and conventions of the project without needing to read all source files first.

#### Acceptance Criteria

1. THE Platform's repository SHALL contain a `docs/learning/` directory with the following files: `PROJECT_OVERVIEW.md`, `ARCHITECTURE.md`, `FOLDER_GUIDE.md`, `DATA_FLOW.md`, `API_REFERENCE.md`, `DATABASE_GUIDE.md`, `TESTING_GUIDE.md`, `DEPLOYMENT_GUIDE.md`, and `LEARNING_PROGRESS.md`.
2. THE `PROJECT_OVERVIEW.md` SHALL describe the purpose, target audience, tech stack, and core objectives of the Platform.
3. THE `ARCHITECTURE.md` SHALL describe the major components (Map_View, Graph_View, Service_Worker, Data_Validator), their responsibilities, and how they interact.
4. THE `FOLDER_GUIDE.md` SHALL list the repository directory structure and describe the purpose of each top-level directory and key file.
5. THE `DATA_FLOW.md` SHALL trace how a Destination record moves from `src/data/nodes.json` through validation, rendering, caching, and display.
6. THE `API_REFERENCE.md` SHALL document the data contracts for `src/data/nodes.json`, including all field names, types, constraints, and example values, noting that this is a static site with no HTTP API.
7. THE `DATABASE_GUIDE.md` SHALL document the full JSON Schema for a Destination record, including required fields, optional fields, valid ranges, and format constraints.
8. THE `TESTING_GUIDE.md` SHALL describe the test framework, how to run tests, what is tested, and conventions for writing new tests.
9. THE `DEPLOYMENT_GUIDE.md` SHALL describe the steps to build and deploy the Platform to Vercel and Cloudflare Pages, including required environment variables and any build configuration.
10. THE `LEARNING_PROGRESS.md` SHALL include a structured checklist of learning milestones tied to implementation phases, with space for notes.
11. THE learning documentation files SHALL be populated with content derived from the spec and known project decisions and SHALL NOT be left as empty placeholders.
