# Reference analysis and original product direction

## Source reviewed

The supplied reference is a Swahili digital services hub. Its primary experience is a single scrollable dashboard-style landing page with a compact announcement strip, persistent header navigation, a search-led hero, an account/token status panel, grouped service sections, and a transaction-history prompt.

## Layout and navigation observations

The reference establishes a clear top-to-bottom hierarchy:

1. A narrow announcement bar communicates a purchase or support action.
2. A compact header combines the brand, three anchor links, and authentication.
3. The hero pairs a large two-line promise with a search box.
4. A wide account card communicates user state, token balance, and a purchase CTA.
5. Services are grouped into horizontal sections with distinct availability states.
6. Supporting tools, training, and history appear lower on the page.
7. The footer closes with brand and ownership information.

The information architecture is effective because it prioritizes discovery and action over a dense administrative table. The visual system uses a dark navy background, saturated purple/cyan accents, white rounded cards, pill tags, and generous section spacing. On small screens, the composition collapses into a single column while keeping the search and account action close to the top.

## Kituo Digitali interpretation

Kituo Digitali keeps the useful structural ideas but makes deliberate changes:

| Reference pattern | Original implementation |
| --- | --- |
| Single public hub | Persistent dashboard shell with real routes for Overview, Services, Workbench, Activity, and Account |
| Token purchase CTA | Available-credit card with a non-transactional “Add credits” affordance |
| Large service rails | Responsive service-card grid with categories, credits, availability, and detail modal |
| Search in hero | Dedicated service search on Overview plus a filter/search toolbar on Services |
| Generic user panel | Workspace switcher, user profile, privacy card, and usage view |
| History prompt | Activity route with typed persisted records and seeded fallback |
| Bright purple/blue visuals | Deep slate panels with teal signal color, amber guidance, violet/blue/coral secondary accents |
| Source-language content | New English copy and invented service names to avoid copying exact content |

## UX principles carried forward

- Make the primary action obvious without making the page feel like a storefront.
- Put account state near the beginning of the journey.
- Use short, scannable descriptions and credit requirements on every tool.
- Preserve escape routes: every page has persistent navigation and the service modal links into Workbench.
- Make the responsive layout mobile-first: the sidebar becomes a drawer, service cards become a single column, and forms stack in an action-first order.
- Use inline feedback for pending, success, empty, and coming-soon states.

## Intentional non-copying boundary

No branding, logo, text, images, private data, or exact content from the reference is used. The visual relationship is limited to broad product-category conventions and the user-requested structural qualities: service discovery, account state, forms, cards, activity, and responsive dashboard navigation.
