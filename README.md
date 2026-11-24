# Redmine Done Ratio Step

UI-only plugin for Redmine that changes the `% Done` / `Percent Complete` (`done_ratio`) options
from the default 10% increments to a configurable step (default **5%**).

## Compatibility
- Redmine **4.2+** (designed to work on 5.x as well)
- No DB migrations, no gem dependencies, no core view overrides.

## What it does
- Rebuilds `done_ratio` options in:
  - New/Edit issue forms
  - Bulk edit form (if present)
  - Issues list context menu (% Done submenu)

## Bugfixes
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

- [Current handoff](HANDOFF.md)
- [Verification and pending runtime checks](docs/TESTING.md)
- [Historical package provenance](release_packages/README.md)

`docs/archive/` preserves historical migration and deployment materials. Its deployment script is reference material requiring review before use. No production deployment is performed by the local verification commands.
