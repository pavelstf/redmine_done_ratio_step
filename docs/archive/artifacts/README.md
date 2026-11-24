# Package deliveries and QA evidence

This archive preserves the delivered packages, checksums, scripts and QA records from the 1.0.5 through 1.0.7 work. The production release source remains tagged `v1.0.7`. See the [handoff](../../../HANDOFF.md) for the final state.

| Version | Archived deliveries |
| --- | --- |
| 1.0.7 | [Production](Production-v1.0.7/) and [staging](Staging-v1.0.7/). Both ZIP files are byte-identical. |
| 1.0.6 | [Staging](Staging-v1.0.6/) and [QA](QA-v1.0.6/), including the [QA report](QA-v1.0.6/QA_Report_redmine_done_ratio_step_1.0.6.pdf). |
| 1.0.5 | [Staging](Staging-v1.0.5/) and [QA](QA-v1.0.5/), including the [QA report](QA-v1.0.5/QA_Report_redmine_done_ratio_step_1.0.5.pdf) and the original packaging script and instructions. |

To verify the copies, run `sha256sum -c SHA256SUMS` from this directory. The [manifest](SHA256SUMS) covers the archived delivery files. The [approved release packages](../../../release_packages/README.md) and [1.0.7 production runbook](../../PRODUCTION-1.0.7.md) remain the references for installation and rollback.
