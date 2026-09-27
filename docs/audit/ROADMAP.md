# План развития Rise UI Kit по итогам аудита

Основа — подтверждённые и неисправленные находки из [REPORT.md](./REPORT.md) (ID — как в `findings/*.md`). Версии указаны по semver: **patch** — исправление без изменения API, **minor** — новое необязательное API или поведение, **major** — несовместимые изменения. Объём: S — до дня, M — несколько дней, L — неделя и больше. Полный список кандидатов по группам (303 строки) — в приложении в конце документа.

## Статус после редизайна (сентябрь 2026)

После аудита сделан редизайн всей библиотеки: токены `--rise-*`, новые стили 51 компонента, переписанные stories — см. [docs/design](../design/DESIGN_SYSTEM.md). Что это меняет в плане ниже:

| ID | Статус | Что сделано |
|---|---|---|
| TOK-1 / CHP-2 | Закрыт | Новые токены проходят WCAG AA в обеих темах (`npm run test:contrast`, шаг CI), правило axe `color-contrast` включено в Storybook, `brightness()`-наведения заменены токенами `-hover` |
| CORE-1 / CRD-4 / CHP-4 | Частично | Миксин `reset-custom-color` на обёртках пользовательских слотов (карточка, модальное окно, панели, чат, таблица…): проп `color` не перекрашивает вложенные кнопки и поля. Сброс в корне каждого `.base-*` не делался |
| CORE-2 | Открыт | Масштаб по-прежнему наследуется вложенными компонентами без своего `sizeScale` — поведение описано в DESIGN_SYSTEM, раздел 2 |
| TST-4, STB-2 | Закрыт | Устаревшие эталоны удалены вместе со всеми старыми (baseline перегенерируются после редизайна), патчи Storybook удалены |
| SB-8 и мёртвый код stories | Закрыт | Тёмная тема — через toolbar и `&globals=theme:dark`; forced-state, coverage- и DarkTheme-stories, `try/catch`, внешние URL, `new Date()`/`Math.random()` удалены; все 51 компонент с docs-описанием |
| OVL-6 | Частично | Visual spec снимают оверлеи открытыми (scope `page`) и ждут окончания play; baseline нужно сгенерировать |
| TST-2 | Закрыт | `npm run test:stories` (`scripts/check-stories.mjs`): каждая story в двух темах — рендер, play, axe, без внешних запросов; отдельный job CI. Подстрока `play:` в `check-a11y-coverage.mjs` исправлена |
| EDT-2, EDT-5, SB-6 | Закрыт | Очистка HTML в BaseEditor по умолчанию (`sanitize`, `sanitizeHtml`), проверка схемы ссылок в редакторе и в BaseSideBar — порция 1.1 плана 2.0 |

Открытые задачи редизайна — [docs/design/FOLLOW_UPS.md](../design/FOLLOW_UPS.md). Изменения для приложений — [docs/design/CHANGES_FOR_APPS.md](../design/CHANGES_FOR_APPS.md).

Версия следующего релиза: публичный API совместим (алиасы 1.x сохранены), но меняются вид всех компонентов и визуальные значения по умолчанию (отступы, размеры). По semver это minor (1.4.0); если релиз должен явно предупредить о смене внешнего вида — выпускать как 2.0.0 с руководством по переходу из CHANGES_FOR_APPS.md.

## Этап 0. Выпустить исправления аудита (minor 1.4.0)

1. Закоммитить изменения, **включая все новые неотслеживаемые файлы** (`git status --short | grep '^??'`) — без них сломаются импорты и сборка: `src/styles/_tokens.scss`, `src/stories/`, `src/__tests__/`, `src/composables/useFocusTrap/`, `src/composables/useScrollableRegion/`, `src/utils/urlUtils/`, `build/storybook/{manager,theme}.ts`, `build/storybook/preview.scss`, `scripts/check-contrast.mjs`, `docs/design/`, `docs/audit/` и новые spec-файлы компонентов.
2. Сгенерировать visual-эталоны **после просмотра** изменений — после редизайна меняются все снимки, объяснение по компонентам в [docs/design/VISUAL_CHANGES.md](../design/VISUAL_CHANGES.md); через метку `visual:update-baselines` в PR (CI-2) или `npm run test:visual:update` локально на Linux.
3. ~~Удалить устаревшие эталоны по старому пути (TST-4, 234 PNG) и неиспользуемый `scripts/patch-storybook-coverage-percentage.mjs` (STB-2).~~ Сделано при редизайне.
4. Релиз: поведение изменилось (Tabs — выбор следует за фокусом, BaseImage — AVIF/WebP только по флагам, BaseNotification — `duration: 0`, BaseSwitch — роль `switch`, `utils` без помощников Storybook) → по правилам semantic-release это `feat`/`fix` с описанием в теле коммита; README уже содержит раздел «Изменения поведения (не выпущено)». Релиз 1.3.0 (коммит `21343e2`) собран из `9c848ae`, то есть без этих исправлений; в них есть новое необязательное API, поэтому следующий релиз — 1.4.0.
5. Проверить в Safari и Firefox то, что проверено только в Chromium (REPORT.md §5.5): фокус BaseButton в loading, `inert` у аккордеона, `display: contents` у fieldset BaseForm, возврат фокуса DatePicker после выбора мышью; сценарии со скринридером — REPORT.md, приложение В.

## Этап 1. Быстрые исправления (patch 1.4.x, объём S)

Отобраны из 139 кандидатов «patch + S» — те, что закрывают остатки P0/P1 или заметные дефекты:

| Тема | ID | Суть |
|---|---|---|
| Остатки P0/P1 | IMG-1 (остаток), ICON-1 (остаток), TRE-8, MOD-1 (остаток), MSK-1 (остаток) | Не удалять `<img>` по таймауту; путь спрайта по умолчанию и тест подпути; `items ?? []` в BaseTree; высота модалки в `isContained`, `100dvh`; не поглощать цифру префикса маски |
| Утечки и SSR | SRCH-6, OVL-4 / TOUR-6, BP-1 | Снятие блокировки прокрутки при размонтировании оверлея поиска; guard'ы `document`/`window`, подписки в `onMounted` |
| Клавиатура и имена | FRM-4, INP-4, RAD-2, PIN-2, SB-1, SB-2, SB-5, BC-3, PG-3, TOUR-4, SEL-4 | Кольцо фокуса у полей, `radiogroup`, `role=group` у PIN, имена в свёрнутом SideBar, `<nav>` у пагинации, ловушка фокуса в карточке тура, кнопка удаления тега |
| Безопасность | SB-6, SCH-1, EDT-5 | `isSafeUrl` для ссылок BaseSideBar; тесты экранирования `schemaUtils`; фильтрация схем ссылок в редакторе |
| Движение | EXP-1, NTF-7, ANI-3, BTN-4 | Reduced motion в раскрытии панелей, префиксованные имена переходов |
| Типы | DRP-5, INP-7 (типы) | Экспорт `Expose`-типов всех компонентов |

## Этап 2. Доступность и слои (minor 1.5)

Архитектурные изменения, от которых зависят и плеер, и большинство открытых P1:

1. **Общий слой оверлеев** — CO-1 / DRP-3 / POPV-4, OVL-1 / PCK-3, OVL-2, ESC-STACK, ESC-1, CO-2 (L). Реестр открытых слоёв (provide/inject): Escape и клик вне получает только верхний слой, вложенные панели не закрывают родителя, z-index по порядку открытия, проп `teleportTo`/контейнер слоёв (нужен для fullscreen), перенос `data-theme`.
2. **Паттерны APG для выпадающих элементов** — DRP-2 (остаток), MENU-1 (развитие), SEL-2, SRCH-4, TT-1, MM-1 (L). Menu button с `aria-haspopup/expanded/controls`, `menu`/`menuitemradio`, select-only combobox для BaseSelect, тултип по фокусу, disclosure-навигация MegaMenu.
3. **Формы** — FRM-1 шаги 1–2, FRM-2, FFD-2, FORM-1 (остаток), FORM-3 (M–L). `useId` и `for`, проп `inputAttrs`, `aria-describedby`/`aria-invalid`, контекст поля и формы (блокировка кастомных контролов).
4. **Дерево и таблица** — TRE-1/TRE-2 (APG Tree), TBL-3/TBL-4 (controlled-выбор и страница, серверный режим), TBL-6 (остаток: озвучивание приоритета мультисортировки), TBL-18 (виртуализация) (L).
5. **Даты** — DP-2 (остаток: сетка по APG Date Picker Dialog, `aria-expanded` на поле), DP-3/DU-1 (форматы) (M).
6. **Контраст** — TOK-1 (M, визуальные изменения ~30 компонентов): `--color-accent #c2410c`, `--color-accent-hover #9a3412`, новый `--color-on-accent` для тёмной темы, `--color-text-muted #66666e` — значения и расчёты в `findings/display.md`. Включить правило axe `color-contrast` хотя бы для stories по умолчанию.
7. **Контракты данных** — EDT-2 (`sanitize?: (html) => string`, `pasteAsPlainText`), EDT-4 (контракт загрузки медиа вместо `blob:`), FU-2 (управляемый прогресс загрузки), NTF-3/NTF-6 (уведомления без автозакрытия и с действием), SRCH-2 (отмена устаревших ответов: `{ query, signal }`), RNG-3/RNG-4 (`formatValue`, Home/End/PageUp/PageDown, Pointer Events) (M).

## Этап 3. Несовместимые изменения (major 2.0)

Собрать в один мажорный релиз с руководством по миграции:
- FRM-1 шаг 3 — `inheritAttrs: false` у полей ввода: атрибуты и слушатели уходят на нативный контрол (учесть внутренних потребителей: `ChatHeader.vue:35`, `DatePickerField.vue:15`, `ChatInput.vue:136-137`).
- CORE-1 / CORE-2 — сброс `--custom-*` и `--size-scale` на корне каждого компонента (цвет и масштаб перестают протекать во вложенные компоненты).
- Удаление мёртвого API: `confirm` у BaseModal (MOD-4), `notificationKey` (NTF-4), неиспользуемые props из типа Slideover (SLD-4), `rootRef` (INP-7).
- TAB-3 — иконки вкладок через BaseIcon вместо HTML-строки; CP-6 — семантика `change` у BaseColorPicker; DEB-1 — сигнатура `useDebounce`; PIN-4 — формат значения без служебных пробелов.
- PKG-3 — `vue` только в `peerDependencies` (+ `devDependencies`), шрифты — как необязательные.

## Инфраструктура (параллельно этапам)

| Задача | ID | Тип | Объём |
|---|---|---|---|
| Запуск всех stories (рендер, play, axe) в CI — Storybook test-runner или Playwright-скрипт по `index.json` (прототип из аудита: REPORT.md §5.4); исправить подстроку `play:` в `check-a11y-coverage.mjs` | TST-2 | CI | M |
| Локальные фикстуры изображений для stories BaseImage/BaseSlider | TST-3 | тесты | S |
| Сократить исключения из порогов покрытия: вернуть под порог компоненты форм (BaseButton, BaseCheckbox, BaseRadio, BaseSwitch, BaseTextarea), затем остальные; `branches` > 0 | TST-1 | тесты | M–L |
| Ужесточить visual: `maxDiffPixelRatio` 0.15 → 0.01–0.02 с масками для текста, снимать открытые состояния оверлеев | OVL-6 | тесты | M |
| Ошибки типов в `tsconfig.node.json` (48) и шаг `tsc -p tsconfig.node.json` в CI | TST-5 | CI | S |
| Release только после зелёного CI (`workflow_run` или `needs`), `npm run ci:validate` в release, одна версия Node | CI-4 | CI | S |
| `npm audit`: обновить уязвимые dev-зависимости отдельным PR с полным прогоном; production-дерево (`nanoid`, `postcss` через `@vue/compiler-sfc`) — вместе с обновлением Vue | DEP-1 | зависимости | S–M |
| Смоук-тест пакета в CI: установка `.tgz` в чистое Vue+TS-приложение, `vue-tsc` со `skipLibCheck: false`, `vite build`, проверка отсутствия чужого рантайма в бандле (как в §5 отчёта) | PKG-1 (защита) | CI | S |
| Контроль размера пакета и бандла (size-limit или скрипт по `dist`) | — | CI | S |
| SSR-смоук: `renderToString` для всех компонентов в node | OVL-4 | тесты | M |

## Масштабирование

- **Стабильность API.** Экспортировать `Props/Emits/Slots/Expose` каждого компонента (DRP-5, INP-7); dev-предупреждения вместо молчаливого игнорирования неизвестных ключей (`customClass`, CORE-3/CORE-5); политика депрекаций: предупреждение в minor, удаление в следующем major.
- **SSR.** Guard'ы окружения (OVL-4, BP-1), подписки только в `onMounted`, смоук-тест в CI.
- **RTL.** В аудите не проверялся: стили используют физические свойства (`left/right`, `margin-left`), позиционирование оверлеев считает от левого края. Нужен отдельный проход: логические CSS-свойства, `dir` в stories, зеркальные иконки стрелок.
- **Производительность.** rAF-циклы на каждый тултип и подпись прогресса (TT-3, PRG-4), `watch` за объектами props (DP-4), IntersectionObserver на каждый BaseImage (IMG-1), виртуализация BaseTable/BaseTree (TBL-18).
- **Размер пакета.** После PKG-1 распакованный пакет 1,4 МБ; следующий шаг — отдельные точки входа на компонент и проверка tree-shaking в смоук-тесте.
- **Локализация.** Все тексты интерфейса — через props или provide (по образцу `labels` в плане плеера), сейчас большая часть — константы `UI_TEXT`/`UI_ARIA` на русском.

## Медиаплеер

Отдельный трек, план — в [MEDIA_PLAYER_PLAN.md](./MEDIA_PLAYER_PLAN.md). Зависит от этапа 2 (слой оверлеев, menu button, тултипы по фокусу, расширения BaseRange).

---

## Приложение. Кандидаты в roadmap по группам

Таблицы перенесены из реестров групп без изменений формулировок.


### Базовые компоненты отображения (display)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| CORE-1 / CRD-4 / CHP-4 | Миксин сброса `--custom-*` в корне каждого `.base-*` (или переменные на потребляющем элементе); у Chip — стиль на индикатор; story NestedCustomColor + Playwright | Сквозное изменение SCSS ~50 компонентов, меняет вид вложенных компонентов и baseline; тест только в браузере | minor | M |
| TOK-1 / CHP-2 | Новые значения токенов (light accent #c2410c, hover #9a3412 вместо `brightness`, dark `--color-on-accent`, error #dc2626/#b91c1c, muted #66666e); литерал `#ffffff` → токен; включить `color-contrast`; скрипт контраста в CI | Дизайн-решение (бренд-цвет); 31 компонент, перегенерация baseline (до 262) | minor | L |
| CORE-2 | Всегда выставлять `--size-scale` (в т.ч. `1`) или сброс в корне `.base-*`; browser-тест | Меняет размеры вложенных компонентов в масштабированных родителях | minor | S |
| BTN-2 | dev-warn для icon-only без имени, story IconOnly; добить 12 мест в Editor/Search/Slider/Table (другие группы) | Новое предупреждение; места вне группы | minor | S |
| ALR-1 (развитие) | Проп `closeLabel` у BaseAlert; провайдер/пропсы для строк `UI_ARIA`/`UI_TEXT` (сейчас русские строки читаются компонентами напрямую) | i18n — отдельная задача | minor | M |
| ALR-2 (развитие) | Проп `live` (`off`/`polite`/`assertive`) для статичных баннеров error/warning | Новый API | minor | S |
| ALR-3 | `--alert-bg`/`--alert-text` читают `--custom-*` для каждого типа | Имеет смысл вместе с CORE-1 | patch | S |
| ANI-1 | В group-режиме слот прямо в TransitionGroup, требовать key | Меняет DOM (исчезает обёртка), затрагивает BaseFileUpload | minor | M |
| ANI-2 / BTN-4 (часть) | `@media (prefers-reduced-motion: reduce)` для BaseAnimation и бесконечных индикаторов Button/Loader/Skeleton/Progress; общий миксин (согласовать с OVL-5) | Сквозное SCSS, visual | patch | M |
| ANI-3 | Префикс классов переходов (`base-anim-*`), собственные классы у BaseNotification | Ломает приложения, опирающиеся на глобальные `.fade-*`/`.list-*` | major | M |
| LDR-1 (остаток) | Visually-hidden текст `label` внутри `role=status` при `hasLabel=false` | Не входило в объём этапа; можно сразу | patch | S |
| PRG-1 (остаток) | Не показывать «0%» в indeterminate, `aria-busy="true"` | Решение по виду подписи | patch | S |
| PRG-2 (остаток) | Проп `valueText` → `aria-valuetext` | Новый API (нужен плееру) | minor | S |
| PRG-3 (остаток) | `complete` и 100% по `clamped >= max`, а не по округлённому проценту | Меняет момент события | patch | S |
| PRG-4 | Подпись линии — CSS внутри fill без BaseTooltip и rAF | Визуальное изменение, baseline | minor | M |
| BDG-1 | Цвет текста на корне `.base-badge` через `custom-text`, soft — на корне | Visual baseline (dark) | patch | S |
| BDG-2 | `<button type="button">` при click-слушателе (или `isInteractive`), hover только у интерактивных | Меняет DOM и семантику | minor | M |
| CHP-1 | Проп `srLabel`, `<button>` для кликабельного индикатора | Новый API | minor | M |
| CRD-1 | «Растянутая ссылка» / проп `href`/`as`, событие от фокусируемого элемента | Новый паттерн и API | minor | M |
| CRD-2 | Отдельный проп `maxLines`/`isTruncated`; `height` — только overflow | Меняет поведение `height` | major (или minor с флагом) | S |
| CRD-3 | Убрать `opacity: .7` у подзаголовка | Visual baseline; удобно вместе с TOK-1 | patch | S |
| TXT-1 | Runtime-валидатор `tag` + фолбэк `p` + dev-warn; экспорт `TEXT_TAGS` | Не входило в объём этапа | patch | S |
| CORE-3 (остаток) / CORE-5 | Выровнять типы и поведение `customClass`/`useCustomStyle` (dev-warn на неизвестные ключи); валидация `sizeScale`/`padding` (`Number.isFinite`, clamp) | Затрагивает все компоненты | patch | S |
| CORE-4 (остаток) | Удалить мёртвый `--variant` (или начать использовать) и исправить JSDoc | Мелочь | patch | S |
| CORE-7 | Интерфейсы `WithVariant/WithColor/WithSizeScale`, убрать каст в `useStandardBaseComponent` | Сужение типов пропсов ломает TS у потребителей | major (или minor с `@deprecated`) | M |
| CNS-1 | Один источник значений (`r` из константы, без недостижимых `defaultPadding`, единый вторичный масштаб), удалить неиспользуемые константы | Рефакторинг | patch | S |
| UTL-1 / UTL-2 | `useId()`/`crypto.randomUUID()`, тест уникальности вместо тавтологии; JSDoc `isObject` | Мелочь | patch | S |
| BTN-3 | Поддержать hover/active/focus-цвета (`custom-*-all`) или поправить описание | Визуальное API | minor | S |
| BTN-4 (остаток) | `@keyframes rotation` → `base-button-rotation` | Мелочь | patch | S |
| BTN-5 | Экспорт `BaseButtonExpose`, `satisfies` в `defineExpose` | Новый экспорт типа | minor | S |
| ALR-4 / EMP-3 | Проп `titleTag` (Alert, Empty, Card), пропорциональный вторичный масштаб | Новый API | minor | S |
| ALR-5 | Единый цвет описания для пропа и слота | Visual | patch | S |
| ANI-4 / ANI-5 | `collapse` через grid-rows/измеренную высоту; `withDefaults({ show: true })` вместо `useExplicitPropDetection` | Мелочь | patch | S |
| LDR-2 / LDR-3 | Точки/бары только от `--loader-color`; оверлей — документация, z-index из токена, `inert`/`aria-busy` | Мелочь | patch | S |
| PRG-5 / PRG-6 / PRG-7 | Indeterminate для круга; слот и единый цветовой API для обеих форм, `immediate`; фон у story DarkTheme | Визуальные изменения | minor | M |
| SKL-1 / SKL-2 / SKL-3 | `aria-hidden` + паттерн в docs; селектор `[data-theme='dark']`; `!== undefined`, дефолтная высота `rect` | Мелочь | patch | S |
| EMP-2 | Реализовать `action` или объявить устаревшим и удалить | Удаление публичного типа — breaking | minor / major | S |
| CHP-3 | Единая семантика `maxValue`, санация `null`/`NaN`/`' '` | Меняет вывод | patch (docs) / minor (поведение) | S |
| SEP-3 / TXT-2 | `spacing` у простой линии, dashed через `custom-bg`, валидация `thickness`/`weight`/`maxLines` | Мелочь | patch | S |


### Формы (forms)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| FRM-1 (шаг 1) | `useId()` для id нативного контрола; проп `for` у FormFieldLabel и `:for="inputId"` в BaseInput/BaseTextarea; опциональный проп `inputAttrs` (name, autocomplete, inputmode, aria-*, data-testid → нативный элемент) | по заданию этапа — только план; вводит новые props | minor | M |
| FRM-1 (шаг 2) | dev-предупреждение, если в `$attrs` приходят `id`, `name`, `autocomplete`, `inputmode`, `aria-*`, `data-testid`; документация миграции | делается после выпуска шага 1 | minor | S |
| FRM-1 (шаг 3) | `inheritAttrs: false`: `class`/`style` — корню, остальное — нативному элементу (Radio — `aria-labelledby` группы, Pin — `role="group"` на корне); `rootAttrs` как запасной путь; тесты через `getByLabelText`; учесть внутренних потребителей с fallthrough — `ChatHeader.vue:35` (`aria-label`), `DatePickerField.vue:15`, `ChatInput.vue:136-137` (`@click`/`@keyup`) | breaking change: меняется элемент, который получает атрибуты и слушатели | major | L |
| MSK-2 | `stripMask`: несовпавшие символы пропускать без расхода токена, экранированный литерал обрабатывать как обычный; вставку и правку в середине считать diff'ом по `selectionStart`/`inputType`; пересмотреть тесты, закрепляющие позиционное поведение | пакет «движок маски» (MSK-2…5 + остаток MSK-1): большой объём, тесты закрепляют ошибки; в задание не входило | patch | L (пакет) |
| MSK-1 (остаток) | не поглощать цифру как литерал префикса, если префикса нет в текущем отображении (`8 (###)…` + ввод 8; `+7 (###)…` + ввод 7); регрессионный тест | найдено на этапе реестра; корень общий с MSK-2 | patch | S (в пакете) |
| MSK-4 | при выделении удалять диапазон чистых индексов; Delete — ближайший токен справа; Backspace без токена слева — ничего; при `isComposing` и Ctrl/Alt не вмешиваться | пакет «движок маски» | patch | M |
| MSK-3 | индекс каретки в чистом значении — по числу токенов до `selectionStart`, возвращать позицию этого токена в маске | пакет «движок маски» | patch | M |
| MSK-5 | жадный токен считать по сырому значению до следующего литерала; Backspace — по числу токенных символов до каретки; либо задокументировать ограничение | пакет «движок маски»; нужно решение: поддерживать или ограничить | patch | M |
| MSK-6 (гипотеза) | проверить IME/Android; если подтвердится — не обрабатывать ввод во время композиции, маску применять на `compositionend` | нужен браузер (CDP) и устройство | patch | M |
| FRM-2 | `useId()` для ошибки и подсказки; на нативном контроле `aria-invalid`, `aria-describedby`, `aria-required` (не `required`: нативная валидация остановит submit BaseForm без `novalidate`); FormFieldError с `id` и `aria-live="polite"`; `aria-hidden` у `*` | в задание не входило; удобнее делать вместе с FRM-1 шаг 1 | patch | M |
| FRM-3 | после emit синхронизировать DOM с `modelValue` (`nextTick`: `value`/`checked`) во всех 6 контролах | в задание не входило | patch | M |
| FRM-4 | кольцо фокуса: `.base-input__wrapper:focus-within`, `.base-radio-item__input:focus-visible ~ .base-radio-item__circle`, `.base-switch__input:focus-visible ~ .base-switch__slider`; visual-тест с реальным Tab вместо принудительных классов | проверка требует браузера; меняются visual-эталоны | patch | S |
| INP-2 | реализовать `allowedChars` (фильтр в `handleInput` без маски с восстановлением DOM и каретки) либо удалить проп и argType | нужно решение: реализовать или удалить | minor (реализация) / major (удаление) | S |
| INP-3 | через `watch([mask, modelValue], { immediate })` эмитить нормализованное значение либо документировать контракт «modelValue — очищенное значение» | меняет поведение: эмит без действий пользователя | minor | S |
| INP-4 | убрать `tabindex="-1"`; постоянный `aria-label` + `aria-pressed` + `aria-controls` | в задание не входило | patch | S |
| INP-5 | список правил с `id` в `aria-describedby`, скрытый текст статуса, `aria-live="polite"` | в задание не входило | patch | S |
| TXA-1 | `box-sizing: border-box`; перед измерением `height='auto'` с учётом border; один триггер (watch); `ResizeObserver`; `watch(isAutosize)`; или `field-sizing: content` с фоллбеком | нужен браузерный тест: jsdom не считает высоту | patch | S |
| RAD-2 | `role="radiogroup"` + `aria-labelledby` на заголовок (или fieldset/legend); `aria-required`, `aria-invalid`, `aria-describedby` | в задание не входило | patch | S |
| PIN-1 | `autocomplete="one-time-code"` на первой ячейке, `inputmode="numeric"`, `pattern`; проп набора символов (по умолчанию цифры); многосимвольный input разбирать как paste | новые props; в задание не входило | minor | M |
| PIN-2 | корень с `role="group"` и именем; `aria-label` ячеек «Символ i из n»; `aria-invalid`/`aria-describedby` | зависит от FRM-1 (проброс `aria-label`) | patch | S |
| PIN-3 | во всех stories группы ставить `v-bind="args"` перед `v-model`, либо убрать `modelValue` из args / использовать `useArgs`; play: ввод 4 цифр → `onComplete('1234')` | в задание не входило; play в CI не запускаются | patch (stories) | S |
| FFD-2 | `provide(FormFieldKey, { id, errorId, descriptionId, error, isRequired })` + `useId()`; контролы кита берут id и ошибку из контекста | нужно решение по API; связано с FRM-1 и FORM-3 | minor | M |
| FORM-1 (остаток) | передавать блокировку формы кастомным виджетам кита (provide/inject «форма заблокирована» → BaseSelect, BaseRange, BaseRating, BaseEditor) | fieldset покрывает только нативные элементы; нужен контракт контекста формы | minor | M |
| FORM-2 | оверлей через `v-if="isLoading"` + постоянный скрытый `aria-live`-регион с меняющимся текстом | в задание не входило | patch | S |
| FORM-3 | реестр полей (provide/inject), проп `validateOnSubmit`, expose `validate`/`reset`, событие `invalid` | нужно решение по API | minor | L |
| DEB-1 (остаток) | `useDebounce(source: MaybeRefOrGetter<T>, delay)` + `watch(() => toValue(source))` с readonly-ref; исправить JSDoc (README уже исправлен) | смена сигнатуры (альтернатива — новый composable под другим именем) | major (или minor) | S |
| EPD-2 | unit-тесты: camelCase/kebab-case, вызов вне компонента, смена набора ключей `v-bind` (закрепит EPD-1) | в задание не входило | patch (тесты) | S |
| INP-6 | применять маску только для text/tel/search/url, иначе dev-предупреждение | в задание не входило | patch | S |
| INP-7 | задокументировать `v-model.number`; экспортировать типы Expose всех компонентов и типизировать `defineExpose` через `FormFieldExpose`; `rootRef` указывать на корень | смена смысла `rootRef` — breaking | minor (типы) / major (`rootRef`) | S |
| TXA-2 | рендерить или убрать объявленные слоты `default` (Textarea/Radio/Pin); класс readonly и эмит `keydown` у Textarea | удаление слота из типов — breaking для типов | minor | S |
| CHK-1 | `indeterminate`, массивный v-model/`value`, `isRequired` | новая функциональность | minor | M |
| RAD-3 | `key` с учётом индекса; `name` по умолчанию через `useId()`; `focus()` на выбранную опцию; `isDisabled` у группы; blur → touched | в задание не входило | minor | S |
| UFF-2 / SWT-2 | required: обрезать пробелы у строк; `false` считать пустым для булевых контролов (Switch, Checkbox) | меняет результат `validate()` | minor | S |
| PIN-4 | guard для null `modelValue`; пустой paste не стирает код; фокус после paste; служебные пробелы не выпускать наружу; осмысленный `validate()` | формат значения без пробелов — breaking | patch / major (формат) | S |
| FFD-3 | Transition на самом `<p>` ошибки, без обёртки-div; у `--ghost` не снижать opacity поля | в задание не входило | patch | S |
| FORM-4 | тёмный оверлей через CSS-переменную темы; `prefers-reduced-motion` | в задание не входило | patch | S |
| UFF-1 | dirty — отличие от базового значения; `reset()` переустанавливает базу; экспонировать `isDirty` или убрать | в задание не входило | patch | S |
| PWD-1 | сбрасывать `isPasswordVisible` при смене `type` | в задание не входило | patch | S |
| EPD-1 | хранить instance и читать `instance.vnode.props` внутри `wasPropPassed`; в BaseSideBar не кэшировать `computed` без реактивных зависимостей | в задание не входило | patch | S |
| DEB-2 | `getCurrentScope() && onScopeDispose(...)`; `cancel`/`flush`; вариант throttle | в задание не входило | minor | S |
| TXA-1 (гипотеза), PIN-4 (гипотеза) | проверить в браузере рост textarea на padding и её ширину; ввод в заполненную ячейку после стрелок (при подтверждении — `select()` на focus) | нужен реальный браузер | patch | S |


### Выбор значений (pickers)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| SEL-2 | APG «Select-only combobox»: роли, `aria-activedescendant`, Up/Down/Home/End/typeahead, Enter/Space/Esc/Tab, фокус в поиск при открытии | Новая модель фокуса и ARIA, вне этапа | minor | L |
| SRCH-2 (остаток) | Защита от гонок: `search` с `{ query, signal }` (новое событие или опция) либо документированный паттерн; проп `filter` | Смена payload `search` — breaking | minor (новое событие) / major (смена payload) | M |
| SLD-1 (остаток) | Кнопка Pause/Play первой в порядке фокуса, `aria-live` off/polite, пауза при `document.hidden`, сброс таймера после ручной навигации | Нужно дизайн-решение по новому UI-элементу | minor | M |
| SLD-3 | Проверить тап на устройстве; шаг сразу на pointerdown, автоповтор после задержки | Нужен реальный тач | patch | S |
| SEL-3 | Считать `[]` пустым в `useFormField` | Общий composable (forms) — проверить потребителей | patch | S |
| SEL-4 | Крестик тега → `<button aria-label>`, Backspace | Вне этапа | patch | S |
| SEL-5 | `inheritAttrs:false`, `$attrs` на триггер, `useId`, связи label/error/`aria-invalid` | Меняет элемент, на который попадают `id`/`data-testid` | minor | M |
| SEL-6…SEL-8 | touched при любом закрытии; dev-warn дубликатов и удаление строго по value; «+N» | Вне этапа | patch (SEL-8 — minor) | S |
| SRCH-3 | Разделить «в фокусе» и «закрыто пользователем»; навигация и Enter только при открытом списке | Вне этапа | patch | M |
| SRCH-4 | combobox/listbox, `aria-activedescendant`, `role=status` с числом результатов, имена кнопок | Объём a11y | minor | M |
| SRCH-5 | Триггер-кнопка `aria-haspopup=dialog`, открытие по click/Enter, `role=dialog` + `useFocusTrap` | Меняет поведение открытия | minor | M |
| SRCH-6 | `onBeforeUnmount` → `unlockScroll()` при открытом оверлее | Вне этапа | patch | S |
| SRCH-7…SRCH-9 | `blur` через expose BaseSearchInput; `:is-readonly`; `inheritAttrs:false` + `$attrs` на корень | Вне этапа | patch | S |
| SRCH-10 | Отменять debounce при внешней смене; Enter без `preventDefault` при закрытом списке и при `isComposing`; применить `customClass.*Overlay`; закрытие фона по pointerdown; в useListNavigation — Home/End/PageUp/PageDown, пропуск disabled, ограничение индекса | Вне этапа | patch | M |
| CP-2 | Откат или ошибка для невалидного HEX, `aria-invalid`, dev-warn пресетов; опционально rgb()/#rgba | Alpha — новая функциональность | minor | M |
| CP-3 | Блокировать повторный pointerdown, фильтр кнопки и `isPrimary`, `setPointerCapture`, pointercancel | Вне этапа | patch | S |
| CP-4 | Клавиатура в SV-области (стрелки, `aria-valuenow`), перевод фокуса в панель и обратно, `aria-expanded` | Объём a11y | minor | M |
| CP-5 | Явное пустое состояние, тип `string \| null` | Расширение типа | minor | S |
| CP-6 | `change` только при фиксации (pointerup, Enter, пресет), непрерывное изменение — отдельным событием | Меняет семантику `change` (BaseEditor) | major (или minor с новым событием) | S |
| CP-7 | Применить `customClass.preset`, `sz()` в SCSS; `variant`/`color` реализовать или убрать из типа | Вне этапа | patch | S |
| RNG-3 | `ariaLabel`/`ariaLabels[]`, `formatValue` (aria-valuetext, подпись, тултип), Home/End/PageUp/PageDown, `aria-orientation`, `aria-disabled` + `tabindex=-1`, фокус на pointerdown | Новые пропы, объём | minor | M |
| RNG-4 | touchcancel + `identifier` или Pointer Events + `setPointerCapture`; тач по треку | Вне этапа | patch (minor при переходе на Pointer Events) | M |
| RNG-5 | Валидация step/min/max/NaN, сортировка `rangeValue`, dev-warn | Вне этапа | patch | S |
| RNG-6 | Тултип по фокусу и во время drag; выбор ползунка с учётом направления при равных значениях | Тултип зависит от TT-1 (overlays) | patch | S |
| SLD-2 | Задержка автоповтора 400–500 мс, подавление click после автоповтора | Вне этапа | patch | S |
| SLD-4 | `visibility:hidden`/`pointer-events:none`/`inert` для неактивных слайдов fade/scale | Вне этапа | patch | S |
| SLD-5 | APG Carousel: region, roledescription, «N из M», имена, `aria-current`, `inert`, live-регион | Объём a11y | minor | M |
| SLD-6 | Пауза видео неактивных слайдов, остановка autoplay на `play` | Вне этапа | patch | S |
| SLD-7 | touchcancel, очистка слушателей перед новым drag, фильтр кнопки, порог по оси | Вне этапа | patch | M |
| SLD-8 | Guards для `items=[]`, одного слайда и NaN; `goTo` без эмита на том же индексе; сравнение с `maxIndex` | Вне этапа | patch | S |
| SLD-9 (остаток) | `defineExpose({ goTo, next, prev, pause, play })`, `v-model:index` | Новый API | minor | M |
| SLD-10 | `${offset - base}%` в transform | Вне этапа | patch | S |
| RAT-2 | Home/End и цифры, `aria-valuetext` «3 из 5», readonly → `role=img`, `aria-disabled`, стиль disabled | Меняет роль readonly | minor | M |
| RAT-3 | Валидация `step > 0` и целого `max`, ограничение `modelValue` | Вне этапа | patch | S |
| PCK-1, PCK-2 | Пересохранить stories без BOM и mojibake; удалить или переделать state-stories | Вне этапа | patch | S |
| PCK-3 / OVL-1 | `teleportTo` или наследование темы для панелей и тултипов | Решение за overlays | minor | M |
| RNG-7, PCK-4 | Проверить в браузере; фильтр `button === 0`; visual без play и внешних URL | Гипотезы | patch | S |


### Оверлеи (overlays)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| CO-1 / DRP-3 / POPV-4, OVL-2, ESC-STACK | Общий менеджер слоёв (provide/inject и стек открытых). Вложенные панели регистрируются у родителя; клик вне проверяется по `composedPath()` с учётом потомков; Escape получает только верхний слой; z-index — по порядку открытия, плюс токены `--z-*` | Архитектурное изменение всех оверлеев и BaseSelect/DatePicker/Search; нужен браузер | minor | L |
| DRP-1 (остаток), DRP-2 (остаток), POPV-3, DRP-6 | Паттерны APG menu button и disclosure: scoped-слот `triggerProps` (id, `aria-expanded`, `aria-haspopup`, `aria-controls`); `panelRole` и `panelLabel`; перевод фокуса в панель (возврат на триггер при закрытии уже сделан); стрелки, Home, End; закрытие по Tab и focusout; `preventDefault` только для нефокусируемых целей | Новый API слотов; смена фокусного поведения по умолчанию затрагивает Select, Search и TableToolbar | minor; смена дефолта `preventMousedown` — major | L |
| OVL-1 / PCK-3 | Проп `teleportTo` у всех оверлеев (строка, HTMLElement или `false`) или inject контейнера слоёв; перенос `data-theme` ближайшего предка; в README требовать `data-theme` на `<html>` | Новый публичный проп в 7 компонентах; fullscreen проверяется только в браузере | minor | M |
| OVL-3 | `defineOptions({ inheritAttrs: false })` и `v-bind="$attrs"` на элемент диалога, панели, карточки или контейнера | Вне объёма этапа; меняет, куда попадают атрибуты | patch | S |
| MOD-A11Y / SLD-1 (остаток) | Имя диалога без title (проп `ariaLabel`/`ariaLabelledby` или через OVL-3); `inert` на остальную страницу при модальном диалоге (закрывает FT-2) | Зависит от OVL-3; `inert` нужно проверить в браузере | patch | S |
| MOD-2 / SLD-2 | Кнопка закрытия без title (`hasCloseButton = true`), слот `header` у BaseModal | Новый проп и слот | minor | S |
| MOD-1 (остаток) | В `isContained` ограничить карточку контейнером (`max-height: calc(100% - 40px)`), `100dvh` (основной e2e уже проходит в Chromium) | Нужен браузер и мобильное устройство | patch | S |
| MOD-5, MOD-4 | Проп `closeOnEscape = true` у BaseModal; убрать `confirm` из Emits или реализовать его | Новый проп; удаление публичного события | minor; удаление `confirm` — major | S |
| OVL-4 / TOUR-6 | Проверка `typeof document` в useScrollLock; блокировку и подписки usePopup и BaseTour — в `onMounted` или `flush:'post'`; guard для `window` в `panelStyle`; тест `renderToString` в node | Вне объёма этапа | patch | S |
| OVL-5 (+ ANI-2, display) | Общий миксин `prefers-reduced-motion`: статичный прогресс-бар; у BaseTour — transition спотлайта и JS-задержка | Визуальные изменения, нужны эталоны | patch | M |
| OVL-6 | Перегенерировать эталоны Slideover (метка `visual:update-baselines`); снимать открытое состояние Modal/Dropdown/Popover/Tooltip, clip через `Math.ceil`, порог 0.01–0.02 с масками; починить play BaseTooltip; запускать play в CI; integration без моков для Dropdown/Popover/Tooltip | На этапе исправлений эталоны менять запрещено; Playwright и Storybook не запускались | patch (тесты, CI) | M |
| TT-1 | Показ по focusin/focusout (с `:focus-visible`); Escape; `role=tooltip`, `useId` и `aria-describedby` через scoped-слот `triggerProps`; убрать `pointer-events:none`; скрывать по pointerdown | Новый API слота и новое поведение | minor | M |
| TT-2 | Перенести класс варианта, `--size-scale` и `--custom-*` на `.base-tooltip-popup` | Визуальное изменение | patch | S |
| TT-3 / TU-1, TT-4 | Пересчёт при показе и по scroll/resize/ResizeObserver вместо rAF каждый кадр; flip и shift; единый зазор; обёртка `span`, защита от пустого `text`, `v-model:isOpen` или expose show/hide | Поведение и API | minor | M |
| DP-1 / DRP-4, DP-2, DP-3, DP-4 | flip, shift и size (например, `@floating-ui/dom`); `clientWidth/clientHeight`; подписка только в открытом состоянии, rAF и ResizeObserver; `minWidth` для `matchWidth` | Новая зависимость или своя реализация; визуальные изменения | minor | M |
| POPV-1, POPV-2, POPV-5 | Обёртки `inline-flex`/`fit-content` и измерение элемента из слота; цвет текста на `__inner`; `close` при любом переходе true→false | Визуальные изменения, вне объёма | patch | S |
| NTF-2, NTF-3 (остаток) | Пауза и возобновление с запоминанием остатка (`animation-play-state`); явный режим без автозакрытия (например, `duration: null` или проп `persistent`), для error — по умолчанию; ограничение значением 2³¹−1 | Новая семантика или проп; `0` уже означает значение по умолчанию | minor | M |
| NTF-4 | `watch(notificationKey)` → `add()` (или удалить проп и описать `ref.add()`) | Удаление пропа — breaking change | minor (удаление — major) | S |
| NTF-6, NTF-8 | Слот действия `<slot :notification :close>`; тип `NotificationInput` для `add()`; `v-if` на заголовок; сервис с очередью, лимитом и дедупликацией; экспорт `BaseNotificationExpose` | Новый API | minor | M |
| NTF-7 (+ ANI-3, display) | Собственные имена переходов `notification-*` | Вне объёма | patch | S |
| TOUR-2 | Оверлей с «дыркой» (`clip-path` или 4 прямоугольника), опция `allowTargetInteraction` | Новое поведение, нужен браузер | minor | M |
| TOUR-3 | Карточка по центру или пропуск шага с событием `target-missing`; `watch(steps)`; ожидание цели через MutationObserver с таймаутом; не блокировать прокрутку, пока нет UI | Новое событие и поведение | minor | M |
| TOUR-4 | Подключить `useFocusTrap` к карточке; фокус при смене шага; `aria-describedby` на контент | Вне объёма этапа | patch | S |
| TOUR-5, TOUR-7 | `scrollIntoView` только при открытии и смене шага, rAF-троттлинг; ограничение карточки экраном; try/catch вокруг селектора; флаг размонтирования; `matchMedia` для reduced motion | Вне объёма этапа | patch | S |
| ESC-1, CO-2 | В useEscapeKey выходить при `defaultPrevented` или `isComposing`; в useClickOutside — `pointerdown` и `composedPath()` | Разумно делать вместе с менеджером слоёв | patch | S |
| FP-1 / MM-8 | `clientWidth/clientHeight`, `max-height` для высоких панелей, слушатели только при `isFlyout && isOpen`, ResizeObserver | Используется в BaseMegaMenu (группа navigation) | patch | S |
| SLD-4, SLD-5 | `Omit` лишних пропсов из типа (или их реализация); немодальный режим `isModal=false` (`pointer-events:none`, без блокировки и ловушки) | Изменение типа или новый проп | major (Omit) / minor | S |
| DRP-5 | Экспорт `BaseDropdownExpose`, а также `BaseNotificationExpose` и `BaseTourSlotContext` | Вне объёма этапа | patch | S |
| FT-1, FT-2 (гипотезы) | Проверить в браузере; в `getTabbableElements` отбрасывать невидимые элементы (`getClientRects().length`) и `:disabled` из `fieldset`; `inert` или реестр слоёв | Нужен браузер | patch | S |


### Навигация (navigation)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| MM-1 | Disclosure-навигация: `<nav aria-label>`; узлы с детьми и заголовки колонок — `<button aria-expanded aria-controls>`; листья — `<a :href>`/linkComponent с `href` через `isSafeUrl`; Escape с возвратом фокуса | Переработка разметки MegaMenu/Node и контракта слотов (вместе с MM-4/MM-5) | minor (major, если меняется контракт слотов) | L |
| MENU-1 (развитие) | Полный APG Menu: `role=menu/menuitem(radio)`, roving tabindex, стрелки/Home/End/typeahead, Escape, триггер + поповер; либо навигационный режим `<nav><ul><a>` | Нужно дизайн-решение (меню действий или навигация); сделан минимальный вариант | minor | L |
| TAB-1 (развитие) | Проп режима активации (auto/manual): при auto `change` приходит на каждую стрелку, что вызывает лишние загрузки у потребителя | Новое поведение уже выпущено автоматическим; режим — новый API | minor | S |
| TAB-3 | Иконка через `<BaseIcon :name>` + слот `#icon`; до мажора — `iconHtml` с документированным требованием доверенных данных и `aria-hidden` | Breaking change контракта `icon` | major (или minor с депрекацией) | S |
| ACC-2 (остаток) | Обёртка заголовка уровнем (`headingLevel`), нативная `<button>`; решить, выводить ли disabled из Tab-порядка | Не было в списке этапа; меняет разметку и стили | minor | S |
| ACC-3 | Ключ по `id`/label; начальный набор открытых — синхронно в setup; `watch(items)` для новых пунктов | Нужно новое поле `id` и переработка состояния | minor | M |
| ACC-4 | `v-model:open` (массив ключей) + expose open/close; `toggle(i, false)` при неявном закрытии | Новый controlled API | minor | M |
| ACC-5 (остаток) | default `items: () => []` (README уже исправлен) | Не было в списке этапа | patch | S |
| MENU-2 | Реализовать `to` (ссылка/linkComponent) и `hasDivider`, рендерить `default`-слот — или удалить их из типов | Реализация — новая функциональность; удаление — breaking | minor / major | M |
| MM-3 | В `close(path)` менять `activePath`, только если `isAncestorPath(path, activePath)`; или общий hover-таймер в провайдере | Не было в списке этапа | patch | S |
| MM-4 | Закрытие dropdown по клику вне, Escape, уходу фокуса и после navigate; сброс дерева; `aria-expanded` у верхних кнопок | Зависит от стека useEscapeKey (сквозная проблема) и MM-1 | minor | M |
| MM-5 | Передавать в слоты `{ isOpen, toggle, navigate }` или оставить обёртку с обработчиком вокруг слота | Меняет контракт слотов | minor | M |
| MM-6 (остаток) | Реализовать или удалить `MegaMenuColumn.to/href` (README уже исправлен) | Удаление полей — breaking | minor / major | S |
| SB-1 | `aria-label` (или visually-hidden label) у пунктов в collapsed; tooltip по фокусу (см. TT-1 в overlays) | Не было в списке этапа; разметка продублирована для collapsed/expanded | patch | S |
| SB-2 | Одна кнопка toggle с постоянной обёрткой tooltip, `aria-expanded`/`aria-controls` | Не было в списке этапа | patch | S |
| SB-3 | Инициализировать Set раскрытых групп предками активного пункта (watch `activePath/activeKey`), дальше — ручное управление | Меняет поведение раскрытия | patch | S |
| SB-4 | Flyout-подменю в collapsed или авторазворачивание панели по клику на группу | Нужно дизайн-решение | minor | M (авторазворот) / L (flyout) |
| SB-5 | Обернуть навигацию в `<nav :aria-label>`, дать имя панели | Не было в списке этапа | patch | S |
| SB-6 | В `getItemProps` пропускать `to` через `isSafeUrl` (иначе `button` + warn); warn для object-`to` без роутера | Защита координатора покрыла только `navigateAndEmit`/`openExternalUrl` | patch | S |
| BC-2 | Крошки — `<a :href>`/linkComponent (как в SideBar), опциональный `target`; `window.open` только для `_blank` | Меняет разметку и семантику `navigate` | minor | M |
| BC-3 (остаток) | «…»: `aria-label` («Показать скрытые разделы»), `aria-expanded`, возможность свернуть; сброс `isExpanded` через `watch(items)` | Не было в списке этапа | patch | S |
| BC-4 | При `showHome` исключать `items[0]` из видимых, как обещает документация | Видимое изменение поведения | patch | S |
| ST-2 | `<ol>/<li>`; кликабельный шаг — `<button>`; `aria-current="step"`; visually-hidden статус | Не было в списке этапа; меняет разметку | minor | M |
| ST-3 | Проп `clickable` (none/completed/all); ранний return при клике по текущему шагу | Новый проп | minor | S |
| PG-3 (остаток) | `<nav aria-label="Пагинация">`, `aria-label` «Страница N» у номеров | Сделаны только имена стрелок | patch | S |
| PG-4 | При `!showLastPage` окно до `total` и правое «…», если `end < total` | Не было в списке этапа | patch | S |
| BP-1 | Стартовать с fallback-ширины и обновлять в `onMounted` (или по флагу SSR); задокументировать вспышку | Меняет первый клиентский рендер; нужна проверка SSR | patch | S |
| EXP-1 | Синхронный `done()` при `duration <= 0` и reduced motion; fallback `setTimeout(duration + 50)` | Не было в списке этапа | patch | S |
| TAB-6 | Сбрасывать `hasDragMoved` после pointerup (click-capture или `setTimeout(0)`), pointer capture, проверка `event.button` | Низкий приоритет | patch | S |
| TAB-8 | Ранний return в `handleTabClick` при `id === modelValue` | Меняет поток событий `change` | patch | S |
| ACC-6 | В single-режиме открывать только первый `defaultOpen` | Низкий приоритет | patch | S |
| MM-7 | `id` у пунктов или путь по индексам; экранирование разделителя | Новое поле; затрагивает ключи и useMegaMenuTree | minor | M |
| MM-8 | Подключать слушатели useFlyoutPosition только при `isFlyout && isOpen` | Низкий приоритет | patch | S |
| SB-8 | Декоратор тёмных stories — `data-theme="dark"`; обновить visual/e2e baseline | Затрагивает baseline | patch (stories) | S |
| SB-9 | Определять controlled-режим реактивно, по актуальным `vnode.props` | Сквозной composable useExplicitPropDetection | patch | S |
| SB-11 | Нормализовать `activePath` (хвостовой `/`, query, hash) или проп-матчер | Меняет правила активности | minor | S |
| SB-12 | Предупреждать о дублях ключей; требовать `key` при совпадающих `to`/label | Низкий приоритет | patch | S |
| BC-5 | Оставить один формат (JSON-LD), исправить свойства ListItem | Влияет на SEO-вывод | patch | S |
| BC-6 | Отдельная иконка для `arrow` (удаление значения — major) | Низкий приоритет | patch | S |
| ST-4 | Ограничить масштаб прогресса диапазоном [0, 1]; явная поддержка «все завершены» | Низкий приоритет | patch | S |
| ST-5 | Рендерить `icon` шага или удалить поле; убрать объявление `default`-слота | Удаление — breaking | patch / major | S |
| PG-5 | Ключи `ellipsis-left/right`, точный расчёт окна, валидация `maxVisible >= 5` | Низкий приоритет | patch | S |
| PG-6 | Ранний return при клике по текущей странице | Меняет поток событий | patch | S |
| PG-7 | `calcPageInfo` при `total=0` → «0 из 0» | Низкий приоритет | patch | S |
| BP-2 | Переименовать или задокументировать `isMobile` против `BREAKPOINTS.mobile`; rAF-троттлинг resize | Переименование — breaking | patch / major | S |
| EXP-2 | Фильтр `event.target === el` и `propertyName` в `onEnd` | Низкий приоритет | patch | S |
| — (тесты) | Спеки MegaMenu: убрать мок-копию `@utils/navigationUtils` (в копии нет `isSafeUrl`), проверять реальную утилиту со шпионом `window.open`; компонентные тесты `javascript:` для MegaMenu и Breadcrumbs | Не было в списке этапа | н/п (тесты) | S |
| — (CI) | Снять исключения из покрытия: BaseTabs (100%-порог компонентов), `useSideBarNavigation.ts`, `navigationUtils/**` | Нужно дописать тесты до 100% | н/п (CI) | M |
| — (тесты) | `BaseSideBar.navigation.spec.ts`: удалить ~11 дословных дублей (стр. 790-997, 1059-1119, 1207-1293) | Не было в списке этапа | н/п (тесты) | S |
| — (stories) | Заменить реальный `window.open` на `https://example.com` заглушкой (MegaMenu DropdownInteractions, Breadcrumbs WithIconsAndHrefs) | Не было в списке этапа | н/п (stories) | S |
| — (visual) | Обновить visual-baseline BasePagination (`default`, `many-pages`, `dark-theme`) после PG-1 | Playwright на этапе не запускался | н/п (тесты) | S |
| — (stories) | Plays без содержательных expect (30 из 82); клавиатурные plays (стрелки в Tabs, Space в Accordion, Enter в Menu); docs-описания компонентов | Объём работы | н/п (stories) | M |


### Даты (dates)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| DP-2 (остаток) | Добавить `aria-haspopup="dialog"`, `aria-expanded` и `aria-controls` на input. Добавить `aria-modal` и Tab-цикл в панели (в проекте уже есть `useFocusTrap`). Открывать по Space, дать очистку с клавиатуры. Написать keyboard-only e2e | Нужен проброс атрибутов на input в BaseInput (forms/FRM-1) и клавиатура в сетке (CAL-1) | minor | M |
| CAL-1 (остаток) | Строки `role="row"` по 7 ячеек `role="gridcell"` с `aria-selected`. `aria-label` с полной датой через `Intl.DateTimeFormat(locale, {dateStyle: 'full'})`, `aria-current="date"`. Roving tabindex и клавиши APG: ←/→, ↑/↓, Home/End, PageUp/PageDown, Shift+PageUp/PageDown. Заголовки дней недели как `columnheader`. Label у полей времени. Роль и Escape у popover. aria-live у заголовка | Большой объём, меняется DOM сетки; проверять нужно в браузере с axe | minor | L |
| CAL-5 | «Сегодня» = `goToToday()` + `handleDayClick(toDateOnly(new Date()))` с проверкой `isDayDisabled`. Отключать кнопку, если сегодняшний день недоступен | Вне задания; поведение меняется в трёх режимах | patch | S |
| CAL-6 | Реализовать `events` (в popover и через слот `event`) и слот `navigation` — либо пометить их deprecated и удалить в следующем major | Удаление ломает совместимость, реализация требует дизайн-решения | minor (реализация) / major (удаление) | M |
| CAL-12 | Фиксированные даты в stories, мок `Date` в visual-прогоне, пересъёмка baseline. argTypes для реальных объектных props. Убрать mojibake и BOM | Пересъёмка visual-baseline на этапе исправлений запрещена | patch | M |
| DP-3 / DU-1 | `parseDate(str, dateFormat)` через `new Date(y, m-1, d)` с проверкой обратного преобразования (31.02 и 29.02 невисокосного года — невалидны). Коммит на blur/Enter, откат или ошибка при неверном вводе, учёт min/max. Форматировать по `dateFormat` — или объявить prop deprecated | Новая функциональность; нужно решить, что означает `dateFormat` | minor | L |
| DP-4 | Сбрасывать базовый месяц только при открытии панели (isOpen false→true) или если значение вышло за видимые месяцы. Не читать весь `resolvedProps` в watch | Вне задания | patch | S |
| DP-5 | (a) `undefined` при явно переданном ключе трактовать как `null`. (b) Валидировать `activeValue`/`activeDates` с учётом режима. (c) Развести «запрет текстового ввода» и readonly; при readonly не открывать панель | (c) меняет смысл `isReadonly` с дефолтом `true`; (a) закреплён существующим тестом | patch (a, b); для (c) major, либо minor через новый prop | M |
| DP-6 | `inheritAttrs: false`: `class`/`style` оставить на корне, остальные атрибуты передавать на `<input>` | Зависит от проброса атрибутов в BaseInput (forms/FRM-1) | minor | M |
| DP-9 | Добавить в репозиторий smoke-тест рендера stories или запускать play-функции в CI | Stories не входят в vitest | patch | S |
| CAL-7 | Нормализовать диапазон (min/max), добавить опцию `disallowDisabledInRange`, применять время к обоим концам | P3, вне задания; меняется поведение range | minor | M |
| CAL-8 | Считать canPrev/canNext для каждого вида, отключать месяцы и годы вне min/max, исправить описание WithMinMaxDates | P3, вне задания | patch | S |
| CAL-9 | Исключить ячейку-триггер из проверки click-outside для popover; закрывать popover по Escape | P3, вне задания | patch | S |
| CAL-10 | Брать `firstDayOfWeek` из `Intl.Locale(locale).getWeekInfo?.()`, тексты — через props или locale, номер недели считать с учётом `firstDayOfWeek` | Смена дефолта `firstDayOfWeek` заметна пользователям | minor (опция) / major (смена дефолта) | M |
| DP-8 | Применить или удалить `variant` и ключи `customClass`. Поддержать `monthsCount` строкой. Пересоздавать ResizeObserver при смене `isMultiMonth`. Сделать клик по иконке переключателем. Определиться с семантикой `reset()`. Снимок props — вместе с forms/EPD-1, z-index — вместе с overlays/OVL-2 | P3; часть зависит от других групп | patch | M |
| DU-2 | Использовать `Intl.PluralRules` или передавать тексты параметрами, сортировать даты, вынести «...» в константы | P3, вне задания | patch | S |
| DU-3 | Добавить `toISODateString(d)` и `parseISODate('YYYY-MM-DD')`, описать в README | P3; это новые публичные экспорты | minor | S |
| DP-7 (гипотеза) | Сначала проверить в браузере. Затем `max-height` по размеру viewport, `nowrap` в одиночном режиме, flip/shift | Гипотеза; flip — общая правка useDropdownPosition (overlays/DP-1) | patch | M |
| CAL-11 (гипотеза) | dev-warning для значений не типа Date или разбор `YYYY-MM-DD` в локальную дату | Строки выходят за типовой контракт | patch | S |
| — (тесты) | Зафиксировать TZ в `build/tests/vitest.config.ts` и прогонять тесты дат в 2–3 зонах. Написать spec для useCalendarInteraction, useCalendarPopover, useCalendarResolvedProps и useDatePickerState, снять их исключения из coverage | Инфраструктура, вне задания | patch | M |
| — (типы) | Добавить `isAm` в `BaseCalendarProps`/`BaseCalendarEmits`, объявить и экспортировать тип Expose для BaseDatePicker | Вне задания | minor | S |


### Таблица и дерево (data)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| TBL-3 | Не сбрасывать страницу при смене rows, клампить по `totalPages`; хранить выбор по id и удалять только исчезнувшие; `v-model:selectedIds` | Меняет поведение, нужен дизайн controlled-API | minor | M |
| TBL-4 | Props `hasMore`/`totalRows` (+ `manual` для серверной пагинации, общий с TBL-3); не уменьшать `loadedCount` при росте данных; переписать тест `useTableData.spec.ts:563-591` | Новый API, смена поведения, закреплённого тестом | minor | M |
| TBL-2 (остаток) | Indeterminate у чекбокса заголовка; опция `selectAllScope` (page / filtered / all); счётчик выбранных скрытых строк; решить, снимать ли поштучный выбор при смене фильтра | Нужен indeterminate в BaseCheckbox (CHK-1, чужой компонент) и продуктовое решение | minor | M |
| TBL-6 (остаток) | Озвучивать «приоритет N» через aria-describedby вместо aria-hidden; документировать или дать кнопку для `header-<key>`; тултип по фокусу (TT-1) | Дополнение к исправленному основному сценарию | patch | S |
| TRE-8 (остаток), TBL-7 (развитие) | Добавить `items ?? []` в useTreeState и тест; пример событий BaseTable в README; перенести проверку примеров README (vue-tsc strictTemplates, сейчас вне репозитория — `audit-tools/readme-check`) в CI | Защита items — вне объёма этапа исправлений; проверка примеров пока не в репозитории | patch | S |
| TRE-1 / TRE-2 | Модель WAI-ARIA APG: роли и aria-* узлов, roving tabindex, ←/→/↑/↓/Home/End/`*`, поиск по буквам, Space/Enter; тесты по сценариям APG | Большой объём, меняет порядок Tab | minor | L |
| TBL-8 | В watch `pageSize`: страница 1, пересчёт `loadedCount`, общий clamp | Вне объёма этапа | patch | S |
| TBL-9 | Разделить значение поля и применённый запрос; `resetPage` синхронно | Вне объёма этапа | patch | S |
| TBL-10 | Поиск по видимым/searchable колонкам через `formatCellValue` (`searchAccessor`), пропуск null, trim, ё/е | Меняет результаты поиска | minor | S |
| TBL-11 | Операторы по типу колонки, даты по timestamp, `ne` для пустых; реализовать `between`/`in`/`valueTo`/`filterConfig`/`childrenKey` или убрать их из типов вместе со слотом `default` и `_depth` | Удаление из публичных типов — breaking | minor (реализация) / major (удаление) | M |
| TBL-12 (остаток) | Pointer events с `setPointerCapture`, `pointercancel`/blur, только левая кнопка, min/maxWidth колонки, rAF; ручка — `role=separator` с управлением стрелками | Отдельная доработка взаимодействия | minor | M |
| TBL-13 | IntersectionObserver на sentinel, догрузка после рендера, dev-предупреждение без `height` | Нужна проверка в браузере | patch | M |
| TBL-14 | Имена чекбоксов (`getRowLabel`), caption/`ariaLabel` таблицы, aria-label иконочных кнопок, скрытый label поиска, `aria-expanded`, `aria-busy`, чипы-кнопки, доступная с клавиатуры панель настроек | Зависит от FRM-1/CHK-1 (BaseCheckbox) и DRP-1/DRP-2 (BaseDropdown) | minor | M |
| TBL-15 | Тип слота `cell-*`: `{ row; value: unknown; column; index?: number }` + type-test | Вне объёма этапа | patch | S |
| TBL-16 (остаток) | Эмитить копии в `sort`/`filter`; тест на неизменность сохранённого payload (включая `columns-change`) | Вне объёма этапа | patch | S |
| TBL-17 | `v-model:expandedIds`; игнорировать клики из интерактивных элементов; `isDisabled` блокирует раскрытие; `<tr>` только при раскрытии; предупреждение о дублях id | Меняет поведение раскрытия | minor | M |
| TBL-18 | Виртуализация; статическая передача слотов; состояние фильтра — в тулбар; `v-memo`; не создавать NestedRow/ExpandedRow без надобности; бенчмарк на 5k строк | Большой объём, нужен браузер | minor | L |
| TBL-19 | Накопленные смещения sticky-колонок; sticky у child-строк; flex от остатка (поправить тест `tableUtils.spec.ts:128-132`) | Визуальные изменения, нужны новые baseline | patch | M |
| TBL-20 (остаток) | Локаль коллатора из prop; `sortAccessor`/`compare` у колонки; описать принимаемые форматы дат (ISO-строка, Date, timestamp) в JSDoc `sortType` (в README уже описаны) | Новый API | minor | S |
| TBL-21 | Реактивная проверка toolbar-слотов; метки операторов — в constants; guard `getCurrentInstance`; убрать внутренние composables из публичного namespace | Удаление экспорта — breaking | patch / major (экспорт) | S |
| TRE-4 | Каскад без disabled; checked/indeterminate снизу вверх; `:is-disabled` у чекбокса | Меняет семантику выбора; indeterminate ждёт CHK-1 | minor | M |
| TRE-5 | Раскрывать новые id при смене items или ввести `defaultExpandedIds` | Вне объёма этапа | patch | S |
| TRE-6 | RouterLink/`<a>` для `to`/`href` с `isSafeUrl` и `rel` — или удалить поля | Удаление полей — breaking | minor / major | M |
| TRE-7 | `:focus-within` для actions; `@click.stop`/`@keydown.stop` на обёртке | Вне объёма этапа | patch | S |
| TRE-9 | visited-Set и предупреждение о циклах и дублях; итеративный обход без spread; ленивый кэш или parent-map | Вне объёма этапа | patch | M |
| TRE-10 | Стили disabled перенести на `.base-tree__header` | Визуальное изменение (нужен baseline) | patch | S |
| TRE-11 | При переходе в single оставлять ≤ 1 выбранного и эмитить `update:selectedIds` | Вне объёма этапа | patch | S |
| SCH-1 | Unit-тесты экранирования (`</script>`, `<!--`) и JSON.parse roundtrip | Вне объёма этапа | patch (только тесты) | S |
| SCH-2 | Экспортировать безопасный сериализатор JSON-LD; билдеры VideoObject/AudioObject/MusicPlaylist | Нужно под медиаплеер | minor | S |


### Редактор и чат (rich)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| EDT-2 / EDT-6 | Опциональный `sanitize?: (html) => string` (по умолчанию identity) на входе, выходе и вставке; свой `paste` + `pasteAsPlainText`; предупреждение в docs-story (в README уже есть) | Изменение контракта; нужно выбрать санитайзер (allowlist или DOMPurify как optional peer) | minor; санитайзер по умолчанию — major | M |
| EDT-4 | `uploadMedia?: (file) => Promise<string>` или emit `upload`; лимиты размера и типа; `revokeObjectURL` при удалении и unmount | Новый контракт, влияет на сохранённый HTML | minor | M |
| EDT-5 | `isSafeUrl` (уже есть в `utils/urlUtils`) в `insertLink`; нормализация `example.com`; экранирование или DOM-сборка в режиме кода | P2, вне объёма этапа (брались P0–P1) | patch | S |
| EDT-7 / CHAT-13 | Пропускать Enter при `isComposing`/`keyCode 229` | P2, вне объёма этапа | patch | S |
| EDT-8 / EDT-10 | Проброс `promptForUrl` или emit `request-link`; scoped-slot `toolbar` с командами; `defineExpose({ focus, blur, getHtml })` + экспорт типа Expose; `isDisabled`/`label`/`error`/`name` | Расширение API, нужен дизайн | minor | M |
| EDT-9 / EDT-CC1 | Селект «Формат» из `activeStates.formatBlock`; один тип `EditorActiveStates` | P2 | patch | S |
| EDT-11 / EDT-3r | `is-readonly` у textarea режима кода; при readonly — выход из режима кода и закрытие меню медиа; синхронизация `codeContent` с `modelValue` | P2 | patch | S |
| EDT-15 | Роль, имя (prop), `aria-multiline`/`aria-readonly`; `role="toolbar"` + roving tabindex; имена и `aria-pressed` у кнопок; фокусируемый file input; меню медиа с клавиатуры | Объём; нужен браузерный/axe-тест | minor | M |
| EDT-12 / EDT-13 / EDT-1r | Собственная история undo или переход на ProseMirror/Tiptap; `styleWithCSS`, проверка результата `execCommand`; конвертация только при `inputType=insertText` | Архитектурное решение | patch (inputType); major (смена движка) | L |
| EDT-14 (остаток) / EDT-CC2 | `isEmpty` с учётом медиа; цвет по умолчанию из токена темы; Escape, scroll и тема у меню медиа; удалить мёртвые экспорты | P3 | patch | S |
| CHAT-5 | Использовать `pinnedMessages`, если передан; реализовать `search` (debounce) и `add-member` или убрать; `unpin-message` для закреплённых; `write-message`; `autoDownload`; экспорт типов props | Изменения контракта; перевод «Открепить» на `unpin-message` меняет поведение для потребителей | minor (с записью в CHANGELOG) | M |
| CHAT-6 / CHAT-CC1 | Clamp индекса закрепа при изменении списка; удалить мёртвый API `useChatState` | P2 | patch | S |
| CHAT-7 | Автоскролл по id последнего сообщения и `isTyping`, только если пользователь у низа; кнопка «к новым»; `ResizeObserver` | P2; нужен браузерный тест | patch | M |
| CHAT-9 | Отдельный emit `header-avatar-click` (или prop `companionId`); поправить тест, закрепляющий баг | Смена payload `avatar-click` — breaking | minor (новый emit) | S |
| CHAT-10 | prop `status: 'online' \| 'offline'` вместо разбора подзаголовка | Новый prop | minor | S |
| CHAT-12 | textarea с авто-высотой; `white-space: pre-wrap` | Визуальное изменение, нужно обновить baseline | minor | M |
| CHAT-14 | prop `chatId` со сбросом ответа, черновика, выделения, поиска, закрепа и панели — или документировать `:key` | Новый prop | minor (или patch-документация) | S |
| CHAT-15 | Подтверждение kick/ban через BaseModal; prop `currentUserId`; payload без хардкода | Изменение контракта | minor | M |
| CHAT-16 | `role="log"`/`aria-live`; `:focus-within` для действий; меню по APG Menu + Shift+F10; `<button>` вместо `div @click`; `inert` у закрытого слайдовера; `tablist`; `combobox`/`listbox`; `aria-pressed` у реакций | Объём; нужны axe и браузер | minor | L |
| CHAT-19 / EDT-14 (i18n) | Экспорт текстов или prop `texts`/`locale` | Дизайн API | minor | M |
| CHAT-20 / CHAT-1r / CHAT-2r / CHAT-3r / CHAT-8r / CHAT-11r | Мелочи парсера (регистр схемы, пунктуация, email, `\n/`); эмодзи в позицию каретки; `is-disabled` у «Отправить»; удалить `DEMO_*`; revoke на unmount; `data-message-id`; блокировка скачивания → `error`; dev-warning в `useClickOutside` | P3 | patch | S |
| EDT-T1 / CHAT-T1 / CHAT-T2 | Убрать `catch {}` и добавить assert'ы в play; переименовать или удалить фиктивные stories; локальные фикстуры вместо unsplash/picsum/placehold; фиксированные id и даты; копии mock-данных; spec для трёх composables чата; запуск play в CI | Тестовая инфраструктура, объём | patch | M |
| EDT-12, CHAT-17, CHAT-7 (в) | Проверить в браузере (Playwright); для CHAT-17 — `Array.from(files)` и `File` в payload `send` | Нужен браузер | patch | S |


### Медиа и иконки (media)

| ID | Что сделать | Почему не сейчас | Тип изменения | Объём |
|---|---|---|---|---|
| IMG-1 (остаток) | Не удалять `<img>` по таймауту: ошибку показывать оверлеем, поздний `load` её снимает; пересмотреть дефолтный `timeout`; общий IntersectionObserver на все экземпляры | Меняется DOM состояния ошибки и смысл события `error`; нужна проверка в браузере | minor | M |
| ICON-1 (остаток) | Рабочий дефолт без настройки (`new URL('./icons.svg', import.meta.url)` в lib-сборке или встраивание спрайта при install); e2e «потребитель на `/a/b`»; тест подпути `./icons.svg` (раздел README уже есть) | Меняет сборку и вывод ассета у потребителя; e2e-фикстуры нет | minor | M |
| FU-2 | Убрать имитацию прогресса; контролируемая модель (`v-model:files` со `status/progress/error` или `setProgress/setStatus`), опционально `uploader` с abort и retry | Новый API и смена поведения по умолчанию | major (minor при opt-in) | L |
| IMG-4 (остаток) | Открытие зума с клавиатуры (обёртка-кнопка с именем); перевод, ловушка и возврат фокуса (`useFocusTrap`); миниатюры-кнопки с `aria-current`; `gallery: {src, alt}[]` | Работа с фокусом (этап ограничен «без переделки фокуса»), расширение типа; нужны axe и скринридер | minor | M |
| IMG-2 (остаток) | Применять `srcWidth`/`sizes` к `<source>` | Только оптимизация | patch | S |
| IMG-3 (остаток) | Включить `strictTemplates` для vue-tsc проекта (story IMG-17 уже исправлена) | `strictTemplates` поднимает много ошибок: в `run2.log` проверки README — 82 ошибки в 35 файлах `src`, в основном fallthrough-атрибуты (`aria-label`, `onClick`) на компонентах кита | patch | M |
| FU-4 | Сначала валидировать, потом ограничивать с ошибкой; синхронный резерв слотов или очередь `addFiles` | Не входило в объём этапа | patch | S |
| FU-5 | `focus()` на зону; `validate` с внутренними ошибками и `isRequired`; `reset` очищает список; типизированный expose | Новый проп и контракт | minor | M |
| FU-6 | `role="alert"`/`aria-live`, `aria-label` кнопок удаления, имя файла в `ariaLabel` прогресса, `alt=""` превью, `aria-describedby` у зоны | Не входило в объём | patch | S |
| FU-13 / CHAT-11 (остаток) | `rel="noopener noreferrer"`; для cross-origin — fetch→blob или документировать `Content-Disposition`; возвращать результат, чтобы `useChatActions` не эмитил `download-file` при отказе | Нужна проверка в браузерах; затрагивает группу rich | patch | S |
| IMG-6 | Pointer- и touch-pan, pinch, стрелки для pan, учёт поворота в clamp | Большой объём, нужен браузер | minor | L |
| IMG-8 | Игнорировать `deltaY===0`, накапливать дельту, зум к курсору | Не входило в объём | patch | S |
| IMG-9 | `src ?? ''`, пустой src — плейсхолдер без запроса; тесты `src: undefined`, в том числе с `srcWidth` | Не входило в объём | patch | S |
| IMG-10 | Слушатели только пока зум открыт, keydown на оверлее, общий стек Escape | Сквозная проблема useEscapeKey | patch | M |
| IMG-11 | Блок ошибки с `role="img"` и `aria-label`, эмодзи `aria-hidden` | Не входило в объём | patch | S |
| IMG-12 (остаток) | `buildSrcset` при существующем `?`, `sizes` для строковой ширины, `isExternalImage` без учёта регистра и для `//` | Не входило в объём | patch | S |
| AVA-1 | Интерактивный аватар — `<button>`, hover только у него | Меняется DOM корня: стили потребителей | minor | S |
| AVA-2 | Имя из `name`, инициалы `aria-hidden`, текст статуса «в сети» | Не входило в объём | patch | S |
| AVA-4 (остаток) | Внутреннему BaseImage передавать `:has-placeholder="false"`, `:border-radius="0"` и таймаут под аватар | Визуальное изменение (снимки) | patch | S |
| ICON-2 | `ICON_NAMES`/`IconName` из сборки, dev-предупреждение, `getIconNames` по списку | Меняет сборку и типы | minor | M |
| ICON-3 | Корень `span` с `inline-flex` или сразу `<svg>` | Визуальное изменение (снимки кнопок) | minor | S |
| ICON-4 (остаток) | Одна точка пути к спрайту, убрать `ICON_SOURCE_DIR` из API, удалить дублирующий spec | Удаление экспорта | minor (deprecate), затем major | S |
| ICON-5 (остаток) | Список `AllIcons` через `import.meta.glob` | P3 | patch | S |
| FU-8 | Разбор `accept`: пустые токены, суффиксы, `*/*`; тексты в `UI_TEXT` | P3 | patch | S |
| FU-10 | Реализовать или удалить `emptyText` и слот `default`; `allowPreview` должен реально скрывать превью; проверять размонтирование после `await` | Удаление или переименование API | minor → major | S |
| FU-11 | Ошибки заменять, а не дописывать; remove снимает ошибку лимита | P3 | patch | S |
| FU-12 | objectURL вместо base64 с revoke; `zoomConfig` в computed | Меняется формат `previewUrl` в payload `remove` | minor | S |
| IMG-13 | `width` вместе с `aspect-ratio`; одинаковые размеры плейсхолдера до и после загрузки | Визуальное изменение | minor | S |
| IMG-14 | Clamp индекса, `currentSrc` в зуме, обработка `src` вне галереи | P3 | patch | S |
| IMG-15 | Атрибуты на `<img>` (или проп `imgAttrs`), `defineExpose({ openZoom, closeZoom })`, удалить `variant` | Перенос `$attrs` и удаление пропа ломают API | minor / major | M |
| IMG-16 | Нормализация `zoomConfig` (clamp, NaN) | P3 | patch | S |
| AVA-3 | Инициалы по графемам, разбиение по `\s+` | P3 | patch | S |
