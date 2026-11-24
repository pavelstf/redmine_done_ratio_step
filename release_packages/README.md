# Release packages

## 1.0.5 for GCR production

- File: `redmine_done_ratio_step-1.0.5-production-20261124.zip`
- Size: 8,202 bytes
- SHA-256: `cf2aaaa53b92a5e01b85450adc9ee67bb1ac4800d4b9e15ff04ce2027198da16`
- Archive root: `redmine_done_ratio_step/`
- Byte-identical to the staging-approved ZIP. Production validation passed after refreshing the fingerprinted JavaScript. The user confirmed that with a Tracker filter applied, Status shows statuses and % Done shows percentages.
- Production HTTP asset SHA-256: `b16608bcce0327baf998f0981aa21c0c982c21a50482d28c8ffa7a1241d54785`, matching the JavaScript entry in the ZIP.
- Manual update and rollback: `scripts/production-install-1.0.5.sh` and `scripts/production-rollback-1.0.5.sh`.

## Historical 1.0.4 package

`redmine_done_ratio_step-1.0.4.zip` was preserved unchanged from the relocated workspace.

- Size: 8,422 bytes
- SHA-256: `4062431F56F82E2266CB4F59574528FBA6B4DFD4A218365C3743C89CED928071`
- Archive root: `redmine_done_ratio_step/`
- Staging/production approval: unknown
- Exact byte equivalence to the source checkout: not established

This is an existing historical artifact, not a newly built or newly approved release. It predates the repository documentation cleanup.
