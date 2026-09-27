# Аудит Rise UI Kit

- **Объект:** `@ramzes1385/rise-ui-kit` 1.2.5, исходный коммит `9c848ae` (ветка `main`; более новый коммит релиза 1.3.0 в `origin/main` в аудит не входил); Vue 3.5, TypeScript 6, Vite 8 (rolldown), Storybook 10.4, Vitest 4.1, Playwright 1.60.
- **Результат:** правки в рабочей копии **без коммитов, push и публикации**; этот отчёт и приложения — в `docs/audit/`.
- **Документы:** [COMPONENT_MATRIX.md](./COMPONENT_MATRIX.md) — все 51 компонент; [ROADMAP.md](./ROADMAP.md) — план развития; [MEDIA_PLAYER_PLAN.md](./MEDIA_PLAYER_PLAN.md) — архитектура аудио/видеоплеера; `findings/<группа>.md` — полный реестр находок P0–P3 по группам с доказательствами; `visual-changes/` — снимки «до/после» для изменившихся visual-эталонов.

## Как проводился аудит

1. **Базовая линия до изменений.** Чистая копия HEAD, `npm ci` в изоляции (с lifecycle-скриптами), затем все проверки проекта: lint, типы, unit/integration и четыре зоны покрытия, гейты stories/a11y, сборка библиотеки, `npm pack`, сборка Storybook, Playwright e2e и visual, проход каждой story в Chromium, `npm audit`. Старые `dist`, `storybook-static` и отчёты покрытия доказательством не считались — всё пересобрано.
2. **Ревью по группам.** 51 компонент разбит на 9 групп (отображение, формы, выбор значений, оверлеи, навигация, даты, таблица и дерево, редактор и чат, медиа); по каждому компоненту — исходники, composables, utils, тесты, stories и примеры README. В реестр попадало только подтверждённое кодом (с указанием строк и сценария); гипотезы, требующие браузера, помечены отдельно.
3. **Исправления.** Только подтверждённые дефекты и локальные недочёты с сохранением публичного API. На каждое исправление — регрессионный тест, который падал на исходном коде. Крупные изменения (новые компоненты, слой оверлеев, смена контрактов, breaking changes) — в ROADMAP, не в коде.
4. **Перепроверка.** Статусы находок сверены с `git diff` и тестами; проверки повторены на итоговом коде (§5), плюс проверка пакета глазами потребителя (`.tgz` в чистом Vue+TS-приложении), клавиатурные сценарии в Chromium и независимая сверка отчёта с логами и кодом.

Приоритеты: **P0** — блокирующая проблема (потеря данных, серьёзная уязвимость, неработоспособность основного сценария); **P1** — значимый дефект функциональности, интеграции или выпуска; **P2** — локальный дефект, пробел в тестах, доступности или сопровождаемости; **P3** — необязательное улучшение.

## Краткая оценка

**Состояние.** Кит широкий (51 компонент, 69 composables, 20 модулей utils) и хорошо обложен unit/integration-тестами (3262 теста до аудита), но качество неравномерное. Простые компоненты в целом пригодны; составные виджеты (Select, Tree, MegaMenu, DatePicker, выпадающие панели, тултипы) не соответствуют паттернам WAI-ARIA APG; у оверлеев нет общего слоя. Основные риски до аудита были не в логике компонентов, а вокруг неё: npm-пакет тащил тестовый рантайм Storybook и ломал типы потребителя, иконки у потребителя не находились, три блокирующих дефекта в BaseImage/BaseEditor, ошибки типов в тестах и визуальные регрессии, которые CI не ловил или «лечил» автокоммитом. По итогам оценки после исправлений: из 51 компонента 3 — «стабилен», 31 — «пригоден с оговорками», 17 — «требует доработки»; доступность — «ок» у 6, «частично» у 29, «нет» у 16 ([COMPONENT_MATRIX.md](./COMPONENT_MATRIX.md)).

**Главное из сделанного.**
- Закрыты оба P0-дефекта, которые исправляются локально: stored-XSS через автоконвертацию HTML в BaseEditor (EDT-1) и поломка любого локального изображения из-за принудительных AVIF/WebP-источников (IMG-2); два других P0 (IMG-1 — lazy-изображения, ICON-1 — иконки у потребителя) исправлены частично.
- Пакет: из `dist` убран рантайм Storybook (−29% размера пакета; у приложения, импортирующего namespace `utils`, бандл 923 → 463 КБ), исправлены типы (`TS2307` у потребителя), спрайт иконок доступен по подпути `./icons.svg` и настраивается опцией плагина.
- Доступность и фокус: диалоги (Modal, Slideover) получили роль, ловушку и возврат фокуса; общий счётчик блокировки прокрутки; клавиатура у Tabs, Accordion, Menu, DatePicker, таблицы; кнопка в loading не теряет фокус. Всего из 58 находок P1 исправлены 33, частично — 10.
- Безопасность ссылок: `javascript:` и другие опасные схемы больше не исполняются при навигации и скачивании.
- Инфраструктура: проверка типов тестов в CI, visual-эталоны больше не перезаписываются автоматически в PR, починен docgen Storybook (описания props и slot-аргументы), корневой `vitest.config.ts` снова запускается, `navigationUtils` возвращён под порог покрытия.
- README приведён к реальному API (≈30 примеров, проверены `vue-tsc`).

**Проверки.** Lint 0; типы 0 ошибок (было 8); 189 файлов / 3608–3610 тестов зелёные (было 183 / 3262), все четыре зоны покрытия проходят пороги; сборка библиотеки, `npm pack`, сборка Storybook — успешно; e2e 57/57; visual 222/240 — все 18 падений объяснены (11 ожидаемых изменений от исправлений, 7 — недоступные внешние изображения, одинаково до и после); каждая из 1186 stories проходит рендер и play в Chromium (было 3 ошибки рендера и 19 падений play), stories с нарушениями axe 390 → 292. Не проверялись: GitHub Actions, Safari/Firefox/мобильные, скринридеры, SSR, RTL (§5.8).

**Аудит не завершает работу над китом.** Открыты 15 P1 и 144 P2 (крупные — слой оверлеев, паттерны APG для составных виджетов, атрибуты форм на нативный контрол, санитизация BaseEditor, контраст токенов), 11 visual-эталонов нужно перегенерировать после просмотра, изменения не закоммичены. Приоритеты — §4 и [ROADMAP.md](./ROADMAP.md).

## 1. Подтверждённые проблемы

В реестр вошли только находки, подтверждённые кодом (с указанием файла и строк на коммите `9c848ae`, условия и сценария воспроизведения). Гипотезы, требующие браузера или устройства, вынесены в раздел A4 файлов `findings/<группа>.md` и в счёт не входят. Одна проблема, затрагивающая две группы, могла попасть в обе (например, SEL-1 = DRP-1, PCK-3 = OVL-1, FU-13 = CHAT-11), поэтому итог слегка завышен.

### 1.1. Сводка

В ячейках: всего (исправлено / частично / не исправлено).

| Группа | P0 | P1 | P2 | P3 | Всего |
|---|---|---|---|---|---|
| Отображение | — | 3 (1/0/2) | 24 (6/4/14) | 28 (1/2/25) | 55 |
| Формы | — | 7 (3/1/3) | 22 (2/2/18) | 13 (0/0/13) | 42 |
| Выбор значений | — | 8 (5/2/1) | 19 (2/0/17) | 21 (1/1/19) | 48 |
| Оверлеи | — | 5 (2/2/1) | 27 (5/4/18) | 20 (0/0/20) | 52 |
| Навигация | — | 5 (4/0/1) | 33 (8/5/20) | 18 (0/0/18) | 56 |
| Даты | — | 3 (2/1/0) | 11 (2/2/7) | 7 (0/0/7) | 21 |
| Таблица и дерево | — | 10 (3/3/4) | 17 (2/2/13) | 8 (0/1/7) | 35 |
| Редактор и чат | 1 (1/0/0) | 7 (5/0/2) | 24 (2/0/22) | 14 (0/2/12) | 46 |
| Медиа и иконки | 3 (1/2/0) | 6 (4/1/1) | 15 (2/2/11) | 14 (2/2/10) | 38 |
| Сборка, пакет, CI, тесты (§1.2) | — | 4 (4/0/0) | 9 (3/2/4) | 4 (2/0/2) | 17 |
| **Итого** | **4** (2/2/0) | **58** (33/10/15) | **201** (34/23/144) | **147** (6/8/133) | **410** |

Итого 410 находок: исправлено 75, частично 43, не исправлено 292.

### 1.2. Сборка, пакет, конфигурация, CI и тестовая инфраструктура

Находки координатора аудита (вне групп компонентов). Номера строк — по HEAD `9c848ae`.

#### PKG-1 · P1 · npm-пакет — в `dist` попадает тестовый рантайм Storybook
- **Где:** `src/utils/index.ts:15` (`export * from './storybookUtils'`), `src/utils/storybookUtils/storybookUtils.ts` (импорт `storybook/test`), `build/config/build.lib.ts:27` (`external: ['vue']` — всё остальное бандлится).
- **Условия:** любая сборка библиотеки (`npm run build:lib`, `npm pack`, релиз).
- **Последствие:**
  - в пакете `dist/chunks/utils-*.js` весом 606 КБ: инструментатор Storybook, chai, `@testing-library/dom`, user-event;
  - tgz 406 КБ вместо 298 КБ, распакованный пакет 2,0 МБ вместо 1,4 МБ;
  - у приложения, которое берёт namespace `utils` из корня (`import { utils } from '@ramzes1385/rise-ui-kit'`), JS-бандл — 923 КБ против 463 КБ после исправления, в нём `storybook/instrumenter`, `chai/inspect`, `@testing-library`, `__STORYBOOK_*` (отдельная сборка варианта приложения-потребителя, §5.6); при именованных импортах из корня и из `/utils` сборщик вырезает этот код tree-shaking'ом и на HEAD;
  - `dist/utils/index.d.ts:15` ссылается на удалённый при сборке `./storybookUtils`: у потребителя с `skipLibCheck: false` — `TS2307: Cannot find module './storybookUtils'` (воспроизведено `vue-tsc` в приложении-потребителе).
- **Воспроизведение:** `npm run build:lib && grep -l storybook dist/chunks/*.js`; приложение-потребитель из §5.
- **Исправление:** реэкспорт `storybookUtils` убран из `src/utils/index.ts` (stories импортируют `@utils/storybookUtils` напрямую, это не менялось). Новый тест-страж `src/__tests__/packageBoundaries.spec.ts`: обходит runtime-импорты всех публичных точек входа (с учётом алиасов, без type-only) и требует, чтобы внешние пакеты входили в `dependencies`/`peerDependencies` и среди них не было `storybook`.
- **Проверка:** `packageBoundaries.spec.ts` (2 теста); после исправления в `dist` нет строк `storybook` (скрипт анализа dist, §5), висячих ссылок в `.d.ts` — 0 (было 1); `vue-tsc` в приложении-потребителе — 0 ошибок (было TS2307); бандл потребителя без рантайма Storybook.
- **Статус:** Исправлено. Изменение API: из namespace `utils` исчезли помощники stories (`buildArgTypes`, `play*`, `getA11yParameters`, `STORY_WAIT_TIMEOUT`) — у потребителя они не работали без `storybook/test`; отражено в README («Изменения поведения»).

#### PKG-2 · P1 · npm-пакет — спрайт иконок нельзя получить по пути пакета (часть ICON-1)
- **Где:** `package.json:33-69` (`exports` без `./icons.svg`), связанная P0-находка ICON-1 (media).
- **Условия:** приложение ставит пакет из npm и использует `BaseIcon`.
- **Последствие:** `exports` закрывает глубокие импорты, поэтому `@ramzes1385/rise-ui-kit/dist/icons.svg` недоступен сборщику; спрайт ищется по относительному `icons.svg` от URL страницы. В приложении-потребителе на HEAD: запрос `/icons.svg` → 404 на `/`, `/users/icons.svg` → 404 на `/users/42`, иконка не рисуется (размер `<use>` 0×0).
- **Исправление:** в `exports` добавлен `"./icons.svg": "./dist/icons.svg"`; путь спрайта настраивается `createUiKitPlugin({ iconSpritePath })` / `createIconPlugin({ spritePath })` (исправление ICON-1, группа media); README описывает подключение.
- **Проверка:** приложение-потребитель: `import iconSpriteUrl from '@ramzes1385/rise-ui-kit/icons.svg?url'` + `iconSpritePath` → спрайт 200 на `/` и `/users/42`, иконка 10×10 (§5).
- **Статус:** Исправлено (подпуть). Остаток ICON-1 (путь по умолчанию всё ещё относительный) — в реестре media.

#### CFG-1 · P2 · Vitest — корневой `vitest.config.ts` падает на старте
- **Где:** `vitest.config.ts:7` (`import '@storybook/addon-vitest/vitest-plugin'`); аддон удалён из devDependencies в `900df6b`.
- **Условия:** `npx vitest …` без `--config`, расширения Vitest в IDE (берут корневой конфиг).
- **Последствие:** `Startup Error … ERR_MODULE_NOT_FOUND: Cannot find package '@storybook/addon-vitest'` — тесты не запускаются.
- **Исправление:** корневой конфиг теперь просто реэкспортирует `build/tests/vitest.config.ts`.
- **Проверка:** `npx vitest run src/utils/idUtils/idUtils.spec.ts` (без `--config`): на HEAD — Startup Error, после — 5/5.
- **Статус:** Исправлено.

#### STB-1 · P2 · Storybook — docgen не работал, slot-аргументы stories не рендерились
- **Где:** `build/storybook/main.ts:129-130` — `vue()` добавлялся в конец списка, после `storybook:vue-docgen-plugin` из `config.plugins`.
- **Условия:** любая сборка/запуск Storybook.
- **Последствие:**
  - docgen дописывает `_sfc_main.__docgenInfo = …` к уже скомпилированному JS; при обратном порядке он дописывался к исходнику SFC и молча отбрасывался парсером — в `storybook-static` HEAD ни у одного компонента нет `__docgenInfo` (0 модулей; после исправления — 53);
  - без docgen Storybook не сопоставляет аргумент `default` со слотом: stories, передающие текст через `args.default`, рендерили пустые компоненты. Visual-эталоны HEAD зафиксировали это: пустая кнопка в `BaseButton` Default/Disabled/Loading, пустое тело `BaseCard` default/hoverable (§5, «Визуальные изменения»);
  - JSDoc с HTML-разметкой в props (`<source type="image/webp">`) ломает сборку Storybook: `Unquoted attribute value cannot contain U+0022` (так упала первая сборка после правки IMG-2).
- **Исправление:** `vue()` ставится первым (`plugins.unshift(vue())`), с комментарием о причине.
- **Проверка:** `npm run build-storybook` — exit 0; `__docgenInfo` в 53 модулях; visual-тесты BaseButton/BaseCard показывают содержимое слотов.
- **Статус:** Исправлено. Visual-эталоны BaseButton ×3 и BaseCard ×2 нужно перегенерировать (не обновлялись автоматически, см. §5).

#### STB-2 · P3 · Storybook — ссылки на удалённый addon-vitest
- **Где:** `build/storybook/main.ts:97` (`'@storybook/addon-vitest'` в `addons`), `scripts/storybook-dev.mjs:10,14,25-31` (патч аддона при каждом `npm run storybook`).
- **Последствие:** аддона нет в зависимостях: патч при каждом старте печатает предупреждение, конфиг ссылается на несуществующий пакет.
- **Исправление:** аддон убран из `addons`, вызов патча — из `storybook-dev.mjs`. Файл `scripts/patch-storybook-coverage-percentage.mjs` больше не используется (удаление — на усмотрение владельца).
- **Проверка:** `npm run build-storybook` — exit 0. Dev-сервер (`npm run storybook`) не запускался.
- **Статус:** Исправлено.

#### CI-1 · P1 · CI — ошибки типов в тестах не проверяются
- **Где:** `.github/workflows/ci.yml:34-35` (`npm run build` = `vue-tsc -p tsconfig.lib.json`, который исключает `*.spec.ts`), в `package.json` нет скрипта полной проверки типов.
- **Последствие:** `npx vue-tsc -b tsconfig.app.json` на HEAD — exit 1, 8 ошибок в 5 spec-файлах (неверный путь импорта типов в двух спеках BaseChat, `trigger('focus'/'blur')` на `DOMWrapper<Element>` в BaseColorPicker/BaseRange/BaseRating). CI этого не видит.
- **Исправление:** ошибки в тестах исправлены (без изменения ожиданий); скрипт `"typecheck": "vue-tsc -b tsconfig.app.json"`; шаг «Type check (app + tests)» в job `lint-and-types`; `ci:validate` включает typecheck.
- **Проверка:** `npm run typecheck` — exit 0. Workflow GitHub Actions не запускался (нет доступа), YAML проверен парсером.
- **Статус:** Исправлено (локально); в CI — не проверено запуском.

#### CI-2 · P1 · CI — visual-эталоны автоматически перезаписываются в каждом PR
- **Где:** `.github/workflows/ci.yml:121-139` (шаги «Regenerate visual baselines on Linux» и «Commit updated baselines to PR» с `if: always()` для любого PR из этого репозитория).
- **Условия:** PR из основного репозитория, в котором упал visual-тест.
- **Последствие:** настоящая визуальная регрессия «лечится» автокоммитом новых скриншотов; проверка перестаёт что-либо проверять. Кроме того, `actions/checkout` без `ref` берёт merge-коммит PR (detached HEAD), а `git-auto-commit-action` по документации требует ветку PR — шаг, вероятно, вообще не может запушить.
- **Исправление:** обновление эталонов — только по метке `visual:update-baselines` (переменная `UPDATE_VISUAL_BASELINES`), checkout ветки PR (`github.head_ref`), `permissions: contents: write` на уровне job.
- **Проверка:** YAML проверен парсером; workflow не запускался.
- **Статус:** Исправлено (не проверено запуском).

#### CI-3 · P2 · npm-скрипты — `test:all` и `ci:validate` расходятся с CI
- **Где:** `package.json:94,105`.
- **Последствие:** `test:all` не запускает пороги composables/utils (в CI они есть), `ci:validate` («полная проверка перед push» в docs) не проверяет типы.
- **Исправление:** `test:all` = components + composables + utils coverage + e2e + visual; `ci:validate` = lint + typecheck + test:unit + pack:dry.
- **Статус:** Исправлено.

#### CI-4 · P2 · Release — публикация не зависит от CI
- **Где:** `.github/workflows/release.yml` (push в main/develop при `vars.ENABLE_RELEASE == 'true'`).
- **Последствие:** релиз идёт параллельно CI и проверяет только `test:unit` и `pack:dry` (без lint, typecheck, порогов покрытия, e2e/visual); Node 24 против 22.19 в CI.
- **Статус:** Не исправлено — процесс релиза меняет владелец; рекомендация: `npm run ci:validate` в release и/или запуск по `workflow_run` после успешного CI.

#### TST-1 · P2 · Пороги покрытия — «100% на файл» распространяются на меньшинство файлов
- **Где:** `package.json` — `test:components:coverage` (23 `--coverage.exclude` каталогов компонентов, `branches=0`), `test:composables:coverage` (27 исключений), `test:utils:coverage` (storybookUtils, navigationUtils).
- **Последствие:** порог components проверяет 31 из 96 SFC; 23 каталога компонентов исключены. 14 из них (BaseSelect, BaseTable, BaseTabs, BaseTooltip, BaseChat, BaseEditor и др.) попадают в отчёт components-heavy без порогов (92,5% statements после исправлений), а 9 — BaseButton, BaseCheckbox, BaseColorPicker, BaseFormField, BasePin, BaseRadio, BaseSearch, BaseSwitch, BaseTextarea — не попадают ни в один отчёт покрытия. В composables из порога исключены 27 из 78 файлов. `navigationUtils` (переходы по ссылкам) был исключён из порога utils.
- **Исправление (частично):** `navigationUtils` доведён до 100% (2 новых теста) и возвращён под порог utils. Остальные исключения не трогались.
- **Проверка:** `npm run test:utils:coverage` после изменения — см. §5.
- **Статус:** Частично; сокращение исключений — ROADMAP.

#### TST-2 · P2 · Storybook — play-функции ничем не запускаются, a11y-гейт считает подстроку
- **Где:** удаление `test:storybook`/`test:a11y` в `900df6b`; `scripts/check-a11y-coverage.mjs:169` (`content.includes('play:')` — совпадает с `display:` в шаблоне story).
- **Последствие:** assertions в play-функциях ~1185 stories не выполняются ни в CI, ни локально (кроме ручного открытия); гейт «есть play для интерактивных компонентов» проходит без play.
- **Проверка:** прогон всех stories в Chromium инструментом аудита (§5) — результат по HEAD и после исправлений.
- **Исправление (частично):** все play-функции, падавшие в браузере, исправлены (19 → 0, §5.4): часть — вместе с дефектами компонентов, часть — в самих stories (BaseTooltip ×5 проверяли обёртку вместо попапа, BaseBadge/BaseLoader — неверное число элементов, BaseSideBar/BaseIcon — не импортирован `expect`).
- **Статус:** Частично — запуск stories в CI нужен отдельно (test-runner Storybook или Playwright-скрипт по `index.json`, прототип — в §5.4); подстрока в гейте не исправлена; ROADMAP.

#### TST-3 · P2 · Visual-тесты зависят от внешних изображений
- **Где:** stories BaseImage, BaseSlider, BaseAvatar, BaseChat, BaseEditor, BaseTable (внешние хосты `images.unsplash.com`, `i.pinimg.com`, `avatars.mds.yandex.net`, `placehold.co`); 4 stories ссылаются на локальные изображения, которых нет в сборке Storybook (404).
- **Последствие:** без доступа к внешнему хосту 7 visual-тестов падают одинаково на HEAD и после исправлений (BaseImage ×4, BaseSlider ×3, расхождение 46–89% пикселей); в CI результат зависит от сети и CDN.
- **Статус:** Не исправлено — локальные фикстуры изображений в `public/` (ROADMAP).

#### TST-4 · P3 · Устаревшие visual-эталоны
- **Где:** `tests/visual-snapshots/src/components/BaseX/BaseX.visual.spec.ts-snapshots/` — 234 PNG по старому пути рядом с 262 актуальными в `__tests__/…`.
- **Статус:** Не исправлено (удаление файлов — решение владельца).

#### TST-5 · P3 · Конфигурация тестов и Storybook не проходит проверку типов
- **Где:** `npx tsc -p tsconfig.node.json --noEmit`: 48 ошибок — `build/tests/setup-vitest.ts` (39), `build/storybook/preview.ts` (7), `build/tests/vitest.config.ts` (1), `build/config/css.ts` (1: опция `api` в `SassPreprocessorOptions`).
- **Статус:** Не исправлено (одинаково на HEAD и после), ROADMAP.

#### DEP-1 · P2 · Уязвимые зависимости
- **Где:** `npm audit`: 39 (critical 1 — `tar`; high 13 — axios, brace-expansion, browserslist, fast-uri, immutable, ip-address, js-yaml, nanoid, postcss, sharp, svgo, undici, vite-plugin-svgo; moderate 23; low 2). В production-дереве (`--omit=dev`) — 2 high: `nanoid` и `postcss`, оба через `vue` → `@vue/compiler-sfc` (используются на этапе сборки приложения).
- **Статус:** Не исправлено — обновление зависимостей вне рамок аудита без отдельного согласования; ROADMAP (отдельный PR с полным прогоном).

#### PKG-3 · P2 · npm-пакет — `vue` одновременно в `dependencies` и `peerDependencies`
- **Где:** `package.json:30-31,108-111`; туда же шрифты `@fontsource-variable/*` в `dependencies`.
- **Последствие:** при несовпадении версий или у менеджеров со строгой изоляцией возможна вторая копия Vue; шрифты ставятся всем потребителям. В проверке с npm копия Vue одна (`npm ls vue`: deduped).
- **Статус:** Не исправлено — правка манифеста и lock-файла, ROADMAP.

#### PKG-4 · P3 · Шрифты не входят в `styles.css`, компоненты не задают font-family
- **Где:** `dist/styles.css` — 0 `@font-face`; токены ссылаются на `Inter Variable` / `JetBrains Mono Variable`.
- **Последствие:** в приложении-потребителе без явного импорта шрифтов вычисленный `font-family` кнопки — `Arial`.
- **Исправление:** раздел «Шрифты» в README (импорт `@fontsource-variable/*`, `font-family: var(--font-family-base)` для `body` и полей).
- **Статус:** Исправлено (документация).

### 1.3. P0 и P1 по группам компонентов

Полный формат: где, условия, последствие, воспроизведение, исправление, проверка, статус. Номера строк — по `9c848ae`. P2 и P3 — в `findings/<группа>.md`.

#### Отображение

P0 нет.

##### CORE-1 / CRD-4 / CHP-4 · P1 · База (useCustomColor), BaseCard, BaseChip — цвет `color` протекает во вложенные компоненты
- **Где:** `src/composables/useCustomColor/useCustomColor.ts:39-51` (переменные `--custom-bg*`/`--custom-text*` пишутся на корень компонента), `src/styles/_mixins.scss:109-111,184-186` (все компоненты читают `var(--custom-*, fallback)`); сброса нет ни в одном SCSS (нет `@property`, нет `--custom-*: initial`). Проявления: `src/components/BaseCard/ui/BaseCard.vue:13` (CRD-4), `src/components/BaseChip/ui/BaseChip.vue:4-5` — стиль на корне-обёртке, а не на индикаторе (CHP-4), `BaseAlert.vue:3-4` (ALR-3), `BaseLoader.style.scss:57,76,94` (LDR-2) (HEAD 9c848ae).
- **Условия:** у компонента задан `color`, а в его слоте лежит компонент кита без своего `color` (кнопка, BaseText, лоадер, контент, обёрнутый BaseChip).
- **Последствие:** вложенный компонент перекрашивается в цвет родителя. Кнопка в футере карточки с `color.bg = '#fff7ed'` получает фон #fff7ed при белом тексте — 1.06:1, текста не видно. В story `BaseAlert/CustomColor` описание белое на #f0f9ff (1.07:1), кнопка закрытия красная. Точки и бары BaseLoader в цветном контейнере сливаются с фоном. Кнопка внутри `BaseChip :color` заливается цветом индикатора.
- **Воспроизведение:** 1) `<BaseCard :color="{ bg: { base: '#fff7ed' } }"><template #footer><BaseButton>Сохранить</BaseButton></template></BaseCard>`; 2) в браузере `getComputedStyle(button).backgroundColor` → `rgb(255, 247, 237)` вместо `rgb(249, 115, 22)`. Готовая демонстрация — story `BaseAlert/CustomColor`.
- **Исправление:** не сделано. Предложение: общий миксин сброса `--custom-bg*` и `--custom-text*` в `initial` в корне каждого `.base-*` (инлайн-стиль того же корня всё равно побеждает) либо запись переменных на потребляющий элемент; у BaseChip — `customColorStyle` на индикатор.
- **Проверка:** не проверено — нужен браузер (jsdom не вычисляет наследование custom properties). Предлагаемый тест: story «NestedCustomColor» + Playwright `getComputedStyle(nestedButton).backgroundColor === 'rgb(249, 115, 22)'`.
- **Статус:** Не исправлено — по заданию этапа не трогалось: изменение дизайн-системы (SCSS всех компонентов), меняет вид вложенных компонентов и visual baseline.

##### TOK-1 / CHP-2 · P1 · Токены темы (BaseButton, BaseChip, BaseProgress; всего 31 компонент с `--color-accent`) — контраст ниже WCAG AA
- **Где:** `src/styles/_variables.scss:4-5,7-9,11,18` (light: `--color-accent #f97316`, `--color-accent-hover #e06a1d`, `--color-text-muted #71717a`, `--color-bg #fafafa`, `--color-white #fff`, `--color-error #ef4444`, `--color-surface-muted #f4f4f5`) и `:116-117,119-121,123,130` (dark: `#fb923c`, `#ea7c28`, `#a1a1aa`, `#09090b`, `#18181b`, `#f87171`, `#27272a`). Потребители: `BaseButton.style.scss:13-14` (литерал `#ffffff` на accent), `:26` (hover `brightness(1.1)`), `:35-39` (кольцо фокуса); `BaseChip.style.scss:21-22,67-68`; `BaseProgress.vue:110-113` + `BaseTooltip.style.scss:8-9` (подпись процента); вне группы — `BaseStepper.style.scss:136-139`, `BaseCheckbox.style.scss:55-65`, `BaseEditor.style.scss:124-151`, `BaseTabs.style.scss:8,10`, `BaseCalendar/_grid.scss:96-117`, `BaseSelect.style.scss:342-346`. Автопроверка выключена: `build/storybook/preview.ts:121` (`color-contrast`, `enabled: false`) (HEAD 9c848ae).
- **Условия:** дефолтные токены, обе темы; все надписи группы 11–18px, крупного текста нет → порог 4.5:1.
- **Последствие:** текст основной кнопки — 2.80:1 (light) / 2.26:1 (dark) при норме 4.5:1 (WCAG 1.4.3), на hover ещё хуже; фокус-кольцо в светлой теме 2.69:1 < 3:1 (1.4.11) — клавиатурный фокус плохо различим; счётчик BaseChip — 3.76:1 / 2.77:1.
- **Воспроизведение:** `python3 docs/audit/evidence/contrast.py src/styles/_variables.scss --wide` (результат — `docs/audit/evidence/contrast.md`, совпадает на исходном коде и на рабочей копии); или включить `color-contrast` в `preview.ts:121` и открыть `BaseButton/Default`.
- **Пары и коэффициенты** (относительная яркость WCAG 2.x; полупрозрачные слои сведены альфа-композицией; жирным — ниже порога):

| Пара (fg / bg) | Где | Критерий, порог | Light | Dark |
|---|---|---|---|---|
| #fff / `--color-accent` (#f97316 · #fb923c) | BaseButton default (14px/600), цифра шага Stepper | 1.4.3, 4.5 | **2.80** | **2.26** |
| #fff / accent + `brightness(1.1)` (≈#ff7f18 · #ffa142) | BaseButton :hover | 1.4.3, 4.5 | **2.53** | **2.01** |
| #fff / `--color-accent-hover` (#e06a1d · #ea7c28) | hover Stepper/Tabs | 1.4.3, 4.5 | **3.36** | **2.83** |
| `--color-white` / `--color-accent` (в dark `--color-white` = #18181b) | Tabs, Calendar, Select; подпись процента BaseProgress (BaseTooltip) | 1.4.3, 4.5 | **2.80** | 7.83 |
| #fff / `--color-error` (#ef4444 · #f87171) | счётчик BaseChip (11px bold) — CHP-2 | 1.4.3, 4.5 | **3.76** | **2.77** |
| `--color-error` / `--color-bg` | BaseChip variant=outline — CHP-2 | 1.4.3, 4.5 | **3.61** | 7.19 |
| `--color-text-muted` / `--color-surface-muted` | плейсхолдер Input/Textarea в hover/filled (группа forms) | 1.4.3, 4.5 | **4.40** | 5.81 |
| #fff / `--color-accent` (графика) | галочка Checkbox, активная кнопка Editor | 1.4.11, 3 | **2.80** | **2.26** |
| `--color-accent` / `--color-bg` | фокус-кольцо Button/Badge/Card | 1.4.11, 3 | **2.69** | 8.79 |
| `--color-accent` / `--color-surface-muted` | BaseProgress: заливка против трека | 1.4.11, 3 | **2.55** | 6.58 |
| `--color-text-muted` × 0.7 / `--color-white` | подзаголовок BaseCard — причина `opacity: .7`, см. CRD-3 | 1.4.3, 4.5 | **2.73** | **4.04** |
| цвет контекста (#000 UA) / `--color-surface-muted` | текст BaseBadge — причина каскад, см. BDG-1 | 1.4.3, 4.5 | 19.11 | **1.41** |

  Проходят (для справки): `--color-text` на bg/surface — 10.01–10.44 / 13.96–15.68; `--color-text-muted` на bg — 4.63 / 7.76; заголовки BaseAlert — 4.79–5.91 / 8.51–10.62, иконки — 3.07–4.41 / 5.84–8.73; soft-кнопка — 15.10 / 14.47.
  Значения в stories ниже AA (не токены): белый на #ff0000 — 4.00 (CustomColor у Button/Alert/Badge/Card), #ff4500 — 3.30 и #16a34a — 3.16 на #fafafa (BaseText/CustomColors), подпись #e4e4e7 на белом — 1.27 (BaseProgress/DarkTheme, PRG-7).
- **Исправление:** не сделано. Значения, пересчитанные для реестра:
  - light `--color-accent #c2410c`: белый 5.18, кольцо на #fafafa 4.96, заливка против трека 4.71;
  - hover — токен `--color-accent-hover #9a3412` (7.31) вместо `brightness(1.1)`: фильтр от #c2410c даёт #d5480d → 4.41, не проходит;
  - dark — новый токен `--color-on-accent #18181b` на #fb923c (7.83; на #f97316 — 6.32); литерал `#ffffff` в SCSS заменить токеном;
  - ошибка — `#dc2626` (4.83) или `#b91c1c` (6.47), в dark — текст #18181b на #f87171 (6.40);
  - light `--color-text-muted #66666e` — 5.18 на surface-muted;
  - включить `color-contrast` хотя бы для stories без disabled; скрипт контраста токенов — в CI.
- **Проверка:** автотестом не проверено: `color-contrast` выключен глобально, visual-порог `maxDiffPixelRatio: 0.15` (`build/tests/playwright.config.ts:39`) смену контраста не ловит. Расчёт — скрипт из «Воспроизведения».
- **Статус:** Не исправлено — изменение дизайн-токенов (бренд-цвет), по заданию этапа не трогалось. `--color-accent` используют SCSS 31 компонента; в группе перегенерировать 19 baseline (Button 7, Progress 4, Loader 3, Chip 3, Alert 1, Card 1 — по отчёту исправлений). Приоритет записи P1 задаёт пара accent; пара Chip сама по себе — P2 (CHP-2).

##### DOC-1 · P1 · README (BaseButton, BaseChip, BaseSkeleton) — примеры с несуществующими пропсами
- **Где:** `README.md:124,140,218,220,222,363,406,429,449,471,492` (`<BaseButton label="…" />`), `:222` (`:disabled="true"`), `:360-364` (кнопка в примере BaseForm без `type="submit"`), `:661` (`<BaseChip label="Vue" />`), `:741` (`<BaseSkeleton />`) (HEAD 9c848ae).
- **Условия:** разработчик копирует quick start или пример компонента.
- **Последствие:**
  - `label` уходит атрибутом на `<button>` — кнопка пустая и без доступного имени;
  - `:disabled` даёт нативный disabled без стилей `--disabled`;
  - кнопка в примере формы её не отправляет (`type="button"` по умолчанию);
  - `<BaseChip label>` ничего не выводит: пропа нет, компонент — счётчик поверх контента;
  - `<BaseSkeleton />` невидим (высота 0, SKL-3).
  Остальные примеры группы (Alert, Badge, Loader, Empty, Progress, Text, Separator, Animation, Card) соответствуют API.
- **Воспроизведение:** вставить `<BaseButton label="Сохранить" />` → `getByRole('button', { name: 'Сохранить' })` кнопку не находит.
- **Исправление:** README переписан (`git diff HEAD -- README.md`): все 11 мест `<BaseButton label>` → текст в слоте (`<BaseButton>Сохранить</BaseButton>`), `:disabled` → `is-disabled`, в примере BaseForm — `<BaseButton type="submit">` и абзац про `type="submit"`; BaseChip — `:content` поверх обёрнутой кнопки (+ `has-overflow`, описание назначения); BaseSkeleton — `width`/`height` в трёх формах и пояснение про нулевую высоту `rect`/`circle`.
- **Проверка:** vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5). Примеры HEAD (`examples-before/`) давали TS2353/TS2561 (`label`, `disabled` у BaseButton, `label` у BaseChip), текущие — без ошибок. Шаблон глобальной регистрации (пример 04) типами не проверяется — ожидаемая TS2339, пакет не объявляет `GlobalComponents`; он и `<BaseSkeleton />` (типовой ошибки не было) сверены по тексту README.
- **Статус:** Исправлено (README).

#### Формы

P0 в группе нет.

##### FRM-1 · P1 · Группа (Input, Textarea, Checkbox, Radio, Switch, Pin, FormFieldLabel) — атрибуты, id и label не доходят до нативного контрола
- **Где:** `src/components/{BaseInput,BaseTextarea,BaseCheckbox,BaseRadio,BaseSwitch,BasePin}/ui/*.vue:2` (корень `<div>`, `inheritAttrs` по умолчанию); `BaseInput.vue:38-50` и `BaseTextarea.vue:24-37` (у поля нет `id`); `FormFieldLabel.vue:2-8` (`<label>` без `for`) (HEAD 9c848ae).
- **Условия:** любой атрибут, не объявленный пропом (`id`, `name`, `autocomplete`, `inputmode`, `aria-label`, `data-testid`), а также проп `label` у BaseInput/BaseTextarea.
- **Последствие:**
  - У Input/Textarea `<label>` не связан с полем: доступного имени нет (только placeholder), клик по подписи не фокусирует поле, `getByLabelText` не находит его.
  - `name`/`autocomplete`/`inputmode` оседают на `div`: не работают нативная отправка и FormData, автозаполнение, цифровая клавиатура для масок.
  - `<BaseFormField for>` невозможно связать с контролом кита.
  - Checkbox/Switch/Radio/Pin без видимой подписи нельзя озвучить через `aria-label`.
  - Проявляется и внутри кита: `ChatHeader.vue:35` передаёт `aria-label` в BaseInput, он оседает на `div`, и поле поиска чата остаётся без имени.
- **Воспроизведение:** `render(BaseInput, { props: { modelValue: '', label: 'Email' }, attrs: { id: 'e', name: 'email', autocomplete: 'email' } })`. `getByLabelText('Email')` не находит поле, а атрибуты стоят на `div.base-input`.
- **Исправление:** не выполнялось. По заданию этапа подготовлен только план миграции (раздел C, FRM-1 шаги 1–3).
- **Проверка:** не проверено — регрессионного теста нет. Предлагаемый тест: `getByLabelText`, затем `toHaveAttribute('name' | 'autocomplete' | 'aria-label')` на нативном элементе.
- **Статус:** Не исправлено — breaking change: меняется элемент, который получает атрибуты и слушатели.

##### MSK-1 · P1 · useInputMask (BaseInput) — маски с префиксом из 2+ литералов не набираются
- **Где:** `src/composables/useInputMask/useInputMask.ts:56,59` — `maxIterations = cleanValue.length * 2` (HEAD 9c848ae).
- **Условия:** маска начинается с двух и более литералов (`'+7 (###) ###-##-##'`, `'8 (###) ###-##-##'`, `'№ ####'`), ввод посимвольный.
- **Последствие:** итерации расходуются на литералы. Поле показывает только префикс (`"+7"`), в модели остаётся последняя набранная цифра, номер ввести нельзя.
- **Воспроизведение:** `<BaseInput v-model="phone" mask="+7 (###) ###-##-##">`, посимвольно ввести `999…`. На HEAD в поле всё время `"+7"`.
- **Исправление:** в `useInputMask.ts` (`applyMask`) лимит заменён на `mask.length + cleanValue.length`.
- **Проверка:**
  - `src/composables/useInputMask/useInputMask.spec.ts` › «applyMask» › «Несколько литералов подряд (частично введённое значение)» — «префикс +7 ( — первые цифры не теряются», «префикс № — первая цифра не теряется», «длинная группа литералов между токенами»;
  - `src/components/BaseInput/__tests__/BaseInput.integration.spec.ts` › «маска ввода» › «должен позволять посимвольно набрать номер в маске с префиксом +7 (».
  - Падали до исправления: да.
- **Статус:** Частично.
  - Работает: посимвольный набор, если первая цифра не совпадает с цифрой префикса.
  - Осталось: при пустом поле первая цифра, равная цифре-литералу префикса, поглощается `stripMask` как литерал (`useInputMask.ts:137-141` HEAD): `stripMask('8', '8 (###) ###-##-##') === ''`, поле остаётся пустым. Поэтому код, начинающийся с 8 (8-800…, 812), в маске `8 (###)…` не набирается; то же для 7 в маске `+7 (###)…`.
  - Корень общий с MSK-2, тестом не покрыто (см. E).

##### MSK-2 · P1 · useInputMask (BaseInput) — позиционный `stripMask` теряет символы при правке и вставке
- **Где:** `src/composables/useInputMask/useInputMask.ts:129-135` (несовпавший символ расходует токен), `:116-119` (экранированный литерал не «съедает» свой символ) (HEAD 9c848ae).
- **Условия:** ввод в середину значения, вставка с другими разделителями или с кодом страны, маски с экранированием `\x`.
- **Последствие:** цифры теряются или переставляются, модель расходится с тем, что ввёл пользователь.
- **Воспроизведение:** результаты получены выполнением чистых функций в node на этапе ревью, трассировка текущего кода даёт то же:
  - ввод `8` после `(99` в `(999) 123-4` → `(998) 912-3`;
  - paste `01/02/2024` в `##.##.####` → модель `010220`;
  - paste `+7 (999) 123-45-67` в `(###) ###-##-##` → `(799) 91`;
  - маска `\#####`, ввод `1234` → `#123`.
- **Исправление:** не выполнялось. Предложение:
  - несовпадающие символы пропускать, не расходуя токен;
  - экранированный литерал обрабатывать как обычный;
  - вставку и правку считать diff'ом по `selectionStart`/`inputType`.
- **Проверка:** не проверено — регрессионных тестов нет.
- **Статус:** Не исправлено. Движок маски нужно переписывать вместе с MSK-3/4/5, а unit-тесты закрепляют ошибочное поведение (большой объём). В задание этапа не входило.

##### MSK-4 · P1 · useMaskedInputHandlers (BaseInput) — Backspace/Delete удаляют не тот символ
- **Где:** `src/composables/useInputMask/useMaskedInputHandlers.ts:45-77`: читается только `selectionStart` (:53), `preventDefault` + `return` при позиции 0 (:57-58), в Delete сравниваются разные координаты (:69) (HEAD 9c848ae).
- **Условия:** поле с маской; выделение текста, Delete перед литералом, Delete при позиции маски ≥ длины чистого значения, Backspace сразу после литерала.
- **Последствие:**
  - (а) Ctrl+A → Backspace ничего не делает, а выделенный диапазон удаляет один символ;
  - (б) Delete перед литералом удаляет символ слева: `12.34.5678`, каретка 2 → `13.45.678` вместо `12.45.678`;
  - (в) в `(999) 123-45-67` с кареткой 10 Delete ничего не делает;
  - (г) Backspace сразу после `(` удаляет цифру справа;
  - Ctrl/Alt+Backspace и `isComposing` не учитываются.
- **Воспроизведение:**
  - Сценарий (б): `{ modelValue: '12345678', mask: '##.##.####' }`, `setSelectionRange(2, 2)`, `keyDown Delete` → эмит `'1345678'`.
  - Это ровно сценарий story `DeleteWithMaskAtToken`. Её play проверяет только `length < 10` и поэтому дефект скрывает.
- **Исправление:** не выполнялось. Предложение:
  - при выделении удалять диапазон чистых индексов;
  - Delete — ближайший токен справа от каретки;
  - Backspace без токена слева — ничего не делать;
  - при `isComposing` и модификаторах не вмешиваться.
- **Проверка:** не проверено — регрессионных тестов нет.
- **Статус:** Не исправлено. Входит в пакет переработки движка маски (MSK-2…5), в задание этапа не входило.

##### INP-1 · P1 · BaseInput — readonly-поле с маской меняется по Backspace/Delete
- **Где:** `src/composables/useInputMask/useMaskedInputHandlers.ts:45-77` (обработчик не знает о readonly); `src/components/BaseInput/ui/BaseInput.vue:145-152` (состояние не передаётся) (HEAD 9c848ae).
- **Условия:** `isReadonly` (или `isDisabled`) вместе с `mask`, поле в фокусе, нажат Backspace или Delete.
- **Последствие:** обработчик вызывает `preventDefault` и эмитит `update:modelValue` с удалённым символом, v-model родителя меняется в поле «только для чтения». Это порча данных.
- **Воспроизведение:** `{ modelValue: '12345678', mask: '##.##.####', isReadonly: true }`, `setSelectionRange(10, 10)`, `keyDown Backspace` → на HEAD эмит `'1234567'`.
- **Исправление:**
  - `useMaskedInputHandlers.types.ts` — новая опциональная опция `isReadonly`;
  - `useMaskedInputHandlers.ts` — в `handleKeydown` ранний выход до `preventDefault` (`keydown` по-прежнему эмитится); в `handleInput` без эмита, DOM возвращается к отображению модели;
  - `BaseInput.vue` — `isReadonly: () => props.isReadonly || props.isDisabled`.
- **Проверка:**
  - `src/components/BaseInput/__tests__/BaseInput.integration.spec.ts` › «маска в readonly и disabled полях» — «не должен менять значение readonly-поля с маской по Backspace и Delete», «не должен отменять нативное поведение клавиш и глушить keydown в readonly-поле с маской», «не должен эмитить ввод в readonly-поле с маской и должен вернуть отображаемое значение», «не должен менять значение disabled-поля с маской по Backspace»;
  - `src/composables/useInputMask/useMaskedInputHandlers.spec.ts` › «isReadonly (readonly/disabled поле)» — 4 теста.
  - Падали до исправления: да, 8 из 8.
- **Статус:** Исправлено.

##### RAD-1 · P1 · BaseRadio — слот `option` удалял нативный radio
- **Где:** `src/components/BaseRadio/ui/BaseRadio.vue:38-54` — слот оборачивал весь контент `<label>`, включая `<input type="radio">` (HEAD 9c848ae).
- **Условия:** используется слот `#option`.
- **Последствие:** пропадают выбор кликом, клавиатура и роль radio. В слот-пропсах нет `select()`, чтобы восстановить поведение.
- **Воспроизведение:** слот `<span>{{ option.label }}</span>` → `queryAllByRole('radio')` пуст, клик по тексту не даёт эмита.
- **Исправление:**
  - `BaseRadio.vue` — input и кружок вынесены из слота, слот заменяет только подпись;
  - `BaseRadio.types.ts` — JSDoc слота;
  - в `BaseRadio.stories.ts` play у CustomSlot, CustomSlotClickHiddenInput и CustomSlotHiddenInputClick теперь проверяют роль, клик и стрелку (раньше закрепляли «inputs отсутствуют»).
- **Проверка:** `src/components/BaseRadio/__tests__/BaseRadio.integration.spec.ts` › «слот option» — «сохраняет нативные radio с именами из кастомной подписи и их состояние», «выбирает опцию кликом по кастомной подписи», «переключает опцию стрелкой вниз с клавиатуры». Падали до исправления: да, 3 из 3.
- **Статус:** Исправлено. Побочный эффект: слот больше не может заменить индикатор — рядом с кастомной подписью всегда виден стандартный кружок. Это визуальное изменение; visual-эталонов со слотом нет.

##### FFD-1 · P1 · BaseFormField — `validate()` обязательного поля всегда ложный
- **Где:** `src/components/BaseFormField/ui/BaseFormField.vue:55-59` (`useFormField({ value: () => undefined, … isRequired })`); `src/composables/useFormField/useFormField.ts:26-30` (HEAD 9c848ae).
- **Условия:** `isRequired=true` и вызов `validate()` через ref.
- **Последствие:** `validate()` возвращает `false` и показывает «Обязательное поле» независимо от того, заполнен ли дочерний контрол.
- **Воспроизведение:** `<BaseFormField ref="f" label="Имя" is-required><BaseInput model-value="Иван" /></BaseFormField>`; `f.validate()` → `false`, появляется текст ошибки.
- **Исправление:** в `BaseFormField.vue` обёртка больше не передаёт `isRequired` в `useFormField`: теперь `validate()` равен `!error`, а `isRequired` отвечает только за звёздочку. Контракт описан в JSDoc `BaseFormField.types.ts`.
- **Проверка:** `src/components/BaseFormField/__tests__/BaseFormField.spec.ts` › «defineExpose: validate/reset» — «validate() обязательного поля без внешней ошибки возвращает true и не показывает ложную ошибку», а также «validate() возвращает false при внешней ошибке и показывает её текст» и «reset() после validate() не оставляет сообщений об ошибке». Падал до исправления: да.
- **Статус:** Исправлено. Делегирование `validate()` дочернему контролу — отдельная задача FFD-2.

#### Выбор значений

P0 нет.

##### SEL-1 / DRP-1 · P1 · BaseSelect (BaseDropdown) — поле поиска `isSearchable` не принимает фокус и ввод
- **Где:** `src/components/BaseSelect/ui/BaseSelect.vue:2-9` — BaseDropdown без `:prevent-mousedown="false"`; `src/components/BaseDropdown/ui/BaseDropdown.vue:50-54, 110-121` — `preventDefault` на mousedown панели и возврат фокуса на триггер по `focusin`; `src/components/BaseSelect/ui/BaseSelectDropdown.vue:4-10` (HEAD 9c848ae).
- **Условия:** `isSearchable`, список открыт; клик в «Поиск...» или перевод фокуса в поле.
- **Последствие:** запрос нельзя ввести ни мышью, ни клавиатурой. Поиск BaseSelect полностью нерабочий.
- **Воспроизведение:** `<BaseSelect is-searchable :options>` → открыть → клик в поле поиска → печатать → ввода нет, фокус на триггере.
- **Исправление:**
  - `BaseDropdown.vue` (агент overlays, DRP-1): для целей `input, textarea, select, [contenteditable]` mousedown не отменяется и фокус не возвращается на триггер. Остальное поведение `preventMousedown` сохранено; сам BaseSelect не менялся.
  - Не сделано из предложения: автоперевод фокуса в поиск при открытии (клавиатурный путь — SEL-2).
  - Побочный эффект — после выбора опции или Escape, когда фокус стоял в поле поиска, панель размонтировалась вместе с полем и фокус уходил в `body` — закрыт правкой координатора (DRP-2 частично, overlays): `BaseDropdown.vue` при закрытии возвращает фокус из панели на элемент, с которого её открыли (`restoreFocusFromPanel`). Тесты `BaseDropdown.integration.spec.ts` › «BaseSelect с поиском: после выбора опции фокус возвращается на триггер селекта», «при закрытии по Escape фокус из поля ввода панели возвращается на триггер, а не на body» (падали без правки: да).
- **Проверка:**
  - `src/components/BaseDropdown/__tests__/BaseDropdown.integration.spec.ts` › «BaseSelect с поиском: клик в поле поиска ставит фокус, ввод фильтрует опции» (падал до исправления: да, по отчёту overlays);
  - там же › «фокус, переведённый в поле ввода панели, не возвращается на триггер» (да);
  - там же, страховочный › «клик по нетекстовому содержимому панели по-прежнему не уводит фокус с триггера» (нет);
  - `src/components/BaseSelect/__tests__/BaseSelect.integration.spec.ts` › «поиск» › «должен принимать фокус и ввод в поле поиска и фильтровать опции» (не проверялось).
  - Play story `SearchWithQuery` теперь проверяет фокус и ровно одну опцию «Металл» (в CI не запускается).
- **Статус:** Исправлено.

##### SEL-2 · P1 · BaseSelect — нет клавиатурного выбора и семантики combobox/listbox
- **Где:** `src/components/BaseSelect/ui/BaseSelect.vue:33-40` — на триггере только Enter/Space → toggle; `src/components/BaseSelect/ui/BaseSelectDropdown.vue:16-28` — `<li @click>` без role/id/tabindex.
- **Условия:** любая работа с клавиатуры или скринридера.
- **Последствие:**
  - выбрать значение с клавиатуры невозможно (WCAG 2.1.1, A); Enter при открытом списке закрывает его без выбора; Tab уводит фокус, а список остаётся открытым;
  - скринридер не получает роли, состояния «раскрыт» и выбранной опции (4.1.2).
- **Воспроизведение:** Tab на триггер → Enter → ArrowDown ×2 → Enter → значение не выбрано, список закрыт. Story `KeyboardNavigation` (stories:557) прямо фиксирует отсутствие стрелок.
- **Исправление (предложение):** паттерн APG «Select-only combobox».
  - Триггер: `role=combobox`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
  - Список: `role=listbox` (+`aria-multiselectable`).
  - Опции: `role=option`, `id`, `aria-selected`, `aria-disabled`.
  - Клавиши: Up/Down/Home/End, typeahead; Enter/Space — выбор, Esc — закрыть, Tab — выбрать и закрыть.
  - Основа — useListNavigation после доработки (SRCH-10д).
- **Проверка:** не проверено — теста нет. Нужен integration с `getByRole('combobox')`/`getByRole('option', {selected:true})` и user-event, плюс axe в Storybook.
- **Статус:** Не исправлено — большой объём (новая модель фокуса и ARIA), не входило в этап исправлений.

##### SRCH-1 · P1 · BaseSearch (useSearchState, useListNavigation) — устаревшая подсветка даёт TypeError или выбор невидимого результата
- **Где:**
  - `src/composables/useSearchState/useSearchState.ts:74-81` — `handleInput` не сбрасывает подсветку;
  - там же `:63` — `onSelect` без проверки индекса;
  - там же `:111-113`;
  - `src/composables/useListNavigation/useListNavigation.ts:51-55` — нет проверки `index < itemCount()`.
- **Условия:** строка подсвечена стрелками, после чего список сокращается (ввод, новый ответ сервера) или при `isInstant=false` меняется запрос.
- **Последствие:** по Enter — либо `TypeError: Cannot read properties of undefined (reading 'title')` (ничего не выбрано, `search` не ушёл), либо выбор результата, которого пользователь не видит.
- **Воспроизведение:** ввести «з» → ArrowDown ×4 → допечатать до одного результата → Enter → TypeError.
- **Исправление:** `useSearchState.ts`:
  - `resetHighlight()` в `handleInput`;
  - `watch` по списку id видимых результатов: сброс подсветки при смене набора;
  - guard в `onSelect`: индекс, которого уже нет, игнорируется. Путь достижим при мутации `results` и Enter в одном тике.
  - useListNavigation не менялся.
- **Проверка:** `src/components/BaseSearch/__tests__/BaseSearch.spec.ts` › «подсветка при изменении списка результатов»:
  - › «должен сбрасывать подсветку, когда новый ответ короче, и искать по Enter» (да);
  - › «должен сбрасывать подсветку при вводе, чтобы Enter искал, а не выбирал» (да);
  - › «не должен выбирать скрытый результат по Enter после изменения запроса при isInstant=false» (да);
  - › «не должен падать и выбирать исчезнувший результат, если список сократился в том же тике, что и Enter» (без guard падает, проверено агентом);
  - страховочный › «должен сохранять подсветку, если набор результатов не изменился» (нет).
  - Все эти тесты работают на стабах BaseInput и BaseDropdown.
- **Статус:** Исправлено для сценариев ревью а–в. Не сделано из предложения:
  - ограничение индекса в самом useListNavigation → SRCH-10д;
  - навигация и Enter только при открытом списке → SRCH-3.

##### SRCH-2 · P1 · BaseSearch — клиентская фильтрация скрывает серверные результаты; гонки ответов не обработаны
- **Где:** `src/composables/useSearchState/useSearchState.ts:13-23` — всегда `title/description.includes(query)`, затем `slice`.
- **Условия:** результаты приходят с сервера (транслит, опечатки, синонимы, поиск по category, тегам или содержимому).
- **Последствие:** найденное сервером скрывается, вместо него «Ничего не найдено». `search` передаёт только строку, поэтому поздний ответ на старый запрос будет отрисован.
- **Воспроизведение:** `:results="[{id:1,title:'Закат в горах'}]"`, ввести «zakat» → список пуст (без `isRemote`).
- **Исправление:**
  - новый опциональный проп `isRemote` (default `false`, не ломает API): результаты показываются как есть, применяется только `maxResults`. Файлы: `BaseSearch.types.ts`, `BaseSearch.vue`, `useSearchState.ts`, `useSearchState.types.ts`;
  - story `RemoteResults` и control `isRemote`;
  - гонки не обработаны: нет `{query, signal}` или id запроса, защита не описана в документации.
- **Проверка:** `src/components/BaseSearch/__tests__/BaseSearch.spec.ts`:
  - › «должен показывать результаты сервера без клиентской фильтрации при isRemote» (да);
  - › «должен ограничивать результаты maxResults при isRemote» (да).
- **Статус:** Частично. Фильтр теперь можно отключить. Осталось:
  - защита от гонок ответов;
  - пользовательская функция фильтра вместо булева флага.
  - По умолчанию (`isRemote=false`) поведение прежнее.

##### CP-1 · P1 · BaseColorPicker (useColorPicker, colorUtils) — пресет и введённый HEX эмитятся с искажением
- **Где:** `src/composables/useColorPicker/useColorPicker.ts:58-63` — `setHex` → HSV → `emitChange()` отдаёт `hsvToHex(hsv)`; `src/utils/colorUtils/colorUtils.ts:67-80` — `Math.round` для h, s, v.
- **Условия:** выбор пресета, ввод HEX, внешнее значение.
- **Последствие:** в v-model уходит не тот цвет: 10 из 12 пресетов по умолчанию (`#f97316→#fa7516`), `#123456→#123457`, около 88% случайных цветов; отклонение до 3 по каналу.
- **Воспроизведение:** клик по пресету `#f97316` → `update:modelValue('#fa7516')` (HEAD).
- **Исправление:** `useColorPicker.ts` хранит точный HEX отдельно (`exactHex`).
  - Ввод, пресет и внешнее значение эмитятся нормализованными как есть.
  - Из HSV HEX пересчитывается только при изменении тона или SV-области.
  - HSV остался целочисленным; для отображения этого достаточно.
- **Проверка:**
  - `src/components/BaseColorPicker/__tests__/BaseColorPicker.spec.ts` › «эмитит точный HEX пресета %s без искажения через HSV» (×12; да — падали 10 из 12);
  - там же › «эмитит введённый HEX без искажения через HSV» (да);
  - `src/composables/useColorPicker/useColorPicker.spec.ts` › «эмитит введённый HEX без искажения через округлённый HSV», «эмитит нормализованную запись введённого HEX», «сохраняет точный внешний HEX, который не переживает round-trip через HSV» (да);
  - `src/components/BaseColorPicker/__tests__/BaseColorPicker.integration.spec.ts` › «записывает в модель родителя точный HEX выбранного пресета» (да).
  - Play story `PickPreset` исправлен: раньше ожидал, что панель останется открытой; теперь проверяет цвет swatch и закрытие панели.
- **Статус:** Исправлено.

##### RNG-1 · P1 · BaseRange (useRangeDrag, useRangeValues) — управление с клавиатуры не эмитит `change`
- **Где:** `src/composables/useRangeDrag/useRangeDrag.ts:102-113` — только `setPointValue`; `:52-64` — `emitChange` вызывается лишь на mouseup/touchend.
- **Условия:** управление стрелками.
- **Последствие:** потребители, которые фиксируют значение по `@change` (сохранение, запрос фильтра, seek в плеере), не получают изменений от пользователей клавиатуры.
- **Воспроизведение:** `modelValue=50` → Tab на ползунок → ArrowRight → `change` нет (HEAD).
- **Исправление:**
  - `useRangeDrag.ts`: после клавиатурного шага вызывается `emitChange(values)` с новыми значениями, ограниченными соседями (props к этому моменту ещё не обновлены). При упоре в границу `change` не эмитится.
  - `useRangeValues.ts`: `emitChange(values = pointValues)`; типы обоих composables обновлены.
  - Нюанс: при клавиатуре значение `change` вычисляет сам компонент, при drag оно берётся из props. Разница видна, только если родитель не применяет `update:*` (см. D).
- **Проверка:** `src/components/BaseRange/__tests__/BaseRange.integration.spec.ts` › «событие change»:
  - › «должен эмитить change с новым значением при управлении с клавиатуры» (да);
  - › «должен эмитить change с обновлённым диапазоном при управлении с клавиатуры» (да);
  - › «должен эмитить change с массивом точек при управлении с клавиатуры» (да);
  - страховочный › «не должен эмитить change с клавиатуры, если значение упёрлось в границу» (нет).
- **Статус:** Исправлено. Home/End/PageUp/PageDown по-прежнему нет (RNG-3).

##### SLD-1 · P1 · BaseSlider (useSlider) — autoplay нельзя поставить на паузу (WCAG 2.2.2)
- **Где:** `src/components/BaseSlider/ui/BaseSlider.vue:15-16` — пауза только по mouseenter/mouseleave; `src/composables/useSlider/useSlider.ts:200-223`.
- **Условия:** `isAutoplay`, пользователь клавиатуры, скринридера или тач-устройства.
- **Последствие:**
  - слайды уходят из-под фокуса и чтения; кнопки Pause/Play нет;
  - не учитываются reduced motion и `document.hidden`;
  - ручная навигация не перезапускает таймер.
- **Воспроизведение:** `isAutoplay` → Tab на стрелку → через `autoplayInterval` слайд сменяется (HEAD).
- **Исправление:** `useSlider.ts`, `useSlider.types.ts`, `BaseSlider.vue`.
  - Раздельные флаги паузы: указатель над слайдером и фокус внутри (`focusin`/`focusout` с проверкой `relatedTarget`).
  - `prefers-reduced-motion: reduce` отключает autoplay; слушатель смены настройки снимается при unmount.
  - Не сделано: кнопка Pause/Play (управление вращением по APG Carousel), `aria-live` off/polite, пауза при `document.hidden`, сброс таймера после ручной навигации (частично смягчено паузой по hover и фокусу).
- **Проверка:**
  - `src/components/BaseSlider/__tests__/BaseSlider.spec.ts` › «пауза автопрокрутки»:
    - › «не должен листать, пока фокус внутри слайдера» (да);
    - › «не должен возобновлять автопрокрутку при переходе фокуса между элементами слайдера» (да);
    - › «не должен возобновлять автопрокрутку при уходе мыши, пока фокус внутри» (да);
    - › «не должен запускать автопрокрутку при prefers-reduced-motion: reduce» (да);
    - страховочные › «должен возобновлять автопрокрутку, когда фокус покидает слайдер» и › «должен ставить на паузу при наведении и возобновлять после ухода мыши» (нет).
  - `src/composables/useSlider/useSlider.spec.ts` › «пауза autoplay по наведению, фокусу и prefers-reduced-motion» — 6 тестов новых обработчиков.
  - Тач и виртуальный курсор скринридера не проверены: нужен браузер или устройство.
- **Статус:** Частично. Нет постоянного механизма остановки (кнопки Pause/Play), поэтому для тача и виртуального курсора скринридера 2.2.2 не выполняется; live-региона нет.

##### RAT-1 · P1 · BaseRating — по умолчанию клик пишет дробную оценку, игнорируя `step`
- **Где:** `src/components/BaseRating/ui/BaseRating.vue:43` — `isHoverSmooth: true`; `:83-96` — клик идёт через `rawValueFromPointer`; `src/utils/ratingUtils/ratingUtils.ts:24-29`.
- **Условия:** пропсы по умолчанию (`<BaseRating v-model>` из README.md:826-832).
- **Последствие:** клик в середину третьей звезды пишет 2.5–2.65, у левого края первой — около 0.01; `step` не работает.
- **Воспроизведение:** `step=1`, клик в середину третьей звезды → `update:modelValue(2.65)` (HEAD).
- **Исправление:** `BaseRating.vue`:
  - клик всегда идёт через `valueFromPointer`, то есть по `step`;
  - `isHoverSmooth` влияет только на предпросмотр;
  - после клика заливка сразу показывает зафиксированное значение.
- **Проверка:** `src/components/BaseRating/__tests__/BaseRating.spec.ts` › «выбор по клику с привязкой к шагу (isHoverSmooth по умолчанию)»:
  - › «должен записывать целую оценку при пропсах по умолчанию» (да);
  - › «должен привязывать клик к половинкам при step=0.5» (да);
  - изменены ожидания, закреплявшие дефект: › «должен привязывать клик к шагу при step=1» (`[[2.65]]`→`[[3]]`), › «должен привязывать клик к шагу, сохраняя плавный предпросмотр hover» (`[[3.25]]`→`[[4]]`);
  - `src/components/BaseRating/__tests__/BaseRating.integration.spec.ts` › «должен записывать через v-model оценку с привязкой к шагу при клике в середину звезды» (`'2.65'`→`'3'`).
  - Play story `Default` теперь требует целое значение.
- **Статус:** Исправлено. Возможен визуальный дифф `base-rating--default`: play этой story кликает звезду.

#### Оверлеи

P0 нет.

##### SCROLL-LOCK · P1 · useScrollLock — блокировка прокрутки без общего счётчика
- **Где:** `src/composables/useScrollLock/useScrollLock.ts:19-45` (HEAD 9c848ae). `previousOverflow`/`isLocked` хранятся в каждом экземпляре отдельно.
- **Условия:** открыты два и более оверлея с блокировкой (Modal, Slideover, Tour, зум BaseImage, overlay-режим BaseSearch) и закрываются не в порядке LIFO.
- **Последствие:**
  - после закрытия первого окна страница прокручивается под ещё открытым вторым;
  - после закрытия второго на body навсегда остаётся `overflow:hidden`, до перезагрузки.
- **Воспроизведение:** открыть BaseModal, затем BaseSlideover; закрыть модалку, потом панель → `body.style.overflow === 'hidden'`. Тест: `useScrollLock.spec.ts` › «при закрытии не в порядке LIFO восстанавливает стили только после последнего unlock».
- **Исправление:**
  - `useScrollLock.ts`: счётчик и исходные стили body хранятся на уровне модуля. Первый `lock` запоминает стили, последний `unlock` их восстанавливает; `isLocked` у каждого экземпляра свой.
  - `useImageZoom.ts` переведён на useScrollLock (IMG-5, media).
  - Приоритет: в ревью не назначен (известная проблема из CONTEXT). Ставлю P1: последствие то же, что у TOUR-1.
- **Проверка** (падали: да, по отчёту):
  - `src/composables/useScrollLock/useScrollLock.spec.ts` › «при закрытии не в порядке LIFO восстанавливает стили только после последнего unlock», «повторные lock/unlock одного экземпляра не сбивают счётчик»;
  - `src/composables/usePopup/usePopup.spec.ts` › «держит блокировку, пока открыт хотя бы один из двух popup (закрытие не в порядке LIFO)»;
  - `src/components/BaseModal/__tests__/BaseModal.integration.spec.ts` › «держит блокировку, пока открыт slideover, даже если модалка закрыта первой», «закрытие зума изображения внутри модалки не снимает её блокировку».
- **Статус:** Исправлено. Смежные открытые проблемы:
  - SSR (OVL-4);
  - iOS (SL-1, гипотеза);
  - утечка у потребителя BaseSearchOverlay (SRCH-6, pickers): при общем счётчике незакрытый `lock` держит блокировку для всех.

##### MOD-1 · P1 · BaseModal — длинный контент не прокручивается, футер уходит за экран
- **Где:** `src/components/BaseModal/styles/BaseModal.style.scss:36-46,101-105` (HEAD).
- **Условия:** содержимое выше `100vh − 40px`.
- **Последствие:** `overflow-y:auto` у тела не работает, потому что его высота ничем не ограничена. Футер с действиями уходит ниже экрана, а прокрутка страницы заблокирована: кнопки недоступны мышью и тачем.
- **Воспроизведение:** окно 800×600, BaseModal с 40 абзацами и слотом `#footer` → кнопка футера ниже 600px, прокрутки нет.
- **Исправление:**
  - `BaseModal.style.scss`: `__content` стал flex-колонкой, у тела `flex:1 1 auto; min-height:0`, у шапки и подвала `flex:none`;
  - story `LongContent` удлинена, в неё добавлен футер и содержательный play.
- **Проверка:** `src/components/BaseModal/__tests__/BaseModal.e2e.spec.ts` › «модалка: длинный контент прокручивается внутри окна, подвал остаётся на экране»; play story `LongContent` (`scrollHeight > clientHeight`, низ футера не ниже `innerHeight`). Прошли в Chromium на итоговом коде: e2e 57/57 и play LongContent (REPORT.md §5.2, §5.4); падал ли тест до исправления — не проверялось (тест новый).
- **Статус:** Частично. Осталось:
  1. режим `isContained`: высота карточки по-прежнему ограничена `100vh`, а не контейнером. `&--contained` меняет только `position` (по CSS), поэтому в контейнере ниже окна шапка и подвал выходят за его границы;
  2. `100dvh` для мобильных не применён (A4).

##### DRP-1 / SEL-1 (pickers) · P1 · BaseDropdown (BaseSelect) — в панель нельзя поставить фокус
- **Где:** `src/components/BaseDropdown/ui/BaseDropdown.vue:13-14,50-54,110-121` (HEAD); для SEL-1 — `BaseSelect.vue:2-9`.
- **Условия:** `preventMousedown` по умолчанию `true`, в панели есть фокусируемый контент.
- **Последствие:** `preventDefault` на mousedown и обработчик `focusin` возвращают фокус на триггер. В поиск BaseSelect `is-searchable` нельзя ввести текст; чекбоксы BaseTableToolbar и другой контент панели недоступны с клавиатуры.
- **Воспроизведение:** `<BaseSelect is-searchable :options/>` → открыть → клик в «Поиск...» → ввод не попадает в поле. В jsdom: `input.focus()` → `activeElement` оказывается триггером.
- **Исправление:** `BaseDropdown.vue` — для целей `input, textarea, select, [contenteditable]` mousedown не отменяется и фокус не возвращается (`isTextEntryTarget`). Для остальных целей поведение прежнее.
- **Проверка:**
  - `src/components/BaseDropdown/__tests__/BaseDropdown.integration.spec.ts` › «BaseSelect с поиском: клик в поле поиска ставит фокус, ввод фильтрует опции», «фокус, переведённый в поле ввода панели, не возвращается на триггер» (падали: да, по отчёту);
  - там же страховочный тест «клик по нетекстовому содержимому панели по-прежнему не уводит фокус с триггера»;
  - `src/components/BaseSelect/__tests__/BaseSelect.integration.spec.ts` › «должен принимать фокус и ввод в поле поиска и фильтровать опции» (на старом коде не запускался);
  - play story `SearchWithQuery`.
- **Статус:** Частично. Поля ввода исправлены (SEL-1 закрыт). Осталось:
  - кнопки, ссылки и `[tabindex]` в панели при `preventMousedown=true` по-прежнему не удерживают фокус: Tab на пункт меню возвращает его на триггер;
  - после ввода в поиск и выбора опции фокус уходил на `body` — закрыто частичной правкой DRP-2 (координатор): при закрытии фокус из панели возвращается на триггер; `BaseDropdown.integration.spec.ts` › «BaseSelect с поиском: после выбора опции фокус возвращается на триггер селекта».
  - Остальное продолжается в DRP-2.

##### CO-1 / DRP-3 / POPV-4 · P1 · useClickOutside (BaseDropdown, BasePopover) — клик во вложенном оверлее закрывает родителя
- **Где:** `src/composables/useClickOutside/useClickOutside.ts:48-58`, `src/components/BaseDropdown/ui/BaseDropdown.vue:97-101` (HEAD).
- **Условия:** в панели BaseDropdown или BasePopover лежит компонент со своей телепортированной панелью (BaseSelect, BaseDatePicker, вложенный поповер, подменю).
- **Последствие:** «внутри» определяется только вложенностью в DOM. Mousedown в панели потомка (она в `body`) закрывает родителя, и потомок размонтируется раньше `click` — выбор теряется. Основной сценарий «поповер-фильтр с селектом» не работает.
- **Воспроизведение:** `<BasePopover v-model:is-open="o"><template #trigger><button>Фильтр</button></template><BaseSelect v-model="v" :options="[{label:'A',value:'a'}]"/></BasePopover>` → открыть поповер → открыть селект → клик «A» → поповер закрыт, `v` не изменился.
- **Исправление:** не сделано. Предлагается реестр слоёв через provide/inject: панели потомков регистрируются у родителя, проверка идёт по `event.composedPath()`. Делать вместе с OVL-2 и ESC-STACK как общий менеджер слоёв.
- **Проверка:** не проверено: теста нет. Нужен integration без моков: в `BaseDropdown.integration.spec.ts` useClickOutside замокан.
- **Статус:** Не исправлено — архитектурное изменение (общий слой оверлеев), вне объёма этапа.

##### TOUR-1 · P1 · BaseTour — после размонтирования открытого тура страница не прокручивается
- **Где:** `src/components/BaseTour/ui/BaseTour.vue:218-237` (HEAD).
- **Условия:** тур открыт, и компонент размонтирован (смена маршрута, `v-if`).
- **Последствие:** `unlock()` вызывался только в watch при `isOpen → false`, поэтому `body{overflow:hidden}` остаётся навсегда.
- **Воспроизведение:** `<BaseTour v-if="show" :is-open="true" :steps/>` → `show=false` → `document.body.style.overflow === 'hidden'`.
- **Исправление:** `BaseTour.vue` — `unlock()` добавлен в `onBeforeUnmount`.
- **Проверка:** `src/components/BaseTour/__tests__/BaseTour.integration.spec.ts` › «снимает блокировку прокрутки при размонтировании открытого тура» (падал: да, по отчёту; мок useScrollLock из этого спека убран).
- **Статус:** Исправлено.

#### Навигация

P0 нет.

##### ACC-1 · P1 · BaseAccordion — закрытые панели доступны фокусу и скринридеру
- **Где:** `src/components/BaseAccordion/ui/BaseAccordion.vue:45-53`, `styles/BaseAccordion.style.scss:101-128` (HEAD 9c848ae).
- **Условия:** в закрытой секции есть фокусируемое содержимое (ссылки, поля, кнопки) или текст.
- **Последствие:** панель скрыта только визуально (`grid-template-rows: 0fr` + `overflow: hidden` + `opacity: 0`), поэтому Tab уводит фокус в невидимые элементы, а скринридер читает закрытый контент.
- **Воспроизведение:** секция со слотом `<a href="#phone">Позвонить</a>` закрыта, фокус на заголовке, Tab → фокус на невидимой ссылке (HEAD). Сценарий демонстрирует тест ниже.
- **Исправление:** `BaseAccordion.vue` — у закрытой `.base-accordion__collapse` стоят `inert` и `aria-hidden="true"`. Атрибуты меняются сразу и CSS-анимацию не трогают. Панель стала `role=region` с `aria-labelledby`.
- **Проверка:** `src/components/BaseAccordion/__tests__/BaseAccordion.integration.spec.ts` › «доступность (APG Accordion)» › «содержимое закрытой панели скрыто от AT и находится в inert-поддереве (вне порядка фокуса)» и «должен снова скрывать содержимое после закрытия панели». Падали до исправления: да (по отчёту агента, согласуется с кодом HEAD). Что Tab пропускает ссылку в реальном браузере, не проверено: jsdom не реализует `inert`, нужен e2e.
- **Статус:** Исправлено (фокусное поведение подтвердить e2e).

##### MENU-1 · P1 · BaseMenu — пункты не активируются с клавиатуры
- **Где:** `src/components/BaseMenu/ui/BaseMenu.vue:7-18` (HEAD 9c848ae).
- **Условия:** управление с клавиатуры, скринридер.
- **Последствие:** пункты — `div tabindex=0` только с `@click`, без роли. Enter и Space ничего не делают, действие меню без мыши недоступно.
- **Воспроизведение:** Tab на «Профиль» → Enter → `select` не эмитится (HEAD).
- **Исправление:** `BaseMenu.vue` — у пунктов `role="button"` и `aria-disabled`. `@keydown.enter/space.prevent` вызывают тот же обработчик, что и клик (`select` + `item.click`). `role=menu` сознательно не введён: он обещает стрелочную навигацию APG Menu, которой нет, и не подходит, когда BaseMenu служит навигационным списком.
- **Проверка:** `src/components/BaseMenu/__tests__/BaseMenu.integration.spec.ts` › «клавиатура и семантика» › «должен активировать пункт по Enter», «должен активировать пункт по Space и вызывать item.click», «пункты доступны вспомогательным технологиям как кнопки с именем», «отключённый пункт помечен aria-disabled и не активируется с клавиатуры». Падали: да (по отчёту агента).
- **Статус:** Исправлено — минимальный вариант из ревью. Полный паттерн APG Menu вынесен в roadmap (C, «MENU-1 (развитие)»).

##### MM-1 · P1 · BaseMegaMenu — содержимое меню недостижимо с клавиатуры
- **Где:** `src/components/BaseMegaMenu/ui/BaseMegaMenuNode.vue:12`; `ui/BaseMegaMenu.vue:2, 23-30` (HEAD 9c848ae).
- **Условия:** управление с клавиатуры в обоих layout; на мобильном (аккордеон колонок) — ещё и открытие колонки.
- **Последствие:**
  - узлы дерева — `div @click.stop` без tabindex, role и keydown;
  - листья — не `<a href>`: нельзя открыть в новой вкладке, краулер не видит ссылок;
  - заголовок колонки — `h4 tabindex=0` без keydown: пустая Tab-остановка, на мобильном колонку не открыть;
  - корень — `div`, а не `<nav>`.
- **Воспроизведение:** layout `columns`, Tab по странице → фокус не попадает ни на один пункт; Enter на `h4` ничего не делает.
- **Исправление (предложение):** disclosure-навигация:
  - корень — `<nav aria-label>`;
  - узлы с детьми и заголовки колонок — `<button aria-expanded aria-controls>`;
  - листья — `<a :href>` или linkComponent, `href` через `isSafeUrl`;
  - Escape закрывает меню и возвращает фокус.
- **Проверка:** не проверено, теста нет. Нужен integration: `user.tab()` доходит до ссылки-листа, Enter на узле с детьми переключает `aria-expanded`.
- **Статус:** Не исправлено — большой объём: переработка разметки MegaMenu/Node и контракта слотов (вместе с MM-4, MM-5). На этапе исправлений вынесено в roadmap.

##### MM-2 · P1 · navigationUtils (BaseMegaMenu, BaseBreadcrumbs) — `javascript:` из href исполнялся при переходе
- **Где:** `src/utils/navigationUtils/navigationUtils.ts:18-21` (HEAD 9c848ae). Через `navigateAndEmit` переходят:
  - `BaseMegaMenu.vue:175` — верхние пункты dropdown, через `handleNavClick` (:222);
  - `BaseMegaMenuNode.vue:132` — листья дерева;
  - `BaseBreadcrumbs.vue:206` — крошки и кнопка «дом».
- **Условия:** `href` из недоверенных данных (CMS/API) со схемой `javascript:`, `vbscript:` или `data:`. При `target: '_self'` вызывается `location.href = href`, при `_blank` — `window.open` (исполнение в новом окне было гипотезой).
- **Последствие:** по клику исполняется код в контексте страницы (XSS).
- **Воспроизведение:** `navigateAndEmit({ href: 'javascript:alert(1)', target: '_self' }, emit)` → на HEAD присваивается `location.href` и эмитится `navigate`.
- **Исправление (координатор):**
  - новый `src/utils/urlUtils/urlUtils.ts` — `isSafeUrl`. Нормализует URL по URL Standard: удаляет `\t\n\r`, обрезает C0-символы и пробелы по краям. Относительные адреса разрешены, абсолютные — только `http`, `https`, `mailto`, `tel`;
  - `navigationUtils.ts` — `openExternalUrl` и `navigateAndEmit` при небезопасном URL пишут `console.warn` и не переходят; `navigateAndEmit` при этом не эмитит `navigate`;
  - защита покрывает BaseMegaMenu, BaseMegaMenuNode и BaseBreadcrumbs.
  - Что осталось открытым:
    - BaseSideBar рендерит `href` сам (`useSideBarNavigation.ts:70-74`) — это SB-6;
    - `to` не проверяется и эмитится как есть — это ответственность роутера или потребителя;
    - `resolveNavigation` возвращает сырой `href`, но в `src` не используется.
- **Проверка:**
  - `src/utils/navigationUtils/navigationUtils.spec.ts` › «защита от небезопасных URL»:
    - «navigateAndEmit не исполняет javascript: href с target _self и не эмитит его»;
    - «navigateAndEmit не открывает javascript: href в новом окне»;
    - «openExternalUrl не открывает javascript: URL»;
    - позитивные: «navigateAndEmit открывает безопасный внешний href и эмитит его», «navigateAndEmit эмитит внутренний маршрут без открытия окна».
  - `src/utils/urlUtils/urlUtils.spec.ts` › «urlUtils.isSafeUrl» › «отклоняет %j» (схемы, регистр, пробелы, табы, NUL), «разрешает %j», «отклоняет пустую строку и не-строки».
  - Падал до исправления: не проверялось. По коду HEAD тесты упали бы на ожиданиях `emitNavigate`, `console.warn` и `window.open`. Проверка неизменного `location.href` в jsdom ничего не доказывает: jsdom не выполняет навигацию.
  - Компонентного теста нет: спеки MegaMenu подменяют утилиту копией (см. E).
- **Статус:** Исправлено для путей через `navigateAndEmit` и `openExternalUrl`; смежный SB-6 открыт.

##### PG-1 · P1 · BasePagination — текущая страница не выделена при variant по умолчанию
- **Где:** `src/components/BasePagination/ui/BasePagination.vue:14-19`; `src/constants/ui.ts:164`; `src/composables/useVariant/useVariant.ts:28-31` (HEAD 9c848ae).
- **Условия:** `variant` не задан, то есть равен `'default'`.
- **Последствие:** текущая кнопка получает вариант `'default'`, для которого класс не ставится, и выглядит как все номера. `aria-current` тоже нет, поэтому текущую страницу не видят ни пользователь, ни скринридер.
- **Воспроизведение:** `<BasePagination v-model="p" :total="100" />` → текущую страницу не отличить от остальных.
- **Исправление:** `BasePagination.vue` — у текущей страницы `aria-current="page"`. При `variant='default'` неактивные номера рисуются вариантом `soft` (`inactivePageVariant`), текущая остаётся `default` (заливка). Ревью предлагало отдельный active-класс; выбранное решение меняет вид неактивных номеров у всех потребителей с вариантом по умолчанию.
- **Проверка:** `src/components/BasePagination/__tests__/BasePagination.integration.spec.ts` › «текущая страница» › «должен помечать ровно одну текущую страницу aria-current="page"», «должен переносить aria-current при внешней смене modelValue», «должен оформлять текущую страницу иначе, чем остальные, при variant по умолчанию». Падали: да (по отчёту агента). Последний тест сравнивает только строки классов, контраст не проверяет. Visual-baseline `default`, `many-pages`, `dark-theme` устарели: Playwright не запускался.
- **Статус:** Исправлено; нужно обновить visual-baseline.

#### Даты

P0 нет.

##### CAL-2 · P1 · BaseCalendar — в 12h неверный AM/PM, ввод часов сдвигает дату
- **Где** (HEAD 9c848ae):
  - `src/components/BaseCalendar/ui/BaseCalendar.vue:183` — `isAm` задан отдельной моделью, по умолчанию `true`;
  - `src/composables/useCalendar/useCalendar.ts:45` — часы берутся из modelValue, а `isAm` не пересчитывается;
  - `src/composables/useCalendarInteraction/useCalendarInteraction.ts:95-104` — переключатель смотрит на флаг, а не на часы;
  - `src/components/BaseCalendar/ui/BaseCalendarTime.vue:57-71` — `to12h(0)=12`, `parseInt(val) || 0`.
- **Условия:** `timeConfig: { showTime: true, is24Hour: false }`, и выполняется одно из двух: время значения — во второй половине суток, или пользователь очистил поле часов и вводит новое значение.
- **Последствие:** пользователь сохраняет не ту дату и не замечает этого.
  - 14:30 показывается как «2:30 AM». Ввод «3» даёт 03:30 вместо 15:30. Первый клик по AM/PM меняет только подпись.
  - После очистки поле часов сразу показывает «12», и следующая цифра дописывается к нему: «123» → hours=135 при PM (123 при AM). На `change` дата сдвигается на +5 дней. В режиме AM ввод «11» сдвигает её на +45 дней.
- **Воспроизведение:**
  1. `<BaseCalendar v-model="d" :time-config="{ showTime: true, is24Hour: false }"/>`, где `d` = 15.05.2026 14:30. В поле часов «2», на кнопке «AM».
  2. То же с `v-model:is-am="isAm"` и `isAm = false`, как в story ChangeTime12HourPM. Очистить поле часов, ввести «3», вызвать change. Приходит `update:modelValue` = 20.05.2026 15:30 (см. `scratch/time-typing.out.txt`). Без `v-model:is-am` результат — 20.05.2026 03:30.
- **Исправление:**
  - `useCalendarInteraction.ts`: `isAmResolved = computed(() => hours < 12)`. `v-model:is-am` синхронизируется в обе стороны: внешнее изменение работает как нажатие переключателя. `toggleAmPm` сдвигает часы на ±12.
  - `BaseCalendar.vue`: в BaseCalendarTime передаётся `isAmResolved`.
  - `BaseCalendarTime.vue`: введённая строка хранится как черновик до `change`/`blur`. `parseTimeField` ограничивает значение (1–12 в 12h). Пустое значение и NaN не эмитятся.
- **Проверка:** `src/components/BaseCalendar/__tests__/BaseCalendar.time.integration.spec.ts` (реальные BaseInput/BaseButton, user-event); падали до исправления: да.
  - «показывает 14:30 как 2:30 PM»;
  - «переключатель AM/PM с первого клика переводит 14:30 в 02:30 того же дня»;
  - «очистка поля часов не подставляет значение до ввода цифры»;
  - «ввод часа сохраняет половину суток (PM) и дату»;
  - «v-model:is-am получает значение, соответствующее часам (PM для 14:30)»;
  - «внешнее изменение v-model:is-am переключает половину суток значения»;
  - «час больше 12 ограничивается 12 и не сдвигает дату».
- **Статус:** Исправлено.
  - Изменение поведения: при PM-значении `update:isAm(false)` приходит сразу при монтировании.
  - Формальный тест `BaseCalendar.spec.ts` › «должен переключать PM на AM по клику и корректировать часы» (два клика и `toBeTruthy`) оставлен без изменений.

##### DP-1 · P1 · BaseDatePicker — регресс 1.2.2: календарные настройки не доходят до BaseCalendar
- **Где** (HEAD 9c848ae):
  - `src/components/BaseDatePicker/ui/DatePickerPanel/DatePickerPanel.vue:81-85` и `src/components/BaseDatePicker/ui/DatePickerRangePanel/DatePickerRangePanel.vue:6-10` передают BaseCalendar через `v-bind` плоский конфиг (`model/BaseDatePickerCalendar.types.ts:49-66`), а также `:show-navigation`, `:can-switch-view`, `:show-year`, `:show-today-button`;
  - с версии 1.2.2 BaseCalendar принимает только группы `constraints`, `timeConfig`, `displayConfig` (`BaseCalendar.types.ts:117-121`). Всё остальное уходит в `$attrs`.
- **Условия:** у BaseDatePicker задан хотя бы один из props: `minDate`, `maxDate`, `disabledDates`, `disabledWeekdays`, `disableFrom`, `disableTo`, `showTime`, `showSeconds`, `is24Hour`, `showWeekNumber`.
- **Последствие:**
  - (a) Ограничения не действуют: можно выбрать любую дату.
  - (b) Блока времени нет. При `showTime` панель после выбора не закрывается, а время значения затирается: 10.06.2025 14:30 → 12.06.2025 00:00 (dates-check, п. 11).
  - (c) Номера недель не показываются.
  - (d) В каждом месяце свои кнопки prev/next, смена вида и «Сегодня». В режиме multi-month получается N копий.
  - Стабы BaseCalendar в `DatePickerPanel.spec.ts` и `DatePickerRangePanel.spec.ts` объявляли несуществующие props и поэтому скрывали дефект.
- **Воспроизведение:** `<BaseDatePicker v-model="d" :min-date="new Date(2026, 8, 20)"/>` → открыть панель → клик по 10 сентября → `d` = 10.09.2026, хотя дата раньше minDate.
- **Исправление:**
  - `model/BaseDatePickerCalendar.types.ts`: адаптер `toBaseCalendarProps(config, display)` собирает `constraints`, `timeConfig` и `displayConfig`. Навигация и смена вида календаря выключены; год и «Сегодня» показываются, только если месяц один.
  - Обе панели передают props через `v-bind="calendarBindings"`.
  - `useCalendar.ts`: время берётся из modelValue и при заданном `initialMonth` (это CAL-4; без него пункт (b) не исправить).
  - Стабы в spec-файлах теперь строятся из `BaseCalendar.props`.
- **Проверка:** падали до исправления: да. Контракт-тест перечислил утёкшие props.
  - `src/components/BaseDatePicker/__tests__/BaseDatePicker.calendar.integration.spec.ts` (реальный BaseCalendar, без стабов и моков):
    - «minDate: дата раньше minDate недоступна для выбора»;
    - «maxDate и disabledWeekdays блокируют соответствующие дни»;
    - «showTime: показывает блок времени и сохраняет время значения при выборе другого дня»;
    - «showWeekNumber: показывает номера недель»;
    - «календарь внутри панели не дублирует навигацию панели».
  - `DatePickerPanel.spec.ts` › «контракт с BaseCalendar», для single и range:
    - «%s: передаёт только объявленные props BaseCalendar (ничего не уходит в $attrs)»;
    - «%s: ограничения, время и номера недель доходят сгруппированными props».
  - `DatePickerRangePanel.spec.ts`:
    - «скрывает year/today в нескольких месяцах»;
    - «передаёт только объявленные props BaseCalendar (ничего не уходит в $attrs)».
- **Статус:** Исправлено.
  - Не покрыто тестом: скрытие «Сегодня» в multi-month для single и multiple. Есть только тест для range, и тот на стабе.
  - Побочный эффект E-1 (блок времени под каждым месяцем) исправлен координатором: хелпер `withoutTimeBlock` в `BaseDatePickerCalendar.types.ts`, панели биндят `index === 0 ? calendarBindings : secondaryCalendarBindings`. Тесты: `DatePickerPanel.spec.ts` › «при нескольких месяцах блок времени получает только первый календарь», `DatePickerRangePanel.spec.ts` › «блок времени получает только первый календарь диапазона» (падали без правки: да). См. E, п. 5 и 8.

##### DP-2 · P1 · BaseDatePicker — нет клавиатурного доступа и паттерна APG Date Picker Dialog
- **Где** (HEAD 9c848ae):
  - `src/components/BaseDatePicker/ui/DatePickerField/DatePickerField.vue:3-15` — нет обработчика keydown;
  - там же, `:25,43` — у кнопок очистки и календаря `tabindex="-1"` и нет доступного имени;
  - `BaseDatePicker.vue:77` — поле по умолчанию readonly;
  - `DatePickerPanel.vue:2-10` — Teleport в body без роли и aria-атрибутов;
  - `src/composables/useDatePickerState/useDatePickerState.ts:119-140` — open/close не управляют фокусом.
- **Условия:** пользователь работает без мыши или со скринридером.
- **Последствие:** выбрать дату без мыши невозможно (WCAG 2.1.1, 2.4.3, 4.1.2).
  - Enter, Space и ↓ в поле ничего не делают.
  - Панель телепортирована в конец body, поэтому по Tab до неё не добраться.
  - После выбора фокус остаётся на элементе, удалённом из DOM.
  - Нет dialog-семантики и атрибутов `aria-haspopup`/`aria-expanded`.
- **Воспроизведение:** Tab в поле → Enter или ↓ — панель не открывается.
- **Исправление:**
  - `DatePickerField.vue`: keydown Enter или ↓ (в том числе Alt+↓) эмитит внутреннее событие `keyboard-open` с `preventDefault`. У кнопок появились `aria-label` «Открыть календарь» и «Очистить» (ключи `OPEN_CALENDAR`, `CLEAR_VALUE` в `constants/ui.ts`). Тип события добавлен в `DatePickerField.types.ts`.
  - `useDatePickerState.ts`: `handleKeyboardOpen` переводит фокус на выбранную дату, если её нет — на сегодняшнюю, иначе на первую доступную. `close()` возвращает фокус в поле, если фокус был внутри панели.
  - `DatePickerPanel.vue`: `role="dialog"`, `aria-label` «Выберите дату».
  - `BaseDatePicker.vue`: обработчик `@keyboard-open`.
- **Проверка:** `BaseDatePicker.calendar.integration.spec.ts` › «BaseDatePicker: клавиатура и фокус»; падали до исправления: да.
  - «Enter в поле открывает панель-диалог и переводит фокус на выбранную дату»;
  - «↓ открывает панель, а прочие клавиши — нет»;
  - «выбор даты с клавиатуры закрывает панель и возвращает фокус в поле»;
  - «Escape закрывает панель и возвращает фокус из панели в поле»;
  - «кнопки-иконки поля имеют доступные имена».
- **Статус:** Частично. Осталось:
  - `aria-haspopup`, `aria-expanded`, `aria-controls` на `<input>`. BaseInput не пробрасывает атрибуты на input (forms/FRM-1, см. также DP-6).
  - Нет `aria-modal` и Tab-цикла: Tab и Shift+Tab уводят фокус из открытой панели, а она остаётся открытой.
  - Space не открывает панель.
  - Очистить значение с клавиатуры нельзя: у кнопки «Очистить» `tabindex="-1"`.
  - Стрелки по сетке дней не работают — это CAL-1.
  - Нет keyboard-only e2e в Playwright.

#### Таблица и дерево

##### TBL-1 · P1 · BaseTable / useTableData — сортировка ломается на пустых, нечисловых и невалидных значениях
- **Где:** `src/composables/useTableData/useTableData.ts:108-126`, выражение компаратора — `:117-121` (HEAD 9c848ae).
- **Условия:** в сортируемой колонке есть null, undefined, `''` или `'—'` (sortType number), либо Invalid Date или дата не в ISO (sortType date).
- **Последствие:**
  - компаратор возвращает NaN, `Array.sort` считает такие пары равными, и порядок получается произвольным (эксперимент ревью: 147 из 200 наборов не отсортированы);
  - null в числовой колонке равен 0, а в строковой сортируется как слово "null".
- **Воспроизведение:** number asc: `[30, undefined, 10, 20]` остаётся без изменений. Тест: `useTableData.spec.ts` › «number: числа (в т.ч. числовые строки) по возрастанию, нечисловые — после них, пустые — в самом конце».
- **Исправление:** `src/utils/tableUtils/tableUtils.ts` (+ `.types.ts`, `index.ts`) — новые `toSortKey`/`compareSortKeys`.
  - Ранги: распознанное → нераспознанное → пустое. Пустые значения в конце при любом направлении.
  - number — только конечные числа (из чисел, числовых строк, bigint, Date).
  - date — Date, timestamp, ISO 8601 с проверкой календарной даты; строка без зоны считается UTC.
  - string — `Intl.Collator(undefined, { numeric: true })`.
  - `useTableData.ts`: ключи считаются один раз на строку, `columns.find` из компаратора убран.
  - Новые экспорты `utils`: `toSortKey`, `compareSortKeys`, `TableSortKey`, `TableSortRank`.
- **Проверка:**
  - `src/composables/useTableData/useTableData.spec.ts` › describe «Сортировка: пустые и нераспознанные значения»: «number: числа …», «number desc: направление меняет порядок чисел, но пустые значения остаются в конце», «date: null и не-ISO даты не ломают сортировку корректных дат», «date: несуществующая календарная дата считается нераспознанной», «мультисортировка: строка с пустым первичным ключом уходит в конец, вторичный ключ сортирует остальные» — падали: да.
  - `src/components/BaseTable/__tests__/BaseTable.spec.ts` › «TBL-1: пустые значения остаются в конце при сортировке по числу» — падал: да.
  - `src/utils/tableUtils/tableUtils.spec.ts` › describe «toSortKey» (5) и «compareSortKeys» (3) — новый код.
  - 5 тестов покрытия из блока 22:20 (зоны, Date, timestamp, boolean) до исправления не прогонялись.
- **Статус:** Исправлено. Поведение изменилось: null и `''` в числовой колонке больше не равны 0 и уходят в конец.

##### TBL-2 · P1 · BaseTable / useTableSelection — «Выбрать все» захватывает строки, скрытые поиском или фильтром
- **Где:**
  - `src/composables/useTableComposition/useTableComposition.ts:93-96` — в выбор передаются исходные rows;
  - `src/composables/useTableSelection/useTableSelection.ts:36-39` (`isAllSelected`), `:54-64` (`toggleAll`).
- **Условия:** `behavior.selectable` плюс активный поиск или фильтр.
- **Последствие:**
  - `select` после клика по чекбоксу заголовка содержит все rows, включая невидимые. Массовое действие потребителя (удаление, экспорт) затронет скрытые данные — по риску граничит с P0;
  - чекбокс заголовка не отмечается, даже когда выбраны все видимые строки.
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-2: «Выбрать все» при поиске выбирает только найденные строки и так же снимает выбор». На HEAD payload `['1','2','3']` вместо `['1','3']`.
- **Исправление:**
  - `useTableSelection.ts` и `.types.ts`: новая опция `filteredRows?` (по умолчанию rows). `isAllSelected`/`toggleAll` работают по отфильтрованному набору всех страниц;
  - при действии заголовка ранее выбранные скрытые строки снимаются, выбор disabled-строк не меняется, пустой набор игнорируется;
  - `useTableComposition.ts` передаёт `processedRows`.
- **Проверка:**
  - `src/composables/useTableSelection/useTableSelection.spec.ts` › describe «toggleAll с filteredRows»: «выбирает только отфильтрованные строки, скрытые не попадают в payload», «isAllSelected учитывает только отфильтрованные строки», «снимает выбор симметрично: ранее выбранная скрытая строка тоже не остаётся в payload», «не меняет выбор disabled-строк: …», «ничего не делает, если в отфильтрованном наборе нет доступных строк» — падали: да;
  - `BaseTable.spec.ts` › «TBL-2: …» — падал: да.
- **Статус:** Частично — действие заголовка исправлено. Осталось:
  - (1) строки, выбранные поштучно до поиска, остаются в payload `select` при следующих кликах по чекбоксам строк (решение агента);
  - (2) выбранные родителем disabled-строки попадают в payload, даже если скрыты поиском;
  - (3) нет indeterminate (нужен в BaseCheckbox, см. CHK-1) и опции области `selectAllScope`;
  - (4) строки других страниц выбираются по-прежнему — осознанное решение.

##### TBL-3 · P1 · BaseTable — смена rows сбрасывает страницу и выбор, clamp нет
- **Где:**
  - `src/composables/useTableData/useTableData.ts:169-174` — `resetPage` на любое изменение rows;
  - `src/composables/useTableSelection/useTableSelection.ts:15-23` — выбор пересобирается из `row.isSelected`;
  - `src/components/BaseTable/ui/BaseTable.vue:167` — total = `processedRows.length`.
- **Условия:** новая ссылка `rows` (рефетч, поллинг, `computed(() => data.map(...))`, удаление через новый массив) или удаление через `splice`.
- **Последствие:**
  - пользователь со страницы N попадает на первую;
  - выбор, сделанный кликами, теряется, если родитель не пишет `isSelected` обратно;
  - после `splice` получается `currentPage > totalPages`: тело «Нет данных», инфо «41–40 из 40»;
  - серверная пагинация невозможна.
- **Воспроизведение:** pageSize 2, 6 строк, `currentPage = 3` → `setProps({ rows: rows.slice() })` → страница 1. Выбрать строку чекбоксом → `setProps({ rows: [...rows] })` → выбор снят.
- **Исправление:** не выполнено. Предложение:
  - при смене rows не сбрасывать страницу, а клампить `currentPage` по `totalPages`;
  - хранить выбор по id и удалять только исчезнувшие id, либо дать `v-model:selectedIds`;
  - для серверного режима — `totalRows`/`manual`.
- **Проверка:** не проверено: теста нет.
  - Побочное смягчение от группы навигации: в BasePagination кнопка «назад» со страницы вне диапазона ведёт на последнюю. Тест: `src/components/BasePagination/__tests__/BasePagination.integration.spec.ts` › ««назад» ведёт на последнюю существующую страницу, если modelValue больше totalPages».
  - Тело таблицы при этом остаётся пустым, пока пользователь не нажмёт кнопку.
- **Статус:** Не исправлено — меняет поведение и требует нового API (controlled-выбор, серверный режим). Агент отнёс к roadmap.

##### TBL-4 · P1 · BaseTable — режимы button/infinite «схлопываются» после догрузки строк родителем
- **Где:**
  - `src/composables/useTablePagination/useTablePagination.ts:27-32` — `loadedCount = pageSize` при любом изменении длины;
  - `:49-55` — `hasMoreRows` считается только по переданным строкам;
  - `useTableData.ts:169-174`.
- **Условия:** `loadMode` = `'button'` или `'infinite'`, родитель дописывает строки по `load-more`.
- **Последствие:**
  - после дописывания снова видно только pageSize строк, скролл прыгает;
  - если передать ровно одну порцию, `hasMoreRows = false`: кнопки нет, `load-more` не эмитится никогда;
  - серверная подгрузка невозможна.
- **Воспроизведение:** button, pageSize 2, 4 строки → «Загрузить ещё» → `setProps` с 6 строками → видно 2 строки. Поведение закреплено тестом `src/composables/useTableData/useTableData.spec.ts:563-591` («изменение rows.value.length сбрасывает loadedCount»).
- **Исправление:** не выполнено. Предложение:
  - props `hasMore`/`totalRows`;
  - при росте данных `loadedCount` не уменьшать; сбрасывать его только при поиске, фильтре, сортировке и смене pageSize;
  - переписать тест `:563-591`.
- **Проверка:** не проверено: теста нет.
- **Статус:** Не исправлено — нужен новый API и смена поведения, закреплённого тестом. Roadmap.

##### TBL-5 · P1 · BaseTable / useTableColumns — мутация колонок из props, рассинхрон «Настроек колонок»
- **Где:**
  - `src/composables/useTableColumns/useTableColumns.ts:12` — поверхностная копия массива; `:14-26` — watch; `:68` — запись `isHidden`;
  - `src/composables/useColumnResize/useColumnResize.ts:56,65` — запись `width`;
  - `src/components/BaseTable/ui/BaseTable.vue:19` → `BaseTableToolbar.vue:55-60` — тулбар читает `props.columns`.
- **Условия:** скрытие колонки в настройках, ресайз, любое обновление prop `columns` после mount.
- **Последствие:**
  - (a) `isHidden`/`width` пишутся в объекты родителя: общие конфиги, модульные константы, общий `COLUMNS` в тестах (появляется скрытая зависимость от порядка тестов);
  - (b) после обновления `columns` чекбокс настроек показывает скрытую колонку как видимую;
  - (c) изменения `isHidden`/`width`, сделанные родителем после mount, игнорируются.
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-5: после обновления props columns чекбокс настроек отражает фактическую видимость».
- **Исправление:**
  - `useTableColumns.ts` (+ `.types.ts`): `localColumns` хранит копии. При смене props значение `isHidden`/`width` из props применяется, только если родитель его изменил; иначе сохраняется выбор пользователя. Для эмитов добавлен `snapshotColumns()`;
  - `useTableComposition.ts`: `columns-change` после ресайза отдаёт копии;
  - `BaseTable.vue`: тулбар получает `localColumns`.
- **Проверка:** `BaseTable.spec.ts`:
  - «TBL-5: переключение видимости не мутирует объект колонки из props», «TBL-5: ресайз меняет ширину во внутреннем состоянии, не мутируя объект колонки из props», «TBL-5: после обновления props columns чекбокс настроек отражает фактическую видимость», «TBL-5: isHidden и width, изменённые родителем в props, применяются к таблице» — падали: да, 4 из 4;
  - защитный «TBL-5: выбор пользователя сохраняется, если родитель пересоздал колонки с теми же значениями» проходил и до правки.
- **Статус:** Исправлено.
  - Поведение изменилось: изменения `isHidden`/`width` от родителя после mount применяются; `columns-change` отдаёт копии (отдельного теста на это нет — см. TBL-16).
  - `v-model:columnState` не добавлялся.

##### TBL-6 · P1 · BaseTable — сортировка недоступна с клавиатуры, нет aria-sort
- **Где:** `src/components/BaseTable/ui/BaseTableHeader.vue:9-24` — `@click` на `<th>` без tabindex, кнопки и `aria-sort`; `:31-44` — приоритет мультисортировки выводится просто цифрой.
- **Условия:** любая сортируемая колонка.
- **Последствие:** сортировку нельзя включить с клавиатуры (WCAG 2.1.1), скринридер не знает текущий порядок (4.1.2).
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-6: сортировка с клавиатуры кнопкой в заголовке, состояние передаётся через aria-sort». На HEAD кнопки нет.
- **Исправление:**
  - `BaseTableHeader.vue`: подпись сортируемой колонки обёрнута в `<button type="button">` без своего обработчика — click от Enter/Space всплывает к `th`;
  - на сортируемых `th` выставляется `aria-sort` (ascending/descending/none), блок иконок помечен `aria-hidden`;
  - `styles/_header.scss`: сброс стилей кнопки и outline 2px при фокусе.
- **Проверка:**
  - `BaseTable.spec.ts` › «TBL-6: сортировка с клавиатуры кнопкой в заголовке, состояние передаётся через aria-sort» (Enter → ascending, Space → descending, порядок строк) — падал: да;
  - защитный «TBL-6: у несортируемой колонки нет кнопки сортировки и aria-sort» проходил и до правки;
  - visual `base-table--default` и `--dark-theme` на итоговом коде прошли без изменений; axe по stories BaseTable — REPORT.md §5.4; скринридер не проверялся.
- **Статус:** Частично — клавиатура и `aria-sort` исправлены. Осталось:
  - номер приоритета мультисортировки теперь внутри `aria-hidden` (рабочая копия `BaseTableHeader.vue:35-48`) и не озвучивается совсем. Ревью предлагало «приоритет N» через aria-describedby;
  - в кастомном слоте `header-<key>` кнопки нет;
  - подсказка «Сортировать» по фокусу не показывается (TT-1, overlays).

##### TBL-7 · P1 · BaseTable (README) — пример из README падает с TypeError
- **Где:** `README.md:512-519` — строки `{ id, name, status }` без `data`; `src/components/BaseTable/ui/BaseTableRow.vue:47-48` — обращение `row.data[column.key]`.
- **Условия:** потребитель копирует пример из README.
- **Последствие:** TypeError при рендере первой строки.
- **Воспроизведение:** смонтировать пример README как есть.
- **Исправление:** этап правки README переписал пример в `README.md`, раздел «BaseTable»: строки `{ id: 1, data: { name: 'Задача 1', status: 'Активна' } }` и пояснение про `data`/`columns[].key`. Правка видна в `git diff HEAD` (состояние на 01:54).
- **Проверка:** vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5). Пример HEAD (`examples-before/21_basetable.vue`) давал TS2322 «Property 'data' is missing in type … 'TableRow'», текущий (`examples/22_basetable.vue`) — без ошибок. Проверка запускается вне репозитория, doc-snippet-теста в репозитории нет (C).
- **Статус:** Исправлено (README). Пример событий из предложения ревью не добавлен — вынесен в C как развитие.
  - Приоритет оставлен P1, как в ревью. При сведении стоит учесть, что похожие README-дефекты других групп оценены как P2 (например, ST-1).

##### TRE-1 · P1 · BaseTree — нет ARIA-семантики дерева
- **Где:**
  - `src/components/BaseTree/ui/BaseTree.vue:2-5` — нет `role=tree`, имени и `aria-multiselectable`;
  - `BaseTreeNode.vue:2-8` — нет `role=treeitem`, `aria-expanded/selected/checked/level/setsize/posinset/disabled`;
  - `BaseTreeChildren.vue:2-5` — нет `role=group`.
- **Условия:** всегда.
- **Последствие:** скринридер получает плоский набор div без состояния раскрытия и выбора (WCAG 4.1.2, 1.3.1).
- **Воспроизведение:** `getByRole('tree')` и `getAllByRole('treeitem')` ничего не находят.
- **Исправление:** не выполнено. Предложение:
  - на корне `role=tree` и `aria-label`/`aria-labelledby` (через prop);
  - на фокусируемом заголовке `role=treeitem`: `aria-expanded` только у узлов с детьми, `aria-selected` (single) или `aria-checked` (multiple; сам чекбокс — `aria-hidden` и `tabindex=-1`), `aria-level`, `aria-setsize`/`aria-posinset`, `aria-disabled`;
  - на контейнере детей `role=group`.
- **Проверка:** не проверено: теста нет.
- **Статус:** Не исправлено — большой объём (модель WAI-ARIA APG вместе с TRE-2). Roadmap.

##### TRE-2 · P1 · BaseTree — клавиатура не по APG, в режимах выбора ветку не раскрыть
- **Где:** `src/components/BaseTree/ui/BaseTreeNode.vue`:
  - `:6-8` — только `tabindex=0` и `@keydown.enter`;
  - `:9-17`, `:39-47` — стрелка сделана как `<span @click>`;
  - `:156-165` — в режимах выбора Enter только выбирает.
- **Условия:** `selectionMode` single или multiple; любое большое дерево.
- **Последствие:**
  - в режимах выбора дочерние узлы недоступны с клавиатуры (WCAG 2.1.1);
  - нет ↑/↓/←/→/Home/End/`*`, поиска по буквам, Space и roving tabindex — у большого дерева сотни Tab-остановок.
- **Воспроизведение:** `selectionMode='single'`, фокус на «Металл», Enter/→/Space — узел не раскрывается, стрелка фокус не получает.
- **Исправление:** не выполнено. Предложение:
  - roving tabindex (один `tabindex=0` на дерево);
  - keydown на корне по APG: →/← раскрывают/сворачивают или переходят к ребёнку/родителю, ↑/↓ — по видимым узлам, Home/End, `*`, поиск по буквам, Space — выбор, Enter — активация.
- **Проверка:** не проверено: теста нет. Play story Default нажимает ArrowDown/Enter без проверок.
- **Статус:** Не исправлено — большой объём, меняет порядок Tab. Roadmap вместе с TRE-1.

##### TRE-8 · P1 · BaseTree (README) — пример README падает, защиты от undefined items нет
- **Где:** `README.md:1003` — `<BaseTree :nodes="nodes" />`; `src/composables/useTreeState/useTreeState.ts:94-101` — вызов `buildDescendantsCache(undefined)`.
- **Условия:** пример из README или не переданный `items`.
- **Последствие:** setup падает с TypeError «not iterable».
- **Воспроизведение:** смонтировать пример README.
- **Исправление:** этап README исправил пример: `<BaseTree :items="nodes" />` плюс абзац про `selection-mode` и `v-model:expanded-ids`/`v-model:selected-ids` (правка в `git diff HEAD`, состояние на 01:54). Защита `items ?? []` в `useTreeState.ts` не добавлена.
- **Проверка:** README-пример — vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2353 «'nodes' does not exist», текущий — без ошибок). На `items = undefined` теста нет.
- **Статус:** Частично — README исправлен. Осталось: защита от undefined items в коде и тест на неё.

#### Редактор и чат

##### EDT-1 · P0 · BaseEditor — DOM/stored-XSS через конвертацию набранного inline-HTML
- **Где:** `src/composables/useEditorToolbar/useToolbarCommands.ts:250-287`: `:262` — гейт по подстроке `</tag>`, `:264-265` — `document.createElement('div').innerHTML = text`, `:278` — замена узла живым HTML. Вызов на каждый `input`: `src/components/BaseEditor/ui/BaseEditor.vue:209` (HEAD 9c848ae).
- **Условия:** Text-узел под кареткой содержит подстроку вида `</tag>`. Источники: экранированный текст из `modelValue` (в том числе после корректной серверной санитизации), вставка text/plain (pastejacking), drag&drop, ручной ввод.
- **Последствие:** `<img onerror>` исполняется в основном документе при любом вводе в этом абзаце, живой HTML уходит в `update:modelValue` (stored XSS у следующих читателей). Буквальный текст `</div>` стирается (потеря данных), каретка прыгает в конец блока.
- **Воспроизведение:** `modelValue='<p>x &lt;img src=x onerror=alert(document.domain)&gt;&lt;/b&gt;</p>'` → клик в конец абзаца → ввести «!» → alert; в emit приходит `<img src="x" onerror=…>` (`scratch/rich-editor-xss.out.txt`, случаи A/B/D).
- **Исправление:**
  - `useToolbarCommands.ts`: `convertInlineHtml` больше не парсит текст через `innerHTML`. Распознаётся только пара `<b|strong|i|em|u|s|strike|del|code>текст</тег>` без атрибутов, закрытая прямо перед кареткой. Элемент строится через `createElement` + `textContent` и ставится через `node.replaceWith`, каретка — сразу после элемента.
  - `src/utils/editorDomUtils/editorDomUtils.ts` (+ `.types.ts`, `index.ts`): новые `matchTypedInlineTag`, `TYPED_INLINE_TAGS`, `TypedInlineTagMatch`.
  - Доработка координатора после отчёта: `node.replaceWith` вместо `parent.replaceChild`, недостижимая ветка удалена (в diff есть).
- **Проверка:**
  - `src/components/BaseEditor/__tests__/BaseEditor.integration.spec.ts`: «экранированный в modelValue HTML остаётся текстом после ввода символа, литерал </div> сохраняется», «не переносит атрибуты из набранного тега в живую разметку», «набранная пара разрешённого тега форматирования превращается в элемент без исполнения разметки».
  - `src/composables/useEditorToolbar/useEditorToolbar.spec.ts`: «convertInlineHtml: одиночный закрывающий тег остаётся буквальным текстом» (переписан: раньше закреплял потерю `</b>`), «convertInlineHtml: не трогает буквальные теги, если каретка стоит не сразу после пары», «convertInlineHtml: пара, закрытая прямо перед кареткой, становится элементом без атрибутов», «convertInlineHtml: пара в самом начале абзаца не создаёт пустой текстовый узел перед элементом» (добавил координатор).
  - `src/utils/editorDomUtils/editorDomUtils.spec.ts`: describe «matchTypedInlineTag» (1 позитивный тест + `it.each` из 8 отрицательных случаев).
  - Падали до исправления: регрессионные тесты — да (по отчёту агента). Позитивные тесты сохранённой функции и тест координатора проверяют новую реализацию: неприменимо / не проверялось.
- **Статус:** Исправлено. Остаток — EDT-1r (P3).

##### EDT-2 · P1 · BaseEditor — HTML не санитизируется на входе, выходе и при вставке
- **Где:** `src/components/BaseEditor/ui/BaseEditor.vue:231` (watch) и `:238` (mount): `innerHTML = modelValue`; `:210`: emit сырого `innerHTML`; `src/composables/useEditorToolbar/useToolbarCodeMode.ts:55`: `innerHTML = codeContent` при выходе из режима кода (HEAD).
- **Условия:** приложение передаёт в `modelValue` HTML других пользователей (CMS, вики, модерация) и не санитизирует его при сохранении. Также вставка из буфера и режим кода.
- **Последствие:**
  - `<img onerror>`, `<svg onload>`, `<iframe srcdoc>`, `<style>` исполняются или применяются сразу при mount, в том числе при `isReadonly`;
  - `javascript:`-ссылки в readonly кликабельны;
  - `update:modelValue` отдаёт сырой HTML.
- **Воспроизведение:** `<BaseEditor model-value="<img src=x onerror=alert(1)>" />` → alert при монтировании (браузер; в jsdom после mount в DOM присутствует `[onerror]`).
- **Исправление:**
  - Код не менялся. Добавлено предупреждение в JSDoc `modelValue` (`src/components/BaseEditor/model/BaseEditor.types.ts`).
  - README: предупреждение безопасности добавлено в раздел «BaseEditor» (`git diff HEAD -- README.md`). В нём сказано, что `modelValue` вставляется через innerHTML без санитизации, `<img onerror>`, `<svg onload>`, `<iframe srcdoc>`, `<style>` и `javascript:` сработают и при `is-readonly`, санитизировать нужно на сервере по allowlist. Это документирование риска, дефект кода не устранён.
  - Предложение:
    - опциональный `sanitize?: (html: string) => string`, по умолчанию identity (обратно совместимо);
    - применять перед `innerHTML` (mount, watch, выход из режима кода), к `text/html` при вставке (нужен свой обработчик `paste`) и перед emit;
    - плюс `pasteAsPlainText?: boolean`.
- **Проверка:** не проверено: исправления нет. Предлагаемый unit-тест: `modelValue` с `onerror`/`<script>`/`<style>`/`javascript:` и переданным `sanitize` → в DOM и emit нет `on*`, `script`, `style`, `javascript:`.
- **Статус:** Не исправлено — изменение контракта, предложен sanitize-проп. Риск задокументирован в JSDoc и README.

##### EDT-3 · P1 · BaseEditor — readonly обходится через контекстное меню медиа
- **Где:** `src/components/BaseEditor/ui/BaseEditor.vue:58` (`@contextmenu` навешан без условия), `src/composables/useEditorToolbar/useToolbarMediaMenu.ts:23-51` (проверки readonly нет) (HEAD).
- **Условия:** `isReadonly=true`, правый клик по `<img>`/`<video>`.
- **Последствие:** «Удалить» и «Применить» (размер) меняют документ и эмитят `update:modelValue`. При автосохранении пользователь без прав на редактирование теряет или меняет данные.
- **Воспроизведение:** см. тесты ниже: на HEAD меню открывалось, `removeMedia` эмитил без картинки.
- **Исправление:**
  - `useToolbarMediaMenu.ts` (+ types): опция `isReadonly`. В readonly своё меню не открывается (остаётся нативное меню браузера), `applyMediaSize`/`removeMedia` только закрывают меню.
  - `useEditorToolbar.ts` (+ types) пробрасывает опцию.
  - `BaseEditor.vue` передаёт `isReadonly: () => props.isReadonly`.
- **Проверка:** `BaseEditor.integration.spec.ts` › «не открывает контекстное меню медиа и не меняет v-model по правому клику на изображении»; `useEditorToolbar.spec.ts` › «режим только для чтения: меню медиа не открывается, размер и удаление не применяются». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — EDT-3r (P3).

##### EDT-4 · P1 · BaseEditor — загруженные медиа сохраняются как blob:-URL и теряются
- **Где:** `src/composables/useEditorToolbar/useToolbarCommands.ts:219,226` (изображение), `:236,242-244` (видео) (HEAD).
- **Условия:** загрузка изображения или видео через тулбар (в том числе в режиме кода).
- **Последствие:**
  - в сохранённом HTML `src="blob:…"` → после перезагрузки или на другом устройстве медиа пропадают (потеря данных);
  - `URL.revokeObjectURL` не вызывается (утечка памяти);
  - хука загрузки файла на сервер нет;
  - размер и тип не проверяются (`accept` — только подсказка диалога).
- **Воспроизведение:** существующий тест `useEditorToolbar.spec.ts` › «handleImageUpload / handleVideoUpload» ожидает `execCommand('insertImage', false, 'blob:test')`, то есть закрепляет это поведение.
- **Исправление:** не исправлялось. Предложение:
  - prop `uploadMedia?: (file: File) => Promise<string>` (или emit `upload` с resolve), вставлять постоянный URL;
  - без него — документировать поведение и эмитить список blob-URL;
  - `maxFileSize` и типы;
  - `revokeObjectURL` при удалении медиа и при unmount.
- **Проверка:** не проверено: исправления нет. Предлагаемый unit-тест: mock `uploadMedia` → в emit `src="https://cdn/…"`; spy на `revokeObjectURL` при `removeMedia` и unmount.
- **Статус:** Не исправлено — нужен новый контракт загрузки (prop/emit); в задание этапа исправлений не входило.

##### CHAT-1 · P1 · BaseChat — пункты контекстного меню не работают при клике мышью
- **Где:** `src/composables/useChatMessageActions/useChatMessageActions.ts:18,28-32`; `src/components/BaseChat/ui/ChatMessageList/ui/ChatMessageList.vue:46`; `…/ChatMessageList/ui/ChatMessageContextMenu.vue:2` (HEAD).
- **Условия:** любой клик указателем (pointerdown → mousedown → click) по пункту меню или реакции.
- **Последствие:**
  - click-outside сравнивал цель с `$el` компонента, корень которого — `<Teleport>` (плейсхолдер, не HTMLElement);
  - поэтому mousedown по пункту считался кликом «снаружи»: меню закрывалось, `message` обнулялся ещё до `click`;
  - мышью не работали «Закрепить» (другого UI для закрепления нет), реакции из меню, «Копировать», «Удалить» одного сообщения, «Ответить/Выбрать».
- **Воспроизведение:** `scratch/rich-chat-clickoutside.out.txt`; на HEAD `user.click(getByText('Закрепить'))` у админа не эмитил `pin-message`.
- **Исправление:** `useChatMessageActions.ts`: целью click-outside стал `computed(() => contextMenuRef.value?.menuRef ?? null)` — реальный div меню из `defineExpose`. Тип `contextMenuRef` исправлен на `ChatMessageContextMenuExpose`.
- **Проверка:** `src/components/BaseChat/ui/ChatMessageList/__tests__/ChatMessageList.spec.ts` › «должен выполнять действия пунктов меню и реакций при клике мышью» (user-event: закрепить/ответить/реакция/удалить), «не должен закрывать меню по mousedown внутри меню и должен закрывать после выбора пункта». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — CHAT-1r (P3). Следствие: «Открепить» из меню теперь достижимо мышью и эмитит `pin-message` (CHAT-5).

##### CHAT-2 · P1 · BaseChat — демо-данные «Металл-Арт» в панели «Информация»
- **Где:** `src/components/BaseChat/ui/ChatSlideover/ChatSlideover.vue:44-49` (описания «Металл-Арт» / «Анна — ведущий скульптор…»), `:118-142` (телефон `+7 (999) 123-45-67`, `info@metal-art.ru`); `src/constants/chat.ts:93-96` (HEAD).
- **Условия:** любое открытие вкладки «Инфо» в любом приложении.
- **Последствие:** пользователи видят чужие описания и контакты. Тест `ChatSlideover.spec.ts:70-75` закреплял это поведение.
- **Воспроизведение:** открыть «Инфо» в личном чате → виден демо-телефон и e-mail.
- **Исправление:**
  - `ChatSlideover.vue`: демо-описания и блок телефон/e-mail удалены.
  - Новый опциональный prop `description` (`BaseChat.types.ts`, `ChatSlideover.types.ts`, проброс в `BaseChat.vue`, default `''`); блок описания показывается только при переданном значении.
  - Stories: argType `description` и значение в `GroupChat`.
- **Проверка:**
  - `src/components/BaseChat/__tests__/ChatSlideover.spec.ts` › «должен показывать подзаголовок и не показывать захардкоженные демо-контакты и описание» (изменён: раньше ожидал демо-телефон), «должен показывать описание из prop description», «не должен показывать захардкоженное демо-описание группы», «должен показывать описание группы из prop description».
  - `…/BaseChat.integration.spec.ts` › «должен показывать в панели только описание из props, без демо-данных».
  - Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Остаток — CHAT-2r (P3).

##### CHAT-3 · P1 · BaseChat — черновик и вложения теряются при входе в выделение
- **Где:** `src/components/BaseChat/ui/BaseChat.vue:57-76` (`<ChatInput v-if>` / `<ChatSelectionToolbar v-else>`); состояние `text`/`attachments` хранится локально в `src/composables/useChatInputState/useChatInputState.ts:13-15` (HEAD).
- **Условия:** набрать текст, прикрепить файл → «Выбрать» сообщение → «Отмена».
- **Последствие:** ChatInput размонтировался, текст и превью вложений пропадали; blob-URL вложений не освобождались.
- **Воспроизведение:** см. тест.
- **Исправление:** `BaseChat.vue`: `ChatInput v-show="selectedMessageIds.length === 0"`, `ChatSelectionToolbar v-if="selectedMessageIds.length > 0"`.
- **Проверка:** `BaseChat.integration.spec.ts` › «должен сохранять черновик и вложения после входа в режим выделения и отмены» (падал до исправления: да, по отчёту агента). Изменённый тест «должен показывать тулбар массовых действий и скрывать панель ввода при выделении»: `queryBy…→toBeNull()` заменено на `getBy…→not.toBeVisible()`.
- **Статус:** Исправлено. Остаток — CHAT-3r (P3).

##### CHAT-4 · P1 · BaseChat — закрытие поиска не сбрасывает фильтр ленты
- **Где:** `src/components/BaseChat/ui/BaseChat.vue:20` (`@toggle-search="isSearching = !isSearching"`); `src/composables/useChatSearch/useChatSearch.ts:11-15` (HEAD).
- **Условия:** открыть поиск, ввести запрос, закрыть поле.
- **Последствие:** лента остаётся отфильтрованной по запросу, которого уже не видно; новые сообщения, не подходящие под него, не отображаются.
- **Воспроизведение:** см. тесты.
- **Исправление:** `useChatSearch.ts`: `watch(isSearching)` — при закрытии `searchQuery = ''`.
- **Проверка:** `BaseChat.integration.spec.ts` › «должен возвращать полную ленту и очищать запрос при закрытии поиска»; `src/composables/useChatSearch/useChatSearch.spec.ts` › «сбрасывает запрос и фильтр при закрытии поиска». Падали до исправления: да (по отчёту агента).
- **Статус:** Исправлено. Объявленный, но не эмитимый `search` остаётся в CHAT-5.

#### Медиа и иконки

##### IMG-1 / AVA-4 · P0 · BaseImage, BaseAvatar — lazy-изображение через 5 с навсегда уходит в ошибку
- **Где:** `src/composables/useImageState/useImageState.ts:91-101,109-121,123-132`, `src/components/BaseImage/ui/BaseImage.vue:28,76,78`; в аватаре — `src/components/BaseAvatar/ui/BaseAvatar.vue:9-15` (HEAD 9c848ae).
- **Условия:** значения по умолчанию (`loading="lazy"`, `timeout=5000`), и при этом:
  - изображение ниже первого экрана — браузер его ещё не запрашивал;
  - или медленная сеть.
- **Последствие:**
  - Таймер стартует при монтировании. Через 5 с `hasError=true`, и `<picture v-if="!hasError">` удаляется: картинка уже не загрузится, пользователь видит «Ошибка загрузки».
  - Затронуты ленты, вложения чата, превью BaseFileUpload, BaseSlider, BaseSearch.
  - Аватары в списках навсегда переключаются на инициалы (AVA-4).
- **Воспроизведение:** страница с BaseImage ниже 3000 px → подождать 6 с → прокрутить → вместо фото блок ошибки.
- **Исправление:** `useImageState.ts` (+ `.types.ts`), `BaseImage.vue` (`ref` на `<img>`).
  - Для `lazy` отсчёт таймаута начинается, когда `<img>` попадает в зону видимости (IntersectionObserver).
  - Без IntersectionObserver таймаут к lazy не применяется; eager — как раньше.
  - Observer отключается при load, error и unmount.
- **Проверка:** `src/components/BaseImage/__tests__/BaseImage.spec.ts` › «таймаут загрузки»:
  - «не переводит lazy-изображение в ошибку, пока браузер не начал его загрузку» — падал до исправления: да. В jsdom нет IntersectionObserver, поэтому тест проверяет ветку «без IO».
  - «отсчитывает таймаут lazy-изображения с момента попадания в зону видимости» — да (управляемая замена IO).
  - «eager-изображение по-прежнему переводится в ошибку по истечении таймаута» — контрольный, нет.
  - Не проверено: Playwright со скроллом через 6 с.
- **Статус:** Частично. Основной сценарий (изображения вне экрана) устранён. Осталось:
  - по таймауту `<img>` по-прежнему удаляется, и поздний `load` картинку не восстанавливает;
  - поэтому на медленной сети (eager или lazy, > 5 с после появления на экране) ошибка остаётся навсегда, а аватар — инициалами;
  - `timeout` по умолчанию — 5000.

  Исправление остатка меняет поведение и вынесено в C.

##### IMG-2 / AVA-4 · P0 · BaseImage, BaseAvatar — AVIF/WebP-источники ломали любой локальный src
- **Где:** `src/composables/useImageState/useImageState.ts:63-74`, `src/components/BaseImage/ui/BaseImage.vue:29-30`, `src/utils/imageUtils/imageUtils.ts:4-6` (HEAD).
- **Условия:** `src` — относительный путь или путь от корня: `/image.jpg`, ассет Vite, примеры `README.md:677` (`/avatar.png`) и `:693`.
- **Последствие:**
  - Всегда рендерились `<source type="image/avif" srcset="….avif">` и `.webp`.
  - Браузер выбирает AVIF, получает 404 и к `<img src>` не возвращается → ошибка.
  - `fallbackSrc` не помогал, `convertToWebp=false` генерацию не отключал.
  - Аватар из примера README всегда показывал инициалы.
- **Воспроизведение:** `<BaseImage src="/favicon.svg" alt="">` в dev-сервере → запрос `/favicon.avif` возвращает 404 → блок ошибки.
- **Исправление:** `useImageState.ts`, `BaseImage.types.ts`, `BaseImage.vue` (новый проп `convertToAvif=false`), `imageUtils.ts`.
  - Производные `<source>` добавляются только по явным `convertToAvif`/`convertToWebp`.
  - Они не строятся для `data:`/`blob:`, для файла без расширения и пока показан `fallbackSrc` (в этот момент убирается и `srcset`).
  - `replaceExtension` ищет расширение только в имени файла.
- **Проверка:**
  - `BaseImage.spec.ts` › «производные источники AVIF/WebP»:
    - «не добавляет <source> AVIF/WebP для локального src без явного запроса форматов» — да;
    - «не строит производный источник, если в пути нет расширения файла» — да;
    - «показывает fallbackSrc, даже если включены производные источники и srcset» — да;
    - «добавляет AVIF-источник по явному convertToAvif» — контрольный.
  - `src/utils/imageUtils/imageUtils.spec.ts`:
    - «не принимает точку в домене за расширение файла» — да;
    - «не принимает точку в каталоге за расширение файла»;
    - «обрабатывает protocol-relative URL: расширение берётся из имени файла, а не из домена»;
    - «заменяет расширение в URL с доменом, каталогами с точкой и hash».
  - Существующий тест «должен генерировать avif source для локальных изображений при convertToAvif» получил `convertToAvif: true`: раньше он закреплял дефект.
  - Не проверено: Playwright `naturalWidth>0`.
- **Статус:** Исправлено. Остаток P3 касается только оптимизации: `srcWidth`/`sizes` не применяются к `<source>` (см. C).

##### ICON-1 · P0 · BaseIcon — у потребителя пакета спрайт иконок не находится
- **Где (HEAD):**
  - `src/constants/ui.ts:167`, `src/composables/useIcon/useIcon.ts:5-7`;
  - `src/components/BaseIcon/ui/BaseIcon.vue:11`, `src/icons/index.ts:1`;
  - `src/plugins/iconPlugin/iconPlugin.ts:10-18`, `package.json:22-26,33-69`;
  - `build/plugins/sprite.ts:23-24,113-119`, `README.md:1455-1469`.
- **Условия:** любое из:
  - приложение с history-роутером на вложенном маршруте;
  - деплой под подпутём;
  - раздача ассетов с CDN;
  - спрайт не скопирован в `public/`.
- **Последствие:**
  - `<use href="icons.svg#…">` резолвится от URL страницы: `/users/42` → `/users/icons.svg`. Результат — 404 или `index.html`, и пропадают все иконки кита.
  - Путь нельзя настроить.
  - `dist/icons.svg` не входит в `exports` (`ERR_PACKAGE_PATH_NOT_EXPORTED`).
  - README об этом молчит.
- **Воспроизведение:** открыть `/a/b` с `<BaseIcon name="close"/>` → браузер запрашивает `/a/icons.svg`.
- **Исправление:**
  - Путь передаётся через provide/inject. Ключ `ICON_SPRITE_PATH_KEY` (`Symbol.for`) экспортирован.
  - Опции: `createIconPlugin({ spritePath })` и `createUiKitPlugin({ iconSpritePath })` — `useIcon.ts`, `iconPlugin.ts`, `iconPlugin.types.ts`, `plugin.ts`. По умолчанию прежний `'icons.svg'`.
  - Координатор добавил в `package.json#exports` подпуть `"./icons.svg": "./dist/icons.svg"` — это пункт 3 находки.
- **Проверка:**
  - `src/plugins/iconPlugin/iconPlugin.spec.ts`:
    - «BaseIcon ссылается на спрайт по пути из опции spritePath» — да;
    - «без spritePath сохраняет прежний относительный путь icons.svg» — контрольный.
  - `src/components/BaseIcon/__tests__/BaseIcon.integration.spec.ts` › «должен ссылаться на спрайт по пути из createUiKitPlugin({ iconSpritePath })» — да.
  - `src/composables/useIcon/useIcon.spec.ts` › «внутри компонента использует путь к спрайту, переданный через provide» — да.
  - Подпуть `exports` не проверен: теста нет. Нужны `npm run pack:dry` и `import.meta.resolve('@ramzes1385/rise-ui-kit/icons.svg')` после сборки.
  - E2E «приложение-потребитель на `/a/b`» нет.
- **Статус:** Частично. Путь настраивается, файл экспортирован. README теперь описывает подключение: разделы «Иконки → Спрайт» и «Быстрый старт» — копирование в `public/` или импорт `?url`, `iconSpritePath`/`spritePath`, `BASE_URL` при подпути, тот же origin. Примеры 72–73 проходят vue-tsc strictTemplates: проверка примеров README (REPORT.md §5). Осталось:
  - дефолт по-прежнему относительный: без `iconSpritePath` на вложенных маршрутах иконки пропадают (теперь это описано в README);
  - спрайт с другого origin (CDN) внешний `<use>` не загрузит;
  - автотеста на подпуть нет.

##### FU-1 · P1 · BaseFileUpload — зона загрузки недоступна с клавиатуры, label не связан
- **Где:** `src/components/BaseFileUpload/ui/BaseFileUpload.vue:15-35`, `src/components/BaseFileUpload/styles/BaseFileUpload.style.scss:31-33` (HEAD).
- **Условия:** всегда.
- **Последствие:** пользователь клавиатуры или скринридера не может выбрать файл (WCAG 2.1.1, 4.1.2):
  - зона — `div tabindex=0` без роли и без обработки Enter/Space;
  - `<label>` без `for`.
- **Воспроизведение:** Tab до зоны → Enter → `input.click` не вызывается; `getByRole('button', {name: /выберите файлы/i})` не находит элемент.
- **Исправление:** `BaseFileUpload.vue`:
  - зона получила `role="button"`, Enter/Space вызывают `triggerUpload`;
  - `<label :for>` связан с input через `useId`, у input `tabindex=-1`;
  - при `isDisabled` у зоны `tabindex=-1` и `aria-disabled`.
- **Проверка:** `src/components/BaseFileUpload/__tests__/BaseFileUpload.integration.spec.ts` › «клавиатурная доступность», все три падали до исправления:
  - «зона загрузки — кнопка, открывающая выбор файла по Enter и Space»;
  - «подпись связана с полем выбора файла»;
  - «отключённая зона загрузки исключена из порядка табуляции».

  axe по 25 stories BaseFileUpload (REPORT.md §5.4): нарушения `list`/`listitem` только в 3 stories со списком ошибок; `nested-interactive` не выявлен (stories со слотом-кнопкой нет).
- **Статус:** Исправлено. `aria-describedby` для подсказки и ошибок относится к FU-6. Input остался `display:none`: фокус на нём не нужен.

##### FU-2 · P1 · BaseFileUpload — прогресс и «Загружено» имитируются, управлять ими нельзя
- **Где:** `src/composables/useFileUploadState/useFileUploadState.ts:74-110`, `src/components/BaseFileUpload/ui/BaseFileUpload.vue:84-99`, `src/components/BaseFileUpload/model/BaseFileUpload.types.ts:25` (HEAD).
- **Условия:** выбран любой файл-изображение; не-изображения навсегда остаются в `pending`.
- **Последствие:**
  - Без реальной отправки UI показывает «N%» (`Math.random`), затем «Загружено»; статус `error` недостижим.
  - Если загрузка у потребителя упала, пользователь уходит, считая файл сохранённым. Это риск потери данных.
- **Воспроизведение:** выбрать `a.png` без сервера → через ~1 с «Загружено»; выбрать `a.pdf` → «Ожидание» навсегда. Имитацию закрепляет `BaseFileUpload.spec.ts` › «имитация прогресса загрузки» › «должен завершать загрузку изображения со статусом done при достижении 100%».
- **Исправление (предложение):**
  - убрать `simulateUploadProgress`;
  - сделать модель контролируемой: `v-model:files` (`UploadedFile[]` со `status/progress/error`) или expose `setProgress/setStatus`;
  - опционально проп `uploader(file, {onProgress, signal})` с abort и retry.
- **Проверка:** не проверено — не исправлялось. Нужен unit: статус и прогресс берутся только из prop и без внешнего обновления не меняются (fake timers).
- **Статус:** Не исправлено. Нужны новый API и смена поведения по умолчанию (дизайн-решение), поэтому пункт вынесен в roadmap.

##### FU-3 · P1 · BaseFileUpload — в одиночном режиме файлы накапливаются
- **Где:** `src/components/BaseFileUpload/ui/BaseFileUpload.vue:199-215`, `src/composables/useFileUploadState/useFileUploadState.ts:48-72,130-135` (HEAD).
- **Условия:** `isMultiple=false` (по умолчанию), повторный выбор файла или drop нескольких файлов.
- **Последствие:**
  - Файлы копятся до `maxCount=10`, `change` отдаёт `[A, B]`.
  - Потребитель, берущий `files[0]`, загрузит старый файл.
  - Drop трёх файлов добавляет все три.
- **Воспроизведение:** выбрать A, затем B → в списке 2 элемента, последний `change` = `[A, B]`.
- **Исправление:** `useFileUploadState.ts` (опция `getIsMultiple`, `replaceFile`), `BaseFileUpload.vue`.
  - Новый валидный файл заменяет выбранный: для старого приходит `remove`, затем `change=[новый]`.
  - Из drop берётся первый валидный файл; невалидный файл выбранный не вытесняет.
  - Устаревшее чтение превью отбрасывается; `maxCount` в одиночном режиме не применяется.
  - Без `getIsMultiple` composable работает по-старому.
- **Проверка:** `BaseFileUpload.integration.spec.ts` › «одиночный режим (isMultiple=false)»:
  - «повторный выбор заменяет файл, а не добавляет второй» — да;
  - «из перетащенных нескольких файлов оставляет один» — да;
  - «невалидный файл не заменяет уже выбранный» — контрольный, нет.

  В существующий тест `BaseFileUpload.spec.ts` › «должен эмитить error при превышении maxCount» добавлен `isMultiple: true`.
- **Статус:** Исправлено. Лишние файлы из drop отбрасываются без сообщения. Это дизайн-решение, как у нативного input.

##### IMG-3 · P1 · BaseImage (потребители) — удалённый проп `hasZoom` молча выключал зум
- **Где:** `src/components/BaseSlider/ui/BaseSlider.vue:85`, `src/components/BaseChat/ui/ChatMessageList/ui/ChatMessageAttachments.vue:13`, `src/components/BaseChat/ui/ChatSlideover/ChatSlideoverMedia.vue:12` (HEAD).
- **Условия:** вложения и медиа-панель чата, BaseSlider с `isZoomable`.
- **Последствие:** `:has-zoom` (проп удалён в 1.2.2) уходит атрибутом на корневой `div`. Зум и галерея не открываются, vue-tsc без `strictTemplates` этого не видит.
- **Воспроизведение:** кликнуть по изображению-вложению в чате → `.base-image__zoom` не появляется.
- **Исправление:** в трёх местах `:zoom-config="{ hasZoom: … }"`.
- **Проверка:** `src/components/BaseImage/__tests__/BaseImage.integration.spec.ts` › «потребители BaseImage включают зум актуальным API», все три падали до исправления:
  - «изображение-вложение в сообщении чата открывает зум по клику»;
  - «изображение в медиа-панели чата открывает зум по клику»;
  - «слайд BaseSlider с isZoomable открывает зум по клику».
- **Статус:** Исправлено. Story `BaseTable.stories.ts:1173` позже исправлена (IMG-17); включение `strictTemplates` — в C.

##### IMG-4 · P1 · BaseImage, BaseImageZoom — зум и галерея недоступны с клавиатуры и скринридеру
- **Где (HEAD):**
  - `src/components/BaseImage/ui/BaseImage.vue:31-44` — `<img @click>` без роли и tabindex;
  - `src/components/BaseImage/ui/BaseImageZoom.vue:3-6` — нет `role="dialog"`, `aria-modal`, имени;
  - `BaseImageZoom.vue:8-72` — 8 кнопок-иконок без имён;
  - `BaseImageZoom.vue:78` — один `alt` на всю галерею;
  - `BaseImageZoom.vue:85-94` — миниатюры сделаны `div @click`.
- **Условия:** `zoomConfig.hasZoom=true`.
- **Последствие:**
  - с клавиатуры зум не открыть;
  - скринридер восемь раз произносит «кнопка» без названия;
  - фокус не переходит в оверлей и по Tab уходит на страницу под ним;
  - клавиши зума срабатывают и при фокусе в поле ввода на фоне.
- **Воспроизведение:** изображение не получает фокус по Tab; после открытия зума мышью `getByRole('dialog')` ничего не находит (HEAD).
- **Исправление:** `BaseImageZoom.vue`:
  - `role="dialog"`, `aria-modal="true"`, имя «Просмотр изображения: {alt}» (при `alt=""` без суффикса);
  - `aria-label` у 6 кнопок тулбара и 2 кнопок навигации — из новых констант `UI_ARIA` (`src/constants/ui.ts`).
- **Проверка:** `BaseImage.integration.spec.ts` › «доступность оверлея зума» › «оверлей — модальный диалог с именованными кнопками управления» — да. axe по 29 stories BaseImage, включая 9 stories с зумом (REPORT.md §5.4), — без нарушений.
- **Статус:** Частично. Осталось:
  - открытие зума с клавиатуры;
  - перевод, ловушка и возврат фокуса (подойдёт новый `useFocusTrap`);
  - миниатюры как кнопки с `aria-current`;
  - отдельный `alt` для каждого элемента галереи;
  - клавиши на `document` (IMG-10).

  Причина: этап был ограничен условием «без переделки фокуса».

##### IMG-5 / AVA-4 · P1 · BaseImage (useImageZoom) — зум и размонтирование снимали чужой scroll lock
- **Где:** `src/composables/useImageZoom/useImageZoom.ts:187-192,199-204` (HEAD).
- **Условия:** открыт BaseModal или BaseSlideover (useScrollLock), и при этом:
  - внутри или рядом размонтируется любой BaseImage — удаление превью, перерисовка списка аватаров (AVA-4), смена вкладки;
  - или внутри открыт и закрыт зум.
- **Последствие:** зум писал `document.body.style.overflow` напрямую, а при unmount безусловно ставил `''`. Фон прокручивается под открытым оверлеем.
- **Воспроизведение:** в открытом BaseModal открыть и закрыть зум → `body.style.overflow === ''`.
- **Исправление:** сделано группой overlays.
  - `useImageZoom.ts` блокирует прокрутку через `useScrollLock`.
  - `useScrollLock.ts` получил общий счётчик блокировок: `unlock()` экземпляра, который не блокировал, ничего не снимает, а стили body восстанавливает последняя разблокировка.
  - В `useImageZoom.spec.ts` добавлен `enableAutoUnmount(afterEach)`.
- **Проверка:**
  - `src/components/BaseModal/__tests__/BaseModal.integration.spec.ts` › «блокировка прокрутки» › «закрытие зума изображения внутри модалки не снимает её блокировку» — да, по отчёту overlays.
  - `src/composables/useScrollLock/useScrollLock.spec.ts` › «несколько экземпляров (общий счётчик блокировок)» › «повторные lock/unlock одного экземпляра не сбивают счётчик» — `unlock` без `lock` не снимает чужую блокировку; это сценарий размонтирования BaseImage без зума.
- **Статус:** Исправлено. Прямого теста «mount/unmount BaseImage при открытой модалке» нет: сценарий покрыт на уровне useScrollLock.


## 2. Выполненные исправления

Все правки — в рабочей копии, без коммитов. Публичный API не удалялся (кроме помощников Storybook в `utils`, которые у потребителя не работали, — PKG-1); новые props/опции необязательны. На каждое исправление дефекта есть тест, который падал на исходном коде: так сказано в отчётах этапа исправлений и перепроверено по коду HEAD; для правок координатора после этапа (BTN-7, E-1, DRP-2, SLD-11) — временным откатом правки. Полные формулировки, файлы и имена тестов — в `findings/<группа>.md`.

### 2.1. Безопасность
| ID | Что исправлено | Файлы | Тесты |
|---|---|---|---|
| EDT-1 (P0) | Набранный текст под кареткой больше не парсится через `innerHTML`: распознаётся только пара простых inline-тегов без атрибутов, элемент строится через `createElement` + `textContent` | `useToolbarCommands.ts`, `editorDomUtils.ts` | `BaseEditor.integration.spec.ts` (3), `useEditorToolbar.spec.ts` (+3, 1 переписан) |
| MM-2 (P1) | `javascript:`, `vbscript:`, `data:` и прочие небезопасные схемы не открываются ни через `location.href`, ни через `window.open` (MegaMenu, Breadcrumbs и все переходы через `navigateAndEmit`/`openExternalUrl`) | новый `src/utils/urlUtils/`, `navigationUtils.ts` | `urlUtils.spec.ts` (24), `navigationUtils.spec.ts` (+7) |
| FU-13 / CHAT-11 (P2, частично) | `downloadFile` скачивает только http/https/blob/data | `fileUtils.ts` | `fileUtils.spec.ts` › `downloadFile` (3) |
| CHAT-8 (P2) | id сообщения экранируется в CSS-селекторе (`CSS.escape` + запасная реализация) | `useChatMessageActions.ts` | `ChatMessageList.spec.ts` |
| EDT-2 (P1) | Только документация: предупреждение в JSDoc `modelValue` и в README; санитизации нет (см. §3) | `BaseEditor.types.ts`, README | — |

### 2.2. Пакет, сборка, Storybook, CI
PKG-1, PKG-2, CFG-1, STB-1, STB-2, CI-1, CI-2, CI-3, TST-1 (частично), PKG-4 (документация) — описаны в §1.2. Кратко по файлам: `src/utils/index.ts`, `src/__tests__/packageBoundaries.spec.ts` (новый), `package.json` (`exports["./icons.svg"]`, `typecheck`, `test:all`, `ci:validate`, `navigationUtils` возвращён под порог utils), `vitest.config.ts`, `build/storybook/main.ts`, `scripts/storybook-dev.mjs`, `.github/workflows/ci.yml`, 5 spec-файлов с ошибками типов.

### 2.3. Оверлеи, фокус, прокрутка
| ID | Что исправлено | Файлы |
|---|---|---|
| SCROLL-LOCK, POP-1/2, TOUR-1, IMG-5 (P1) | Общий счётчик блокировки прокрутки: закрытие одного слоя не разблокирует страницу под другим; `usePopup` снимает блокировку по факту закрытия и при размонтировании; BaseTour и зум изображения больше не оставляют/не снимают чужую блокировку | `useScrollLock.ts`, `usePopup.ts`, `BaseTour.vue`, `useImageZoom.ts` |
| MOD-A11Y (P2), SLD-1 overlays | BaseModal/BaseSlideover: `role="dialog"`, `aria-modal` (кроме `isContained`/`container`), `aria-labelledby`, имя у кнопки закрытия; перевод фокуса внутрь, ловушка Tab, возврат фокуса. Новый composable `useFocusTrap` (экспортируется) | `useFocusTrap/*` (новый), `BaseModal.vue`, `BaseSlideover.vue` |
| MOD-1 (P1, частично) | Длинный контент модалки прокручивается внутри карточки, шапка и подвал на экране | `BaseModal.style.scss` |
| NTF-1/3/5 | Уведомления: регион с именем, `alert`/`status` по типу, имя у кнопки закрытия; `duration: 0`/NaN/Infinity/отрицательные → 3000 мс, таймер и прогресс-бар считают одинаково | `BaseNotification.vue`, `constants/ui.ts` |
| DRP-1 / SEL-1 (P1) | Поля ввода в панели BaseDropdown принимают фокус (поиск BaseSelect работает мышью) | `BaseDropdown.vue` |
| DRP-2 (частично) | При закрытии панели фокус из неё возвращается на триггер, а не теряется на body (побочный эффект DRP-1, закрыт координатором) | `BaseDropdown.vue` |

### 2.4. Формы
| ID | Что исправлено |
|---|---|
| FFD-1 (P1) | `BaseFormField.validate()` больше не сообщает ложное «Обязательное поле» |
| RAD-1 (P1) | Слот `option` у BaseRadio заменяет только подпись — нативный radio остаётся (клавиатура, имя, выбор) |
| INP-1 (P1) | Маска в readonly/disabled поле не удаляет символы |
| MSK-1 (P1, частично) | Маски с 2+ литералами в начале (`+7 (`) набираются посимвольно; остаток — поглощение первой цифры, совпадающей с цифрой префикса |
| SWT-1 | BaseSwitch — `role="switch"` |
| FORM-1 (частично) | Блокировка полей формы при loading/disabled через `<fieldset disabled>` (`display: contents` — раскладка не меняется), `aria-busy`, возврат фокуса после разблокировки; кастомные контролы (Select, Range, Rating, Editor) fieldset не блокирует |

### 2.5. Выбор значений
| ID | Что исправлено |
|---|---|
| CP-1 (P1) | BaseColorPicker эмитит точный HEX пресета/ввода (раньше искажался через HSV: 10 из 12 пресетов) |
| RNG-1 / RNG-2 (P1/P2) | BaseRange: клавиатура эмитит `change`; шаг 0.1 без хвостов плавающей точки |
| RAT-1 (P1) | BaseRating: клик привязывается к `step` |
| SRCH-1 (P1), SRCH-2 (частично) | BaseSearch: подсветка сбрасывается при смене списка (раньше TypeError или выбор скрытого результата); новый проп `isRemote` без клиентской фильтрации |
| SLD-1 (P1, частично) | BaseSlider: autoplay на паузе при наведении и фокусе, выключен при `prefers-reduced-motion`; кнопки Pause нет |
| SLD-11 (P2) | Клик после перетаскивания слайда мышью не активирует содержимое (не открывает зум) — побочный эффект IMG-3, закрыт координатором (`useSwipe.onClickCapture`) |

### 2.6. Навигация
ACC-1 (P1; ACC-2 частично) — закрытые панели аккордеона `inert`, заголовок `role=button` с `aria-expanded/controls`, Enter/Space; MENU-1 (P1) — пункты BaseMenu активируются с клавиатуры; TAB-1/TAB-2/TAB-4 — roving tabindex, стрелки/Home/End, `tabpanel`, имена у кнопок прокрутки; BC-1 (BC-3 частично) — `<nav aria-label>` у хлебных крошек; PG-1 (P1), PG-2, PG-3 (частично) — `aria-current`, выделение текущей страницы, корректная блокировка кнопок при `total=0` и странице вне диапазона.

### 2.7. Даты
DP-1 (P1, регрессия 1.2.2) — `minDate`/`maxDate`/`disabledWeekdays`/`showTime`/`showWeekNumber` снова доходят до BaseCalendar (адаптер `toBaseCalendarProps`); CAL-2 (P1) + CAL-3 — AM/PM из часов, ограничение ввода времени; DP-2 (P1, частично) — открытие с клавиатуры, фокус на дате, возврат фокуса, `role="dialog"`, имена кнопок; DP-9 — три story падали с TypeError; имена кнопок навигации календаря; E-1 — при нескольких месяцах один блок времени (побочный эффект DP-1, закрыт координатором).

### 2.8. Таблица и дерево
TBL-1/TBL-20 (P1) — сортировка: пустые/нераспознанные значения в конце, числовые строки как числа, даты ISO/Date/timestamp, `Intl.Collator` с `numeric`; TBL-2 (P1, частично) — «Выбрать все» по отфильтрованным строкам; TBL-5 (P1) — колонки из props не мутируются, «Настройки колонок» синхронны; TBL-6 (P1, частично) — сортировка с клавиатуры, `aria-sort`; TBL-12 (частично) — ресайз колонки чистит слушатели и стили body при размонтировании; TRE-3 — узлы свёрнутых веток не достижимы по Tab.

### 2.9. Редактор и чат
EDT-1 (P0), EDT-3 (P1, readonly обходился через меню медиа), CHAT-1 (P1, пункты контекстного меню не работали мышью), CHAT-2 (P1, демо-данные «Металл-Арт» в продакшен-компоненте → проп `description`), CHAT-3 (P1, черновик терялся при выделении), CHAT-4 (P1, закрытие поиска не сбрасывало фильтр), CHAT-8.

### 2.10. Медиа и иконки
IMG-2 (P0) — AVIF/WebP-источники только по явным `convertToAvif`/`convertToWebp` (раньше ломали любой локальный src); IMG-1 (P0, частично) — таймаут lazy-изображения от попадания в зону видимости; ICON-1 (P0, частично) — путь к спрайту через `iconSpritePath`/`spritePath`, подпуть `./icons.svg`, README; IMG-3 (P1) — зум в чате и BaseSlider снова работает (удалённый проп `hasZoom`); IMG-4 (P1, частично) — оверлей зума `role=dialog`, имена кнопок; FU-1 (P1) — зона загрузки доступна с клавиатуры; FU-3 (P1) — одиночный режим заменяет файл; FU-7; IMG-17 (story).

### 2.11. Базовые компоненты отображения
BTN-1 — кнопка в loading остаётся в фокусе (`aria-busy`/`aria-disabled`), активация подавлена; BTN-7 — клик по кнопке в loading не доходит до кликабельного предка (побочный эффект BTN-1, закрыт координатором); ALR-1/ALR-2 — имя кнопки закрытия, роль по типу; LDR-1 (частично) — имя из `label`; PRG-1/2/3 (частично) — проп `ariaLabel`, без `aria-valuenow` в indeterminate, без «NaN»; SEP-1/SEP-2 — `role="separator"` в обеих ориентациях, имя из метки; EMP-1 — отступы BaseEmpty масштабируются по `sizeScale`; CORE-4 — `useVariant` сравнивает с `DEFAULT_VARIANT`; CORE-3 — JSDoc `useCustomClass`.

### 2.12. Документация
README: ≈30 примеров приведены к реальному API (проверены `vue-tsc` со `strictTemplates`: было 44 ошибки в 33 из 67 файлов, стало 1 ожидаемая в 73), опечатка `@ramses1385`, раздел «Миграция на 2.0.0» переименован честно (мажорной версии не было), новые разделы: «Изменения поведения (не выпущено)», «Шрифты», «Иконки → Спрайт», предупреждение о безопасности BaseEditor, `useFocusTrap`, `urlUtils`. `docs/README.md` — ссылки на отчёты аудита и команда `typecheck`.

### 2.13. Изменённые существующие тесты и stories
Изменены только ожидания, которые закрепляли дефект (или стабы, скрывавшие его):
- `usePopup.spec.ts:95` — ожидал, что `close()` снимает блокировку при ещё открытом окне (POP-1).
- `BaseSwitch.integration.spec.ts:19,30,42,56,80` — `getByRole('checkbox')` → `'switch'` (SWT-1).
- `BaseRating.spec.ts:87,98`, `BaseRating.integration.spec.ts:67` — дробная оценка после клика (RAT-1).
- `DatePickerPanel.spec.ts` (HEAD :20, :29–56), `DatePickerRangePanel.spec.ts` (HEAD :43–44, :53–66) — стаб BaseCalendar объявлял удалённые props и скрывал DP-1; теперь стаб повторяет реальный контракт.
- `useEditorToolbar.spec.ts` (~651) — ожидал потерю литерала `</b>` (EDT-1).
- `ChatSlideover.spec.ts:70-75` — ожидал демо-телефон (CHAT-2); `BaseChat.integration.spec.ts:257` — поле ввода теперь скрыто, а не удалено (CHAT-3).
- `BaseImage.spec.ts` (HEAD :209) — AVIF для локальных изображений (IMG-2); `BaseFileUpload.spec.ts:221` — накопление файлов в одиночном режиме (FU-3).
- `BaseButton.spec.ts:113` — `toBeDisabled()` при loading (BTN-1); `BaseAlert.integration.spec.ts:102` — `role=alert` у info (ALR-2); `BaseProgress.spec.ts:249` — `aria-valuenow=0` в indeterminate (PRG-2); `BaseSeparator.spec.ts:146`, `BaseSeparator.integration.spec.ts:53` — отсутствие роли у вертикального (SEP-1).
- Технические правки без смены ожиданий: `useScrollLock.spec` (снятие экземпляров в `afterEach` из-за общего счётчика), `useImageZoom.spec` (`enableAutoUnmount`), `BaseNotification.spec:211,245` (`unmount`), в integration-спеках Modal/Slideover/Tour убраны `vi.mock` для useScrollLock/useEscapeKey/useClickOutside (тесты идут на реальных composables), `BaseEmpty.spec.ts` (путь к SCSS через `node:path`), `BaseSlideover.visual.spec.ts` (переведён на существующие stories и ожидание панели — старые эталоны сняли спиннер и страницу ошибки, OVL-6).
- Stories, где play закреплял дефект или story падала: BasePagination OutOfRangePage, BaseRadio CustomSlot×3, ColorPicker PickPreset, Rating Default, DatePicker Interactive/ExternalEndUpdate/ExternalSelectedUpdate, BaseImage (keydown в `document`), BaseIcon (импорт `expect`), BaseTable WithImages; обновлены play Button/Loading, Alert/Closable, Separator/Vertical×2, Modal LongContent; новая story Search RemoteResults.
- Play, которые никогда не могли пройти (выявлены прогоном stories в браузере): BaseTooltip — 22 проверки искали обёртку `.base-tooltip` или несуществующий класс `.base-tooltip--{позиция}` вместо попапа `.base-tooltip-popup` (проверки «тултип показан» были формальными, «скрыт» — всегда падали); BaseBadge и BaseLoader SizeScale — ожидалось неверное число элементов, теперь проверяются значения `--size-scale`; BaseSideBar WithCustomClass — не импортирован `expect`.

### 2.14. Новое в публичном API (всё необязательное)
`useFocusTrap`; `isSafeUrl`, `NAVIGATION_PROTOCOLS`, `DOWNLOAD_PROTOCOLS`; `toSortKey`, `compareSortKeys` (+ типы `TableSortKey`, `TableSortRank`); `ICON_SPRITE_PATH_KEY`; опции `createUiKitPlugin({ iconSpritePath })`, `createIconPlugin({ spritePath })`; props `BaseImage.convertToAvif`, `BaseSearch.isRemote`, `BaseProgress.ariaLabel`, `BaseChat.description`; опции composables `useImageState({ convertToAvif, loading, imgRef })`, `useFileUploadState({ getIsMultiple })`, `useTableSelection({ filteredRows })`, `useMaskedInputHandlers({ isReadonly })`, `useEditorToolbar({ isReadonly })`; `useTableColumns` возвращает `snapshotColumns`; подпуть пакета `./icons.svg`.

## 3. Неисправленное и причины

Не исправлялись: изменения публичного API и поведения по умолчанию (breaking), архитектурные изменения (слой оверлеев, новые паттерны APG), решения дизайн-системы (контраст токенов, наследование цвета), крупные новые возможности, а также всё, что требует проверки в браузере или на устройстве без возможности её провести. Для каждого пункта в реестрах указаны причина, тип изменения и объём; план — в [ROADMAP.md](./ROADMAP.md).

### 3.1. P0 и P1 — открытые и частично исправленные

| ID | P | Компонент | Проблема | Статус и причина |
|---|---|---|---|---|
| IMG-1 / AVA-4 | P0 | BaseImage, BaseAvatar | lazy-изображение через 5 с навсегда уходит в ошибку | Частично. Основной сценарий (изображения вне экрана) устранён. Осталось: по таймауту `<img>` по-прежнему удаляется, и поздний `load` картинку не восстанавливает; поэтому на медленной сети (eager или lazy, > 5 с после появления на экране) ошибка остаётся навсегда, а аватар — инициалами; `timeout` по умолчанию — 5000. |
| ICON-1 | P0 | BaseIcon | у потребителя пакета спрайт иконок не находится | Частично. Путь настраивается, файл экспортирован. README теперь описывает подключение: разделы «Иконки → Спрайт» и «Быстрый старт» — копирование в `public/` или импорт `?url`, `iconSpritePath`/`spritePath`, `BASE_URL` при подпути, тот же origin. Примеры 72–73 проходят vue-tsc strictTemplates: проверка примеров README (REPORT.md §5). … |
| CORE-1 / CRD-4 / CHP-4 | P1 | База (useCustomColor), BaseCard, BaseChip | цвет `color` протекает во вложенные компоненты | Не исправлено — по заданию этапа не трогалось: изменение дизайн-системы (SCSS всех компонентов), меняет вид вложенных компонентов и visual baseline. |
| TOK-1 / CHP-2 | P1 | Токены темы (BaseButton, BaseChip, BaseProgress; всего 31 компонент с `--color-accent`) | контраст ниже WCAG AA | Не исправлено — изменение дизайн-токенов (бренд-цвет), по заданию этапа не трогалось. `--color-accent` используют SCSS 31 компонента; в группе перегенерировать 19 baseline (Button 7, Progress 4, Loader 3, Chip 3, Alert 1, Card 1 — по отчёту исправлений). Приоритет записи P1 задаёт пара accent; пара Chip сама по себе — P2 (CHP-2). |
| FRM-1 | P1 | Группа (Input, Textarea, Checkbox, Radio, Switch, Pin, FormFieldLabel) | атрибуты, id и label не доходят до нативного контрола | Не исправлено — breaking change: меняется элемент, который получает атрибуты и слушатели. |
| MSK-1 | P1 | useInputMask (BaseInput) | маски с префиксом из 2+ литералов не набираются | Частично. Работает: посимвольный набор, если первая цифра не совпадает с цифрой префикса. Осталось: при пустом поле первая цифра, равная цифре-литералу префикса, поглощается `stripMask` как литерал (`useInputMask.ts:137-141` HEAD): `stripMask('8', '8 (###) ###-##-##') === ''`, поле остаётся пустым. Поэтому код, начинающийся с 8 (8-800…, 812), в маске `8 (###)…` не набирается; то же для 7 в маске `+7 (###)…`. … |
| MSK-2 | P1 | useInputMask (BaseInput) | позиционный `stripMask` теряет символы при правке и вставке | Не исправлено. Движок маски нужно переписывать вместе с MSK-3/4/5, а unit-тесты закрепляют ошибочное поведение (большой объём). В задание этапа не входило. |
| MSK-4 | P1 | useMaskedInputHandlers (BaseInput) | Backspace/Delete удаляют не тот символ | Не исправлено. Входит в пакет переработки движка маски (MSK-2…5), в задание этапа не входило. |
| SEL-2 | P1 | BaseSelect | нет клавиатурного выбора и семантики combobox/listbox | Не исправлено — большой объём (новая модель фокуса и ARIA), не входило в этап исправлений. |
| SRCH-2 | P1 | BaseSearch | клиентская фильтрация скрывает серверные результаты; гонки ответов не обработаны | Частично. Фильтр теперь можно отключить. Осталось: защита от гонок ответов; пользовательская функция фильтра вместо булева флага. По умолчанию (`isRemote=false`) поведение прежнее. |
| SLD-1 | P1 | BaseSlider (useSlider) | autoplay нельзя поставить на паузу (WCAG 2.2.2) | Частично. Нет постоянного механизма остановки (кнопки Pause/Play), поэтому для тача и виртуального курсора скринридера 2.2.2 не выполняется; live-региона нет. |
| MOD-1 | P1 | BaseModal | длинный контент не прокручивается, футер уходит за экран | Частично. Осталось: режим `isContained`: высота карточки по-прежнему ограничена `100vh`, а не контейнером. `&--contained` меняет только `position` (по CSS), поэтому в контейнере ниже окна шапка и подвал выходят за его границы; `100dvh` для мобильных не применён (A4). |
| DRP-1 / SEL-1 (pickers) | P1 | BaseDropdown (BaseSelect) | в панель нельзя поставить фокус | Частично. Поля ввода исправлены (SEL-1 закрыт). Осталось: кнопки, ссылки и `[tabindex]` в панели при `preventMousedown=true` по-прежнему не удерживают фокус: Tab на пункт меню возвращает его на триггер; после ввода в поиск и выбора опции фокус уходил на `body` — закрыто частичной правкой DRP-2 (координатор): при закрытии фокус из панели возвращается на триггер; … |
| CO-1 / DRP-3 / POPV-4 | P1 | useClickOutside (BaseDropdown, BasePopover) | клик во вложенном оверлее закрывает родителя | Не исправлено — архитектурное изменение (общий слой оверлеев), вне объёма этапа. |
| MM-1 | P1 | BaseMegaMenu | содержимое меню недостижимо с клавиатуры | Не исправлено — большой объём: переработка разметки MegaMenu/Node и контракта слотов (вместе с MM-4, MM-5). На этапе исправлений вынесено в roadmap. |
| DP-2 | P1 | BaseDatePicker | нет клавиатурного доступа и паттерна APG Date Picker Dialog | Частично. Осталось: `aria-haspopup`, `aria-expanded`, `aria-controls` на `<input>`. BaseInput не пробрасывает атрибуты на input (forms/FRM-1, см. также DP-6). Нет `aria-modal` и Tab-цикла: Tab и Shift+Tab уводят фокус из открытой панели, а она остаётся открытой. Space не открывает панель. Очистить значение с клавиатуры нельзя: у кнопки «Очистить» `tabindex="-1"`. Стрелки по сетке дней не работают — это CAL-1. … |
| TBL-2 | P1 | BaseTable / useTableSelection | «Выбрать все» захватывает строки, скрытые поиском или фильтром | Частично — действие заголовка исправлено. Осталось: (1) строки, выбранные поштучно до поиска, остаются в payload `select` при следующих кликах по чекбоксам строк (решение агента); (2) выбранные родителем disabled-строки попадают в payload, даже если скрыты поиском; (3) нет indeterminate (нужен в BaseCheckbox, см. CHK-1) и опции области `selectAllScope`; … |
| TBL-3 | P1 | BaseTable | смена rows сбрасывает страницу и выбор, clamp нет | Не исправлено — меняет поведение и требует нового API (controlled-выбор, серверный режим). Агент отнёс к roadmap. |
| TBL-4 | P1 | BaseTable | режимы button/infinite «схлопываются» после догрузки строк родителем | Не исправлено — нужен новый API и смена поведения, закреплённого тестом. Roadmap. |
| TBL-6 | P1 | BaseTable | сортировка недоступна с клавиатуры, нет aria-sort | Частично — клавиатура и `aria-sort` исправлены. Осталось: номер приоритета мультисортировки теперь внутри `aria-hidden` (рабочая копия `BaseTableHeader.vue:35-48`) и не озвучивается совсем. Ревью предлагало «приоритет N» через aria-describedby; в кастомном слоте `header-<key>` кнопки нет; подсказка «Сортировать» по фокусу не показывается (TT-1, overlays). |
| TRE-1 | P1 | BaseTree | нет ARIA-семантики дерева | Не исправлено — большой объём (модель WAI-ARIA APG вместе с TRE-2). Roadmap. |
| TRE-2 | P1 | BaseTree | клавиатура не по APG, в режимах выбора ветку не раскрыть | Не исправлено — большой объём, меняет порядок Tab. Roadmap вместе с TRE-1. |
| TRE-8 | P1 | BaseTree (README) | пример README падает, защиты от undefined items нет | Частично — README исправлен. Осталось: защита от undefined items в коде и тест на неё. |
| EDT-2 | P1 | BaseEditor | HTML не санитизируется на входе, выходе и при вставке | Не исправлено — изменение контракта, предложен sanitize-проп. Риск задокументирован в JSDoc и README. |
| EDT-4 | P1 | BaseEditor | загруженные медиа сохраняются как blob:-URL и теряются | Не исправлено — нужен новый контракт загрузки (prop/emit); в задание этапа исправлений не входило. |
| FU-2 | P1 | BaseFileUpload | прогресс и «Загружено» имитируются, управлять ими нельзя | Не исправлено. Нужны новый API и смена поведения по умолчанию (дизайн-решение), поэтому пункт вынесен в roadmap. |
| IMG-4 | P1 | BaseImage, BaseImageZoom | зум и галерея недоступны с клавиатуры и скринридеру | Частично. Осталось: открытие зума с клавиатуры; перевод, ловушка и возврат фокуса (подойдёт новый `useFocusTrap`); миниатюры как кнопки с `aria-current`; отдельный `alt` для каждого элемента галереи; клавиши на `document` (IMG-10). |

Из инфраструктурных (§1.2): CI-4 (релиз не зависит от CI), TST-1 (исключения из порогов покрытия — частично), TST-2 (stories в CI — частично), TST-3 (внешние изображения в stories), TST-4 (устаревшие эталоны), TST-5 (типы конфигурации), DEP-1 (уязвимости зависимостей), PKG-3 (`vue` в dependencies).

### 3.2. P2 и P3

Открыты 144 находок P2 и 133 находок P3, частично исправлены 23 и 8 (с учётом §1.2). Все с доказательствами — в `findings/<группа>.md` (таблицы A2/A3), кандидаты в работу с типом изменения и объёмом — в приложении [ROADMAP.md](./ROADMAP.md).

### 3.3. Побочные эффекты исправлений

Перепроверка нашла пять побочных эффектов исправлений; все закрыты — с тестами, которые падают без правки, или visual-проверкой:
- BTN-7 — клик по кнопке в loading доходил до кликабельного предка;
- DRP-2 (частично) — фокус из поля поиска BaseSelect после выбора или Escape уходил на `body`;
- E-1 — при нескольких месяцах в DatePicker блок времени повторялся под каждым месяцем;
- SLD-11 — перетаскивание слайда открывало зум;
- FORM-1 (в) — fieldset менял раскладку `customClass.content`; исправлено через `display: contents`, теста в jsdom нет, раскладку проверил visual-тест BaseForm.

Открытыми остаются новые нарушения axe, которые проявились вместе с добавленной семантикой (§5.4): `landmark-unique` (одинаковые имена `nav`/`region` при нескольких экземплярах на странице) и `aria-dialog-name` (диалог без заголовка).

## 4. Рекомендации

Порядок — по отношению пользы к риску. Подробный план с версиями — в [ROADMAP.md](./ROADMAP.md).

1. **Выпустить исправления аудита.** Закоммитить, включая новые неотслеживаемые файлы (список — в приложении Б), просмотреть и перегенерировать 11 visual-эталонов (§5.3), выпустить 1.4.0 (релиз 1.3.0 собран из `9c848ae` и этих исправлений не содержит) с разделом «Изменения поведения» из README. До выпуска вручную проверить сценарии из приложения В.
2. **Запускать stories в CI.** Play-функции и axe сейчас не проверяются нигде (TST-2): в базовой линии 19 stories падали в браузере, 3 не рендерились, и этого никто не видел. Прототип прогона — §5.4. Следом — локальные фикстуры изображений (TST-3) и более строгий порог visual (OVL-6).
3. **Смоук-тест пакета в CI.** Установка `.tgz` в чистое Vue+TS-приложение с `skipLibCheck: false` и проверкой бандла поймала бы PKG-1 и PKG-2 до публикации; тест-страж `packageBoundaries.spec.ts` закрывает только часть этого.
4. **Общий слой оверлеев** (CO-1, OVL-1/2, ESC-STACK). Самый крупный архитектурный долг: вложенные оверлеи закрывают друг друга, Escape закрывает все слои сразу, телепорт в `body` делает панели невидимыми в fullscreen. От него зависят меню настроек, тултипы и плеер.
5. **Доступность составных виджетов по APG:** BaseSelect (SEL-2), BaseTree (TRE-1/2), BaseMegaMenu (MM-1), BaseDatePicker (DP-2, остаток), меню и выпадающие панели (DRP-2, MENU-1), тултипы (TT-1). Вместе с контрастом токенов (TOK-1) это основные препятствия для WCAG 2.2 AA.
6. **Формы: атрибуты на нативный контрол** (FRM-1). План из трёх шагов уже согласован с кодом: `useId`/`for`/`inputAttrs` (minor) → предупреждения (minor) → `inheritAttrs: false` (major).
7. **Безопасность контента:** проп `sanitize` у BaseEditor (EDT-2) и контракт загрузки медиа вместо `blob:` (EDT-4); проверка схем для ссылок BaseSideBar (SB-6) и редактора (EDT-5).
8. **Покрытие:** вернуть под пороги исключённые компоненты форм и сократить список исключений composables (TST-1); включить `branches` для компонентов.
9. **Релизный процесс:** публикация только после зелёного CI (CI-4); `npm audit` — отдельным PR (DEP-1); `vue` только в peerDependencies в следующем major (PKG-3).
10. **Медиаплеер** — после пунктов 4–5, по плану [MEDIA_PLAYER_PLAN.md](./MEDIA_PLAYER_PLAN.md).

## 5. Проверки

Окружение: Linux (облачный контейнер), Node 22.22.2, npm 10.9.7; зависимости — `npm ci` по `package-lock.json` проекта. «До» — чистая копия коммита `9c848ae`, «после» — рабочая копия с исправлениями; обе собраны и проверены с нуля в одном окружении.

### 5.1. Команды проекта

| Проверка | Команда | До (`9c848ae`) | После | Ограничения |
|---|---|---|---|---|
| Установка в изоляции | `npm ci` (lifecycle-скрипты включены) | exit 0, 1096 пакетов, 22 с; `prepare` (husky) печатает «.git can't be found» — не ошибка | exit 0, 20 с | Реестр npm через прокси окружения |
| ESLint | `npm run lint` | 0 ошибок, 0 предупреждений | 0 / 0 | — |
| Типы исходников и тестов | `npx vue-tsc -b tsconfig.app.json` (после — `npm run typecheck`) | **exit 1**, 8 ошибок в 5 spec-файлах (CI-1) | exit 0 | — |
| Типы конфигурации | `npx tsc -p tsconfig.node.json --noEmit` | exit 2, 48 ошибок | exit 2, 48 ошибок | Не исправлялось (TST-5) |
| Гейты stories и a11y | `node scripts/check-stories-coverage.mjs`, `node scripts/check-a11y-coverage.mjs` | exit 0 / 0 | exit 0 / 0 | Гейт play ищет подстроку (TST-2) |
| Unit + integration | `npm run test:unit` | 183 файла, 3262 теста — все зелёные | 189 файлов, 3608 тестов — все зелёные (финальный прогон `test:utils:coverage` после последних правок — 3610) | jsdom: без вёрстки и реального фокуса |
| Порог components (100% lines/functions/statements на файл) | `npm run test:components:coverage` | exit 0; итог 100 / 98,91 / 100 / 100 (stmts/branch/funcs/lines) | exit 0; 100 / 99,04 / 100 / 100 | Порог охватывает 31 из 96 SFC; 9 каталогов компонентов не попадают ни в один отчёт (TST-1) |
| Отчёт components-heavy (без порога) | `npm run test:components-heavy:coverage` | 91,02 / 85,32 / 86,30 / 90,93 | 92,46 / 87,33 / 89,07 / 92,77 | — |
| Порог composables (100% на файл) | `npm run test:composables:coverage` | exit 0; 100% | exit 0; 100% | 27 из 78 файлов исключены |
| Порог utils (100% на файл) | `npm run test:utils:coverage` | exit 0; 100% | exit 0; 100% — **с `navigationUtils` под порогом** | `storybookUtils` исключён |
| Сборка библиотеки | `npm run build:lib` | exit 0; `dist` 1,92 МБ, рантайм Storybook в `chunks/utils-*.js`, 1 висячая ссылка в `.d.ts` | exit 0; 1,35 МБ, Storybook нет, висячих ссылок 0 | Анализ `dist` — скриптом аудита |
| Пакет | `npm pack` | 406,2 КБ, распакован 2,0 МБ, 580 файлов | 297,9 КБ, 1,4 МБ, 584 файла | — |
| Сборка Storybook | `npm run build-storybook` | exit 0; `__docgenInfo` у 0 модулей | exit 0; `__docgenInfo` у 53 модулей | Первая сборка после IMG-2 падала — см. STB-1 |
| Уязвимости | `npm audit`, `npm audit --omit=dev` | 39 (critical 1, high 13, moderate 23, low 2); prod — 2 high | без изменений | Зависимости не обновлялись (DEP-1) |

### 5.2. Playwright против собранного Storybook

Браузер: предустановленный Chromium 141 (headless shell). Playwright 1.60 рассчитан на Chromium 148, но загрузка браузеров была недоступна; результаты «до» и «после» получены на одном и том же браузере, поэтому сравнимы между собой.

| Набор | Команда | До | После |
|---|---|---|---|
| E2E | `npm run test:e2e` (`PLAYWRIGHT_REUSE_SERVER=true`, `scripts/serve-storybook-static.mjs`) | 56 из 56 | 57 из 57 (новый тест MOD-1 — прокрутка длинной модалки — проходит в браузере) |
| Visual | `npm run test:visual` | 233 из 240 | 222 из 240 (финальный прогон на итоговом коде) |

Разбор 18 падений visual после исправлений (эталоны **не обновлялись**):
- **7 — окружение, одинаково до и после:** stories BaseImage (default, fits, border-radii, dark-theme) и BaseSlider (default, fade, dark-theme) грузят картинки с внешних хостов (`images.unsplash.com` и др.), доступ к которым в окружении закрыт — TST-3.
- **11 — ожидаемые изменения от исправлений**, разобраны в §5.3.
- **Нестабильный тест (вне этих 18):** BaseTour dark-theme однажды упал в промежуточном прогоне — clip снимка считается по размеру карточки во время анимации появления (340 → 320 px). В финальном прогоне и в 3 повторах подряд — зелёный; карточка в обоих вариантах 300 px.

### 5.3. Ожидаемые визуальные изменения

Снимки «до» (текущий эталон) и «после» (фактический рендер) — в `docs/audit/visual-changes/`. После просмотра эталоны обновляются командой `npm run test:visual:update` на Linux или меткой `visual:update-baselines` в PR (CI-2).

| Снимок | Что было | Что стало | Причина |
|---|---|---|---|
| `base-pagination--default`, `--many-pages`, `--dark-theme` | Все номера страниц залиты акцентным цветом — текущая страница не отличается | Залита только текущая страница, остальные — вариант `soft` | PG-1 |
| `base-empty--size-scale` | При масштабе 75% и 150% отступы схлопнуты | Отступы масштабируются пропорционально | EMP-1 |
| `base-slideover--default`, `--left-side` | Эталон зафиксировал спиннер загрузки Storybook и страницу ошибки «Couldn't find story» | Открытая панель; на кнопке закрытия видимое кольцо фокуса (фокус переводится в диалог) | OVL-6 (спек переведён на существующие stories), MOD-A11Y |
| `base-button-default`, `-disabled`, `-loading` | Пустые кнопки: текст из `args.default` не попадал в слот | Кнопки с текстом («Кнопка», «Отключена», спиннер в кнопке нормальной ширины) | STB-1 (docgen) |
| `base-card--default`, `--hoverable` | Пустое тело карточки | Текст «Содержимое карточки» / «Наведите курсор» в теле | STB-1 (docgen) |

Ожидались, но **не изменились** (проверено): `base-form--loading`/`--disabled` (fieldset с `display: contents` не влияет на раскладку), `base-table--default`/`--dark-theme` (кнопка в заголовке сортируемой колонки), `base-rating--default`.

### 5.4. Все stories в Chromium

Инструмент аудита (Playwright-скрипт по `index.json` собранного Storybook, вне репозитория): каждая story открывается отдельно, ждёт `storyFinished`, собирает ошибки рендера, падения play-функций, ошибки страницы и отчёт axe из addon-a11y (правило `color-contrast` отключено конфигурацией проекта, minor/moderate-правила включены как в режиме разработки). Предупреждения Vue не собираются: `storybook-static` — production-сборка.

| Показатель | До | После |
|---|---|---|
| Stories | 1185 | 1186 (новая: Search RemoteResults) |
| Ошибка рендера | 3 (DatePicker Interactive, ExternalEndUpdate, ExternalSelectedUpdate — DP-9) | 0 |
| Падает play-функция | 19 | **0** (полный повторный прогон после правки stories) |
| Stories с нарушениями axe | 390 | 292 |
| Stories с ошибками в консоли | 184 (недоступные внешние изображения — 162, 404 локальных изображений — 4, остальное — сообщения упавших play) | 165 (внешние изображения — 162, 404 — 4: BaseImage LocalSrc*, BaseTable rich-content/with-images ссылаются на отсутствующие файлы; у одной story оба типа) |

Падения play до исправлений: BaseButton ×4 и BaseCard ×2 (пустые слоты — STB-1), BaseChip long-content, BaseIcon и BaseSideBar with-custom-class (`expect` не импортирован), BaseImage ×2 (keydown в `window`), BaseSlider with-zoom (IMG-3), BaseBadge и BaseLoader size-scale (неверное ожидаемое число элементов), BaseTooltip ×5 (play искали обёртку `.base-tooltip` вместо попапа `.base-tooltip-popup`: проверки «тултип появился» проходили всегда, «тултип скрылся» — никогда). Все исправлены; play Tooltip, Badge и Loader теперь проверяют поведение (попап, значения `--size-scale`).

Нарушения axe по правилам (число stories):

| Правило | Влияние | До | После | Комментарий |
|---|---|---|---|---|
| `button-name` | critical | 271 | 110 | Пустые кнопки из-за STB-1, имена иконочных кнопок (Alert, Notification, Pagination, Calendar, Tabs, FileUpload, ImageZoom); остаток — BTN-2 и иконочные кнопки других компонентов |
| `aria-required-children` | critical | 74 | 74 | Составные виджеты без нужных дочерних ролей (TRE-1, SEL-2 и др.) |
| `label` | critical | 48 | 50 | FRM-1: подпись не связана с нативным контролом; +2 — stories DatePicker со временем: после DP-1 блок времени стал виден, у его полей нет подписей (CAL-1) |
| `target-size` | serious | 42 | 42 | Мелкие иконочные цели (WCAG 2.5.8) |
| `aria-input-field-name` | serious | 38 | 38 | FRM-1, SEL-2 |
| `empty-table-header` | minor | 24 | 24 | Пустые `th` служебных колонок BaseTable |
| `scrollable-region-focusable` | serious | 14 | 8 | Исчезли в 7 stories (BaseChat ×6, BaseTable sticky-header); +1 новое — тело длинной модалки теперь прокручивается (MOD-1), но само не фокусируемо |
| `landmark-unique` | moderate | 6 | 16 | Новое: `<nav aria-label>` у хлебных крошек, `region` у панелей аккордеона и у контейнера уведомлений — на story с несколькими экземплярами имена совпадают |
| `aria-progressbar-name` | serious | 12 | 0 | PRG-1 |
| `aria-dialog-name` | serious | 0 | 2 | Новое: у Modal без `title` и Slideover со слотом header теперь есть `role=dialog`, но нет имени (MOD-A11Y, остаток) |
| `list` / `listitem` | serious | 4 / 4 | 4 / 4 | — |
| `link-name` | serious | 3 | 3 | — |
| `aria-prohibited-attr`, `aria-allowed-attr` | serious / critical | 2 / 2 | 0 / 0 | `aria-label` на `div` у пустых BaseBreadcrumbs (корень стал `nav`, BC-1); ARIA вертикального BaseSeparator (SEP-1) |

Правила, которых у story не было до исправлений, появились в 16 stories: `landmark-unique` ×10 и `aria-dialog-name` ×2 — следствие добавленной семантики (роль появилась, а на story с несколькими экземплярами имена совпадают или имени нет); `label` ×2 — в DatePicker со временем стал виден блок времени без подписей (CAL-1); `scrollable-region-focusable` ×1 — прокручиваемое тело модалки (MOD-1); `button-name` ×1 — новая story Search RemoteResults (SRCH-4). Остатки учтены в реестрах и в ROADMAP.

### 5.5. Клавиатура и фокус в Chromium

Сценарии выполнены скриптом аудита в обоих собранных Storybook (одинаковые шаги до и после):

| Сценарий | До | После |
|---|---|---|
| BaseAccordion: ссылка в закрытой панели достижима по Tab? | да | нет (`inert`); заголовки — `role=button` c `aria-expanded` |
| BaseTabs: tabindex вкладок; ArrowRight; End | все вкладки в Tab-порядке, стрелки не работают | `0/-1/-1/-1`; стрелка переводит фокус и выбор, End — на последнюю |
| BaseModal: роль, фокус внутри, 8 × Tab, Escape | роли нет, фокус снаружи, Tab уходит из окна 5 раз из 8, после Escape фокус на `body` | `role=dialog`, `aria-modal`, `aria-labelledby`, фокус внутри, 0 выходов, после Escape фокус на кнопке «Открыть» |
| BaseButton: фокус при переходе в loading | фокус сбрасывается на `body` (нативный `disabled`) | фокус остаётся на кнопке, `aria-busy="true"`, `disabled` нет |
| BaseForm в loading: нативные поля | 0 из 3 заблокированы, 5 табуляций внутрь формы | 3 из 3 заблокированы (`fieldset` с вычисленным `display: contents`), `aria-busy`, 0 табуляций внутрь |
| BaseDatePicker: фокус после выбора дня мышью | `body` | поле ввода |
| BasePagination / BaseSwitch / BaseBreadcrumbs | нет `aria-current`, стрелки без имён / нет роли switch / нет `nav` | `aria-current="page"`, «Предыдущая/Следующая страница» / `role="switch"` / `nav` «Хлебные крошки» |

Не проверялось: скринридеры (NVDA, VoiceOver), Safari, Firefox, мобильные браузеры, масштаб 200–400% — см. приложение В.

### 5.6. Пакет глазами потребителя

`npm pack` → чистое приложение Vite + Vue 3.5 + TypeScript 6 (`strict`, `skipLibCheck: false`), зависимость — локальный `.tgz`: `npm install`, затем удаление `node_modules` и `npm ci` с lifecycle-скриптами, `npm ls vue`, `vue-tsc --noEmit`, `vite build`, проверка собранного приложения в Chromium на маршрутах `/` и `/users/42`. Приложение использует BaseButton, BaseInput, BaseSelect, BaseIcon, BaseModal из корня пакета, `useDebounceFn` из `/composables`, `formatFileSize` из `/utils`.

| Проверка | Пакет из `9c848ae` | Пакет после исправлений |
|---|---|---|
| `npm ci` | exit 0 | exit 0 |
| `npm ls vue` | одна копия (deduped) | одна копия |
| `vue-tsc --noEmit` | **TS2307** `Cannot find module './storybookUtils'` в `dist/utils/index.d.ts` | 0 ошибок |
| `vite build` | exit 0 | exit 0 (+ спрайт `icons-*.svg` 34,7 КБ как asset через `?url`) |
| JS-бандл приложения (именованные импорты из корня, `/composables`, `/utils`) | 445 КБ, рантайма Storybook нет (вырезан tree-shaking'ом) | 460 КБ (+15 КБ: ловушка фокуса, проверки URL и др.), рантайма Storybook нет |
| JS-бандл варианта с `import { utils } from '@ramzes1385/rise-ui-kit'` (отдельная сборка) | 923 КБ, внутри `storybook/instrumenter`, `chai/inspect`, `@testing-library`, `__STORYBOOK_*` | 463 КБ, рантайма Storybook нет |
| Спрайт иконок на `/` и `/users/42` | 404 (`/icons.svg`, `/users/icons.svg`), иконка 0×0 | 200 (`/assets/icons-*.svg`), иконка 10×10 |
| BaseModal с клавиатуры | роли нет, фокус не переходит | `role=dialog`, `aria-modal`, фокус внутри, после Escape — на кнопке-триггере |
| Шрифт кнопки без импорта шрифтов | `Arial` | `Arial` — ожидаемо, описано в README («Шрифты», PKG-4) |

### 5.7. Примеры README

Каждый пример шаблона и script из README извлечён в отдельный SFC и проверен `vue-tsc` со `strictTemplates` против исходников рабочей копии: **старые примеры** — 44 ошибки в 33 из 67 файлов; **новые** — 1 ошибка в 73 файлах (ожидаемая: пример глобальной регистрации без импорта — пакет не объявляет `GlobalComponents`, это указано в README). Старые примеры компилировались против исправленного кода, а не против HEAD; API в исправлениях только расширялся, поэтому ошибки старых примеров от этого не зависят.

### 5.8. Что не проверялось

- GitHub Actions (`ci.yml`, `release.yml`, `deploy-storybook.yml`) не запускались: изменения workflow проверены только парсером YAML.
- Dev-сервер Storybook (`npm run storybook`) не запускался; проверена только статическая сборка.
- Браузеры, кроме Chromium 141; мобильные устройства и тач; скринридеры; RTL; SSR (`renderToString`); производительность и утечки памяти под нагрузкой.
- Visual-эталоны сравнивались с порогом проекта `maxDiffPixelRatio: 0.15` — мелкие изменения могли не попасть в падения.
- Команды релиза (`release`, `release:dry`) не запускались — по условиям задачи.

## Приложение А. Визуальные изменения

Описаны в §5.3; файлы `docs/audit/visual-changes/<снимок>-before.png` (текущий эталон) и `<снимок>-after.png` (рендер после исправлений) для 11 снимков: BaseButton default/disabled/loading, BaseCard default/hoverable, BaseEmpty size-scale, BasePagination default/many-pages/dark-theme, BaseSlideover default/left-side.

## Приложение Б. Изменённые и новые файлы

Изменены 213 отслеживаемых файлов (+6317 / −688 строк): `src/components` — 126, `src/composables` — 57, `src/utils` — 17, `src/plugins` — 3, `src/plugin.ts`, `src/constants/ui.ts`, `README.md`, `docs/README.md`, `docs/CONTRIBUTING.md`, `package.json`, `vitest.config.ts`, `build/storybook/main.ts`, `scripts/storybook-dev.mjs`, `.github/workflows/ci.yml`.

**Новые файлы — не отслеживаются git, их нужно добавить в коммит** (без них ломаются импорты и сборка):
- `src/utils/urlUtils/` — `urlUtils.ts`, `index.ts`, `urlUtils.spec.ts` (импортируется из `navigationUtils`, `fileUtils`, `utils/index.ts`);
- `src/composables/useFocusTrap/` — composable, типы, `index.ts`, spec (импортируется BaseModal/BaseSlideover, реэкспорт из `composables/index.ts`);
- `src/__tests__/packageBoundaries.spec.ts`;
- `src/components/BaseCalendar/__tests__/BaseCalendar.time.integration.spec.ts`;
- `src/components/BaseDatePicker/__tests__/BaseDatePicker.calendar.integration.spec.ts`;
- `src/composables/useVariant/useVariant.constants.spec.ts`;
- `docs/audit/` — этот отчёт и приложения.

`package-lock.json` не менялся, зависимости не обновлялись.

В папку проекта изменения перенесены поверх коммита `21343e2` (релиз 1.3.0 от semantic-release: меняет только `version` в `package.json` и `package-lock.json` и `CHANGELOG.md`). `package.json` объединён трёхсторонним слиянием — версия 1.3.0 сохранена, остальные файлы между `9c848ae` и `21343e2` не менялись. Относительно `21343e2` итог тот же: 213 изменённых файлов (+6317 / −688) и 7 новых путей.

Кандидаты на удаление (не удалялись — решение владельца): `scripts/patch-storybook-coverage-percentage.mjs` (патчил удалённый аддон, STB-2), 234 устаревших PNG по пути `tests/visual-snapshots/src/components/<X>/<X>.visual.spec.ts-snapshots/` (TST-4).

## Приложение В. Ручные сценарии доступности (WCAG 2.2 AA)

Автоматически в Chromium проверены сценарии из §5.5. Ниже — то, что требует человека со скринридером и реальных устройств; **эти сценарии в аудите не выполнялись**.

| # | Сценарий | Инструмент | Критерии WCAG | Ожидаемый результат |
|---|---|---|---|---|
| 1 | Открыть BaseModal с клавиатуры, пройти Tab/Shift+Tab, закрыть Escape | NVDA + Chrome, VoiceOver + Safari | 2.1.2, 2.4.3, 4.1.2 | Объявляется «диалог» с заголовком; фокус не выходит из окна; после закрытия фокус на кнопке-триггере |
| 2 | BaseTabs: стрелки, Home/End, чтение панели | NVDA, VoiceOver | 2.1.1, 4.1.2 | «вкладка, выбрано, 2 из 4»; содержимое панели читается после Tab |
| 3 | BaseAccordion: закрытая панель | NVDA | 1.3.1, 2.4.3 | Содержимое закрытых панелей не читается и не достижимо по Tab (`inert` в Safari ≥ 15.5, Firefox ≥ 112) |
| 4 | BaseButton в loading внутри BaseForm (`display: contents` у fieldset) | Safari macOS/iOS | 2.4.3, 4.1.2 | Фокус остаётся на кнопке; «занято/busy»; раскладка формы не меняется |
| 5 | BaseDatePicker: выбор даты мышью и с клавиатуры | Safari macOS | 2.4.3 | После выбора фокус в поле (в Chromium проверено автоматически, Safari не фокусирует кнопки по клику) |
| 6 | BaseNotification error/success | NVDA, VoiceOver | 4.1.3 | Ошибка объявляется сразу (`alert`), успех — вежливо (`status`); кнопка «Закрыть» названа |
| 7 | BaseSwitch, BaseRadio со слотом `option`, BaseSelect с поиском | NVDA | 4.1.2 | «переключатель, включено»; радио-группа читается; в поиске Select можно печатать |
| 8 | Контраст основных кнопок и фокус-кольца | Colour Contrast Analyser | 1.4.3, 1.4.11 | Сейчас не проходит (TOK-1: 2,80:1 и 2,69:1) — ожидаемо до изменения токенов |
| 9 | Масштаб 200% и 400% (reflow), ширина 320 px | Chrome | 1.4.4, 1.4.10 | Таблица, MegaMenu и DatePicker без потери содержимого (в аудите не проверялось) |
| 10 | `prefers-reduced-motion` | Chrome DevTools (эмуляция) | 2.3.3, 2.2.2 | BaseSlider без автопрокрутки; остальные анимации пока не учитывают настройку (OVL-5, ANI-2) |
| 11 | Размер целей 24×24 | axe `target-size` + ручная проверка | 2.5.8 | Иконочные кнопки (закрытие, пагинация, теги) — см. нарушения `target-size` в §5.4 |

## Приложение Г. Инструменты аудита

Вспомогательные скрипты запускались вне репозитория и в проект не добавлялись: прогон всех stories в Chromium (рендер, play, axe), клавиатурные сценарии, анализ `dist` (строки Storybook, висячие импорты в `.d.ts`, размер), приложение-потребитель для `.tgz`, извлечение и компиляция примеров README. Если нужны в репозитории — их удобно оформить как CI-шаги из ROADMAP («Инфраструктура»).
