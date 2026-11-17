# GCR Redmine Environments

Use these fixed values when generating GCR Redmine plugin runbooks.

## Common

```bash
UPLOAD_DIR="/home/gcrbgcaa/uploads"
BACKUP_DIR="/home/gcrbgcaa/plugin-backups"
LOG_FILE="log/production.log"
RESTART_COMMAND="touch tmp/restart.txt"
SSH_USER="gcrbgcaa"
```

Always ask the user to upload plugin zip files to:

```bash
/home/gcrbgcaa/uploads
```

Use backup directory:

```bash
/home/gcrbgcaa/plugin-backups
```

Restart Redmine/Passenger with:

```bash
touch tmp/restart.txt
```

## Staging

```bash
TARGET_ENV="staging"
REDMINE_ROOT="/home/gcrbgcaa/redminestaging"
VENV_PATH="/home/gcrbgcaa/rubyvenv/redminestaging/3.2"
REDMINE_URL="https://www.redminestaging.gcr.bg"
```

Staging log:

```bash
/home/gcrbgcaa/redminestaging/log/production.log
```

## Production

```bash
TARGET_ENV="production"
REDMINE_ROOT="/home/gcrbgcaa/redmine"
VENV_PATH="/home/gcrbgcaa/rubyvenv/redmine612build/3.2"
REDMINE_URL="https://redmine.gcr.bg"
```

Production log:

```bash
/home/gcrbgcaa/redmine/log/production.log
```

Important: production Ruby env is intentionally named:

```bash
/home/gcrbgcaa/rubyvenv/redmine612build/3.2
```

Do not replace it with `/home/gcrbgcaa/rubyvenv/redmine/3.2` unless the user explicitly confirms the environment changed.

## URL Notes

Staging may redirect between `www`, non-`www`, HTTP, and HTTPS. Prefer log validation over assumptions from the browser address bar.

Observed production Redmine URL is:

```text
https://redmine.gcr.bg
```

Do not use `https://www.gcr.bg` as the Redmine production URL unless the user explicitly confirms it.
