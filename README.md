# Redmine Done Ratio Step

UI-only plugin for Redmine that changes the `% Done` / `Percent Complete` (`done_ratio`) options
from the default 10% increments to a configurable step (default **5%**).

## Compatibility
- Primary target: **Redmine 6.1.2**. The 1.0.6 QA tests used markup based on 6.1.2 and included a Redmine 5 context-menu fixture. Live acceptance on GCR remains pending.
- Declared minimum: **Redmine 4.2.0**. Live compatibility on 4.2 and 5.x has yet to be verified for 1.0.6.
- No DB migrations, no gem dependencies, no core view overrides.

Redmine 6.1 provides its own **Done ratio options interval** in **Administration → Settings → Issue tracking**. The enabled plugin uses its configured step for the issue controls listed below. It does not change Redmine's saved setting. If the built-in 5% or 10% interval meets your needs, disable the plugin to use the native controls. Repository commit-keyword settings continue to use the Redmine interval.

The plugin loads its script on the native issue pages and on My Page, Roadmap/Versions, Gantt and Calendar, which can display issue context menus. Custom pages supplied by other plugins may need their own integration.

## What it does
- Rebuilds `done_ratio` options in:
  - New/Edit issue forms
  - Bulk edit form (if present)
  - Issues list context menu (% Done submenu)

## Bugfixes
- **1.0.7**: In the single-issue context menu, preserves the saved percentage as one marked, inactive option, even when it falls outside the configured step.
- **1.0.6**: Keeps the current percentage in order as a single disabled entry, always offers 100%, and limits JavaScript loading to enabled issue views.
- **1.0.5** (staging candidate): Prevents filtered return URLs from causing the Status context submenu to be replaced with percentage choices.
- **1.0.4**: Prevents broken context menu visualization when all issues are selected and Redmine exposes `% Done` links outside a nested submenu.
- **1.0.3**: Scopes preserved issue `done_ratio` values to the issue form select and clarifies the required deployment folder name.
- **1.0.2**: Also rebuilds `% Done` values in the issues list context menu to match the configured step.
- **1.0.1**: Preserves non-standard stored `done_ratio` values (e.g. 15%) on edit forms to prevent browser defaulting to 0%.

## Installation
### From a downloaded archive

1. Copy plugin folder into Redmine:
   - `redmine/plugins/redmine_done_ratio_step`
   - The folder name must be `redmine_done_ratio_step`, not `redmine_done_ratio_step_1.0.2` or another versioned directory name.
2. Restart Redmine app server (Passenger/Puma/etc.)
3. Configure:
   - **Administration → Plugins → Done Ratio Step (Percent Complete) → Configure**

### From Git

From the Redmine root directory:

```bash
cd /path/to/redmine
git clone https://github.com/pavelstf/redmine_done_ratio_step.git plugins/redmine_done_ratio_step
touch tmp/restart.txt
```

To update later:

```bash
cd /path/to/redmine/plugins/redmine_done_ratio_step
git pull --ff-only
cd /path/to/redmine
touch tmp/restart.txt
```

## Rollback
- Disable the plugin, or remove the folder and restart.

## Notes
- This plugin changes **only the UI options**. Redmine continues storing `done_ratio` as an integer 0..100.

## Development and project records

The [source repository](https://github.com/pavelstf/redmine_done_ratio_step) contains development tests, QA instructions, release checksums, and historical records. The installation ZIP contains the plugin files. Use the Git tag for your installed version to find the corresponding documentation and tests.
