# Staging в GCR Redmine 6.1.2

Пакетът е копие на ZIP архива, приет при повторния QA тест. Размерът е 9 347 байта, със SHA-256 `0f84da86f9bdaa8253a77e31432627add44dc3a1fe61d0fd4e9d848a721b1373`. Документационните корекции след QA са в работния код.

Качи двата файла в `/home/gcrbgcaa/redminestaging/plugins/`:

- `redmine_done_ratio_step-1.0.6-staging-20261124.zip`
- `staging-1.0.6.sh`

В cPanel или SSH терминала като `gcrbgcaa`:

```bash
clear
bash /home/gcrbgcaa/redminestaging/plugins/staging-1.0.6.sh install
```

Инсталаторът очаква вече инсталиран плъгин в обикновена директория. Той проверява ZIP файла, архивира текущия код, обновява публичния и съществуващите fingerprinted JavaScript файлове и заявява рестарт на Passenger. Проверява версията в Rails и сравнява HTTP отговора за JavaScript с инсталирания файл. Не са нужни миграции.

Изчакай `SUCCESS`, отвори staging и направи **Ctrl+F5** с **Disable cache**. Потвърди 1.0.6 в **Administration → Plugins**. Изпълни сценариите от `QA-1.0.6.md`, особено 40% при една задача, Status при Tracker филтър, запазена заявка и реален запис на статус и процент върху тестови задачи. В **Network** провери, че заявката е за пътя, който скриптът отпечата, и че файлът съвпада с SHA-256: `9c2c65f270ba146e8016ea20e265f7a57e97346ae876510b836848163336503a`.

За връщане на предишната версия:

```bash
clear
bash /home/gcrbgcaa/redminestaging/plugins/staging-1.0.6.sh rollback
```

Rollback използва записания от инсталацията backup, архивира заменяния код и проверява възстановения JavaScript по HTTP. Backup файловете остават в staging `plugins/`. Логът на приложението е `/home/gcrbgcaa/redminestaging/log/production.log`.
