# Changelog

## 1.0.7 (staging candidate, 2026-11-24)
- Show a single issue's saved percentage as a marked, disabled choice even when the Redmine interval omits it from the native context menu.

## 1.0.6 (QA candidate, 2026-11-24)
- Keep the selected percentage in its sorted context-menu position as a single, disabled entry.
- Always include 100% in generated form and context-menu choices, including when a saved step does not divide 100.
- Match the native percentage label format in the context menu.
- Explain when the plugin step applies and how to use Redmine's built-in interval. Point installation ZIP readers to the source repository for tests and release records.
- Load the JavaScript only when enabled on supported Redmine issue pages and suppress the issue-form fallback when disabled.
- Complete plugin metadata with the repository link, author profile and existing author attribution.

## 1.0.5 (staging candidate, 2026-11-24)
- Fix: match only direct done-ratio action parameters in context-menu URLs. A `done_ratio` column or filter inside an encoded `back_url` must not cause the Status submenu to be rebuilt as percentages.
- Add dependency-free JavaScript regression tests for filtered return URLs, direct parameter encodings, absent percentage actions and root-level menu protection.

## 1.0.4
- Fix: avoid rebuilding root-level context menu lists when Redmine does not render `% Done` as a nested submenu, preventing broken visualization when all issues are selected.

## 1.0.3
- Hardening: scope preserved issue `done_ratio` values to the issue form select before falling back to the legacy global value.
- Documentation: clarify canonical plugin folder name for deployment.

## 1.0.2
- Fix: also apply configured step to the issues list context menu (% Done submenu)

## 1.0.1
- Fix: preserve and preselect non-standard stored done_ratio values (e.g., 15%) on edit form to prevent accidental overwrite to 0%

## 1.0.0
- Initial release: configurable `% Done` (`done_ratio`) dropdown step (default 5%)
