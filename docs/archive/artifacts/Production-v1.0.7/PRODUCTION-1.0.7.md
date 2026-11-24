# Done Ratio Step 1.0.7 за GCR production

На staging потребителят потвърди, че при стъпка 5% записаните 17% са маркирани и неактивни между 15% и 20%. Production ZIP е копие на този пакет.

- Архив `redmine_done_ratio_step-1.0.7-production-20261124.zip`, 9 977 байта.
- SHA-256 на ZIP `1b10c111e283e1e6b884c30681752ed8f4f2842b8875c5f839726003216184d8`.
- SHA-256 на JavaScript `8189a87085bca16e45c6e48a2167c7a5d47831e4b5882d505abef8632a4601b9`.

Качи ZIP файла и `production-1.0.7.sh` в `/home/gcrbgcaa/redmine/plugins/`. Изпълни като `gcrbgcaa`:

```bash
clear
bash /home/gcrbgcaa/redmine/plugins/production-1.0.7.sh install
```

Скриптът проверява архива, архивира текущия плъгин, обновява JavaScript и заявява рестарт на Passenger. `SUCCESS` изисква потвърждение на версията в Rails и съвпадение на JavaScript от HTTP отговора с инсталирания файл. Няма миграции или нови gem зависимости.

След `SUCCESS`, презареди с **Ctrl+F5** при включено **Disable cache**. Провери **Administration → Plugins** за версия 1.0.7. В задача със записани 17% при стъпка 5% потвърди, че **% Done** съдържа един маркиран, неактивен **17%** между **15%** и **20%**. При Tracker филтър провери, че **Status** съдържа статуси.

За връщане на версията отпреди обновяването:

```bash
clear
bash /home/gcrbgcaa/redmine/plugins/production-1.0.7.sh rollback
```

Rollback използва записания при инсталацията backup. Възстановява кода и публичния JavaScript и проверява зареждането му по HTTP. Backup файловете остават в `/home/gcrbgcaa/redmine/plugins/`. Логът е `/home/gcrbgcaa/redmine/log/production.log`.
