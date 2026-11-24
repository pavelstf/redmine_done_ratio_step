# Verification

Run from the repository root:

```powershell
ruby -c init.rb
ruby -c lib/redmine_done_ratio_step/hooks.rb
node --check assets/javascripts/done_ratio_step.js
ruby -rpsych -e 'Dir["config/locales/*.yml"].each { |f| Psych.parse_file(f); puts "YAML OK: #{f}" }'
git diff --check
node --test test/javascript/context_menu_test.cjs
```

The Node command runs dependency-free context-menu regression tests against a minimal DOM fixture. The other commands check syntax and whitespace. There is no standalone application or full Redmine integration suite in this repository. Do not install dependencies or run migrations solely for this plugin.

On 2026-11-24 all 9 JavaScript regression tests passed with the local fix. Against the pre-fix HEAD, 5 failed and 4 passed, reproducing Status submenu corruption when `back_url` contains `done_ratio`. JavaScript syntax and Git whitespace checks passed. Real browser/Redmine confirmation remains pending.

On 2026-11-17 the Ruby and YAML checks passed with Ruby 3.4.8, and JavaScript syntax passed with Node 24.18.0. Git integrity passed. Ruby required execution outside the Codex sandbox. These tool versions are not a Redmine compatibility matrix.

## Pending Redmine validation

Record the host's Redmine, Ruby, Rails, theme and relevant plugin versions before testing. Install source under `plugins/redmine_done_ratio_step` using the host's existing asset and restart procedure.

- Verify the candidate plugin version (currently 1.0.5) is recognized and its JavaScript asset loads without errors.
- Check new/edit forms, each supported step, 0 and 100, and saving a chosen percentage.
- Preserve off-grid stored percentages when saving unrelated fields.
- Retain the blank/no-change bulk-edit option and isolate it from issue-form fallback state.
- Save/reload enabled and disabled settings.
- Check context menus for one, multiple and all selected issues, including current/disabled choices and permissions. Root-level lists are deliberately left unchanged.
- Check AJAX refreshes and EN/BG settings.
- With Tracker and other filters applied, and with `% Done` present as a column or filter, verify Status still contains statuses and `% Done` contains percentages. Repeat after applying/clearing filters and reopening the menu. Check that each action changes the intended field and returns to the same filtered list.

## Review observations awaiting reproduction

- A manually supplied non-divisor step such as 3 can omit 100.
- Context-menu reconstruction copies template state attributes/classes.
- Without jQuery, a context-menu container inserted after DOMContentLoaded may escape observation.
- The settings checkbox has no explicit hidden off value; verify actual controller behavior.
- Verify the legacy global stored-value fallback during AJAX and bulk-edit flows.

The user confirmed the 1.0.5 context-menu fix on staging and production. On production, the Tracker-filtered list showed status values under Status and percentage values under % Done. The served JavaScript matched the approved ZIP after the fingerprinted asset was refreshed. The broader host checklist above remains open.

## Follow-up from independent QA of 1.0.5

QA passed 26 of 30 browser tests against fixtures based on Redmine 6.1.2. Three failures concerned DR-01 and one concerned DR-04. QA did not exercise a running Redmine server or save changes through live menu actions.

| ID | Finding | Follow-up |
| --- | --- | --- |
| DR-01 | High. The selected 40% appears twice and out of order in the single-issue menu. One entry is actionable. | Fixed locally. Retest exactly 21 choices at step 5, ascending, with one disabled 40% in place. |
| DR-02 | Medium. The plugin step takes precedence in the affected UI over Redmine 6.1's native 5%/10% interval. | Explained in README and EN/BG settings help. The decision about whether to use the native controls on GCR remains open. |
| DR-03 | Medium. The installation ZIP refers to development files it omits and the QA handoff does not bundle the full test evidence. | README now points to the source repository. The 1.0.6 QA handoff ships a separate checksum, scenarios and local results next to the ZIP. |
| DR-04 | Low. A saved step of 3 stops at 99%. | Fixed locally. Retest both the form and menu end at 100%. |
| DR-05 | Low. Menu labels use inconsistent spacing. Read-only and derived-ratio menus keep the native interval. | Generated menu labels now use the native format. Retest that read-only options remain disabled and unchanged. |
| DR-06 | Low. The repository commit-keyword percentage selector uses the native interval. | Documented outside the plugin's scope. |
| DR-07 | Low. Plugin author/URL and license metadata need review. JavaScript is loaded globally even when the plugin is disabled. | Project and author URLs added. MIT notice uses the existing author name. Ruby hook tests cover enabled and disabled behavior and page scope. Browser retest is pending. |

### 1.0.6 QA candidate checks

Passed locally with Node 24.18.0 and Ruby 3.4.8. Run from the repository root:

```text
node --test test/javascript/context_menu_test.cjs
ruby test/ruby/hooks_test.rb
```

The Node suite passed 17 of 17 cases. Ruby checks covered asset scope, disabled hooks, the configured step and the stored-value fallback. Ruby, JavaScript and ERB syntax and EN/BG locale key parity passed. The QA ZIP contains the nine expected installable files, all byte-compared to source. See `QA-1.0.6.md` for the browser retest.

### Independent QA retest, 2026-11-24

The report accepted 1.0.6 for QA/staging. It recorded **40/40 browser fixture tests**, including all 30 earlier scenarios, and **21/21 Ruby hook tests**. All seven findings above were closed. QA also verified the 9,347-byte ZIP, the nine files, and the SHA-256 values for the ZIP and its JavaScript entry.

The report raised two documentation observations. The README now identifies Redmine 6.1.2 as the primary target and distinguishes fixture coverage from live compatibility. The 1.0.6 changelog entry now includes its QA candidate date. These edits apply to the working source. The previously tested ZIP and SHA-256 remain preserved.

Before production, execute the live cases in `QA-1.0.6.md` with the GCR theme and plugins on Redmine 6.1.2. Verify actual issue updates, return to the filtered list, saved queries and the exact fingerprinted script served over HTTP. A live check on Redmine 4.2/5.x and the project's separate Node suite were outside the independent retest; QA recorded the project's Node result from the supplied protocol.

### Follow-up from live staging

The user confirmed the sorted, unique selected choice for an on-grid percentage. An existing percentage outside the native interval had no selected option because Redmine omits that choice from the HTML response. The local follow-up uses the selected issue from the context-menu response to supply the native disabled markup. Retest a single issue saved at 17% with plugin step 5: 17% appears once, disabled between 15% and 20%. With a native interval of 10 and plugin step 5, also test a saved 15%: the generated 15% becomes selected, with no duplicate. Repeat with two selected issues, read-only permissions and a parent with derived percentage. The existing 1.0.6 QA/staging ZIP excludes this follow-up.

### 1.0.7 release validation, 2026-11-24

- Local: 21/21 JavaScript cases passed. Ruby hook tests and syntax checks passed. The Bash deployment script and its embedded Ruby verifier passed syntax checks.
- Staging: the user confirmed that 17% appears once, marked and disabled between 15% and 20% at step 5%.
- Production: Rails registered 1.0.7, and the served JavaScript matched the packaged SHA-256. The user confirmed the same 17% behavior and verified that Status shows statuses with a Tracker filter.
- Package: the staging and production ZIPs are byte-identical with SHA-256 `1b10c111e283e1e6b884c30681752ed8f4f2842b8875c5f839726003216184d8`.
