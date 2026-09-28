# План версии 2.0

Работа идёт порциями по 45–90 минут. Каждая порция заканчивается проверками, переносом в папку проекта и отдельным коммитом. Следующая начинается по команде «дальше» (или «следующая порция» в новом чате).

Основа плана:
- находки аудита — [audit/ROADMAP.md](../audit/ROADMAP.md);
- открытые задачи редизайна — [design/FOLLOW_UPS.md](../design/FOLLOW_UPS.md);
- сравнение с Nuxt UI, Element Plus, Vuetify, Quasar, PrimeVue и Buefy (сентябрь 2026).

## Решения

| Вопрос | Решение |
|---|---|
| Коммиты | Сначала коммит редизайна, дальше — коммит на каждую порцию. Ветка `feat/rise-v2` от `main`. Push — только по отдельному указанию |
| Зависимости | Только свой код, новых зависимостей в рантайме нет. Потоковое видео (HLS) — необязательное дополнение, которое подключает приложение |
| Совместимость | Всё выходит как 2.0: можно менять DOM и поведение существующих компонентов (слой оверлеев, паттерны APG, контекст форм). Изменения описываются в руководстве по переходу |
| Порядок | Фундамент → базовые компоненты → тренды → ниши → выпуск; необязательное — в конце |

`develop` отстаёт от `main` и содержит свой коммит `dd75096` (collapsible sidebar groups). Перед PR нужно решить: влить `main` в `develop` или открыть PR сразу в `main`.

## Правила порции

1. Новые компоненты создаются через `npm run create:component` (см. [CONTRIBUTING.md](../CONTRIBUTING.md), «Новый компонент»).
2. В конце порции:
   - `npm run lint`, `npm run typecheck`;
   - тесты затронутых компонентов с порогом покрытия;
   - `npm run test:a11y:coverage`;
   - прогон затронутых stories (рендер, play, axe) в светлой и тёмной теме.
3. Полная проверка — в конце этапа: все тесты, сборка библиотеки и Storybook, e2e.
4. Эталоны скриншотов автоматически не создаются: визуальные изменения описываются, эталоны генерируются после просмотра.
5. В этом файле отмечается статус порции; копия плана лежит в проекте «UI KIT».

## Время

Оценки пересмотрены после порций 1.1 и 1.2: 1.1 заняла столько же, сколько оценивалась (1 ч), 1.2 — вдвое меньше (45 мин вместо 1,5 ч). Оставшиеся оценки уменьшены примерно на 30%; 1.3 и 1.4 уложились в новые оценки (55 и 45 мин из 1 ч 15 мин), 1.5 — 1 ч 20 мин из 1 ч 30 мин, 1.6 и 1.7 — около 1 ч из 1 ч 30 мин, 1.8 — около 1 ч из 1 ч, 2.1 — около 50 мин из 1 ч 30 мин, 2.2 — около 45 мин из 1 ч 15 мин, 2.3 — около 1 ч из 1 ч, 2.4 — около 50 мин из 1 ч 30 мин (вместе с полной проверкой этапа 2).

| | Порций | Время |
|---|---|---|
| Сделано (0, 1.1–1.8, 2.1–2.4) | 13 | ≈11 ч 40 мин |
| Осталось до выпуска 2.0 (этапы 1–5) | 8 | ≈11 ч |
| Необязательное | 4 | ≈4 ч 45 мин |
| Структура и правила кода: сделано (С.1–С.8, С.9.1–С.9.8) | 16 | ≈11 ч 45 мин |
| Структура и правила кода: осталось (С.9.9) | 1 | ≈2 ч 30 мин |

## Порции

Статус: ✅ готово · 🔄 в работе · ⬜ не начата. «Оценка» — ориентир на начало порции, «Факт» — сколько заняла.

### Этап 0

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 0 | Подготовка | Коммит исправлений аудита и редизайна; скрипт `create:component`; проверка незаполненных заготовок; этот план | 30 мин | ≈30 мин | ✅ |

### Этап 1. Фундамент (~9 ч 45 мин)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 1.1 | Безопасность и stories в CI | Схемы ссылок в редакторе (EDT-5), `href` в BaseSideBar через `isSafeUrl` (SB-6), проп `sanitize` у BaseEditor (EDT-2). Прогон всех stories (рендер, play, axe, две темы) скриптом в `scripts/` и шагом CI (TST-2). Попутно: гонка курсора в BaseInput, шрифты до рендера stories, таймаут findBy 3 с | 1 ч | ≈1 ч | ✅ |
| 1.2 | BaseApp и сервисы | `<BaseApp>`: контейнер уведомлений и оверлеев. `useToast()`, `useOverlay()`, `useConfirm()` и BaseConfirm. Пауза автозакрытия уведомлений при наведении и фокусе (NTF-2), `isPersistent`, кнопки действий, `duration` компонента для `add()`. Подтверждение у элемента (Popconfirm) перенесено в 1.6: ему нужно позиционирование и слой оверлеев | 1,5 ч | 45 мин | ✅ |
| 1.3 | Тема и настройки | `data-theme="system"`, `useColorMode()`, BaseColorModeButton. Значения по умолчанию для всего приложения (`createUiKitPlugin({ defaults })`). Замена иконок кита своими (`icons`). BaseLink и `linkComponent` в плагине с автоматическим RouterLink; ссылки в BaseBreadcrumbs (BC-2) и BaseSideBar. Ссылки в BaseTree (TRE-6) перенесены в 1.7, в BaseMegaMenu (часть MM-1) — в 1.6: там эти компоненты перерабатываются | 1 ч 15 мин | 55 мин | ✅ |
| 1.4 | Локализация | Словари ru и en (≈230 строк), константы со строками читают словарь текущего языка и перерисовывают шаблоны при его смене. `locale` в BaseApp и плагине, `useLocale()`, `setLocale()`, `defineLocale()`. Календарь без жёсткого `ru-RU`, первый день недели из языка; числа, даты и множественное число через `Intl`. Кнопка «Язык» в Storybook | 1 ч 15 мин | 45 мин | ✅ |
| 1.5 | Слой оверлеев | Стек слоёв: Escape и клик вне получает только верхний (без нажатий с `preventDefault` и в IME, проверка по `composedPath`). z-index по порядку открытия (`useLayerIndex`) и токены `--rise-z-*`. Контейнер слоёв `teleportTo` в BaseApp и плагине, тема блока у панелей, тултипов и меню. Переворот и сдвиг у края экрана в `useDropdownPosition` (CO-1, OVL-1, OVL-2, ESC-STACK, ESC-1, DP-1) | 1 ч 30 мин | ≈1 ч 20 мин | ✅ |
| 1.6 | Меню и тултипы | BaseDropdownMenu по паттерну APG menu button: флажки и переключатели, подписи групп, подменю, стрелки, поиск по первой букве, ссылки. BaseContextMenu. BasePopconfirm (из 1.2). Тултип: `aria-describedby`, наведение на подсказку, переворот и сдвиг у края (TT-1, TT-3). `triggerProps` и ARIA кнопки у Popover и Tooltip, `close` при закрытии кнопкой (POPV-5). Ссылки в BaseMegaMenu через BaseLink (часть MM-1, из 1.3). Телепорты с `defer`, stories слоёв из 1.5 | 1 ч 30 мин | ≈1 ч | ✅ |
| 1.7 | Выбор и дерево | BaseSelect и BaseSearch как APG combobox/listbox: `aria-activedescendant`, поиск по первой букве. BaseTree по APG: роли, roving tabindex, стрелки, ссылки `to`/`href` через BaseLink (SEL-2, SRCH-4, TRE-1, TRE-2, TRE-6 из 1.3) | 1 ч 30 мин | ≈1 ч | ✅ |
| 1.8 | Формы | BaseFormField передаёт полям id, описание и ошибку. `ariaLabel` и `inputAttrs` у полей. `indeterminate` у чекбокса и BaseCheckboxGroup. Блокировка кастомных контролов в неактивной форме. Валидация BaseForm по схеме через Standard Schema (FRM-1, FRM-2, FFD-2, CHK-1, FORM-1, FORM-3) | 1 ч | ≈1 ч | ✅ |

### Этап 2. Базовые компоненты (~5 ч 15 мин)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 2.1 | Поля | BaseInputNumber, BaseTimePicker, BaseAutocomplete, BaseInputTags, BaseSegmented | 1 ч 30 мин | ≈50 мин | ✅ |
| 2.2 | Отображение и действия | BaseTimeline, BaseKbd, BaseAvatarGroup, BaseUser, BaseButtonGroup, BaseSplitButton, BaseToolbar, BaseFab, BaseInplace | 1 ч 15 мин | ≈45 мин | ✅ |
| 2.3 | Каркас и прокрутка | Каркас приложения: BaseLayout (ссылка «Перейти к содержимому», `<main>`), BaseHeader (меню для узкого экрана), BaseFooter, BaseContainer; BaseSplitter, BaseScrollArea, BaseDrawer, BaseBackTop (кнопка «наверх»), BaseInfiniteScroll | 1 ч | ≈1 ч | ✅ |
| 2.4 | Виртуализация | BaseVirtualList и `useVirtualList`, виртуальная прокрутка BaseTable и BaseTree (`isVirtual`; TBL-18 — часть про виртуализацию) | 1 ч 30 мин | ≈50 мин | ✅ |

### Этап 3. Тренды (~1 ч 30 мин)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 3.1 | Палитра команд и графики | BaseCommandPalette (⌘K), `useHotkeys`, графики без зависимостей (BaseSparkline, BasePieChart, BaseHeatmap), BaseImageCompare | 1 ч 30 мин | — | ⬜ |

### Этап 4. Ниши (~8 ч 30 мин)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 4.1 | Медиаплеер: ядро | Composables плеера (состояние элемента, источники, дорожки, полный экран, горячие клавиши, автоскрытие) и BaseMediaPlayer: видео и аудио, перемотка, громкость, скорость, полный экран, ошибки. По [audit/MEDIA_PLAYER_PLAN.md](../audit/MEDIA_PLAYER_PLAN.md) | 1 ч 30 мин | — | ⬜ |
| 4.2 | Медиаплеер: дорожки и звук | Субтитры WebVTT, выбор звуковой дорожки (оригинал или озвучка), главы. BaseAudioPlayer и BaseWaveform с выделением фрагментов | 1 ч 30 мин | — | ⬜ |
| 4.3 | Запись и субтитры | BaseVoiceRecorder с индикатором уровня и голосовые сообщения в BaseChat. BaseSubtitleEditor: реплики и таймлайн, синхронные с плеером | 1 ч 30 мин | — | ⬜ |
| 4.4 | ИИ и общение | BaseMarkdown (безопасный рендер без HTML-строк). Блоки ИИ-чата: потоковое сообщение, рассуждение, вызов инструмента. BasePromptInput, BaseEmojiPicker, BaseMention | 1 ч 30 мин | — | ⬜ |
| 4.5 | Инструменты | BaseKanban с перетаскиванием мышью и с клавиатуры, BaseFilterBuilder для BaseTable, BaseChecklist для онбординга | 1 ч 30 мин | — | ⬜ |
| 4.6 | Русский модуль | BasePhoneInput (страна и маска), BaseMoneyInput, поля реквизитов с проверкой контрольных чисел (ИНН, КПП, ОГРН, БИК, расчётный счёт, СНИЛС), BaseAddressInput с адаптером подсказок (например, DaData) | 1 ч | — | ⬜ |

### Этап 5. Выпуск 2.0 (~1 ч)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| 5.1 | Выпуск | Руководство по переходу `docs/v2/MIGRATION.md`, короткий README со ссылкой на Storybook и бейджами, полная проверка | 1 ч | — | ⬜ |

### Необязательное (~4 ч 45 мин)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| Н.1 | Демо и блоки страниц | Демо-приложение на ките, блоки страниц и дашборда | 1 ч 30 мин | — | ⬜ |
| Н.2 | Разбивка CSS | Стили по компонентам вместо одного файла на 321 КБ | 45 мин | — | ⬜ |
| Н.3 | Мелкие компоненты | BaseAvatarCropper, BaseSignaturePad, BaseQrCode (свой кодировщик), BaseJsonViewer, BaseTextDiff | 1 ч 30 мин | — | ⬜ |
| Н.4 | Уведомления и комментарии | Центр уведомлений (прочитанные и непрочитанные), ветки комментариев | 1 ч | — | ⬜ |

### Структура и правила кода (вне этапов)

| № | Порция | Состав | Оценка | Факт | Статус |
|---|---|---|---|---|---|
| С.1 | Папки и сборка | Удалены `npm run dev` и демо-приложение, `.npmignore`, `build/ci/env`, неиспользуемые плагины сборки; commitlint в `build/`; алиасы из одного файла; `npm run typecheck` проверяет и конфиги сборки | — | ≈1 ч | ✅ |
| С.2 | Тесты и типы | Тесты — в `__tests__` своей папки, тесты пакета — в `build/tests/`; удалены `src/types`, `src/plugins` (`createIconPlugin` — в `icons`) и корневая `types` | 30 мин | ≈30 мин | ✅ |
| С.3 | Без `src/constants` | Строки — `src/locales/messages.ts`, `DEFAULT_VARIANT` и `SIZE_SCALE_DEFAULT` — в `useVariant` и `useSizeScale`, остальное — рядом с кодом; неиспользуемое удалено | 1 ч | ≈1 ч 10 мин | ✅ |
| С.4 | Код компонента в `model/` | Пилот: BaseInputNumber, BaseSplitter, BaseInplace — логика `<script setup>` в `model/useBaseX.ts`, тип `PropsWithDefaults`, покрытие `model/use*.ts` | 45 мин | ≈15 мин | ✅ |
| С.5 | Правила кода | Prettier (отдельный коммит переформатирования), ESLint: импорты «лесенкой» и правила «чистого кода», Stylelint для SCSS; хуки и CI | 1 ч 30 мин | ≈1 ч 25 мин | ✅ |
| С.6 | Типы в `types/` | Все `*.types.ts` — в папках `types/`, типы из кода и хелперов stories — туда же; функции и константы без типов — в `model/`; плагин — `src/plugin/`; ESLint запрещает типы вне `types/` и функции в `types/`; тест структуры; шаблоны `create:component` | 1 ч 30 мин | ≈1 ч 25 мин | ✅ |
| С.7 | Мёртвый код | knip (`npm run lint:unused`, pre-commit и CI): удалены 10 неиспользуемых файлов, 6 dev-зависимостей, неиспользуемые экспорты и типы; ESLint проверяет неиспользуемые переменные и в тестах со stories | 45 мин | ≈35 мин | ✅ |
| С.8 | Комментарии | Удалены около 1 700 комментариев, которые пересказывали код, заголовки разделов и шапки тестов и stories, 229 сокращены; остались объяснения «почему», единицы и смысл чисел, описания props, emits, slots и stories. Правило — в CONTRIBUTING | 1 ч | ≈1 ч 30 мин | ✅ |
| С.9.1 | Логика в `model/` | BaseButtonGroup, BaseContainer, BaseBadge, BaseFooter, BaseSplitButton, BaseAnimation, BaseAvatarGroup, BaseUser, BaseEmpty, BaseColorModeButton: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 45 мин | ≈25 мин | ✅ |
| С.9.2 | Логика в `model/` | BaseLoader, BaseMenu, BaseConfirm, BaseIcon, BaseFab, BaseCard, BaseLink, BaseApp, BaseChip, BaseLayout: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts`. Перед группой — пороги «чистого кода» ошибками для `model/` и новых файлов, правило ESLint для `<script setup>` переведённых компонентов | 45 мин | ≈35 мин | ✅ |
| С.9.3 | Логика в `model/` | BaseTimeline, BaseHeader, BaseSeparator, BaseSegmented, BaseButton, BaseSkeleton, BaseStepper, BaseText, BaseAvatar, BaseTimePicker: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 1 ч | ≈25 мин | ✅ |
| С.9.4 | Логика в `model/` | BaseProgress, BaseRadio, BaseAlert, BaseCheckbox, BaseSwitch, BaseVirtualList, BaseKbd, BasePopover, BasePagination, BaseAccordion: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 45 мин | ≈25 мин | ✅ |
| С.9.5 | Логика в `model/` | BaseBackTop, BaseContextMenu, BaseCheckboxGroup, BaseModal, BaseInfiniteScroll, BaseToolbar, BaseBreadcrumbs, BaseFormField, BaseSlideover, BasePopconfirm: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 1 ч | ≈30 мин | ✅ |
| С.9.6 | Логика в `model/` | BaseForm, BasePin, BaseDrawer, BaseInput, BaseRange, BaseDropdown, BaseColorPicker, BaseTextarea, BaseSlider, BaseRating: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 1 ч 15 мин | ≈30 мин | ✅ |
| С.9.7 | Логика в `model/` | BaseFileUpload, BaseSideBar, BaseScrollArea, BaseTour, BaseImage, BaseInputTags, BaseNotification, BaseTabs, BaseTooltip, BaseMegaMenu: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 1 ч 30 мин | ≈35 мин | ✅ |
| С.9.8 | Логика в `model/` | BaseAutocomplete, BaseSelect, BaseCalendar, BaseDatePicker, BaseSearch: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 1 ч 30 мин | ≈30 мин | ✅ |
| С.9.9 | Логика в `model/` | BaseEditor, BaseTree, BaseTable, BaseDropdownMenu, BaseChat: в `.vue` — макросы и вызов `useBaseX`, логика — в `model/useBaseX.ts` | 2 ч 30 мин | — | ⬜ |

## Как продолжить в новом чате

1. Подключить папку проекта с компьютера.
2. Написать: «Выполни следующую порцию из `docs/v2/PLAN.md`».
3. Новой сессии нужно заново развернуть окружение: скопировать репозиторий, `npm ci`, браузер Playwright — это около 30–60 минут.
