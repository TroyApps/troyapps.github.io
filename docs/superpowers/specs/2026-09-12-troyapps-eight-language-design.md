# TroyApps Eight-Language Design

## Goal

Expand the current Turkish and English static site to these public locales:

- `tr` — Turkish at `/`
- `en` — English at `/en/`
- `es-419` — Latin American Spanish at `/es/`
- `pt-BR` — Brazilian Portuguese at `/pt-br/`
- `hi` — Hindi at `/hi/`
- `id` — Indonesian at `/id/`
- `ar` — Arabic at `/ar/`
- `de` — German at `/de/`

The language selector displays the compact labels `TR · EN · ES · PT-BR · HI · ID · AR · DE` and preserves the equivalent page when changing language.

## Scope

Each locale receives:

- a localized homepage;
- a localized Morse Flash product page;
- localized navigation, footer, metadata, accessibility labels, inventory text, and Troy controls/dialogue;
- correct canonical and `hreflang` links;
- a sitemap entry for every localized public page.

Radar remains fully generated in Turkish and English. Visitors using Spanish, Portuguese, Hindi, Indonesian, Arabic, or German are directed to the English Radar page. This prevents the daily summarization job from multiplying its recurring AI output while the rest of the site is localized.

Privacy-policy pages remain outside this localization phase. Existing policy URLs and visibility are unchanged.

## Architecture

The deployed output stays static HTML so GitHub Pages, search engines, no-JavaScript navigation, and the existing Radar injection markers continue to work.

A small locale manifest is the source of truth for locale codes, labels, direction, paths, and fallback behavior. A deterministic build script generates localized HTML from the approved Turkish and English page structures plus locale dictionaries. Generated pages are committed only after final user approval; runtime visitors do not call an AI service.

The build must preserve existing local asset URLs, Troy model wiring, social links, Google Play link, email addresses, Radar markers, and cache-busting query strings.

## Locale Routing

- Turkish uses the existing root routes.
- Other locales use a lowercase folder prefix.
- Language selection maps home to home and Morse Flash to Morse Flash.
- Radar maps `tr` to `/radar/`; every other locale maps to `/en/radar/` during this phase.
- Unknown or incomplete locale data falls back to English at build time, never by fetching translation data in the browser.

## Arabic and Layout

Arabic pages use `<html lang="ar" dir="rtl">`. Text flow, navigation, menus, panels, and alignment follow RTL, while brand marks, model controls, email addresses, URLs, code, and numeric telemetry retain readable left-to-right presentation where needed.

The existing responsive breakpoints remain authoritative. RTL overrides are limited to directional properties and must not create a separate visual theme.

## Translation Quality

Brand and product names remain unchanged: `TroyApps`, `Troy`, `Morse Flash`, and `Radar`. Translations should be concise enough to fit the current command-center layout. Troy keeps the same sarcastic but playful personality without literal translations that become insulting, unnatural, or culturally awkward.

Latin American Spanish copy is authored as `es-419`, although the selector label and URL remain `ES` and `/es/`.

## Verification

Automated tests must fail before implementation and then verify:

- all 8 locale homepages and Morse Flash pages exist;
- HTML `lang`, Arabic `dir`, canonical URLs, and complete `hreflang` clusters are correct;
- every language menu has exactly 8 options and keeps page context;
- required Troy, social, email, Google Play, and local asset references remain intact;
- Troy copy resolves every supported locale without silently using Turkish;
- Radar links follow the agreed TR/EN fallback;
- sitemap entries cover all localized public pages;
- all existing tests remain green.

After automated checks, the local preview is inspected at desktop and mobile widths, with special attention to long German labels, Hindi font rendering, the PT-BR selector width, and Arabic RTL.

## Release Boundary

This work changes only the local branch. It does not commit, push, deploy, or alter the scheduled Radar workflow until the user approves the complete site.
