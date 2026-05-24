# Changelog

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
