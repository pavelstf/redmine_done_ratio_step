# QA test plan for Done Ratio Step 1.0.5

Use `redmine_done_ratio_step-1.0.5-qa.zip` on a Redmine test environment. The QA ZIP is a copy of the artifact confirmed on GCR staging and production.

- Size: 8,202 bytes.
- SHA-256: `cf2aaaa53b92a5e01b85450adc9ee67bb1ac4800d4b9e15ff04ce2027198da16`.
- Install folder: `plugins/redmine_done_ratio_step`. Back up any existing plugin, replace its files with the archive contents, refresh the plugin JavaScript using the host's asset publishing procedure, and restart Redmine. The plugin has no migrations.
- Confirm 1.0.5 in **Administration → Plugins**. If the host serves a fingerprinted JavaScript file, verify that the HTTP body matches the packaged JavaScript. Its SHA-256 is `b16608bcce0327baf998f0981aa21c0c982c21a50482d28c8ffa7a1241d54785`.

| Test | Expected result |
| --- | --- |
| Apply a Tracker filter and show the % Done column. Right-click an editable test issue. | Status contains status options. % Done contains percentages at the configured step. |
| Change the status and then the percentage on a disposable test issue. | Each action updates the intended field and returns to the filtered list. |
| Clear and reapply filters. Repeat with a saved query and a % Done filter where available. | Reopening the menu keeps both sets of choices distinct. |
| Check single, multiple and all-selected cases. | The native menu layout stays intact. Percentage choices appear only where Redmine permits them. |
| Edit an issue with an off-grid value and open bulk edit. | The stored value stays selected in the issue form. Bulk edit retains its blank option. |

Record the Redmine version, browser, active filters, and the result of each case. For a failure, capture the menu and the URL of the JavaScript loaded by the browser.
