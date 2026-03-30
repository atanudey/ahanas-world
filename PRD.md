
# Product Requirements Document (PRD)
## Parent-Managed Young Creator Portal ("Ahana's World" — working title)

**Document status:** Draft v1.0  
**Date:** March 29, 2026  
**Audience:** Product, design, engineering, content operations, family stakeholders  
**Primary outcome:** Build a safe, parent-managed creative platform that helps a 9-year-old artist create, practice, publish, preserve memories, and grow an audience over time without sacrificing privacy, safety, or joy.

---

## 1. Executive Summary

This product is **not just a website**. It is a **parent-managed creative growth portal** for a young artist who loves singing, dancing, painting, science, space exploration, and storybooks.

The product must serve **three connected purposes**:

1. **Inspiration system** — help the child stay motivated, record ideas, and feel proud of progress.
2. **Publishing system** — let a parent upload once, then publish to the website and selected social channels with review and scheduling controls.
3. **Growth system** — combine practice history, content history, and audience analytics into one dashboard so the family can make better creative decisions over time.

The portal should behave as:

- her digital home
- her creative journal
- her private practice tracker
- her parent approval workflow
- her media archive
- her public portfolio
- her discoverability engine

The website alone will not make her famous. The real value comes from a repeatable loop:

**practice -> create -> publish -> measure -> learn -> improve -> repeat**

Because the creator is **9 years old**, the product must be **parent-managed by default** and must avoid designs that assume independent child account ownership or unrestricted public interaction.[^google-age][^family-link][^youtube-supervised][^coppa-rule]

---

## 2. Problem Statement

Today, the family's creative workflow is fragmented:

- videos, songs, paintings, and notes are likely spread across phones, cloud folders, and social apps
- there is no single place to preserve the child's creative history
- there is no structured practice log or progress record
- uploads to public channels can become manual, repetitive, and inconsistent
- public social profiles alone do not tell a full story about the child as an artist
- analytics are scattered across multiple platforms
- social platforms optimize for engagement, not necessarily for healthy child development or long-term creative identity

The family needs a system that can safely combine:

- **creative memory**
- **creative growth**
- **brand storytelling**
- **publishing operations**
- **audience insights**

---

## 3. Product Vision

Create a **warm, artistic, parent-operated digital studio** where a young creator can:

- record songs and ideas
- upload videos and artwork
- log practice and milestones
- explore creative prompts tied to books, science, and space
- publish selected work through a parent-managed workflow
- present a polished public story
- learn from progress and audience response over time

### Product positioning

This should **not** be positioned as "just a child singer website."

It should be positioned as:

> **A young creative explorer's world — where songs, sketches, stories, and stars meet.**

That positioning is stronger because it blends:

- singing
- dancing
- painting
- curiosity about science and space
- reading and storytelling

This combination is unique and memorable, and it can support a richer, more durable public identity than music alone.

---

## 4. Goals

### 4.1 Primary goals

1. **Build a safe digital home**
   - A polished public site that showcases songs, videos, artwork, reading inspirations, science/space interests, and milestones.

2. **Create a private growth engine**
   - A child-friendly space for inspiration, missions, practice logs, badges, and creative notes.
   - A parent space for approval, publishing, analytics, archive, and observations.

3. **Enable one-to-many publishing**
   - Upload once and distribute to:
     - website
     - YouTube
     - Instagram (where allowed/configured)
     - Facebook Page

4. **Unify analytics**
   - Bring together:
     - website engagement
     - YouTube performance
     - Instagram/Facebook insights
     - internal practice and progress data

5. **Support long-term discoverability**
   - Make the website the permanent "home base" that remains valuable even if social algorithms or platform rules change.

### 4.2 Secondary goals

- preserve creative history in a structured archive
- create a repeatable weekly content system
- support milestone storytelling ("look how far she has come")
- help parents make decisions based on progress and resonance
- build a media-ready portfolio over time

---

## 5. Non-Goals

These are **not** goals for v1 unless explicitly added later:

- direct messaging with the child
- open public comments
- public user accounts/community accounts
- fan uploads
- livestreaming
- paid memberships
- advertising monetization
- influencer-style daily posting pressure
- independent child account management
- public display of detailed private practice notes
- exact school, address, routine, or location sharing
- building a full social network

---

## 6. Guiding Principles

1. **Parent-managed by default**  
   Every public action that exposes content externally must be approved or controlled by a parent.

2. **Inspiration before virality**  
   The product must first help the child create joyfully and consistently. Reach is a by-product of healthy creative habits.

3. **Safety over engagement**  
   Features that increase reach but reduce safety should be deferred or rejected.

4. **One upload, many outputs**  
   One content item should become multiple reusable outputs: a page, a post, a short clip, a scheduled reel, a milestone, a teaser, etc.

5. **Effort is more important than vanity metrics in the child-facing experience**  
   The Child Hub should celebrate effort, consistency, curiosity, and completion — not views, follower counts, or social comparison.

6. **Preserve everything meaningful**  
   Early drafts, imperfect performances, and sketches matter because they become part of the growth story later.

7. **Website is the home base**  
   Social platforms are distribution channels; the website is the permanent archive and brand home.

8. **Artistic identity should feel unified**  
   Public site, Child Hub, and Parent Center must feel like one creative universe, not three separate products.

---

## 7. Target Users and Personas

| Persona | Description | Primary needs |
|---|---|---|
| Parent Admin | Parent or guardian who manages privacy, uploads, publishing, and platform accounts | control, safety, scheduling, analytics, archive, approvals |
| Child Creator | 9-year-old artist using a guided and joyful interface | inspiration, missions, simple logging, creativity prompts, badges, pride in progress |
| Public Visitor | Family, friends, supporters, teachers, collaborators, media visitors | discover story, browse work, watch/listen, contact parents |
| Future Collaborator (optional) | Organizer, local venue, teacher, partner, journalist | portfolio, milestones, media/contact information |

---

## 8. Jobs To Be Done

### Parent Admin jobs
- As a parent, I want to upload a song or video once and distribute it across channels.
- As a parent, I want every public item reviewed before it goes live.
- As a parent, I want to track practice growth separately from public engagement.
- As a parent, I want a safe contact flow that reaches me, not my child.
- As a parent, I want to preserve a long-term archive that can be exported later.

### Child Creator jobs
- As a child creator, I want to log what I made today in a fun way.
- As a child creator, I want creative prompts that connect music, space, art, and books.
- As a child creator, I want to feel proud of streaks, badges, and milestones.
- As a child creator, I want to save melody ideas and artwork without dealing with public posting.

### Public visitor jobs
- As a visitor, I want to quickly understand who she is and what makes her unique.
- As a visitor, I want to discover songs, videos, art, books, and milestones.
- As a visitor, I want to contact the parent if I want to invite or support her.

---

## 9. Product Scope Overview

The product consists of **three user-facing modes** and several shared services.

### 9.1 Public Site
A beautiful, artistic, public website that acts as the official home of the young creator.

### 9.2 Child Hub
A private, child-friendly creative space focused on:
- logging
- inspiration
- missions
- badges
- curiosity
- reflections

### 9.3 Parent Center
A private admin portal focused on:
- content management
- publishing workflows
- schedule queue
- analytics
- archive
- observations
- permissions and settings

### 9.4 Shared Services
- content repository
- media processing
- publishing engine
- analytics ingestion
- notifications
- theme system
- role-based access control
- backups/export

---

## 10. Brand and Experience Requirements

## 10.1 Brand pillars

The portal should feel:

- warm
- imaginative
- artistic
- curious
- safe
- hopeful
- polished, but not corporate

### Emotional themes
- wonder
- growth
- play
- storytelling
- confidence
- discovery

### Creative identity
The experience should blend:
- songs
- sketches
- stories
- stars

---

## 10.2 Dark and Light artistic modes

The portal must support **two artistic modes**, not merely dark and light color inversions.

### Mode A: **Moonlit Studio** (Dark Mode)
**Use case:** evening browsing, music/performance emphasis, space/science storytelling, immersive creative mood

**Visual qualities**
- deep navy, indigo, plum, rose-magenta accents
- stardust glows
- spotlight overlays
- constellation lines
- velvet-style depth
- luminous buttons and badges

**Best suited for**
- performance pages
- music pages
- video detail pages
- Child Hub default
- night-time creative mood

### Mode B: **Storybook Atelier** (Light Mode)
**Use case:** painting, reading, editorial storytelling, day-time browsing, parent operations

**Visual qualities**
- warm ivory and paper backgrounds
- watercolor blush and lavender
- hand-painted dividers
- sketchbook textures
- soft gallery-like shadows
- scrapbook / notebook accents

**Best suited for**
- art pages
- storybook pages
- About page
- Parent Center default
- editorial public content browsing

### Design system requirement
All product surfaces must share a common visual DNA:
- typography system
- motion language
- corner radius scale
- border style logic
- badge style logic
- textured overlays
- shared icon language
- shared illustration motifs

**Design goal:** The app should feel like **one portal with three modes**, not three unrelated products.

---

## 11. Information Architecture

## 11.1 Public Site structure

1. Home
2. About
3. Music
4. Videos / Performances
5. Art Gallery
6. Space & Science Corner
7. Storybooks / Reading
8. Milestones
9. Media / Events (future)
10. Contact Parents

## 11.2 Child Hub structure

1. Today / Greeting / Creative streak
2. Log Creation
3. Missions / prompts
4. Idea Vault
5. Badge Cabinet
6. Discovery Log / milestone history
7. Reading & curiosity prompts
8. Private reflections (optional)

## 11.3 Parent Center structure

1. Overview dashboard
2. Content Studio
3. Publishing Engine
4. Schedule Queue
5. Analytics Dashboard
6. Practice Logs
7. Parent Observations
8. Archive / Export
9. Settings / Safety / Integrations

---

## 12. User Flows

## 12.1 Parent publishing flow
1. Parent uploads video/audio/image.
2. System asks for metadata:
   - title
   - content type
   - public/private
   - collection/section
   - description
   - inspiration/story
   - publish now or schedule later
3. System stores original asset.
4. System creates derivatives:
   - thumbnail
   - teaser
   - short caption options
   - public page draft
5. Parent reviews.
6. Parent chooses destinations:
   - website only
   - website + YouTube
   - website + YouTube + Instagram + Facebook
7. System publishes or schedules.
8. System records status, retries, and results.
9. Analytics sync later updates the dashboard.

## 12.2 Child creative log flow
1. Child opens Child Hub.
2. Child sees greeting, streak, and today's missions.
3. Child taps **Log Creation**.
4. Child chooses:
   - sang
   - danced
   - painted
   - read
   - idea note
5. Child logs simple details:
   - time spent
   - what they worked on
   - mood
   - favorite part
6. System awards XP/badges/streak progression.
7. Parent can later review the log privately.

## 12.3 Public discovery flow
1. Visitor lands on Home page.
2. Visitor understands the creator's story and uniqueness.
3. Visitor explores songs, performances, art, books, and milestones.
4. Visitor watches or listens to featured content.
5. Visitor optionally follows official channels or contacts parents.

---

## 13. Detailed Functional Requirements

## 13.1 Public Site Requirements

### PR-01 Home page
The home page must:
- introduce the creator in 1-2 clear sentences
- present a featured content item
- showcase mixed media (music, art, curiosity, milestones)
- include strong calls to action:
  - Watch Latest Performance
  - Explore Creative World
- visually reflect the chosen artistic mode

### PR-02 Content discovery
Visitors must be able to browse:
- songs
- performances/videos
- art
- reading/storybook inspirations
- science/space content
- milestone timeline

### PR-03 Content detail pages
Each published content item must have a detail view/page with:
- title
- type
- date
- description
- story behind the piece
- image/video/audio
- related items
- public engagement summary (optional and parent-curated)

### PR-04 Public visibility rules
Only items marked:
- `visibility = public`
- `status = published`
may appear on the public site.

Scheduled, draft, private, or internal-only items must never render publicly.

### PR-05 Contact flow
The public site may include:
- contact parents form
- media inquiry form
- collaboration inquiry form

The site must **not** expose:
- child's email
- child's direct phone
- direct DM path to the child

### PR-06 Search and filtering
The public site should support, at minimum:
- browse by category
- browse by collection
- browse by newest / featured

Advanced search can be a later enhancement.

### PR-07 SEO and sharing
Each public content page should support:
- clean URLs
- metadata for social sharing
- descriptive titles and summaries
- alt text on images
- structured collections where useful

### PR-08 No public comments in v1
No public commenting system at launch.

---

## 13.2 Child Hub Requirements

### CH-01 Child-safe entry
The Child Hub must be simple, visual, and encouraging.

It should not emphasize:
- follower counts
- public ranking
- comparison with others

It should emphasize:
- streaks
- effort
- badges
- curiosity
- completed missions

### CH-02 Creative logging
The child must be able to log:
- singing practice
- dance practice
- painting/art time
- reading time
- melody/idea note
- curiosity/discovery entry

### CH-03 Missions and prompts
The hub should show:
- daily missions
- weekly creative goals
- themed prompts tied to books, music, art, and space

### CH-04 Idea Vault
The child must be able to save:
- melody ideas
- story prompts
- painting concepts
- space/science questions
- book inspirations

### CH-05 Badges and milestones
The system should reward:
- streaks
- firsts
- persistence
- curiosity
- completion of goals
- creative diversity

### CH-06 Parent review boundary
The child can create private logs/drafts, but cannot publish to public channels directly.

### CH-07 Accessibility of controls
Large tap targets, clear iconography, minimal text burden, supportive copy.

---

## 13.3 Parent Center Requirements

### PC-01 Overview dashboard
The Parent Center overview must show:
- total content count
- content by status
- current streaks and recent practice activity
- recent uploads
- recent publishing actions
- high-level public performance trends

### PC-02 Content Studio
Parent can:
- upload audio/video/images
- edit metadata
- add descriptions and stories
- assign items to sections
- set visibility
- draft/save/publish/archive

### PC-03 Publishing Engine
Parent can:
- select publish destinations
- schedule future publishing
- review caption variants
- review thumbnail
- retry failed posts
- see posting history
- manually override or cancel queued items

### PC-04 Schedule Queue
Parent can see:
- scheduled posts
- queued posts
- failed posts
- published posts
- items needing review

### PC-05 Analytics Dashboard
Parent can see:
- website traffic
- content views
- YouTube performance
- social performance
- top content by type
- best days/times/themes
- creator growth metrics
- content performance over time

### PC-06 Practice and progress tools
Parent can review:
- daily/weekly logs
- practice minutes
- streak history
- confidence notes
- milestone notes
- parent observations

### PC-07 Archive and export
Parent can:
- export media archive
- export metadata
- export practice logs
- export milestone timeline
- retain a family archive independent of social platforms

### PC-08 Safety controls
Parent can:
- disable or enable public sections
- control contact forms
- review what is public
- set visibility defaults
- remove content instantly
- hide drafts/private items
- manage integration tokens and permissions

---

## 13.4 Content and Media Requirements

### CM-01 Content types
The system must support, at minimum:

- Song
- Performance Video
- Artwork
- Practice Clip
- Reading Note
- Space/Science Entry
- Milestone
- Parent Observation (private only)
- Idea Vault Item (private by default)

### CM-02 Content statuses
Each item must support a lifecycle status:

- Draft
- Review Needed
- Scheduled
- Published
- Failed
- Archived
- Private

### CM-03 Section mapping
Each item must support one or more public sections/collections, e.g.:
- home
- music
- art
- space
- reading
- milestones

This avoids weak one-field tab filtering and allows one item to belong to multiple narratives.

### CM-04 Rich metadata
Each item should support fields such as:
- title
- subtitle
- content type
- created date
- publish date
- description
- story behind the work
- tags/themes
- collections
- linked books
- linked inspirations
- related content items
- platform destinations
- visibility
- hero/featured flag
- licensing/rights note (where applicable)

### CM-05 Media handling
The system should support:
- original file retention
- derivative generation
- thumbnails
- previews
- embed URLs
- caption/subtitle fields
- mobile-friendly formats

### CM-06 Rights and consent tracking
For each public item, the system should optionally track:
- original vs cover
- usage notes
- licensing/rights note
- consent/approval status
- platform restrictions or warnings

---

## 13.5 Publishing and Distribution Requirements

The portal must support a staged publishing model because platform integrations vary in complexity.

### Distribution goals
- reduce duplicate effort
- keep website as source-of-truth archive
- support automation where stable
- preserve manual fallback where APIs fail or permissions expire

### Platform prerequisites
- **YouTube**: official Data API supports video upload and metadata operations.[^yt-data][^yt-insert]
- **YouTube Analytics / Reporting**: official APIs support channel/video reporting for dashboards.[^yt-analytics][^yt-channel-reports][^yt-reporting]
- **Instagram**: Meta's Instagram API supports publishing and insights for Instagram Professional accounts; the account must be linked appropriately through Meta/Page-based permissions.[^ig-postman]
- **Facebook Pages**: Page access tokens are used for Pages a user manages, and Meta's published collection includes Page and Reel publishing flows.[^fb-postman]

### PD-01 Parent-managed channels only
All connected social destinations must be parent-managed assets:
- YouTube channel under parent supervision/control
- Facebook Page controlled by parent
- Instagram Professional account appropriately linked and managed by parent

### PD-02 Publishing destinations
For each publishable item, parent must be able to choose:
- website only
- website + YouTube
- website + Instagram
- website + Facebook
- any approved combination

### PD-03 Platform-specific assets
The system should support platform-specific derivatives:
- long-form video
- short-form reel
- image post
- story-sized visuals (future)
- caption variants
- thumbnail variants

### PD-04 Scheduling
The system should support:
- immediate publish
- future scheduling
- queued retries
- cancel scheduled publish
- reschedule

### PD-05 Failure handling
When a publish fails, the system must:
- mark status as failed
- preserve destination error details for parent/admin view
- allow retry
- allow manual export fallback

### PD-06 Manual fallback
If automation fails, the system should still provide:
- downloadable asset package
- caption text
- thumbnail
- metadata summary

### PD-07 Token and permission health
The system should surface:
- expired tokens
- revoked permissions
- disconnected accounts
- publish destination health warnings

### PD-08 Rate and workflow awareness
The portal should assume external platform limits and approval requirements may change. The system architecture must therefore be resilient to:
- permission changes
- endpoint changes
- token expiry
- temporary API outages

---

## 13.6 Analytics and Growth Requirements

### AG-01 Multi-layer analytics model
The system must track analytics in three layers.

#### Layer A: Creator growth (private)
- practice minutes
- practice streaks
- number of completed works
- diversity of creative activity
- milestone frequency
- confidence notes (parent only)

#### Layer B: Website analytics
- page views
- item views
- top landing pages
- traffic sources
- click-through to videos/social destinations
- search/query performance (future)

#### Layer C: External channel analytics
- YouTube views / watch indicators / channel reporting
- Instagram reach / engagement (where available)
- Facebook reach / reactions / shares (where available)

### AG-02 Parent-only analytics
Public audience metrics should **not** be shown in the Child Hub by default.

The child-facing product should emphasize:
- effort
- completion
- streaks
- learning
- creative pride

### AG-03 Cross-platform item rollups
For each content item, the system should eventually support combined rollups such as:
- website views
- YouTube views
- Instagram reach
- Facebook reach
- total combined interactions

### AG-04 Insights and recommendations
The dashboard should generate useful summaries such as:
- best-performing content themes
- best day/time to publish
- original vs cover performance
- short vs long-form performance
- music vs art vs reading/space content resonance

### AG-05 Reporting cadence
Support at least:
- daily snapshots
- weekly summaries
- monthly summaries
- milestone alerts

---

## 13.7 Safety, Privacy, and Compliance Requirements

This section is critical because the creator is under 13.

### SP-01 Parent-managed identity
The product must be designed as a **parent-managed portal**, not a child-operated public social product.

Google states that younger children can use supervised Google Accounts via Family Link, and YouTube supports supervised experiences with parental controls; parents also provide consent for under-age supervised use of Google services.[^google-age][^family-link][^youtube-supervised][^google-parent-consent]

### SP-02 Minimal personal data collection
The system should collect only the data required to operate the product.

At launch, avoid:
- public account registration
- open community profiles
- direct messaging to the child
- precise location history
- school details
- routine schedules

### SP-03 Child privacy awareness
If the site is directed to children under 13 or has actual knowledge that it is collecting personal information from a child under 13, COPPA can apply.[^coppa-rule][^coppa-faq]

### SP-04 No public comments in v1
Public comments and open messaging are out of scope for launch.

### SP-05 Parent-only contact routing
All inquiry flows must route to parents/guardians only.

### SP-06 Public metadata hygiene
The system should avoid public exposure of:
- exact address
- exact school
- recurring routine
- sensitive family details
- real-time location
- travel plans before they happen

### SP-07 Consent and legal review
Before launch, the family should review:
- privacy notice
- terms
- media consent approach
- analytics and cookies setup
- child data retention practices
- any rights/licensing questions for cover songs or third-party media

### SP-08 No targeted ads or child-data monetization assumptions
Do not build the initial business model around targeted advertising or monetization of child data. In January 2025, the FTC finalized COPPA rule changes that further limited the ability to monetize kids' data without active parental permission.[^coppa-2025]

### SP-09 Emergency takedown
Parent must be able to unpublish or hide any public item immediately.

---

## 13.8 Notifications and Automation Requirements

### NA-01 Parent notifications
Notify parent when:
- upload finishes
- publish succeeds
- publish fails
- token expires
- scheduled post needs attention
- milestone achieved
- weekly summary is ready

### NA-02 Scheduled jobs
System should run scheduled tasks for:
- publish queue checks
- analytics sync
- thumbnail/derivative generation
- reminder summaries
- backup/export jobs

### NA-03 Quiet child experience
The child-facing product should avoid noisy, stressful alerts.

---

## 14. Content Strategy Requirements

## 14.1 Core content pillars

The portal should organize public storytelling into a few repeatable content pillars:

1. **Performance**
   - songs
   - recitals
   - dance videos
   - polished releases

2. **Process**
   - practice moments
   - behind-the-scenes clips
   - growth comparisons
   - milestone stories

3. **Art & Imagination**
   - paintings
   - sketches
   - themed art collections
   - music-art pairings

4. **Books, Space, and Curiosity**
   - reading inspirations
   - science/space notes
   - creative responses to books and facts

5. **Milestones**
   - firsts
   - achievements
   - events
   - year-over-year growth

## 14.2 Narrative requirement
Every content item should, where possible, answer one or more of these:
- What is it?
- Why does it matter?
- What inspired it?
- What did she learn?
- How does it connect to her larger story?

This keeps the website from feeling like a random gallery.

---

## 15. Role-Based Access Control (RBAC)

| Capability | Public Visitor | Child Creator | Parent Admin |
|---|---:|---:|---:|
| View public site | Yes | Yes | Yes |
| View private child log history | No | Yes (own simplified view) | Yes |
| Upload private drafts | No | Limited / guided | Yes |
| Publish content publicly | No | No | Yes |
| Schedule posts | No | No | Yes |
| Connect social accounts | No | No | Yes |
| View detailed analytics | No | No (or very limited) | Yes |
| Edit visibility/privacy settings | No | No | Yes |
| Export archive | No | No | Yes |

---

## 16. Conceptual Data Model

### Core entities

#### `users`
- id
- role (`parent_admin`, `child_creator`)
- name
- email (parent only or limited as appropriate)
- auth identity

#### `creator_profile`
- display name
- bio
- public intro
- artistic themes
- public settings
- theme preference

#### `content_items`
- id
- content_type
- title
- subtitle
- description
- story
- status
- visibility
- created_at
- publish_at
- featured_flag

#### `content_sections`
- item_id
- section_id (`home`, `music`, `art`, `space`, `reading`, `milestones`)

#### `media_assets`
- id
- item_id
- original_path
- derivative_type
- format
- duration
- dimensions
- thumbnail_path
- embed_url

#### `practice_logs`
- id
- created_by
- activity_type
- duration_minutes
- title/topic
- note
- mood
- date

#### `idea_vault_items`
- id
- type
- note
- tags
- source_inspiration
- private_flag

#### `milestones`
- id
- title
- category
- date
- description
- evidence_item_id (optional)

#### `distribution_records`
- id
- item_id
- platform
- destination_account
- publish_status
- external_id
- last_error
- scheduled_for
- published_at

#### `analytics_daily`
- id
- platform
- item_id
- date
- views
- watch_time
- impressions
- likes
- comments
- shares
- saves
- subscribers_delta

#### `parent_observations`
- id
- date
- note
- linked_item_id
- private_flag

#### `integrations`
- id
- platform
- token_status
- scopes/permissions
- connected_at
- expires_at

---

## 17. Non-Functional Requirements

### 17.1 Performance
- Public pages should load quickly on mobile-first networks.
- Media should use optimized delivery and thumbnails.
- Public pages should be CDN-cacheable where possible.

### 17.2 Availability
- Public site should remain available even if third-party publish APIs are degraded.
- Publishing and analytics jobs should fail gracefully without taking down the public site.

### 17.3 Security
- Parent Center must require authenticated access.
- Secrets/tokens must never be exposed client-side.
- File uploads should use secure, scoped URLs.
- Audit logs should exist for publish/unpublish actions.

### 17.4 Privacy
- Separate public and private data cleanly.
- Do not expose private practice notes in public APIs or front-end bundles.
- Minimize analytics identifiers and review cookie behavior before launch.

### 17.5 Accessibility
- Keyboard accessible nav and dialogs
- descriptive alt text
- reduced-motion support
- color contrast validation in both dark and light modes
- touch-friendly controls in Child Hub

### 17.6 Maintainability
- shared design tokens
- reusable component library
- structured content model
- clear environment/config management
- modular integrations

### 17.7 Observability
- publish job logs
- error tracking
- background job monitoring
- token expiry alerts
- analytics sync health monitoring

---

## 18. Technical Architecture and Hosting / Server Requirements

## 18.1 Architecture recommendation

### Core recommendation
At launch, this product **does not need a large dedicated server**. The recommended architecture is:

- **Public frontend** on CDN/static-capable hosting
- **Authenticated app/API layer** for Parent Center and Child Hub
- **Managed database**
- **Object storage** for originals and generated media
- **Background job worker** for publishing, derivatives, analytics sync
- **CDN** in front of public assets/pages

### Why this is the right approach
The public site is mostly read-heavy, while the private/admin side is operation-heavy. These workloads are better split across:
- fast cached public delivery
- a thin application backend
- asynchronous workers for media and integrations

This reduces cost and operations burden while remaining scalable.

---

## 18.2 Recommended hosting by phase

| Phase | Recommended hosting model | Notes |
|---|---|---|
| Prototype | static/CDN host only | good for front-end demos with mock data |
| MVP | CDN-hosted frontend + serverless/API backend + managed DB + object storage | no dedicated always-on server required |
| Automation phase | add queue/worker service | needed for scheduled posting, analytics sync, derivative generation |
| Growth phase | scale workers separately; keep public site CDN-first | public traffic and background jobs can scale independently |

---

## 18.3 Recommended server profile by phase

### Prototype / UI demo
- no dedicated backend server required
- local or static JSON data is enough

### MVP production
Use:
- serverless functions or a small containerized backend
- managed Postgres
- object storage with signed upload URLs
- CDN for public delivery

This avoids routing large video uploads through an expensive always-on web server.

### Publishing + media phase
Add one worker service for:
- video derivative generation
- thumbnails
- short clip generation
- scheduled publish jobs
- analytics sync jobs

**Suggested starting worker size:**
- 2 vCPU
- 8 GB RAM
- 100+ GB ephemeral or attached work storage (depending on processing approach)

### Heavier media growth phase
If video editing/transcoding becomes frequent:
- separate media worker pool
- 4 vCPU / 16 GB RAM workers or managed media processing service
- queue-based orchestration
- lifecycle rules for raw file retention and archival storage

### Storage recommendation
Start with:
- **200-500 GB object storage** if preserving original phone-quality videos and artwork
- lifecycle policies for old derivatives
- backup/export strategy for family archive

### CDN/media recommendation
- serve public pages and images through a CDN
- prefer embeds or externally optimized playback for large public video
- keep original masters in private storage

### Authentication recommendation
- parent login with modern auth provider
- child login only if needed, and kept very limited
- role-based route protection

---

## 18.4 Suggested application architecture

### Frontend
- React or Next.js
- route-based public pages
- authenticated parent/child areas
- theme tokens for dark/light modes

### Backend/API
- content CRUD
- auth/session handling
- schedule queue control
- integration token management
- analytics ingestion endpoints
- contact form routing to parents

### Data layer
- managed Postgres for structured product data
- analytics snapshots in relational tables to start

### Storage layer
- object storage for originals, derivatives, and exports

### Worker layer
- scheduled jobs
- publishing jobs
- token refresh/health checks
- derivative generation

### Monitoring
- logs
- error tracking
- job status dashboards
- backup/restore checks

---

## 19. Integration Requirements and Assumptions

### 19.1 Google / YouTube
Requirements are based on official Google help and developer documentation:

- children under 13 can use supervised Google Accounts through Family Link under parent management[^family-link]
- YouTube supports supervised experiences and parental controls for kids' accounts[^youtube-supervised][^youtube-parent-controls]
- YouTube Data API supports uploads and metadata operations[^yt-data][^yt-insert]
- YouTube Analytics / Reporting APIs support channel and content reporting[^yt-analytics][^yt-channel-reports][^yt-reporting]

**Product implication:**  
Use a parent-controlled or supervised Google/YouTube setup and keep YouTube publishing under parent-operated workflows.

### 19.2 Instagram
Meta's current published Instagram collection indicates:
- Instagram Graph/API support for **Instagram Professionals** (Businesses and Creators)
- content publishing
- insights
- Page-linked permission model[^ig-postman]

**Product implication:**  
Instagram automation must be designed around a parent-managed Professional account properly linked via Meta/Page permissions.

### 19.3 Facebook Pages
Meta's published Facebook collection indicates:
- Page access token flow for managed Pages
- Reel publishing support through Page-based publishing endpoints[^fb-postman]

**Product implication:**  
Facebook automation should target a **parent-managed Facebook Page**, not a child's personal account.

### 19.4 Compliance / privacy
FTC guidance indicates COPPA may apply to child-directed services or services with actual knowledge of collecting personal information from children under 13.[^coppa-rule][^coppa-faq]

**Product implication:**  
Launch should be privacy-first and legal review should happen before enabling any features that materially expand data collection or public interaction.

---

## 20. Release Plan

## Phase 0 — Brand + foundation
**Goal:** establish identity and safe structure

Deliverables:
- naming and visual direction
- Moonlit Studio + Storybook Atelier theme concepts
- public information architecture
- RBAC model
- content schema
- privacy-first public rules

## Phase 1 — Core portal MVP
**Goal:** make the portal useful immediately

Deliverables:
- public site
- Parent Center auth
- Child Hub basics
- content studio
- content detail pages
- practice logs
- milestone system
- archive basics
- manual website publishing

## Phase 2 — Publishing engine
**Goal:** reduce operational effort

Deliverables:
- schedule queue
- platform destination selection
- YouTube publishing integration
- publish logs
- retries/failure states
- downloadable manual fallback package

## Phase 3 — Social distribution expansion
**Goal:** centralized multi-platform distribution

Deliverables:
- Instagram Professional integration
- Facebook Page integration
- platform-specific caption/assets
- token health checks
- scheduled multi-platform posting

## Phase 4 — Unified analytics
**Goal:** learn what works

Deliverables:
- cross-platform dashboard
- content-level rollups
- weekly/monthly reports
- theme and timing insights
- creator growth summaries

## Phase 5 — Growth and media kit
**Goal:** build reach in a safe, sustainable way

Deliverables:
- media/contact page
- collaboration workflows
- press-friendly bio package
- branded collections
- newsletter or update list (parent-managed, if approved)
- searchable archive

---

## 21. Acceptance Criteria by Milestone

## MVP acceptance criteria
- public site renders only published, public items
- child can log at least five creation types
- parent can create/edit/publish/archive content
- public contact form routes to parent only
- dark and light artistic themes are available
- private data is not exposed publicly
- archive export is possible in basic form

## Publishing phase acceptance criteria
- parent can schedule at least one item for later publishing
- system records publish success/failure by destination
- system supports retry
- system generates a manual fallback package when automation fails

## Analytics phase acceptance criteria
- dashboard shows website metrics
- dashboard shows YouTube metrics where connected
- dashboard can associate analytics with content items
- child-facing view does not show public vanity metrics by default

---

## 22. KPIs and Success Metrics

## 22.1 Creator growth KPIs
- weekly practice minutes
- practice streak length
- number of creations completed per month
- number of new songs learned
- number of art pieces completed
- number of reading/curiosity entries

## 22.2 Audience growth KPIs
- public site visits
- repeat visitors
- YouTube channel growth
- video views and watch indicators
- Instagram reach/engagement
- Facebook reach/engagement

## 22.3 Brand development KPIs
- branded search traffic
- direct visits
- collaboration inquiries
- performance/event invitations
- newsletter signups (if enabled)
- return visits to milestone/content pages

## 22.4 Operational KPIs
- time from upload to publish
- publish failure rate
- token health incidents
- archive completeness
- analytics sync success rate

## 22.5 Safety KPIs
- zero direct child contact pathways
- zero accidental exposure of private items
- zero public display of restricted metadata
- time to takedown / unpublish
- privacy review completion before launch

---

## 23. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| Child overexposure | public success can create pressure and privacy risk | parent-managed workflow, no public comments, minimal personal data |
| API/platform changes | social posting workflows can break | manual fallback, queue design, token health monitoring |
| Token expiry / permission loss | publish jobs fail unexpectedly | integration health dashboard, renewal alerts |
| Family burnout from constant posting | product becomes stressful | prioritize weekly rhythm, not daily pressure |
| Metrics affecting self-esteem | child may focus on views instead of joy | keep vanity metrics parent-only in default child experience |
| Content rights issues | songs/covers may require review | track rights notes and review before publish |
| Storage costs | raw video archives grow fast | lifecycle policies, archival tiers, derivative cleanup |
| Generic branding | site feels like a template, not a world | strong design system with dark/light artistic modes |
| Public/private leakage | private logs or draft items exposed | strict visibility rules, RBAC, test coverage |

---

## 24. Recommended Weekly Operating Rhythm

### Monday
- set weekly missions
- choose one focus song / project
- add one reading or curiosity prompt

### Midweek
- log practice
- add one private draft or idea
- capture one reflection

### Friday / Saturday
- record one polished or semi-polished piece
- parent reviews what might be publishable

### Weekend
- schedule one core release
- generate 1 long version + 1-2 short versions
- review analytics from prior week
- celebrate one milestone

This cadence is sustainable and supports growth without turning creativity into pressure.

---

## 25. Launch Checklist

### Product
- [ ] final brand direction selected
- [ ] dark/light theme system implemented
- [ ] public navigation complete
- [ ] content detail views complete
- [ ] parent and child experiences separated cleanly

### Safety / privacy
- [ ] public contact routed only to parent
- [ ] no public comments enabled
- [ ] no sensitive metadata exposed
- [ ] privacy notice reviewed
- [ ] cookie/analytics behavior reviewed
- [ ] takedown/unpublish flow tested

### Operations
- [ ] backup/export tested
- [ ] publish queue tested
- [ ] manual fallback workflow documented
- [ ] integration token renewal plan documented
- [ ] monitoring and error tracking enabled

### Content
- [ ] at least 10-20 high-quality starter items loaded
- [ ] About page completed
- [ ] milestone timeline seeded
- [ ] reading/space/art sections seeded
- [ ] hero content selected

---

## 26. Open Questions

1. Should the portal use the child's real name publicly, a stage name, or a hybrid identity?
2. Should public comments remain off indefinitely, or could a heavily moderated guestbook exist later?
3. Should the website include a parent-managed newsletter or updates list?
4. Will the portal include original songs only, or also cover songs?
5. What level of rights/licensing tracking is needed for cover performances?
6. Should the Child Hub allow voice-note capture in v1 or v2?
7. Should the public site support event requests or only general contact at launch?
8. Which country-specific privacy/legal review is needed before public launch?
9. Should analytics use a cookieless/minimal configuration first?
10. Should the parent dashboard eventually support collaborator roles (e.g., teacher, editor, designer)?

---

## 27. Product Recommendation Summary

### What to build first
1. Safe public site
2. Parent Center content workflow
3. Child Hub logging and inspiration
4. Archive and milestones
5. YouTube publishing
6. Unified analytics
7. Instagram/Facebook automation

### What makes this portal valuable
- it protects the child while still allowing creative visibility
- it tells a richer story than social profiles alone
- it builds a real body of work
- it reduces operational friction for parents
- it creates a durable long-term creative foundation

### What success looks like after 12 months
A successful first year is **not** "fame." It is:
- a clear artistic identity
- a safe, polished public home
- a preserved body of work
- visible growth in confidence and consistency
- repeatable publishing habits
- usable analytics for parents
- a strong foundation for future opportunities

---

## 28. References

[^google-age]: Google Account Help, "Age requirements on Google Accounts." https://support.google.com/accounts/answer/1350409  
[^family-link]: Google For Families Help, "Get started with Family Link" / "Create a Google Account for your child." https://support.google.com/families/answer/7101025 and https://support.google.com/families/answer/7103338  
[^google-parent-consent]: Google For Families Help, "Provide consent & add supervision to your child's Google Account." https://support.google.com/families/answer/9499456  
[^youtube-supervised]: Google For Families Help / YouTube Help, "Understand YouTube & YouTube Kids options for your child" and "What is a supervised kid account on YouTube?" https://support.google.com/families/answer/10495678 and https://support.google.com/youtube/answer/10314940  
[^youtube-parent-controls]: YouTube Help, "Parental controls & settings for supervised kid accounts on YouTube." https://support.google.com/youtube/answer/13877231  
[^yt-data]: Google for Developers, "YouTube Data API." https://developers.google.com/youtube/v3  
[^yt-insert]: Google for Developers, "Videos: insert | YouTube Data API." https://developers.google.com/youtube/v3/docs/videos/insert  
[^yt-analytics]: Google for Developers, "YouTube Analytics and Reporting APIs." https://developers.google.com/youtube/analytics/  
[^yt-channel-reports]: Google for Developers, "YouTube Analytics API: Channel Reports." https://developers.google.com/youtube/analytics/channel_reports  
[^yt-reporting]: Google for Developers, "YouTube Analytics and Reporting APIs / Reporting API." https://developers.google.com/youtube/reporting/  
[^ig-postman]: Meta / Instagram API documentation on Postman, including Instagram Professionals, Page-linked access, publishing, and insights. https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api  
[^fb-postman]: Meta / Facebook API documentation on Postman, including Page access tokens and Reels publishing flows. https://www.postman.com/meta/facebook/documentation/r56bjfd/facebook-api  
[^coppa-rule]: FTC, "Children's Online Privacy Protection Rule (COPPA)." https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa  
[^coppa-faq]: FTC, "Complying with COPPA: Frequently Asked Questions." https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions  
[^coppa-2025]: FTC press release, January 16, 2025, "FTC Finalizes Changes to Children's Privacy Rule Limiting Companies' Ability to Monetize Kids' Data." https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data