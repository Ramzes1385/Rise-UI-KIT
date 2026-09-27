# Матрица компонентов Rise UI Kit

Состояние 51 публичного компонента после исправлений аудита (исходный коммит `9c848ae` + изменения из [REPORT.md](./REPORT.md)).

**Как читать таблицу**
- **Зрелость:** «стабилен» — готов к использованию; «с оговорками» — основной сценарий работает, есть известные ограничения; «требует доработки» — есть открытые дефекты основного сценария или доступности.
- **Доступность:** оценка после исправлений (роль, имя, клавиатура, фокус): «ок», «частично», «нет». Подробности и ID — в блоке компонента ниже и в `findings/<группа>.md`.
- **Тесты:** число spec-файлов компонента (включая подкомпоненты) по типам и число вызовов `it`/`test` (строка `it.each` считается один раз). Тесты composables и utils — в их каталогах, здесь не учтены.
- **Stories:** число экспортированных stories, из них с play-функцией, и есть ли у компонента docs-описание (`parameters.docs.description.component`).
- **Прогон stories:** каждая story собранного Storybook открыта в Chromium (рендер, play-функция, axe из addon-a11y; правило `color-contrast` отключено конфигурацией проекта) — см. REPORT.md §5.4. «Ок» — story отрисовалась и play прошла.
- **Открытые P0–P1:** неисправленные или частично исправленные находки высокого приоритета, где компонент назван в находке.

Итого: зрелость — стабилен 3, с оговорками 31, требует доработки 17; доступность — ок 6, частично 29, нет 16.

| Компонент | Группа | Зрелость | Доступность | Тесты: файлы unit/int/e2e/visual (кейсов) | Stories: всего / с play / docs | Прогон stories после исправлений: ок / ошибки play / с нарушениями axe | Открытые P0–P1 |
|---|---|---|---|---|---|---|---|
| BaseButton | Отображение | с оговорками | частично | 1/1/0/1 (52) | 22 / 22 / нет | 22 / 0 / 0 | TOK-1 (P1) |
| BaseAlert | Отображение | с оговорками | частично | 1/1/0/1 (26) | 13 / 13 / нет | 13 / 0 / 0 | — |
| BaseAnimation | Отображение | требует доработки | нет | 1/1/0/1 (15) | 7 / 7 / нет | 7 / 0 / 1 | — |
| BaseLoader | Отображение | с оговорками | частично | 1/1/0/1 (38) | 8 / 8 / нет | 8 / 0 / 0 | — |
| BaseProgress | Отображение | с оговорками | частично | 1/1/0/1 (52) | 10 / 2 / нет | 10 / 0 / 0 | TOK-1 (P1) |
| BaseSkeleton | Отображение | с оговорками | частично | 1/1/0/1 (29) | 10 / 4 / нет | 10 / 0 / 0 | — |
| BaseEmpty | Отображение | стабилен | ок | 1/1/0/1 (17) | 7 / 7 / нет | 7 / 0 / 0 | — |
| BaseBadge | Отображение | требует доработки | нет | 1/1/0/1 (15) | 8 / 8 / нет | 8 / 0 / 0 | — |
| BaseChip | Отображение | требует доработки | нет | 1/1/0/1 (30) | 21 / 21 / нет | 21 / 0 / 0 | CORE-1 (P1), TOK-1 (P1) |
| BaseCard | Отображение | с оговорками | частично | 1/1/0/1 (16) | 17 / 17 / нет | 17 / 0 / 0 | CORE-1 (P1) |
| BaseSeparator | Отображение | стабилен | ок | 1/1/0/1 (31) | 12 / 12 / нет | 12 / 0 / 0 | — |
| BaseText | Отображение | стабилен | ок | 1/1/0/1 (29) | 12 / 7 / нет | 12 / 0 / 0 | — |
| BaseInput | Формы | требует доработки | нет | 1/1/0/1 (89) | 30 / 27 / нет | 30 / 0 / 1 | FRM-1 (P1), MSK-1 (P1, частично), MSK-2 (P1), MSK-4 (P1) |
| BaseTextarea | Формы | с оговорками | частично | 1/1/0/1 (46) | 22 / 7 / нет | 22 / 0 / 4 | FRM-1 (P1) |
| BaseCheckbox | Формы | с оговорками | частично | 1/1/0/1 (30) | 15 / 10 / нет | 15 / 0 / 0 | FRM-1 (P1) |
| BaseRadio | Формы | с оговорками | частично | 1/1/0/1 (31) | 24 / 9 / нет | 24 / 0 / 0 | FRM-1 (P1) |
| BaseSwitch | Формы | с оговорками | частично | 1/1/0/1 (35) | 17 / 3 / нет | 17 / 0 / 0 | FRM-1 (P1) |
| BasePin | Формы | требует доработки | нет | 1/1/0/1 (35) | 18 / 17 / нет | 18 / 0 / 18 | FRM-1 (P1) |
| BaseFormField | Формы | с оговорками | частично | 1/1/0/1 (19) | 11 / 2 / нет | 11 / 0 / 4 | FRM-1 (P1) |
| BaseForm | Формы | с оговорками | частично | 1/1/1/1 (21) | 17 / 4 / нет | 17 / 0 / 0 | — |
| BaseSelect | Выбор значений | требует доработки | нет | 1/1/1/1 (43) | 35 / 20 / нет | 35 / 0 / 0 | SEL-2 (P1), DRP-1 (P1, частично) |
| BaseSearch | Выбор значений | требует доработки | нет | 1/1/0/1 (104) | 57 / 42 / нет | 57 / 0 / 22 | SRCH-2 (P1, частично) |
| BaseColorPicker | Выбор значений | с оговорками | частично | 1/1/0/1 (29) | 12 / 12 / нет | 12 / 0 / 0 | — |
| BaseRange | Выбор значений | с оговорками | частично | 1/1/0/1 (82) | 38 / 29 / нет | 38 / 0 / 38 | — |
| BaseSlider | Выбор значений | требует доработки | нет | 1/1/1/1 (53) | 45 / 43 / нет | 45 / 0 / 43 | SLD-1 (P1, частично) |
| BaseRating | Выбор значений | с оговорками | частично | 2/1/0/1 (72) | 13 / 13 / нет | 13 / 0 / 0 | — |
| BaseModal | Оверлеи | с оговорками | частично | 1/1/1/1 (54) | 26 / 19 / нет | 26 / 0 / 2 | MOD-1 (P1, частично) |
| BaseSlideover | Оверлеи | с оговорками | частично | 1/1/0/1 (50) | 24 / 18 / нет | 24 / 0 / 1 | — |
| BaseDropdown | Оверлеи | требует доработки | нет | 1/1/1/1 (49) | 13 / 9 / нет | 13 / 0 / 2 | DRP-1 (P1, частично), CO-1 (P1) |
| BasePopover | Оверлеи | требует доработки | нет | 1/1/0/1 (28) | 18 / 4 / нет | 18 / 0 / 0 | CO-1 (P1) |
| BaseTooltip | Оверлеи | требует доработки | нет | 1/1/0/1 (21) | 17 / 17 / нет | 17 / 0 / 0 | — |
| BaseNotification | Оверлеи | с оговорками | частично | 1/1/1/1 (29) | 14 / 7 / нет | 14 / 0 / 3 | — |
| BaseTour | Оверлеи | с оговорками | частично | 2/1/0/1 (65) | 9 / 9 / нет | 9 / 0 / 0 | — |
| BaseTabs | Навигация | с оговорками | ок | 1/1/1/1 (39) | 19 / 12 / нет | 19 / 0 / 0 | — |
| BaseAccordion | Навигация | с оговорками | ок | 1/1/1/1 (40) | 21 / 9 / нет | 21 / 0 / 3 | — |
| BaseMenu | Навигация | с оговорками | частично | 1/1/0/1 (25) | 18 / 4 / нет | 18 / 0 / 0 | — |
| BaseMegaMenu | Навигация | требует доработки | нет | 1/1/0/1 (75) | 21 / 10 / нет | 21 / 0 / 0 | MM-1 (P1) |
| BaseSideBar | Навигация | с оговорками | частично | 2/1/1/1 (117) | 27 / 3 / нет | 27 / 0 / 9 | — |
| BaseBreadcrumbs | Навигация | с оговорками | частично | 1/1/0/1 (43) | 23 / 23 / нет | 23 / 0 / 4 | — |
| BaseStepper | Навигация | требует доработки | нет | 1/1/0/1 (36) | 17 / 17 / нет | 17 / 0 / 0 | — |
| BasePagination | Навигация | с оговорками | частично | 1/1/0/1 (26) | 18 / 4 / нет | 18 / 0 / 0 | — |
| BaseCalendar | Даты | с оговорками | частично | 1/2/0/1 (48) | 50 / 21 / нет | 50 / 0 / 49 | — |
| BaseDatePicker | Даты | с оговорками | частично | 5/2/1/1 (134) | 67 / 45 / нет | 67 / 0 / 25 | DP-2 (P1, частично) |
| BaseTable | Таблица и дерево | требует доработки | частично | 2/1/1/1 (74) | 62 / 24 / нет | 62 / 0 / 27 | TBL-2 (P1, частично), TBL-3 (P1), TBL-4 (P1), TBL-6 (P1, частично) |
| BaseTree | Таблица и дерево | требует доработки | нет | 2/1/1/1 (65) | 31 / 16 / нет | 31 / 0 / 3 | TRE-1 (P1), TRE-2 (P1), TRE-8 (P1, частично) |
| BaseEditor | Редактор и чат | требует доработки | нет | 1/1/0/1 (36) | 27 / 13 / нет | 27 / 0 / 23 | EDT-2 (P1), EDT-4 (P1) |
| BaseChat | Редактор и чат | с оговорками | частично | 8/1/0/1 (210) | 85 / 78 / нет | 85 / 0 / 7 | — |
| BaseFileUpload | Медиа | требует доработки | частично | 1/1/1/1 (49) | 25 / 11 / нет | 25 / 0 / 3 | FU-2 (P1) |
| BaseImage | Медиа | с оговорками | частично | 1/1/0/1 (61) | 29 / 27 / нет | 29 / 0 / 0 | IMG-1 (P0, частично), IMG-4 (P1, частично) |
| BaseAvatar | Медиа | с оговорками | нет | 1/1/0/1 (30) | 15 / 15 / нет | 15 / 0 / 0 | IMG-1 (P0, частично) |
| BaseIcon | Медиа | с оговорками | ок | 2/1/0/1 (38) | 9 / 1 / нет | 9 / 0 / 0 | ICON-1 (P0, частично) |

---

# Подробности по компонентам

Блоки перенесены из реестров групп: назначение и зрелость, API, состояния, доступность, тесты, Storybook, открытые проблемы.

## Отображение
### BaseButton

- Назначение и зрелость: базовая кнопка — 5 вариантов, loading/disabled, слоты иконок, `padding`. Зрелость: Пригоден с оговорками — контраст основного варианта (TOK-1), безымянные icon-only (BTN-2).
- API: `type` (`button`/`submit`/`reset`, по умолчанию `button`), `variant` (default/ghost/outline/shadow/soft), `padding` (PaddingProp = 10), `isLoading`, `isDisabled`, `sizeScale` = 100, `color` (только base — BTN-3), `customClass` (root). v-model нет. Emits: `click(MouseEvent)` (не эмитится при disabled/loading). Slots: `default`, `left`, `right`. Expose: `{ buttonRef, focus, blur }`; тип `BaseButtonExpose` объявлен, но из `index.ts` не экспортирован (BTN-5). `$attrs` (aria-label и т. п.) — на `<button>`.
- Состояния: disabled (нативный), loading (спиннер, контент `opacity: 0`, `aria-busy` + `aria-disabled`, остаётся в фокус-порядке), 5 вариантов; нет pressed/toggle и icon-only режима.
- Доступность (после исправлений): частично — нативная кнопка, loading корректен (BTN-1); открыто: icon-only без обязательного имени (BTN-2), текст 2.80/2.26 и кольцо фокуса 2.69 (TOK-1), спиннер без reduced-motion (ANI-2/BTN-4), фокус в forced-colors (BTN-6, гип.).
- Тесты: unit/integration — `type`, варианты, disabled/loading (`aria-busy`, `aria-disabled`, фокус и Tab в loading, Enter/Space гасятся, форма не отправляется в loading и отправляется без него, клик и Enter не доходят до предка в loading — BTN-7), слоты, padding-переменные, click; visual — 7 снимков. Не покрыто: `focus()/blur()` из expose, проброс `aria-label` у icon-only, фокус в реальном браузере; порог покрытия на компонент не распространяется.
- Storybook: 22 stories; docs-описания компонента нет (только `docs.source`); play 22 — в основном наличие, клик + `fn()` в Default/Disabled/Loading (+ `aria-busy`/`aria-disabled`)/DisabledLoading/Interactive; keyboard — только `userEvent.tab()` в Default без проверки фокуса; DarkTheme есть; недетерминизма нет. ShortText — антипример «✓/✕/+» без имён; InteractiveStates опирается на устаревший `build/storybook/forced-states.scss:8-39`; CustomColor задаёт hover/active/focus, которые кнопка не читает (BTN-3), белый на #ff0000 — 4.00:1.
- Открытые проблемы: TOK-1, CORE-1 (как вложенный), BTN-2, ANI-2/BTN-4, CORE-2, BTN-3, BTN-4 (остаток), BTN-5, CNS-1 (три дефолта отступа); гип. BTN-6.
### BaseAlert

- Назначение и зрелость: баннер-оповещение (4 типа × 5 вариантов, иконка, заголовок/описание, действия, закрытие через событие). Зрелость: Пригоден с оговорками — `color` не работает и протекает в детей (ALR-3/CORE-1).
- API: `type` (info/success/warning/error, по умолчанию info), `variant` (5), `title`, `description`, `isClosable` = false, `icon`, `sizeScale`, `color` (алерт не красит — ALR-3), `customClass` (10 ключей). v-model нет. Emits: `close` (компонент управляемый, сам не скрывается). Slots: `default` (вместо description), `icon`, `actions`. Expose нет.
- Состояния: 4 типа, 5 вариантов, closable, пустой (без title/description), неизвестный `type` → нейтральные токены + иконка info.
- Доступность (после исправлений): частично — `role=alert` для error/warning и `role=status` для info/success без явного `aria-live` (ALR-2), у кнопки закрытия имя «Закрыть» (ALR-1, не локализуется); открыто: фиксированный `h4` (ALR-4), после закрытия фокус теряется (кнопка удаляется вместе с алертом, рекомендаций нет).
- Тесты: unit — классы типов/вариантов, иконки по типу, emit закрытия, слоты; integration — закрытие через родителя, действия, роль по типу, отсутствие `aria-live`, имя кнопки закрытия. Формально: `integration.spec.ts:40` ищет `getByRole('button')` без имени (остался). Не покрыто: эффект `color` и `sizeScale` (браузер), фокус после закрытия.
- Storybook: 13 stories; docs-описания нет; play 13 — наличие текстов, Closable ищет кнопку по роли и имени; keyboard нет; DarkTheme и LongContent есть; детерминизм ОК; CustomColor наглядно показывает CORE-1/ALR-3.
- Открытые проблемы: CORE-1, ALR-3, CORE-2 (описание при 110), ALR-4, ALR-5; локализация имени кнопки закрытия (C).
### BaseAnimation

- Назначение и зрелость: обёртка над `<Transition>`/`<TransitionGroup>` с 12 пресетами. Зрелость: Требует доработки — групповой режим сломан (ANI-1), глобальные классы (ANI-3), нет reduced-motion (ANI-2).
- API: `show` (фактический дефолт true через `useExplicitPropDetection` — ANI-5), `name` (TransitionName, по умолчанию `fade`), `mode` (`out-in`/`in-out`/`default`, по умолчанию `out-in`), `isGroup` = false, `tag` = `div`, `customClass` (root); `variant/sizeScale/color` принимаются и игнорируются (CORE-7). v-model нет. Emits: `after-enter`, `after-leave`. Slot `default`. Expose нет. `index.ts` экспортирует `ANIMATION_NAMES/MODES`.
- Состояния: показ/скрытие, appear при монтировании (отключить нельзя).
- Доступность: нет — reduced-motion не учитывается (ANI-2), group-режим даёт `ul > div > li` (ANI-1).
- Тесты: unit — `show` true/false/по умолчанию, `ul` в group-режиме (структура не проверяется), проброс after-* через стаб Transition; формальные — «пропс name» (`spec:51-61`), «пропс mode» (`spec:90-105`, `wrapper.exists()`); integration — 1 тест рендера. Не покрыто: смена `show` после mount, поэлементная анимация группы, reduced-motion (браузер).
- Storybook: 7 stories; docs-описания нет; play 7 — Default/Interactive переключают и ждут `after-leave`, проверка `after-enter` слабая (fn уже вызван при appear); DarkTheme есть; детерминизм ОК; GroupAnimation демонстрирует сломанную структуру.
- Открытые проблемы: ANI-1, ANI-2, ANI-3, ANI-4, ANI-5, CORE-7.
### BaseLoader

- Назначение и зрелость: индикатор загрузки (spinner/dots/pulse/bars), подпись, оверлей. Зрелость: Пригоден с оговорками — в live-регионе нет текста (LDR-1, остаток).
- API: `variant` (spinner/dots/pulse/bars, по умолчанию spinner — базовый `variant` в другом смысле), `hasLabel` = false, `label` = «Загрузка...», `isOverlay` = false, `sizeScale`, `color`, `customClass` (root/animation/spinner/label). Emits нет. Slot `default` объявлен в типах, в шаблоне отсутствует. Expose нет.
- Состояния: 4 вида, подпись, оверлей.
- Доступность (после исправлений): частично — `role=status`, имя из `label` без многоточия (пусто → «Загрузка»), анимация `aria-hidden`; открыто: при `hasLabel=false` в регионе нет текста (LDR-1), оверлей не делает контент `inert` (LDR-3), нет reduced-motion (ANI-2).
- Тесты: unit — роль, имя из `label`/по умолчанию/пустого, `aria-hidden` анимации, классы видов, подпись, оверлей, `--custom-text`, `--size-scale`, части SVG; integration практически дублирует unit. Не покрыто: объявление live-региона, смена пропсов после mount, reduced-motion.
- Storybook: 8 stories; docs-описания нет; play 8 — наличие; DarkTheme есть; длинного контента нет; детерминизм ОК (бесконечные анимации `toHaveScreenshot` отключает).
- Открытые проблемы: CORE-1 (через LDR-2), LDR-1 (остаток), ANI-2, LDR-2, LDR-3.
### BaseProgress

- Назначение и зрелость: индикатор прогресса (линия/круг, анимации, неопределённый режим, подпись). Зрелость: Пригоден с оговорками — rAF-подсказка (PRG-4), досрочный `complete` (PRG-3, остаток).
- API: `value` (обяз.), `max` = 100, `shape` (line/circle, по умолчанию line), `animation` (none/striped/pulse/glow), `hasLabel` = false, `isIndeterminate` = false, `ariaLabel` (новый, по умолчанию «Прогресс»), `sizeScale`, `color`, `customClass` (9 ключей); `variant` игнорируется. Emits: `complete`. Slot `default({ value, percent })` — только у круга. Expose нет. `PROGRESS_SHAPES/ANIMATIONS` из `index.ts` не экспортируются.
- Состояния: determinate/indeterminate (визуально — только линия, PRG-5), подпись, анимации; некорректные `value/max` → 0%.
- Доступность (после исправлений): частично — `role=progressbar` с именем (`ariaLabel`, «Прогресс» или внешний `aria-labelledby`), без `aria-valuenow` в indeterminate, без «NaN»; открыто: видимая «0%» в indeterminate (PRG-1), нет `aria-valuetext` (PRG-2), подпись линии вне progressbar (PRG-4), подпись белым на accent 2.80 и заливка против трека 2.55 (TOK-1).
- Тесты: unit — роль, `aria-valuenow` (0/50/100, клампы, `max`), имя (3 сценария), indeterminate (нет valuenow, возврат после выхода), некорректные value/max (4 случая, нет `complete`), Infinity → 100, формы, подписи, анимации, color, `complete`; integration — подсказка, подпись круга, `complete`, слот. Формально: блок «tooltipColor» (HEAD `spec:228-246`) проверяет style корня, а не цвет подсказки. Не покрыто: 199/200 → `complete`, остановка rAF при unmount, число кадров rAF.
- Storybook: 10 stories; docs-описания нет; play 2 (OnComplete — реальный `waitFor`, WithCustomClass — наличие класса), у остальных удалены; argTypes включают `ariaLabel`; DarkTheme без фона (1.27:1 на baseline, PRG-7); детерминизм ОК; `completeSpy` — общий модульный мок.
- Открытые проблемы: TOK-1, PRG-1 (остаток), PRG-2 (остаток), PRG-3 (остаток), PRG-4, ANI-2, PRG-5, PRG-6, PRG-7, CNS-1 (`r="52"`), CORE-7.
### BaseSkeleton

- Назначение и зрелость: заглушка (rect/circle/text) с шиммером или пульсом. Зрелость: Пригоден с оговорками.
- API: `width`, `height` (string/number), `shape` (text/circle/rect, по умолчанию rect), `isAnimated` = true, `isPulse` = false, `color` (строка, в отличие от CustomColor), `sizeScale`, `customClass` (root); `variant` игнорируется. Emits нет. Slot `default` объявлен в типах, в шаблоне нет. Expose нет.
- Состояния: 3 формы; анимирован/пульс/статичен.
- Доступность: частично — пустой div без `aria-hidden` и без описанного паттерна `aria-busy` (SKL-1); бесконечный шиммер без reduced-motion (ANI-2).
- Тесты: unit/integration (integration во многом дублирует) — классы форм/анимаций, размеры (число/строка/масштаб), цвет, `--size-scale`, customClass. Не покрыто: нулевые размеры, тёмный шиммер, aria.
- Storybook: 10 stories; docs-описания нет; play 4 (проверки style); DarkTheme есть; детерминизм ОК; часть stories названа по покрываемым строкам.
- Открытые проблемы: ANI-2, SKL-1, SKL-2, SKL-3, CORE-7.
### BaseEmpty

- Назначение и зрелость: пустое состояние (иконка, заголовок, описание, тело, действия). Зрелость: Стабилен после EMP-1 (нужен новый baseline).
- API: `title`, `description`, `icon` (фолбэк `inbox`), `variant` (default/ghost/soft), `sizeScale`, `color`, `customClass` (8 ключей). Emits: в типах `action`, не реализован (EMP-2). Slots: `default`, `icon`, `actions`. Expose нет.
- Состояния: 3 варианта, со слотами и без.
- Доступность: ОК для статики (иконка декоративна); фиксированный `h3` (EMP-3); `role=status` для динамического «ничего не найдено» — задача потребителя, не задокументировано.
- Тесты: unit — заголовок/описание, варианты, слоты, customClass, масштаб отступов (формула из SCSS при 150/75/100); integration — действия, условный body, замена иконки. Не покрыто: проп `icon`, уровень заголовка, computed-стиль в браузере.
- Storybook: 7 stories; docs-описания нет; play 7 — наличие; DarkTheme есть; длинного контента нет; детерминизм ОК; в stories `<BaseText size="xs">` — несуществующий проп; baseline `base-empty--size-scale` перегенерировать.
- Открытые проблемы: CORE-2, EMP-2, EMP-3.
### BaseBadge

- Назначение и зрелость: «пилюля»-метка с 5 вариантами и событием click (в терминах MUI — Chip). Зрелость: Требует доработки — цвет текста (BDG-1) и клавиатура (BDG-2).
- API: `label`, `variant` (5), `sizeScale`, `color` (`color.text` не работает — BDG-1), `customClass` (root/text). Emits: `click(MouseEvent)`. Slot `default` (заменяет label). Expose нет.
- Состояния: варианты; кликабельность только визуальная (hover-эффект у всех бейджей).
- Доступность: нет — кликабельный span без роли, tabindex и клавиатуры (BDG-2); текст наследует цвет контекста, в тёмной теме 1.41:1 (BDG-1).
- Тесты: unit — рендер, label/слот, варианты, `--size-scale`, click (формально: `expect(clickEvents).toBeTruthy()`, `spec:100`), customClass; integration — один клик. Не покрыто: клавиатура, цвет текста и тёмная тема (браузер).
- Storybook: 8 stories; docs-описания нет; play 8 — клик/наличие; keyboard нет; DarkTheme есть, baseline `base-badge--dark-theme` содержит чёрный текст на тёмных бейджах; `<BaseText size="xs|sm">` — несуществующий проп; `docs.source` у Variants перечисляет несуществующие варианты primary/secondary/success/warning/error/info (замечено при перепроверке).
- Открытые проблемы: BDG-1, BDG-2, CORE-1 (как вложенный).
### BaseChip

- Назначение и зрелость: счётчик-индикатор поверх обёрнутого контента (в терминах MUI — Badge); удаления нет, название инвертировано относительно BaseBadge. Зрелость: Требует доработки.
- API: `content` (number/string), `placement` (4 угла, по умолчанию top-right), `isHiddenOnZero` = false, `hasOverflow` = false, `maxValue` = 99, `variant` (5), `sizeScale`, `color` (протекает в обёрнутый контент — CHP-4), `customClass` (root/badge). Emits: `click-badge`. Slot `default` (обёрнутый контент). Expose нет.
- Состояния: виден/скрыт (пусто, ноль), переполнение `99+` (только с `hasOverflow`), 4 позиции, 5 вариантов.
- Доступность: нет — индикатор кликабельный span без роли, клавиатуры и текстовой альтернативы (CHP-1); контраст 3.76/2.77 (TOK-1/CHP-2).
- Тесты: unit — правила видимости, overflow/maxValue, позиции, варианты, масштаб, ветки `numericValue`; integration — `click-badge`. Не покрыто: клавиатура, текст для скринридера, утечка цвета (браузер).
- Storybook: 21 story (около 10 — под ветки покрытия); docs-описания нет; play 21 — наличие/клик; keyboard нет; InteractiveStates показывает несуществующее focus-состояние индикатора (`forced-states.scss:202-206`); DarkTheme и LongContent есть; детерминизм ОК.
- Открытые проблемы: CORE-1/CHP-4, TOK-1/CHP-2, CHP-1, CHP-3.
### BaseCard

- Назначение и зрелость: карточка с шапкой, телом и футером, вариантами, отступами, высотой и скроллом. Зрелость: Пригоден с оговорками — «интерактивность» только визуальная (CRD-1), обрезка тела при `height` (CRD-2).
- API: `title`, `subtitle`, `isHoverable` = false, `padding` = 24, `height` (string), `scroll` = false, `variant` (5), `sizeScale`, `color`, `customClass` (7 ключей). Emits нет. Slots: `default`, `header`, `footer`, `actions` со scope `{ sizeScale }`. Expose нет.
- Состояния: варианты, hoverable, scroll, неявный truncate при `height`, с шапкой/футером и без.
- Доступность: частично — hoverable не фокусируется и без роли (CRD-1); подзаголовок 2.73/4.04 (CRD-3); фиксированный `h3`; `<footer>` как landmark (CRD-5, гип.).
- Тесты: unit — шапка/заголовок/подзаголовок, варианты, hoverable, footer, customClass; integration — слоты. Не покрыто: padding-переменные, height/scroll/truncate, scope слотов, клавиатура hoverable, color.
- Storybook: 17 stories; docs-описания нет; play 17 — наличие/классы; keyboard нет; тёмной темы нет (единственный в группе); LongContent есть; детерминизм ОК; WithActions/WithFooter используют сырые `<button>` (у «⋮» имя только из `title`, в футере белый на accent).
- Открытые проблемы: CORE-1/CRD-4, CRD-1, CRD-2, CRD-3, CNS-1 (дубль дефолта отступа); гип. CRD-5.
### BaseSeparator

- Назначение и зрелость: горизонтальный/вертикальный разделитель с меткой или слотом, толщиной, пунктиром. Зрелость: Стабилен после SEP-1/2.
- API: `orientation` (horizontal/vertical, по умолчанию horizontal), `label`, `thickness` = 1, `isDashed` = false, `spacing` = 10, `sizeScale`, `color`, `customClass` (root/line/content); `variant` игнорируется. Emits нет. Slot `default`. Expose нет.
- Состояния: ориентации, пунктир, с контентом.
- Доступность (после исправлений): ОК — `role=separator` в обеих ориентациях с `aria-orientation`; метка/слот — имя через `aria-labelledby` (`useId`).
- Тесты: unit — роль и `aria-orientation` в обеих ориентациях, имя из label и слота, отсутствие `aria-labelledby` у простой линии, классы, CSS-переменные, масштаб, цвет. Не покрыто: a11y-дерево браузера, `thickness` NaN/≤0, `spacing` у простой линии.
- Storybook: 12 stories; docs-описания нет; play 12 — Default и Vertical проверяют роль и `aria-orientation`, VerticalWithLabel — имя «ИЛИ»; DarkTheme есть; детерминизм ОК.
- Открытые проблемы: SEP-3, CORE-7.
### BaseText

- Назначение и зрелость: типографический примитив (тег, начертание, nowrap, truncate/line-clamp, цвет, масштаб). Зрелость: Стабилен; оговорка TXT-1 — только при недоверенном `tag`.
- API: `tag` (p, span, div, h1–h6, label, small, strong, em; по умолчанию p; в рантайме не проверяется — TXT-1), `weight` = 400, `nowrap`, `truncate`, `maxLines` = 1, `sizeScale`, `color`, `customClass` (root); `variant` игнорируется. Emits нет. Slot `default`. Expose нет. `TEXT_TAGS` из `index.ts` не экспортируется.
- Состояния: обрезка в 1 и N строк, без переноса.
- Доступность: ОК — семантические теги, контраст по умолчанию 10.01/15.68.
- Тесты: unit — теги, масштаб, weight, nowrap, truncate/maxLines, customClass; integration в основном дублирует unit. Не покрыто: валидация `tag`, `color`, реактивность пропсов.
- Storybook: 12 stories; docs-описания нет; play 7; LongContent помечена `tags: ['!a11y']` (`stories:286`) без объяснения; CustomColors — цвета ниже AA (3.30, 3.16); DarkTheme есть; детерминизм ОК.
- Открытые проблемы: TXT-1, TXT-2, CORE-7.

## Формы
### BaseInput

- **Назначение и зрелость:** однострочное поле с маской, паролем (переключатель видимости, правила) и prefix/postfix. **Требует доработки:** движок маски (MSK-2, MSK-4, остаток MSK-1) и FRM-1.
- **API:**
  - Props: `modelValue: string | number | null` (обязателен), `type` (`text`/`email`/`tel`/`number`/`password`), `label`, `error`, `isDisabled`, `isReadonly`, `isRequired`, `mask`, `passwordRules`, `prefix`/`postfix`, `allowedChars` (не реализован, INP-2) + variant/sizeScale/color/customClass.
  - v-model: `modelValue` (эмит всегда строкой).
  - Emits: `update:modelValue`, `focus`, `blur`, `keydown`.
  - Slots: `prefix`, `postfix`, `suffix`.
  - Expose: `rootRef` (на самом деле input), `inputRef`, `focus`, `blur`, `validate`, `reset`. Тип Expose не экспортирован.
- **Состояния:** disabled; readonly (с маской больше не редактируется — INP-1); error (внешняя или «Обязательное поле» после blur); required — только звёздочка; пароль скрыт/показан. Loading нет.
- **Доступность — нет.** Label не связан (FRM-1), нет aria-invalid/describedby/required (FRM-2), фокус не виден в 5 из 7 вариантов (FRM-4), кнопка пароля вне Tab (INP-4), правила пароля только визуально (INP-5).
- **Тесты:**
  - Spec: рендер, классы, маска на полных значениях. Много формальных мест: `:617` `toBeDefined`, `:441-501` тестирует мок, `:510-606` не проверяют позицию каретки.
  - Integration: v-model, focus/blur, маска на счастливом пути + новые тесты: посимвольный ввод в `+7 (`, 4 теста readonly/disabled с маской.
  - Visual: 7 (Sizes и SizeScale снимают одну story); e2e нет.
  - Не покрыто: связь label и проброс атрибутов, aria-атрибуты, `rerender` (смена modelValue/mask после mount), ввод в середину, paste, выделение, Delete перед литералом, каретка, IME.
- **Storybook:**
  - 30 stories, docs-описания нет. play 27, ни скрипт, ни CI их не запускают.
  - Формальные play: `playShiftTab` без expect (Default, Empty); `toBeTruthy` в BackspaceAtStart; `typeof` в MaskDeleteShortAndNullValue; `length < 10` в WithMask/DeleteWithMaskAtToken — скрывает MSK-4(б).
  - Клавиатура: Tab/Shift+Tab, Backspace/Delete по маске. DarkTheme есть, недетерминизма нет.
  - Empty/LongContent замораживают модель (PIN-3); argType `allowedChars` описан как регэксп.
- **Открытые проблемы:**
  - P1: FRM-1, MSK-1 (частично), MSK-2, MSK-4;
  - P2: FRM-2, FRM-3, FRM-4, INP-2, INP-3, INP-4, INP-5, MSK-3, MSK-5, PIN-3;
  - P3: INP-6, INP-7;
  - гипотеза: MSK-6.
### BaseTextarea

- **Назначение и зрелость:** многострочное поле с autosize. **Пригоден с оговорками:** label не связан, autosize не уменьшает высоту.
- **API:**
  - Props: `modelValue=''`, `placeholder`, `rows=4`, `maxlength`, `label`, `error`, `isDisabled`, `isReadonly`, `isRequired`, `isAutosize`, `name` + variant/sizeScale/color/customClass.
  - v-model: `modelValue`. Emits: `update:modelValue`, `focus`, `blur` (`keydown` нет).
  - Slots: `default` объявлен, но не рендерится (TXA-2).
  - Expose: `rootRef` (textarea), `textareaRef`, `adjustHeight`, `focus`, `blur`, `validate`, `reset`. Тип не экспортирован.
- **Состояния:** disabled, readonly (без CSS-модификатора), error, required (визуально), autosize.
- **Доступность — частично.** Фокус виден; label и ошибка не связаны (FRM-1, FRM-2).
- **Тесты:**
  - Spec: рендер, атрибуты, классы, эмиты; autosize-тесты формальны (в jsdom `scrollHeight=0`, `vi.dynamicImportSettled` вместо flush).
  - Integration: v-model, фокус, disabled, error. Visual: 4.
  - Не покрыто: уменьшение высоты (браузер), связь label, включение `isAutosize` после mount.
- **Storybook:**
  - 22 stories, docs нет, play 7.
  - Default: после ввода нет expect. Interactive: `dispatchEvent` вместо userEvent. AutosizeHandleInput: `setTimeout(50)` — таймерная зависимость. WithCustomClass: `toBeTruthy`.
  - FocusState на принудительном классе. DarkTheme и LongContent есть; Empty/LongContent замораживают модель (PIN-3).
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: TXA-1, FRM-2, FRM-3, PIN-3;
  - P3: TXA-2;
  - гипотеза: TXA-1 (часть 2).
### BaseCheckbox

- **Назначение и зрелость:** одиночный булев чекбокс. **Пригоден с оговорками.**
- **API:**
  - Props: `modelValue=false`, `label`, `error=''`, `isDisabled` + variant/sizeScale/color/customClass.
  - v-model: `modelValue` (boolean). Emits: `update:modelValue`, `change`. Slots: `error`.
  - Expose: `rootRef` (div), `focus`/`blur` (через `querySelector('input')` — хрупко), `validate`, `reset`. Тип не экспортирован.
- **Состояния:** checked, disabled, error. Нет indeterminate, readonly, required, name/value (CHK-1).
- **Доступность — частично.** Нативный checkbox внутри `<label>` (имя есть при `label`), фокус виден, Space работает нативно. Без label контрол безымянный, а `aria-label` не передать (FRM-1); ошибка не связана (FRM-2).
- **Тесты:**
  - Spec: классы и пропсы. Integration: клик, клик по label, disabled. Visual: 7.
  - Не покрыто: Space (есть только в story), expose, смена modelValue извне и расхождение с DOM (FRM-3), слот `error`, доступное имя.
- **Storybook:**
  - 15 stories, docs нет, play 10. Default: Tab и Space ×2 с проверкой emit (содержательно).
  - WithoutLabel отключает axe-правило `label` и советует `aria-label` — совет не работает (FRM-1). WithCustomClass: `toBeTruthy`.
  - DarkTheme есть. LongContent замораживает модель: галочка расходится с checked (PIN-3, FRM-3).
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: FRM-2, FRM-3, PIN-3;
  - P3: CHK-1.
### BaseRadio

- **Назначение и зрелость:** группа радиокнопок по массиву `options`. **Пригоден с оговорками:** RAD-1 исправлен, но у группы нет семантики и видимого фокуса.
- **API:**
  - Props: `modelValue: string | number` (обязателен), `options: { value, label, isDisabled? }[]` (обязателен), `name` (обязателен), `label`, `isRequired`, `isVertical`, `error` + variant (default/ghost/outline/shadow/bordered)/sizeScale/color/customClass.
  - v-model: `modelValue`. Emits: `update:modelValue`, `change`.
  - Slots: `option({ option, isChecked })` — теперь заменяет только подпись; `default` объявлен, но не рендерится (TXA-2).
  - Expose: `rootRef`, `focus` (первая опция), `blur`, `validate`, `reset`. Тип не экспортирован.
- **Состояния:** disabled отдельной опции (у группы нет), error, required (звёздочка + `validate` на `''`), vertical.
- **Доступность — частично.** Нативные radio дают стрелки и один таб-стоп, со слотом `option` радио сохраняются. Нет роли и имени группы (RAD-2), фокус не виден (FRM-4), уникальность `name` — на потребителе (RAD-3).
- **Тесты:**
  - Spec: рендер, классы. Integration: клик, disabled-опция, Space + новый блок «слот option» (роль, имя и состояние, клик по подписи, ArrowDown). Visual: 8.
  - Не покрыто: стрелки без слота (только story), имя группы, expose/validate, смена modelValue извне.
- **Storybook:**
  - 24 stories, docs нет, нет controls для `options`/`modelValue`. play 9.
  - Default: Tab, ArrowDown, Shift+Tab. CustomSlot, CustomSlotClickHiddenInput и CustomSlotHiddenInputClick теперь проверяют роль radio, клик и стрелку.
  - SwitchSelection: описание скопировано из Accordion. WithCustomClass без `modelValue` (предупреждение об обязательном пропе).
  - FocusState на принудительном классе. DarkTheme есть. LongContent замораживает модель (PIN-3).
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: RAD-2, FRM-2, FRM-3, FRM-4, PIN-3;
  - P3: RAD-3, TXA-2.
### BaseSwitch

- **Назначение и зрелость:** булев переключатель. **Пригоден с оговорками:** роль исправлена, фокус не виден.
- **API:**
  - Props: `modelValue=false`, `label`, `error`, `isRequired`, `isDisabled`, `reverse` (нарушает конвенцию `is*`) + variant (default/outline/shadow)/sizeScale/color/customClass.
  - v-model: `modelValue`. Emits: `update:modelValue`, `change`. Slots: `default`, `label`, `error`.
  - Expose: `rootRef`, `focus`, `blur`, `validate`, `reset`. Тип не экспортирован.
- **Состояния:** on/off, disabled, error, required (декоративный — UFF-2/SWT-2), reverse.
- **Доступность — частично.** Есть `role="switch"` (SWT-1) с именем из label (`useId` + `label for`), Space работает. Фокус не виден (FRM-4), `*` входит в имя (FRM-2), без видимой подписи `aria-label` не передать (FRM-1).
- **Тесты:**
  - Spec: рендер, слоты, классы + новый блок «доступность» (роль switch, имя, checked). Integration: клик, Space, клик по label, disabled — теперь через `getByRole('switch')`. Visual: 8.
  - Не покрыто: видимый фокус (браузер), expose.
- **Storybook:**
  - 17 stories. Описания компонента нет, только `docs.source.code` у Variants и SizeScale. play 3: Default (Tab, Space ×2, Shift+Tab), LongContent (фокус), WithCustomClass.
  - FocusState: принудительный класс, плюс `v-model` и `:model-value="true"` одновременно. DarkTheme есть.
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: FRM-2, FRM-3, FRM-4;
  - P3: UFF-2/SWT-2.
### BasePin

- **Назначение и зрелость:** ввод PIN/OTP по ячейкам. **Требует доработки:** для OTP не годится, доступности нет (README-пример исправлен).
- **API:**
  - Props: `modelValue: string` (обязателен), `length=4`, `type` (`text`/`password`/`number`), `isDisabled`, `error` + variant/sizeScale/color/customClass.
  - v-model: пустые ячейки передаются пробелами, хвост обрезается `trimEnd`. Emits: `update:modelValue`, `complete`.
  - Slots: `default` объявлен, но не рендерится (TXA-2).
  - Expose: `rootRef`, `focus` (первая ячейка), `blur`, `validate` (всегда true без `error`), `reset`. Тип не экспортирован.
- **Состояния:** disabled, error, password. Нет readonly, required, loading.
- **Доступность — нет.** Ячейки без имён, нет `role="group"` и имени, нет `one-time-code`/`inputmode`, ошибка не связана (PIN-1, PIN-2, FRM-1, FRM-2). Клавиатура: ←/→, Backspace назад, автопереход; Home/End нет.
- **Тесты:**
  - Spec: рендер, пропсы, `maxlength=1`. Integration: ввод, Backspace, стрелки, paste. Visual: 3.
  - Формальные места: «complete…» не проверяет обработчик; название «не должен удалять…» противоречит проверке; «disabled не эмитит» — без ввода; закреплено поведение «paste пустого буфера очищает код».
  - Не покрыто: автопереход и возврат фокуса, `autocomplete`/`inputmode`, фильтр символов, многосимвольный input, перезапись ячейки, доступные имена.
- **Storybook:** 18 stories, docs нет. play 17, но v-model заморожен в большинстве stories (PIN-3): в Default `complete` не приходит. Тёмной темы нет.
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: PIN-1, PIN-2, PIN-3, FRM-2, FRM-3;
  - P3: PIN-4, TXA-2;
  - гипотеза: PIN-4 (часть).
### BaseFormField

- **Назначение и зрелость:** обёртка «заголовок + контент + описание/ошибка». **Пригоден с оговорками — только как визуальная обёртка:** связать её семантически с контролами кита невозможно (FRM-1, FFD-2).
- **API:**
  - BaseFormField props: `label`, `description`, `error`, `isRequired` (после FFD-1 — только звёздочка), `for`, variant/sizeScale/color/customClass. Slots: `default`. Emits нет.
  - BaseFormField expose: `rootRef`, `validate` (равен `!error`), `reset`. Тип `FormFieldValidateExpose` есть в useFormField, но из index.ts компонента не экспортирован.
  - FormFieldLabel: `label`, `tag='label'`, `isRequired`, `className`/`customClass`, `requiredClassName`/`requiredCustomClass`, `sizeScale`. Пропа `for` нет.
  - FormFieldError: `error` (обязателен), `className`, `customClass`, `sizeScale`.
- **Состояния:** label, description (скрывается при ошибке), error, required.
- **Доступность — частично.** `<label :for>` работает только с «голым» нативным input с id. Описание и ошибка без id, у ошибки нет live-региона (FRM-2, FFD-2). `*` попадает в имя.
- **Тесты:**
  - Spec: рендер, классы; тест `for` проверяет строку атрибута, а не связь. Новые тесты: `validate()`/`reset()` (FFD-1).
  - Integration: один тест. Visual: 5. У FormFieldLabel/FormFieldError своих тестов нет.
  - Не покрыто: реальная связь label↔контрол, анимация ошибки.
- **Storybook:**
  - 11 stories, docs нет, в argTypes нет `for`. play 2; Interactive вводит текст в `<BaseInput model-value="">` — значение держится только в DOM.
  - Связь for/id не показывает ни одна story. `<BaseInput … error />` (:143) даёт `''`, и поле не переходит в состояние ошибки. LongContent помечен `!a11y` без объяснения. DarkTheme есть.
- **Открытые проблемы:**
  - P1: FRM-1;
  - P2: FFD-2, FRM-2;
  - P3: FFD-3.
### BaseForm

- **Назначение и зрелость:** обёртка над `<form>` с состояниями loading/disabled. **Пригоден с оговорками.**
- **API:**
  - Props: `isLoading`, `isDisabled` + variant/sizeScale/color/customClass (root/overlay/content).
  - Emits: `submit(e)` — только если `!isLoading && !isDisabled`; нативная отправка всегда отменяется `@submit.prevent`.
  - Slots: `default`. Expose нет.
- **Состояния:** loading (оверлей, `aria-busy`, поля disabled), disabled (класс, поля disabled, submit заблокирован). После разблокировки фокус возвращается на прежнее поле.
- **Доступность — частично.** Нативная форма, Enter отправляет её. При блокировке отключаются нативные поля, но кастомные виджеты кита остаются активными с клавиатуры (FORM-1). Статус «Загрузка» всегда в DOM (FORM-2).
- **Тесты:**
  - Spec: классы. Integration: submit по клику, блокировка submit + новый блок «блокировка полей» (5 тестов: клавиатура, `aria-busy`, возврат и неперехват фокуса). По отчёту исправлений BaseForm.vue покрыт на 100%.
  - e2e: тест 1 заканчивается `expect(true).toBeTruthy()`; тест 3 проверяет `disabled` кнопки, выставленный в story вручную. Visual: 4.
  - Не покрыто: `defaultPrevented`, отправка по Enter из поля, доступность оверлея, кастомные контролы кита в заблокированной форме, раскладка fieldset с `display: contents` (только visual).
- **Storybook:** 17 stories, docs нет. play 4; в SubmitWhile* проверка `waitFor(() => expect(…).not.toHaveBeenCalled())` проходит мгновенно. Валидация в stories ручная. DarkTheme есть.
- **Открытые проблемы:**
  - P2: FORM-1 (частично), FORM-2, FORM-3;
  - P3: FORM-4.

## Выбор значений
### BaseSelect

- **Назначение и зрелость:** выпадающий выбор одного или нескольких значений с поиском, тегами и слотами. Мышью и поиском (после SEL-1) пользоваться можно, клавиатуры и ARIA нет. Оценка: **Требует доработки.**
- **API:**
  - Props: `modelValue: string|number|(string|number)[] = ''`, `options` (обязателен; `{value, label, icon?, description?, isDisabled?}`), `isMultiple`, `isSearchable`, `isDisabled`, `isRequired`, `label`, `placeholder`, `error`, `variant` (6), `customClass` (25 ключей).
  - v-model: `modelValue`. Emits: `update:modelValue`, `change`.
  - Slots: `trigger`, `tag{labels, items, remove}`, `selected`, `header`, `option{option, isSelected}`, `empty`, `footer`; `default` объявлен, но не рендерится.
  - Expose: `rootRef` (указывает на триггер), `selectRef`, `focus`, `blur`, `validate`, `reset`. Тип Expose не экспортирован.
- **Состояния:** disabled (tabindex -1, без `aria-disabled`), error, required, пустой список, disabled-опции. Loading и readonly нет.
- **Доступность:** нет. Нет combobox/listbox, выбрать значение с клавиатуры нельзя, label и ошибка не связаны с триггером; видимый фокус есть. Открытые: SEL-2, SEL-4, SEL-5.
- **Тесты:**
  - Unit (29) — в основном классы и наличие элементов.
  - Integration (6): открытие, эмит, disabled, multiple и новый реальный тест поиска с user-event (+ 2 теста BaseSelect в `BaseDropdown.integration`: поиск и возврат фокуса на триггер после выбора).
  - E2e: выбор, Escape, disabled. Visual: 5 снимков.
  - Не покрыто: клавиатура, удаление тега и снятие выбора, `validate()` при required+multiple, изменение props после mount. `useSelect.spec` нет.
- **Storybook:**
  - 35 stories, play в 20; docs-описания компонента нет; events, slots и expose не описаны.
  - Play часто формальны: `if (trigger)` молча проходит без элемента, `input.value=` пишет в обход фокуса, шаг Shift+Tab без expect, Vue-узлы `.base-dropdown__panel` удаляются вручную. `SearchWithQuery` исправлен.
  - Клавиатура — только Tab/Enter. DarkTheme есть, но панель светлая (PCK-3). Недетерминизма нет; BOM и mojibake (PCK-1).
- **Открытые проблемы:**
  - группы: SEL-2 (P1); SEL-3, SEL-4, SEL-5; SEL-6…SEL-8; PCK-1…PCK-3;
  - межгрупповые: CO-1 (overlays, P1 — внутри BasePopover выбор теряется), DRP-2 (частично: при закрытии фокус возвращается на триггер; нет ARIA-связки и перевода фокуса в панель), DP-1/OVL-1.
### BaseSearch

- **Назначение и зрелость:** поиск с подсказками в режимах default, modal и sidebar; debounce/instant, `maxResults`, слоты результатов. После SRCH-1 и SRCH-2 мышь и стрелки работают корректно. Но ARIA нет, modal не является диалогом, после выбора подсказки больше не открываются. Оценка: **Требует доработки.**
- **API:**
  - Props: `modelValue=''`, `results: SearchResult[]` (`{id, title, description?, icon?, image?, category?}`), `mode`, `isRemote=false` (новый), `isInstant=true`, `debounceMs=300`, `isLoading`, `maxResults=10`, `hasClear`/`hasIcon`/`isAutofocus`, `isDisabled`, `error`, `variant` (7), `customClass` (31 ключ).
  - v-model: `modelValue`. Emits: `update:modelValue`, `search(query)`, `select(result)`, `clear`.
  - Slots: `result`, `results`, `result-before`, `result-after`, `empty`, `loading`.
  - Expose: `rootRef` (в modal/sidebar `null`), `focus`, `blur` (не работает, SRCH-7), `validate`, `reset`. Типы Expose, в том числе `BaseSearchInputExpose` и `BaseSearchOverlayExpose`, не экспортированы.
- **Состояния:** loading (спиннер `role=status`), disabled, error, empty, clear. Readonly нет.
- **Доступность:** нет. Нет combobox/listbox/activedescendant, кнопки без имён, модалка открывается по фокусу, не является диалогом и не управляет фокусом. Открытые: SRCH-4, SRCH-5, SRCH-8.
- **Тесты:**
  - `BaseSearch.spec` (101): debounce, отмена при unmount, ArrowDown+Enter, Escape в modal/sidebar, `isInstant=false`, синхронизация modelValue; новые — сброс подсветки (5) и `isRemote` (2).
  - Почти всё идёт на стабах BaseDropdown/BaseInput/… и моках useClickOutside/useEscapeKey/useScrollLock, поэтому реальные связки (readonly, blur, scroll lock) не проверяются. Есть формальные `not.toThrow()`.
  - Integration — 2 теста; e2e нет; `useSearchState.spec` нет (`useListNavigation.spec`, 15 тестов, есть).
  - Не покрыто: SRCH-3, SRCH-6 (скрыто моком), фокус и роли, гонки ответов.
- **Storybook:**
  - 57 stories (+`RemoteResults`), play в 42; docs-описания нет; argTypes без modelValue, results и color.
  - Клавиатура: Enter/ArrowDown/Escape (Interactive, *Escape). DarkTheme — только default-режим, панель светлая.
  - Недетерминизм: 6 картинок picsum.photos (они же в visual `with-image-results`), sleep 400 мс.
  - Формальные play: BlurHandling ищет несуществующий `.base-dropdown__content`; Hover/Active/FocusState пустые (PCK-2). Mojibake (PCK-1).
- **Открытые проблемы:** SRCH-2 (P1, частично — гонки); SRCH-3, SRCH-4, SRCH-5, SRCH-6; SRCH-7…SRCH-10; PCK-1…PCK-3.
### BaseColorPicker

- **Назначение и зрелость:** поповер с SV-областью, слайдером тона (нативный range), HEX-полем, пресетами и сбросом. После CP-1 значения точные, но ввод не валидируется, а SV-область недоступна с клавиатуры. Оценка: **Пригоден с оговорками.**
- **API:**
  - Props: `modelValue: string` (обязателен), `position='bottom'`, `presets` (12 по умолчанию), `isHexHidden`, `isPresetsHidden`, `isResettable`, `resetLabel`, `hasTransparentSwatch`, `isDisabled`, `customClass` (root, swatch, panel, preset, reset). `variant` и `color` игнорируются.
  - v-model: `modelValue`. Emits: `update:modelValue`, `change` (непрерывно, CP-6), `reset`. Slot: `trigger`.
  - Expose: `rootRef` (swatch), `focus`, `blur`, `validate`, `reset`. Тип Expose не экспортирован.
- **Состояния:** disabled; невалидное modelValue (подставляется внутренний цвет); resettable; прозрачный swatch. Error, readonly и состояния «нет цвета» нет (CP-5).
- **Доступность:** частично.
  - Swatch — `button` с именем, но без `aria-expanded`/`aria-haspopup`; тон — нативный range с именем.
  - SV-область `role=slider` без tabindex, клавиатуры и `aria-valuenow` (`aria-valuetext` есть).
  - Фокус в панель не переводится и не возвращается; у HEX-поля `outline:none`.
  - Открытые: CP-4, CP-2.
- **Тесты:**
  - `BaseColorPicker.spec` (34), integration (3), visual (3), `useColorPicker.spec` (18), `colorUtils.spec` (31). Новые тесты проверяют точный HEX для всех 12 пресетов, ввода и внешнего значения.
  - Формальные места: integration `not.toBe('#ff0000')`; тест снятия pointer-листенеров проходит и без onBeforeUnmount; `getBoundingClientRect` подменяется глобально без восстановления; «±1 на канал» в `colorUtils.spec`.
  - Не покрыто: откат невалидного HEX, повторный pointerdown (CP-3), клавиатура, сброс и `''`/`null`.
- **Storybook:**
  - 12 stories, play во всех; docs-описания нет; argTypes без isResettable, resetLabel, hasTransparentSwatch.
  - `PickPreset` исправлен; PickArea, DarkTheme, WithCustomClass — smoke-проверки.
  - Клавиатурных stories нет. DarkTheme есть, панель светлая (PCK-3). Недетерминизма нет.
- **Открытые проблемы:** CP-2, CP-3, CP-4; CP-5, CP-6, CP-7; PCK-3; межгрупповые CO-1, OVL-1.
### BaseRange

- **Назначение и зрелость:** слайдер значения: один ползунок, диапазон (`rangeValue`) или N точек (`points`); вертикальный режим, метки, тултип, подпись, слот ползунка. Самый зрелый компонент группы; после RNG-1 и RNG-2 контракт `change` и точность шага корректны. Оценка: **Пригоден с оговорками.**
- **API:**
  - Props: `modelValue=0`, `rangeValue?: [n,n]`, `points?: n[]` (приоритет points > rangeValue > single), `min=0`, `max=100`, `step=1`, `isDisabled`, `isVertical`, `hasTooltip`, `hasLabel`, `marks: RangeMark[]`, `variant` (5), `customClass` (16 ключей).
  - v-model: `modelValue`, `rangeValue`, `points`. Emits: `update:*` (три), `change(number | [n,n] | n[])` — теперь и при управлении с клавиатуры.
  - Slots: `thumb{value, index}`; `default` объявлен, но не рендерится.
  - Expose: `rootRef`, `focus`/`blur` (первый ползунок), `validate`, `reset`. Тип Expose не экспортирован.
- **Состояния:** disabled (класс, обработчики выключены), vertical, label, tooltip, marks. Error, readonly и loading нет.
- **Доступность:** частично.
  - Есть: `role=slider`, `tabindex=0`, `aria-valuenow/min/max` с границами от соседей, стрелки + `change`.
  - Нет: Home/End/PageUp/PageDown, `aria-valuetext`, имени, `aria-orientation`, `aria-disabled` (disabled остаётся в Tab-порядке).
  - Тултип только по наведению мыши; при клике фокус на ползунок не ставится.
  - Открытые: RNG-3, RNG-6.
- **Тесты:**
  - `BaseRange.spec` (39): рендер, aria, классы, marks, слот, expose.
  - Integration (42): трек, drag мышью и тачем, стрелки, step, vertical, disabled, ограничения range/points; новые — `change` с клавиатуры (3 теста + 1 страховочный) и точность шага (2).
  - `rangeUtils.spec` (18). `useRangeDrag.spec` и `useRangeValues.spec` нет; e2e нет; visual — 3 stories.
  - Не покрыто: touchcancel, unmount посреди drag, внешнее изменение значения во время drag, min>max, step 0, NaN.
- **Storybook:**
  - 38 stories, play в 29 (в основном реальные проверки `aria-valuenow`); docs-описания нет; argTypes полные, кроме color.
  - Клавиатура: KeyboardSingle, KeyboardRange, MultiPointKeyboard, KeyboardOtherKey, DisabledKeyboard, StepDiscrete; Home/End нет.
  - DarkTheme есть. `Default` без expect; Hover/Active/FocusState пустые (PCK-2); stories служат харнессом покрытия (шапка «100% coverage»).
  - Недетерминизма нет; BOM (PCK-1).
- **Открытые проблемы:** RNG-3, RNG-4; RNG-5, RNG-6; гипотеза RNG-7; PCK-1…PCK-3; межгрупповые TT-1 (тултип), OVL-1.
### BaseSlider

- **Назначение и зрелость:** карусель изображений и видео (не слайдер значения): анимации slide/fade/scale/flip, стрелки с удержанием, точки или миниатюры, autoplay, perView/perGroup, свайп, зум. Функционально богата, семантики APG Carousel нет. Оценка: **Требует доработки.**
- **API:**
  - Props: `items: SliderItem[]` (обязателен; `{src, type?, poster?, alt?, title?, description?}`), `animation='slide'`, `navigation='dots'`, `isAutoplay`, `autoplayInterval=4000`, `hasArrows`, `isLoop=true`, `isVertical`, `initialIndex` (отслеживается watch), `slidesPerView`/`slidesPerGroup`/`spaceBetween`, `isZoomable` (заработал только после IMG-3), `customClass` (14 ключей). `variant` и `color` игнорируются.
  - v-model нет. Emits: `change(index)`, `next`, `prev`.
  - Slots: `default{item, index}`, `caption`, `header`, `footer`. Expose нет (SLD-9).
- **Состояния:** loop/no-loop (disabled-стрелки); dragging; autoplay (пауза при наведении и фокусе, выключен при reduced motion). Пустой список обрабатывается некорректно (SLD-8). Loading и error нет.
- **Доступность:** нет.
  - Отсутствуют: region/roledescription и «N из M», имена стрелок и точек, `aria-current`, `inert` у скрытых слайдов, live-регион, кнопка Pause.
  - Есть только пауза autoplay по фокусу. Анимации переходов не учитывают reduced motion.
  - Открытые: SLD-1 (частично), SLD-5.
- **Тесты:**
  - `BaseSlider.spec` (46): рендер, классы, disabled-стрелки, слоты, эмиты, initialIndex; новые — «пауза автопрокрутки» (6).
  - `useSlider.spec` (66, из них 6 новых) и `useSwipe.spec` (53, из них 6 новых — «onClickCapture», SLD-11): навигация, loop, autoplay, perView/group, touch/mouse, rAF, очистка слушателей, гашение click после drag — содержательно.
  - Формальные: integration (2) проверяет лишь наличие какого-нибудь активного слайда; из 4 e2e два ничего не доказывают; visual — 3 stories. Зум по клику и его отсутствие после drag мышью проверяются в `BaseImage.integration`.
  - Не покрыто: удержание стрелок (SLD-2), тап (SLD-3), pointer-events в fade (SLD-4), пустой `items`, a11y.
- **Storybook:**
  - 45 stories, play в 43; docs-описания нет; argTypes полные.
  - Play в основном формальны: подписи всех слайдов всегда в DOM; «Удержание» проверяет только `activeSlide !== null`; Default оставляет незавершённый touch-drag; «Empty» содержит слайд.
  - Клавиатура — только Tab/Shift+Tab. DarkTheme есть.
  - Недетерминизм: placehold.co и видео w3schools.com (используются и в visual/e2e), `Date.now()+Math.random()` в Touch identifier (stories:26), sleep 100/350/1200 мс; BOM.
- **Открытые проблемы:** SLD-1 (P1, частично); гипотеза SLD-3 (P1); SLD-2, SLD-4, SLD-5, SLD-6; SLD-7, SLD-8, SLD-9 (частично — README исправлен), SLD-10; PCK-1, PCK-4.
### BaseRating

- **Назначение и зрелость:** звёздный рейтинг с дробной заливкой, шагом, плавным предпросмотром, readonly/disabled и кастомными иконками. После RAT-1 клик идёт по `step`. Оценка: **Пригоден с оговорками.**
- **API:**
  - Props: `modelValue=0`, `max=5`, `step=1`, `isHoverSmooth=true` (теперь влияет только на предпросмотр), `icon='star'`, `iconFilled?`, `isReadonly`, `isDisabled`, `variant` (5), `customClass` (root, icon, iconFilled).
  - v-model: `modelValue`. Emits: `update:modelValue`, `change`.
  - Slot `default` объявлен, но не рендерится.
  - Expose: `rootRef`, `focus`, `blur`, `validate`, `reset`. Тип Expose не экспортирован.
- **Состояния:** readonly и disabled (визуально одинаковы), дробные значения, hover-предпросмотр.
- **Доступность:** частично.
  - Есть: `role=slider` с именем «Оценка от 0 до N», `aria-valuemin/max/now`, tabindex, стрелки, видимый фокус.
  - Нет: Home/End, `aria-valuetext`, `aria-disabled`; readonly остаётся слайдером с `tabindex=-1`.
  - Открытые: RAT-2.
- **Тесты:**
  - spec (53), integration (4), utils.spec (17), `ratingUtils.spec` (33), visual (9).
  - Проверяют: заливку, клик по step (2 новых теста и 3 исправленных ожидания), клавиатуру, hover, readonly/disabled, aria.
  - Не покрыто: `step ≤ 0`, семантика readonly. `BaseRating.utils.spec` частично дублирует `ratingUtils.spec`.
- **Storybook:**
  - 13 stories, play во всех, с реальными проверками; docs-описания нет; argTypes без icon и iconFilled.
  - Клавиатура — Interactive (стрелки). DarkTheme есть. Play `Default` теперь требует целое значение. Недетерминизма нет.
- **Открытые проблемы:** RAT-2; RAT-3.

---

## Оверлеи
### BaseModal

- **Назначение и зрелость:** модальное окно — шапка с title и «×», тело, футер; режимы fullScreen ×3, `isContained`, без затемнения. **Пригоден с оговорками**: прокрутка длинного контента, семантика диалога и фокус исправлены, но без title нет ни кнопки закрытия, ни имени; атрибуты теряются; Escape не отключается.
- **API:**
  - props: `isOpen` (обязательный), `title`, `closeOnOverlay=true`, `fullScreen: 'width'|'height'|'both'`, `isContained=false`, `hasOverlay=true`, `variant: default|ghost|shadow`, `sizeScale=100`, `color`, `customClass` (8 ключей);
  - v-model: `v-model:is-open`;
  - emits: `update:isOpen`, `close`, `confirm` (не эмитится, MOD-4);
  - slots: `default`, `footer` (слота `header` нет);
  - expose нет.
- **Состояния:** open/closed; contained (немодальный); fullScreen ×3; без оверлея (остаётся модальным); `closeOnOverlay=false`. Нет loading и «незакрываемого» режима (MOD-5).
- **Доступность — частично.** Есть `role=dialog`; `aria-modal`, кроме `isContained`; имя из title; фокус переходит внутрь, Tab ходит по кругу, фокус возвращается; «Закрыть» с именем. Без title — нет имени и кнопки закрытия. Открытые: MOD-A11Y (частично), MOD-2, OVL-3, MOD-5, ESC-STACK; FT-1 и FT-2 (гипотезы).
- **Тесты:**
  - integration 13, с реальными usePopup, useEscapeKey и useScrollLock: закрытие, оверлей, contained, общий счётчик со Slideover и зумом, роль и имя диалога, фокус (вход, цикл, возврат), `hasOverlay=false`, `isContained`;
  - spec 36 — рендер и классы, usePopup замокан; формальные места `:236-240`, `:274-283`;
  - e2e 4: закрытие тремя способами и длинный контент (новый тест проходит в Chromium, REPORT.md §5.2);
  - visual 2 — только закрытый триггер.
  - Не покрыто: окно без title, `$attrs`, вложенные Escape и клик вне, SSR, длинный контент в contained, reduced motion.
- **Storybook:**
  - 26 stories, 14 из них `!autodocs`; docs-описания нет;
  - play 19. Осмысленные: Default, Interactive, EscapeClose (Tab, Enter, Escape), OverlayClick*, ContentClickNoClose, HeaderCloseClick, LongContent (теперь проверяет прокрутку и футер в пределах экрана). Формальные: FullScreen*, WithCustomColor;
  - нет story на ловушку и возврат фокуса;
  - DarkTheme — декоратор на поддереве, модалка остаётся светлой (OVL-1);
  - недетерминизма и внешних URL нет.
- **Открытые проблемы:** MOD-1 (частично), OVL-1, OVL-2, OVL-3, OVL-4, OVL-6, MOD-A11Y (частично), MOD-2, ESC-STACK, OVL-5, MOD-4, MOD-5; гипотезы MOD-3, FT-1, FT-2.
### BaseSlideover

- **Назначение и зрелость:** выезжающая панель слева или справа (ширина, полная ширина, `isContained`, `container`); прокрутка тела сделана правильно. **Пригоден с оговорками.**
- **API:**
  - props: `isOpen` (обязательный), `title`, `side='right'`, `width=100` (масштаб от 420px), `isFullWidth=false`, `closeOnOverlay=true`, `closeOnEscape=true`, `isContained=false`, `container?: string|HTMLElement`, `hasOverlay=true`, `padding=24`, `customClass` (6 ключей);
  - `variant`, `sizeScale`, `color` объявлены, но игнорируются (SLD-4);
  - v-model: `v-model:is-open`;
  - emits: `update:isOpen`, `close`;
  - slots: `default`, `header`, `footer`;
  - expose нет.
- **Состояния:** open/closed; две стороны; ширина; полная ширина; contained и container (немодальные); без оверлея (модальный); запрет Escape и клика по оверлею.
- **Доступность — частично.** Есть `role=dialog`; `aria-modal`, кроме contained/container; имя из title (со слотом header имени нет); фокус переходит внутрь, ходит по кругу и возвращается; «Закрыть» с именем. Открытые: SLD-1 (частично), SLD-2, OVL-3, ESC-STACK; FT-1 и FT-2.
- **Тесты:**
  - integration 18: закрытие по роли и имени, оверлей, Escape, реальные composables, 5 тестов семантики и фокуса;
  - spec 31 — классы, ширина, padding, `container` как HTMLElement; usePopup замокан;
  - e2e нет;
  - visual 4 — спек исправлен, эталоны устарели (OVL-6а).
  - Не покрыто: `container` селектором (SLD-3), прокрутка длинного контента в браузере, тема, SSR.
- **Storybook:**
  - 24 stories, 16 из них `!autodocs`; docs-описания нет;
  - play 18, в основном проверяют классы и стили. OverlayClickCloses проверяет, что панель осталась на месте (v-model нет); EscapeCloses и CloseButtonClick без проверок; Tab и Shift+Tab без проверки фокуса;
  - нет тёмной темы и примера с `container`;
  - LongContent есть, но прокрутку не проверяет;
  - недетерминизма нет.
- **Открытые проблемы:** OVL-1, OVL-2, OVL-3, OVL-4, OVL-6, SLD-1 (частично), SLD-2, ESC-STACK, OVL-5, SLD-4, SLD-5; гипотезы SLD-3, FT-1, FT-2.
### BaseDropdown

- **Назначение и зрелость:** базовый контролируемый выпадающий контейнер — 12 позиций, телепорт в body, Escape, клик вне. На нём построены BasePopover, BaseSelect, BaseSearch и BaseTableToolbar. **Требует доработки**: нет ARIA и клавиатуры, вложенные слои закрывают родителя, нет flip.
- **API:**
  - props: `isOpen=false`, `position='bottom-start'`, `gap=4`, `maxHeight='320px'`, `matchWidth=false` (задаёт width, DP-4), `closeOnEscape` (фактически true), `preventMousedown` (фактически true), `panelClass`, `padding=8`, `variant`, `sizeScale`, `color`, `customClass` (root, panel);
  - v-model: `v-model:is-open` (компонент сам не открывается);
  - emits: `update:isOpen`, `close`;
  - slots: `default` (триггер), `dropdown`;
  - expose: `updatePosition`; тип `BaseDropdownExpose` не экспортирован (DRP-5).
- **Состояния:** open/closed, пустой, длинный (прокрутка по maxHeight). Disabled нет.
- **Доступность — нет.** Нет связки триггер↔панель и role; фокус не переводится в панель, но при закрытии возвращается из панели на триггер (DRP-2, частично). Поля ввода в панели теперь фокусируемы, кнопки и ссылки — нет. Открытые: DRP-2 (частично), DRP-1 (частично), DRP-6, CO-1.
- **Тесты:**
  - integration 10: реальный Escape, preventDefault на mousedown, 3 теста на фокус полей ввода и поиск BaseSelect, 3 — на возврат фокуса при закрытии (DRP-2); useClickOutside и useDropdownPosition замоканы;
  - spec 34 — всё замокано; тесты позиций проверяют лишь наличие панели; возврат фокуса на триггер закреплён как ожидаемое поведение;
  - e2e 4 (только мышью);
  - visual — закрытый триггер.
  - Не покрыто: вложенные оверлеи (CO-1), клавиатура и ARIA, край экрана (DP-1), скроллбар (DP-2), SSR.
- **Storybook:**
  - 13 stories; docs-описания нет, только `docs.source.code` у 4;
  - argTypes без `isOpen`, `matchWidth`, `closeOnEscape`, `preventMousedown`, `panelClass`;
  - play 9. Default (Tab, Enter, Escape) осмысленный; PreventMousedown и NoPreventMousedown проверяют `defaultPrevented`; Empty, LongContent, NoCloseOnEscape формальные; WatchIsOpenAndFocusin не проверяет, куда ушёл фокус;
  - паузы `setTimeout` 200/100/100 мс; пункты меню — `div @click`;
  - 2 stories открыты при монтировании и висят поверх autodocs; тёмной темы нет.
- **Открытые проблемы:** CO-1, DRP-1 (частично), OVL-1, OVL-2, OVL-4 (useDropdownPosition), OVL-6, DRP-2 (частично), DP-1, ESC-STACK, OVL-5, DRP-5, DRP-6, DP-2, DP-3, DP-4, ESC-1, CO-2.
### BasePopover

- **Назначение и зрелость:** поповер со стрелкой поверх BaseDropdown (`preventMousedown=false`, `gap=10`), работает и как контролируемый, и как неконтролируемый. **Требует доработки**: вложенный селект закрывает поповер (P1), нет ARIA, зона триггера — вся строка.
- **API:**
  - props: `isOpen=false`, `position: top|bottom|left|right = 'bottom'`, `variant` (5 значений), `sizeScale=100`, `color`, `customClass` (root, trigger, arrow, inner, panel);
  - v-model: `v-model:is-open` (локальное состояние и watch);
  - emits: `update:isOpen`, `close` (не приходит при закрытии повторным кликом, POPV-5);
  - slots: `trigger`, `default`;
  - expose нет.
- **Состояния:** open/closed. Disabled нет: story Disabled просто кладёт disabled-кнопку в слот.
- **Доступность — нет.** У обёртки триггера нет роли, `aria-expanded` и клавиатуры; у панели нет role и имени; фокус не переводится (возврат при закрытии — через BaseDropdown, DRP-2 частично). Открытые: POPV-3, DRP-2 (частично).
- **Тесты:**
  - spec 25: классы вариантов и стрелки, CSS-переменные, эмиты, закрытие по mousedown на body, синхронизация пропа — для рендера содержательно;
  - integration 2 — эмит по клику;
  - e2e нет; visual — только триггер.
  - Не покрыто: вложенный BaseSelect (CO-1), фокус и Tab, положение в блочной вёрстке (POPV-1), тёмная тема (POPV-2).
- **Storybook:**
  - 18 stories; docs-описания нет;
  - play 4: Default (Tab, Enter, Escape); CloseViaDropdown и HandleClose (эмиты и паузы 100 мс); WithCustomClass;
  - 10 stories открыты при монтировании и попадают в autodocs — около 10 панелей поверх docs-страницы;
  - триггеры центрированы flex-контейнером, поэтому POPV-1 не виден;
  - DarkTheme на поддереве (OVL-1).
- **Открытые проблемы:** CO-1 (POPV-4), OVL-1, OVL-2, OVL-6, POPV-1, POPV-2, POPV-3, DRP-2 (частично), ESC-STACK, POPV-5, OVL-5.
### BaseTooltip

- **Назначение и зрелость:** текстовая подсказка по наведению — задержки 100/150 мс, телепорт в body, слежение за позицией через rAF, режим «всегда видна». **Требует доработки**: недоступна с клавиатуры, пропсы оформления не действуют, тесты ложные.
- **API:**
  - props: `text` (обязательный), `position: top|bottom|left|right = 'top'`, `isAlwaysVisible=false`, `variant` (5 значений), `sizeScale=100`, `color`, `customClass` (root, tooltip, text);
  - emits нет; slot `default` (триггер); expose нет;
  - задержки не настраиваются, программных show/hide нет.
- **Состояния:** наведение, «всегда видна», переключение этого режима. Пустой `text` рисует пустой пузырь.
- **Доступность — нет.** Нет показа по фокусу, Escape, `role=tooltip`, `aria-describedby`; на сам тултип нельзя навести. Открытые: TT-1.
- **Тесты:**
  - integration 2 — hover и unhover с реальным телепортом (хорошо);
  - spec 18 — Teleport застаблен; тесты variant/sizeScale/color ложноположительные; наведение не тестируется;
  - e2e нет, хотя `istanbul ignore` ссылается на e2e;
  - visual — триггер и обрезанный always-visible.
  - Не покрыто: фокус, Escape, ARIA; таймеры и их очистка (fake timers); край экрана.
- **Storybook:**
  - 17 stories; docs-описания нет;
  - play 17, «для coverage». 14 из них ищут класс обёртки, которая есть всегда: проверки «появился» всегда истинны, 4 проверки «исчез» упадут при запуске; TooltipPlacementFlip ждёт несуществующие классы;
  - TooltipKeyboardEsc закрепляет, что Escape не закрывает тултип (противоречит WCAG 1.4.13); Tab идёт по нефокусируемому `span`;
  - Variants, SizeScale и CustomColor выглядят как Default;
  - тёмной темы нет; пауза `setTimeout(200)`.
- **Открытые проблемы:** TT-1, TT-2, OVL-1, OVL-2, OVL-6, TT-3/TU-1, TT-4, OVL-5.
### BaseNotification

- **Назначение и зрелость:** стек тостов — типы, 6 позиций, автозакрытие с прогресс-баром. Два режима: декларативный (props при монтировании) и программный (`ref.add/remove`). **Пригоден с оговорками**: озвучивание и имя кнопки исправлены, `duration: 0` больше не удаляет уведомление сразу. Нет паузы, «постоянного» режима и реактивности декларативного режима.
- **API:**
  - props: `title=''`, `description`, `type: success|error|warning|info = 'info'`, `position` (6 значений, `'top-right'`), `duration=3000` (0, NaN, отрицательные и Infinity → 3000), `isContained=false`, `notificationKey` (не реализован, NTF-4), `variant`, `sizeScale`, `color`, `customClass` (8 ключей);
  - emits: `close` (когда список опустел);
  - slot `default` объявлен, но не рендерится (NTF-6);
  - expose: `add(props)`, `remove(id)`; тип `BaseNotificationExpose` не экспортирован (NTF-8).
- **Состояния:** 4 типа, несколько уведомлений, автозакрытие, contained. Нет паузы, «постоянного» режима, действий, лимита и очереди.
- **Доступность — частично.** Регион «Уведомления»; error → `alert`, остальные → `status`; «Закрыть» с именем. Нет паузы (NTF-2, WCAG 2.2.1); без title рендерится пустой `h4`. Открытые: NTF-2, NTF-3 (частично), NTF-6.
- **Тесты:**
  - spec 25: роли и имя кнопки; семантика длительности с fake timers (0, Infinity, −500, NaN, 5000); классы типов; описание; прогресс; emit `close`. В `:211` и `:245` добавлен unmount;
  - integration 2 — формальные `expect(emitted).toBeDefined()`;
  - e2e 3: Default зависит от тайминга, закрытие обёрнуто в `if (count > 0)`;
  - visual: default.
  - Не покрыто: пауза, `notificationKey` и реактивность, несколько экземпляров, «постоянный» режим, `duration` больше 2³¹−1.
- **Storybook:**
  - 14 stories; docs-описания нет; argTypes скрывают `isContained` и `notificationKey`;
  - play 7. Содержательные: CloseByButton, AutoCloseAfterDuration (50 мс), AddWithoutTypeAndDuration, CloseOneOfMany, Positions. Формальные: Default (Tab без проверок), WithCustomClass;
  - мета-args `duration: 0` теперь дают 3 с показа;
  - CloseOneOfMany игнорирует `args.position`; тёмной темы нет.
- **Открытые проблемы:** OVL-1 (вне isContained), OVL-3, OVL-6, NTF-2, NTF-3 (частично), NTF-4, OVL-5, NTF-6, NTF-7, NTF-8; гипотеза NTF-1 (озвучивание).
### BaseTour

- **Назначение и зрелость:** пошаговый онбординг — спотлайт, карточка с навигацией, прогресс точками или полосой, мобильная раскладка, слоты, reduced motion. **Пригоден с оговорками**: утечка блокировки прокрутки исправлена. Открыто: клик по цели закрывает тур, при отсутствующей цели остаётся невидимый блокирующий оверлей, фокус не переводится.
- **API:**
  - props: `isOpen=false`, `steps: TourStep[]` (обязательный, `target` — CSS-селектор), `step=0`, `placement='auto'`, `gap`, `padding`, `radius`, `labels`, `behavior { closeOnOverlayClick, closeOnEscape, lockScroll, scrollIntoView }`, `showSkip=true`, `showProgress=true`, `customClass` (17 ключей);
  - `variant`, `sizeScale`, `color` игнорируются;
  - v-model: `v-model:is-open`, `v-model:step`;
  - emits: `update:isOpen`, `update:step`, `next`, `prev`, `change`, `skip`, `finish`, `close`;
  - slots: `default(ctx)`, `title`, `content`;
  - expose нет; `BaseTourSlotContext` не экспортирован.
- **Состояния:** первый и последний шаг; больше 8 шагов (полоса вместо точек); мобильная карточка; отсутствующая цель (карточки нет); кастомный слот.
- **Доступность — частично.** Есть `role=dialog`, `aria-modal`, `aria-label` = заголовок шага, имена кнопок, Escape, reduced motion. Нет перевода фокуса, ловушки и возврата (TOUR-4).
- **Тесты:**
  - spec 50: навигация, эмиты, геометрия, авторазмещение, Escape, мобильная карточка, снятие слушателей. useScrollLock замокан; тест «не блокирует прокрутку…» (`:324-327`) формальный;
  - integration 5: v-model, слот, размонтирование открытого тура без мока useScrollLock;
  - useTourLogic.spec 9 (лежит в папке компонента); у useTourCoordination тестов нет; e2e нет.
  - Не покрыто: клик по цели (browser), пустые и поздние цели, прокрутка при `lockScroll=false`, фокус, SSR.
- **Storybook:**
  - 9 stories; docs-описания нет; argTypes без `steps`, `labels`, `behavior`, `radius`;
  - play 9; Navigation проверяет текст, который есть всегда, — формально; клавиатурных сценариев нет;
  - DEMO_LAYOUT с фиксированными id в 8 stories → в autodocs id дублируются;
  - WithCustomClass открыт в autodocs: оверлей и блокировка прокрутки на docs-странице;
  - DarkTheme на поддереве, эталон со светлой карточкой (OVL-1); недетерминизма нет.
- **Открытые проблемы:** TOUR-2, TOUR-3, TOUR-4, TOUR-5, OVL-1, OVL-2, OVL-3, OVL-4 (TOUR-6), OVL-6, ESC-STACK, TOUR-7, OVL-5.

## Навигация
### BaseTabs

- **Назначение и зрелость:** горизонтальные вкладки (4 варианта) с кнопками прокрутки и drag при переполнении; контент — общий default-слот. **Пригоден с оговорками.**
- **API:**
  - props: `items: TabItem[]` (`{ id, label, icon? — сырой HTML, isDisabled? }`), `modelValue: string`, `variant` (underline/pills/rounded/arc), `isScrollable`, `isFullWidth`, `sizeScale`, `color`, `customClass` (8 ключей);
  - v-model `modelValue` (controlled);
  - emits `update:modelValue`, `change` — теперь и на каждое нажатие ←/→/Home/End;
  - slot `default` без slot-props; expose нет.
- **Состояния:** disabled-вкладка (нативный `disabled`, стрелки её пропускают), scrollable, full-width. Пустой `items` → пустой `tablist`. Если `modelValue` не совпадает ни с одним `id`, ничего не выбрано, а в Tab-порядке первая доступная вкладка. loading/error нет.
- **Доступность (после исправлений):** в основном ОК.
  - Есть: `tablist/tab/aria-selected`, roving tabindex, стрелки с зацикливанием, Home/End, автоматическая активация, `tabpanel` + `aria-labelledby` (только при default-слоте), имена у кнопок прокрутки.
  - Открыто: TAB-3 — HTML-иконка попадает в имя вкладки; TAB-9 (гип.).
- **Тесты:**
  - Проверяют: unit — рендер, варианты, роли, `aria-selected`, disabled, имена кнопок прокрутки. integration — клик и disabled, 5 клавиатурных тестов, `tabpanel`. e2e — переключение, disabled, drag. visual — 7 stories.
  - Не покрыто: клик по активной вкладке (TAB-8), XSS через `icon` (TAB-3), drag с отпусканием вне вкладки (TAB-6), смена `items` при `isScrollable` (TAB-7), ручная активация.
  - Покрытие: компонент исключён из 100%-порога `test:components:coverage`, drag/scroll закрыты `istanbul ignore`; `ResizeObserver` подменяется без восстановления.
- **Storybook:**
  - 19 stories, docs-описания нет.
  - play 12: содержательных 3 (WithContent, WithIcons, NotScrollableObserver), остальные без expect или формальные.
  - Клавиатура — только Tab/Shift+Tab в Default без проверок; stories для стрелок и Home/End нет.
  - DarkTheme через `data-theme`. Внешних URL и random нет; play ScrollButtons подменяет метрики узла (H-1).
- **Открытые проблемы:** TAB-3, TAB-6, TAB-8; гипотезы TAB-7, TAB-9.
### BaseAccordion

- **Назначение и зрелость:** список раскрывающихся секций (single/multiple), анимация через CSS grid. **Пригоден с оговорками.**
- **API:**
  - props: `items: BaseAccordionItem[]` (обяз.; `{ label, content?, slot?, icon?, isDisabled?, defaultOpen? }`), `isMultiple`, `variant` (default/ghost/outline/shadow/soft), `sizeScale`, `color`, `customClass` (10 ключей);
  - emits `toggle(index, isOpen)`;
  - slots `default({ item })` + динамические по `item.slot`;
  - v-model нет, expose нет.
- **Состояния:** disabled (`aria-disabled`, не переключается), `defaultOpen` (только при mount), multiple, пустой список. loading нет.
- **Доступность (после исправлений):** в основном ОК.
  - Есть: заголовок `role=button` с `aria-expanded/controls/disabled`, Enter/Space; панель `role=region` + `aria-labelledby`; закрытая панель `inert` + `aria-hidden`.
  - Открыто: ACC-2 (уровень заголовка, нативная кнопка); reduced motion (сквозная проблема).
- **Тесты:**
  - Проверяют: unit — рендер, варианты, `defaultOpen`, стрелка, `toggle`. integration — клик, Enter, single/multiple, disabled, слоты + 6 APG-тестов (роль и `aria-expanded`, связь `aria-controls`↔region, Space, `inert` и скрытие от AT, повторное скрытие, `aria-disabled`). e2e — клик, disabled, multiple. visual — 4.
  - Не покрыто: реальный пропуск Tab по `inert` (нужен e2e), смена `items` после mount (ACC-3), `toggle(i, false)` при неявном закрытии (ACC-4), несколько `defaultOpen` в single-режиме (ACC-6).
- **Storybook:**
  - 21 stories, docs-описания нет; `items`, событие `toggle` и динамические слоты не описаны в argTypes.
  - play 9: 6 содержательных (KeyboardToggle — синтетический keydown Enter), Default/Empty/WithCustomClass — формальные.
  - Сценариев для Space и Tab нет. DarkTheme и LongContent есть; stories детерминированы.
- **Открытые проблемы:** ACC-2 (частично), ACC-3, ACC-4, ACC-5 (частично — README исправлен, нет default `items`), ACC-6.
### BaseMenu

- **Назначение и зрелость:** статичный список пунктов-действий, сгруппированных массивами, с разделителями между группами; триггера и поповера нет. **Пригоден с оговорками.**
- **API:**
  - props: `items: BaseMenuItem[][]` (`{ label, icon?, to? — не используется, click?, isDisabled?, hasDivider? — не используется }`), `variant`, `sizeScale`, `color`, `customClass` (6 ключей);
  - emits `select(item)`;
  - slot `default` объявлен, но не рендерится;
  - v-model и expose нет.
- **Состояния:** disabled (`aria-disabled`, без эмита), пустой. Нет выбранного/checked-пункта, подменю, loading.
- **Доступность (после исправлений):** частично.
  - Есть: пункты `role=button` с именем, Enter/Space, `aria-disabled`.
  - Нет: семантики списка или меню, стрелок, typeahead, Escape; disabled-пункты в Tab-порядке. Это развитие MENU-1, в roadmap.
- **Тесты:**
  - Проверяют: unit — рендер, иконки, disabled, разделители, `select`, `item.click`. integration — клик, `select`, disabled + 4 теста клавиатуры и роли. visual — 4; e2e нет.
  - Не покрыто: `to`/`hasDivider` (мёртвый API).
- **Storybook:**
  - 18 stories, docs-описания нет.
  - play 4, все без содержательных expect. Default жмёт Tab+Enter без проверки — теперь Enter эмитит `select`, но play этого не проверяет.
  - Большинство stories без `v-bind="args"`, поэтому Controls не работают. WithDividers/Simple/LongContent используют неработающий `hasDivider`.
  - DarkTheme и LongContent есть; stories детерминированы.
- **Открытые проблемы:** MENU-2; развитие MENU-1 (полный APG Menu).
### BaseMegaMenu

- **Назначение и зрелость:** многоуровневое меню сайта в двух layout: `columns` (на мобильном — аккордеон) и `dropdown` (верхняя навигация + каскадные flyout). Раскрытие ведёт реестр `useMegaMenuTree`. **Требует доработки.**
- **API:**
  - props: `columns?: MegaMenuColumn[]` (`{ title, icon?, to?/href? — не используются, items }`), `items?: MegaMenuItem[]` (`{ label, to?, href?, target?, description?, icon?, isDisabled?, children? }`), `layout` (columns/dropdown), `trigger` (click/hover), `hoverDelay = 200`, `variant`, `sizeScale`, `color`, `customClass` (9 ключей);
  - emits `navigate(url)`, `item-click(item)`, `column-click(column)`;
  - slots `column-title({ column })`, `nav-item({ item })`, `item({ item, level })`;
  - v-model и expose нет;
  - useMegaMenuTree: `useMegaMenuTreeProvider()`, `useMegaMenuTree()`, `MEGA_MENU_TREE_KEY`, `MEGA_MENU_PATH_SEPARATOR`.
- **Состояния:** disabled, мобильный аккордеон (useBreakpoint), hover/click. Нет текущего пункта (`aria-current`) и закрытия извне.
- **Доступность (после исправлений):** нет — MM-1 (P1), MM-4, MM-5. Переходы по `href` из данных защищены от `javascript:` (MM-2).
- **Тесты:**
  - Проверяют: spec (783 стр.) и integration (516 стр.) — клики и hover в обоих layout, disabled, глубина > 3, мобильный режим, navigate `_self`/`_blank`. `useMegaMenuTree.spec` — открытие, закрытие, соседи, inject. visual — 3; e2e нет.
  - Подмена: оба файла мокают `@utils/navigationUtils` копией `navigateAndEmit` без `isSafeUrl`, поэтому ни реальная утилита, ни защита на уровне компонента не проверяются. `window.location` подменяется без try/finally.
  - Не покрыто: клавиатура, ARIA, слоты (MM-5), hover между соседями (MM-3), закрытие (MM-4), label с `/` (MM-7).
- **Storybook:**
  - 21 stories, docs-описания нет; `columns/items`, события и слоты не описаны.
  - play 10, в основном содержательные. Default закрепляет фокусируемость `h4` и жмёт Enter без проверки.
  - DarkTheme и LongContent есть.
  - Внешние запросы: play DropdownInteractions кликает «Контакты» (`https://example.com`, `_blank`) → реальный `window.open` (https проходит `isSafeUrl`). В данных stories также `https://docs.example.com/api`.
- **Открытые проблемы:** MM-1 (P1), MM-3, MM-4, MM-5, MM-6 (частично — README исправлен, `MegaMenuColumn.to/href` нет), MM-7, MM-8.
### BaseSideBar

- **Назначение и зрелость:** боковая панель: заголовок, навигация (items или слот), тело, подвал, свёрнутый режим (controlled/uncontrolled), skeleton-загрузка. Самый зрелый компонент группы. **Пригоден с оговорками.**
- **API:**
  - props: `isCollapsed?` (v-model, `undefined` = внутреннее состояние), `items?: SideBarItem[]` (`{ key?, label, icon?, to?: string или объект, badge?, click?, isActive?, isDisabled?, hasDivider?, children? }`), `activeKey?`, `activePath?`, `activeMatch` (exact/startsWith), `linkComponent = 'a'`, `title?`, `width = 280`, `collapsedWidth = 68`, `isCollapsible = true`, `isLoading`;
  - emits `update:isCollapsed`, `collapse`, `expand`, `itemClick(item, event)` (camelCase);
  - slots `default`, `header`, `footer`, `navigation`, `collapsedContent`, `item/icon/label/badge`;
  - expose нет;
  - экспорт: index.ts экспортирует типы BaseSideBarNavigation, но не сам подкомпонент; `useSideBarNavigation` публичен (namespace), тип возврата не объявлен.
- **Состояния:** collapsed, loading (skeleton без `aria-busy`), disabled-пункт, active/current, badge, divider, disclosure-группы.
- **Доступность (после исправлений):** частично.
  - Есть: `aria-current="page"`, `aria-expanded` у групп, имя у кнопки toggle.
  - Открыто: SB-1, SB-2, SB-4, SB-5; гипотезы SB-7, SB-10.
- **Тесты:**
  - Проверяют: spec, integration, navigation.spec (1733 стр.), e2e — 16, visual — 22. Широко покрыты active, disabled, disclosure, collapsed, linkComponent.
  - Формальное: ~11 тестов в navigation.spec — дословные дубли. Тесты «без label» и «не использует title» закрепляют SB-1. e2e «dark theme» проверяет только фон. `useSideBarNavigation.ts` исключён из покрытия.
  - Не покрыто: имя в collapsed, фокус после toggle, сворачивание группы с активным ребёнком (SB-3), `javascript:` в `to` (SB-6).
  - На этапе исправлений файлы не менялись.
- **Storybook:**
  - 27 stories, docs-описания нет. argTypes — все props с описаниями, события скрыты, слоты не описаны; `StoryObj` без параметра.
  - play 3 без содержательных проверок (KeyboardNavigation — Tab+Tab без expect).
  - Тёмная тема — через `.dark`, то есть не настоящая (SB-8). LongContent есть; stories детерминированы.
- **Открытые проблемы:** SB-1, SB-2, SB-3, SB-4, SB-5, SB-6, SB-8, SB-9, SB-11, SB-12; гипотезы SB-7, SB-10.
### BaseBreadcrumbs

- **Назначение и зрелость:** цепочка крошек с разделителями, сворачиванием (`maxItems` → «…»), иконкой дома и Schema.org (микроразметка + JSON-LD). Переходы сделаны кнопками через `navigateAndEmit`. **Пригоден с оговорками.**
- **API:**
  - props: `items: BreadcrumbItem[]` (`{ label, to?, href?, icon? }`, без `target`), `separator` (slash/chevron/dot/arrow), `maxItems = 0`, `showHome = false`, `homeIcon = 'home'`, `variant`, `sizeScale`, `color`, `customClass` (14 ключей);
  - emits `navigate(url)`, `item-click(item)`;
  - slots `item({ item, index })`, `separator({ index })`, `home`;
  - v-model и expose нет.
- **Состояния:** current (`aria-current`); collapsed → expanded, обратно свернуть нельзя; пустой (пустой `ol` + JSON-LD с пустым списком).
- **Доступность (после исправлений):** частично.
  - Есть: `<nav aria-label="Хлебные крошки">`, `aria-current="page"`, разделители с `aria-hidden`, имя у кнопки «дом».
  - Открыто: BC-2 (кнопки вместо ссылок), BC-3 («…»), BC-4 (два элемента «Главная»).
- **Тесты:**
  - Проверяют: unit — рендер, разделители, `maxItems` и раскрытие, `showHome`, клики `to`/`href`, слоты, `aria-current`, наличие JSON-LD. integration — клики, ellipsis, дом, внешняя ссылка, слоты + 2 a11y-теста. visual — 3.
  - Формальное: JSON-LD проверяется только по наличию `<script>`; тесты с `href` вызывают реальный `window.open` (jsdom «not implemented») и не проверяют, что открывается новая вкладка.
  - Не покрыто: дубль при `showHome` (BC-4), граничные `maxItems`, повторное сворачивание, `javascript:` через компонент.
- **Storybook:**
  - 23 stories, docs-описания нет.
  - play у всех 23, из них 6 формальных; клавиатурных play нет.
  - DarkTheme и LongContent есть.
  - Внешние запросы: WithIconsAndHrefs кликает «Внешний сайт» без подмены `window.open` → реальный `https://example.com`.
- **Открытые проблемы:** BC-2, BC-3 (частично), BC-4, BC-5, BC-6.
### BaseStepper

- **Назначение и зрелость:** горизонтальный или вертикальный индикатор шагов с формами индикатора и анимированной линией прогресса; шаги кликабельны только мышью. **Требует доработки** (как некликабельный визуальный индикатор пригоден).
- **API:**
  - props: `modelValue: number` (обяз., с 1), `items: BaseStepperStep[]` (`{ label, description?, icon? — не используется, isDisabled? }`), `orientation`, `shape` (circle/square/diamond/empty), `variant` (default/animated), `sizeScale`, `color`, `customClass` (11 ключей);
  - v-model `modelValue`;
  - emits `update:modelValue`, `change`;
  - slots `header`, `footer`, `item(BaseStepperItemSlot)`; `default` объявлен, но не рендерится;
  - expose нет.
- **Состояния:** active, completed, disabled. Нет error, optional и состояния «все завершены» (ST-4).
- **Доступность (после исправлений):** нет — ST-2.
- **Тесты:**
  - Проверяют: unit — рендер, классы, галочка, ориентации, формы, CSS-переменная, disabled, слоты, эмиты. integration — клик → emit, disabled. visual — 4; e2e нет.
  - Не покрыто: `modelValue` вне диапазона (ST-4), клавиатура и ARIA, клик по текущему шагу (ST-3).
  - На этапе исправлений файлы не менялись.
- **Storybook:**
  - 17 stories, docs-описания нет; `modelValue` скрыт из argTypes.
  - play у всех 17; Default жмёт Tab/Shift+Tab без expect, а фокусироваться не на чем.
  - AllCompleted показывает последний шаг активным, а не завершённым.
  - DarkTheme и LongContent есть; stories детерминированы.
- **Открытые проблемы:** ST-2, ST-3, ST-4, ST-5.
### BasePagination

- **Назначение и зрелость:** пагинация с prev/next, многоточиями и последней страницей. **Пригоден с оговорками.**
- **API:**
  - props: `modelValue: number` (обяз.), `total: number` (обяз., число элементов), `pageSize = 10`, `maxVisible = 7`, `showLastPage = true`, `variant = 'default'`, `sizeScale`, `color`, `customClass` (6 ключей);
  - v-model `modelValue`;
  - emits `update:modelValue`, `change`;
  - slot `default` объявлен, но не рендерится;
  - expose нет;
  - не использует useStandardBaseComponent, поэтому `variant` не попадает на корень;
  - paginationUtils: `calcTotalPages`, `calcVisiblePages`, `calcPageInfo`.
- **Состояния:**
  - prev/next блокируются на краях и вне диапазона (`<= 1` / `>= totalPages`); при `total=0` заблокированы обе;
  - текущая страница — `aria-current` и вариант `default`, остальные — `soft` при `variant='default'`;
  - loading и disabled для всего компонента нет.
- **Доступность (после исправлений):** частично.
  - Есть: нативные кнопки, `aria-current="page"`, имена у стрелок.
  - Открыто: PG-3 (`<nav>`, «Страница N»).
- **Тесты:**
  - Проверяют: unit — рендер, многоточия, последняя страница, totalPages, `showLastPage`, guard в `changePage`. integration — клики, `change`, вперёд/назад + 7 новых тестов (`aria-current` ×2, отличие оформления, вне диапазона ×3, имена стрелок). `paginationUtils.spec` — totalPages, окна, pageInfo. visual — 3, baseline устарели после PG-1.
  - Не покрыто: `showLastPage=false` при текущей последней (PG-4), чётный или малый `maxVisible` и дубли key (PG-5), `calcPageInfo` при `total=0` (PG-7), клик по текущей (PG-6).
- **Storybook:**
  - 18 stories, docs-описания нет; argTypes — все props, события скрыты.
  - play 4: Interactive проверяет `change(3)`; OutOfRangePage теперь проверяет, что обе стрелки заблокированы; Default кликает без проверок; WithCustomClass — `toBeTruthy`.
  - ZeroTotal и Empty совпадают. DarkTheme есть; stories детерминированы.
- **Открытые проблемы:** PG-3 (частично), PG-4, PG-5, PG-6, PG-7.

## Даты
### BaseCalendar

- **Назначение и зрелость.** Встраиваемый календарь с режимами single/range/multiple, видами дни/месяцы/годы, временем 24h/12h и подсветками. После CAL-2, CAL-3 и CAL-4 выбор даты и времени мышью корректен, но нет APG-клавиатуры, «Сегодня» ошибается, часть API мёртвая. Оценка: **Пригоден с оговорками**.
- **API.** Дефолты задаются в `useCalendarResolvedProps`, без `withDefaults`.
  - Props:
    - `selectionMode`;
    - `timeConfig {showTime, showSeconds, is24Hour}`;
    - `constraints {minDate, maxDate, disabledDates, disabledWeekdays, disableFrom, disableTo}`;
    - `displayConfig {showNavigation, canSwitchView, showTodayButton, showYear, showWeekNumber}`;
    - `highlights`, `weekends`, `firstDayOfWeek = 1`, `locale = 'ru-RU'`, `showDatePopover`, `isDisabled`;
    - `initialMonth`/`initialYear` — через watch фактически управляют текущим месяцем;
    - `events` — мёртвый, CAL-6.
  - v-model: `modelValue`, `modelValueEnd`, `selectedDates`, `isAm`. Модель `isAm` скрытая: объявлена через `defineModel`, её нет в `BaseCalendarProps`/`BaseCalendarEmits`. После CAL-2 она следует за часами.
  - Emits: `update:*`, `date-click`, `range-select`, `month-change`, `year-change`, `view-change`.
  - Slots: `day`, `header`, `date-popover`. Слоты `event` и `navigation` объявлены, но не рендерятся (CAL-6).
  - Expose нет, типа Expose нет.
- **Состояния.**
  - Есть: disabled для всего календаря; отключённые дни (min/max, disabledDates, disabledWeekdays, disableFrom/To); selected, range, start/end, out-of-range; today; weekend/holiday; highlight с popover; номера недель; три вида; время 24h/12h (с clamp).
  - Нет: readonly, валидации входных дат.
- **Доступность — частично.**
  - Есть: дни — нативные кнопки (Tab + Enter/Space), стиль `:focus-visible`; у nav-кнопок имена по виду.
  - Нет: grid-семантики, полной даты в имени дня, `aria-selected`/`aria-current`, стрелок и roving tabindex, label у полей времени, роли и Escape у popover, aria-live.
  - Открыто: CAL-1. Контраст выбранного дня — TOK-1 (группа display).
- **Тесты.**
  - Что проверяют:
    - `BaseCalendar.time.integration.spec.ts` (9, реальные компоненты): 12h, AM/PM, clamp, `v-model:is-am`;
    - `BaseCalendar.integration.spec.ts` (9): 7 тестов на стабах — выбор в трёх режимах; 2 на реальных компонентах — имена кнопок навигации. Формальные: «должен выделять выбранную дату» проходит и без клика, «должен эмитить date-click при нажатии "Сегодня"» не проверяет значение;
    - `BaseCalendar.spec.ts` (26, стабы). Формальные: «должен переключать AM на PM / PM на AM по клику и корректировать часы» проверяют только `toBeTruthy`, «должен эмитить range-select при выборе диапазона» — только `instanceof Date`;
    - visual — 4 теста, зависят от текущей даты (CAL-12); e2e нет.
  - Не покрыто: клавиатура и ARIA (нужны браузер и axe); «Сегодня» в range/multiple и при ограничениях; popover через `userEvent.click`; `events`; прогоны в разных TZ (TZ в `build/tests/vitest.config.ts` не зафиксирован); ввод секунд и отрицательных значений.
- **Storybook.**
  - 50 stories, docs-описания компонента нет. Единственное описание story (WithMinMaxDates) неверно (CAL-8).
  - 25 play-функций, многие проверяют «если элемент есть». В Default «стрелки» нажимаются без единого expect — этого хватает `check-a11y-coverage.mjs`. CustomColor и WithCustomClass проверяют только наличие элемента.
  - Клавиатура: только стрелки в Default и `playShiftTab`. Тёмная тема: DarkTheme.
  - Недетерминизм: модульный `new Date()`, `ref(new Date())` в 5 stories и `new Date()` в DatePopoverWithHighlights. Внешних URL нет.
  - argTypes с точками мёртвые; нет контролов `showDatePopover`, `isDisabled`, `isAm`. Есть mojibake и BOM.
- **Открытые проблемы:** CAL-1 (частично), CAL-5, CAL-6, CAL-12, CAL-7, CAL-8, CAL-9, CAL-10. Гипотеза: CAL-11.
  - Смежные из других групп: TOK-1 (P1, display); Escape без стека (сквозная проблема useEscapeKey).
### BaseDatePicker

- **Назначение и зрелость.** Поле с Teleport-панелью из одного или нескольких BaseCalendar. После DP-1 работают ограничения, время и номера недель; после DP-2 панель открывается с клавиатуры. Остаются: сброс вида при scroll (DP-4), валидация и сброс значения (DP-5), нет ручного ввода (DP-3), атрибуты попадают на обёртку (DP-6). Оценка: **Пригоден с оговорками** — для single/range через v-model; режим multiple и работа в формах требуют доработки.
- **API.**
  - Props:
    - `selectionMode`;
    - ограничения: `minDate`, `maxDate`, `disabledDates`, `disabledWeekdays`, `disableFrom`, `disableTo`;
    - время и недели: `showTime`, `showSeconds`, `is24Hour`, `showWeekNumber`;
    - `isMultiMonth`, `calendarConfig` (явно переданные props приоритетнее);
    - `label`, `error`, `isRequired`, `isClearable`, `isDisabled`;
    - `isReadonly = true` — запрещает только ввод текста (DP-5);
    - `closeOnClickOutside`, `closeOnEscape`;
    - `dateFormat` не влияет на вывод (DP-3), `variant` не используется (DP-8).
  - v-model: `modelValue`, `modelValueEnd`, `selectedDates`; если значение undefined — uncontrolled.
  - Emits: `update:*`, `open`, `close`, `clear`, `range-select`. Slot: `icon`.
  - Expose: `{ rootRef, validate, reset }`. Тип Expose не объявлен и не экспортирован. У панели `DatePickerPanelExpose` объявлен, но тоже не экспортирован.
  - Новое внутреннее событие поля: `keyboard-open`.
- **Состояния.**
  - Есть: disabled; error (из prop и из `validate()`); required (звёздочка); clearable; empty (placeholder); multi-month; тёмная тема (копируется на момент открытия); ограничения, время и номера недель в панели.
  - С ошибками: readonly, required, сброс в undefined (DP-5).
  - Нет: loading, ручного ввода.
- **Доступность — частично.**
  - Есть: Enter и ↓ (в том числе Alt+↓) открывают панель и переводят фокус на дату; после выбора и по Escape фокус возвращается в поле; у панели `role="dialog"` и `aria-label`; у кнопок поля есть имена.
  - Нет: `aria-haspopup`, `aria-expanded`, `aria-controls`; `aria-modal` и Tab-цикла; открытия по Space; очистки с клавиатуры; стрелок по сетке. Label не связан с input (forms/FRM-1), атрибуты попадают на обёртку.
  - Открыто: DP-2, CAL-1, DP-6.
- **Тесты.**
  - Что проверяют:
    - `BaseDatePicker.calendar.integration.spec.ts` (10, реальные дочерние компоненты, без моков): ограничения, время, номера недель, отсутствие дублей навигации, клавиатура и фокус;
    - `DatePickerPanel.spec.ts` (40) и `DatePickerRangePanel.spec.ts` (7): стаб построен из `BaseCalendar.props`, плюс контракт «ничего не уходит в $attrs» и блок времени только у первого календаря (E-1);
    - `BaseDatePicker.spec.ts` (43, стабы). Формальные: «должен передавать minDate в панель»; «игнорирует watch modelValue, когда новое значение undefined» закрепляет дефект DP-5a;
    - `BaseDatePicker.integration.spec.ts` (15): дочерние компоненты на стабах, composables замоканы; тест ResizeObserver без assertions;
    - `DatePickerField.spec.ts` (11); e2e — 2 теста; visual — 3 теста, снимают только закрытое поле.
  - Не покрыто: DP-4, DP-5, ручной ввод, проброс атрибутов, «Сегодня» в multi-month для single/multiple, keyboard-only e2e, возврат фокуса после выбора мышью.
- **Storybook.**
  - BaseDatePicker: 38 stories, 21 play-функция, а `expect(` во всём файле всего 8. Многие play молча выходят через `if (!field) return`.
  - DatePickerPanel: 21 story, 21 play «для 100% coverage», большинство без assertions. MonthChangeEmit и YearChangeEmit диспатчат DOM `CustomEvent` — это no-op. Поиск через `document.body` протекает между stories.
  - DatePickerField: 8 stories, 5 play.
  - Docs-описания нет ни в одном файле.
  - В argTypes нет `isReadonly`, `closeOn*`, `gap`, `dateFormat`, `calendarConfig`, `disabled*`, `highlights`, `weekends`, `firstDayOfWeek`, `color`. Stories с min/max нет.
  - Клавиатура: `playShiftTab` и Escape в OpenClosePanel. Story с открытием с клавиатуры нет. Тёмная тема: DarkTheme.
  - Недетерминизм: `new Date()` в Clearable и fallback на текущий месяц в stories панели. Внешних URL нет. Mojibake на строке 263.
  - DP-9 исправлен, но без теста в репозитории.
- **Открытые проблемы:** DP-2 (P1, частично), DP-3/DU-1, DP-4, DP-5, DP-6, DP-9 (частично), CAL-5 и CAL-1 (через календарь в панели), DP-8, CAL-7. Гипотеза: DP-7.
  - Смежные из других групп: CO-1 (P1, overlays: пикер внутри Popover/Dropdown закрывает родителя), FRM-1 (P1, forms), overlays/DP-1 (нет flip), Escape без стека.

## Таблица и дерево
### BaseTable

- **Назначение и зрелость:** клиентская таблица — поиск, фильтры, сортировка (в том числе мультисортировка), пагинация или подгрузка (кнопка / бесконечная прокрутка), выбор, раскрытие и вложенность строк, ресайз и видимость колонок. Все операции выполняются на клиенте, состояние снаружи не управляется. **Требует доработки.**
- **API:**
  - props: `columns` и `rows` (обязательные), `isLoading`, `emptyText`, `height`, `pageSize` (0 — без пагинации), `pageSizeOptions`, `loadMode` (pagination/infinite/button), `searchDebounce`, `nestedConfig`, `features` (search, filters, columnSettings, rowNumber, pageSizeSelector), `behavior` (selectable, multiSort, resizable), `padding`, `variant`;
  - v-model: нет;
  - emits: `sort`, `filter`, `search`, `select`, `expand` (копия строки), `page-change`, `page-size-change`, `load-more`, `row-click`, `column-resize(key, px)`, `columns-change` (теперь копии);
  - slots: `header`, `footer`, `empty`, `toolbar-prepend`, `toolbar-append`, `expanded-content{row}`, `pagination{…}`, `header-<key>{column}`, `cell-<key>{row, value, column, index}` (в типе только row и column — TBL-15); слот `default` объявлен, но не рендерится;
  - expose: нет, типа Expose нет;
  - подкомпоненты (Toolbar, Header, ResizeHandle, Body, Row, NestedRow, ExpandedRow) внутренние и наружу не экспортируются.
- **Состояния:**
  - loading: скелетон, если строк нет; оверлей с blur и `pointer-events:none`, если строки есть; в режиме infinite — строка «загрузка ещё»;
  - empty: `emptyText` или `#empty`; текст одинаковый для «нет данных» и «ничего не найдено»;
  - disabled-строки: блокируется только чекбокс (TBL-17);
  - также есть selected, expanded, вложенная таблица и child-строки, sticky-заголовок (при `height`) и sticky-колонки;
  - error-состояния нет.
- **Доступность (после исправлений): частично.**
  - Есть: нативные table/thead/th, стабильные ключи строк; сортируемые заголовки — кнопки с `aria-sort`.
  - Нет: имён у чекбоксов и иконочных кнопок, indeterminate, caption/aria-label, `aria-expanded`, `aria-busy`. Чипы фильтров и панель настроек с клавиатуры недоступны; row-click и ресайз — только мышью.
  - Открытые: TBL-14, TBL-6 (остаток), TBL-12 (остаток), TBL-2 (indeterminate).
- **Тесты:**
  - `BaseTable.spec.ts` — 64 (54 + 10 регрессий). Регрессии проверяют: порядок сортировки с пустыми значениями, «Выбрать все» при поиске, отсутствие мутаций колонок и синхронизацию настроек, клавиатурную сортировку и `aria-sort`, cleanup ресайза при unmount. Старые тесты эмитов в основном проверяют только факт события; BaseCheckbox, BaseSelect, BaseDropdown и BasePagination застаблены.
  - `BaseTable.integration.spec.ts` — 1 (факт эмита sort); `BaseTableNestedRow.spec.ts` — 4.
  - e2e — 4. Проверки сортировки и пагинации обёрнуты в `if (count > 0)` (`e2e:26, 39, 43`); тест пагинации после клика ничего не проверяет. Visual — default и dark-theme.
  - BaseTable исключён из 100%-гейта покрытия.
  - Не покрыто: смена rows и pageSize, догрузка (TBL-3/4/8); поиск и фильтры по типам (TBL-9/10/11); имена и клавиатура остальных контролов плюс axe (TBL-14); infinite без height (TBL-13); производительность (TBL-18).
- **Storybook:**
  - 62 stories; docs.description.component нет; argTypes есть для всех props, события скрыты без описания, слоты и payload не описаны.
  - 24 play-функции:
    - содержательные — RowClickToggleExpand, ExpandableChildren, DynamicColumns, DynamicRows, ButtonLoadModeDone, EmptyTable, частично Interactive;
    - без проверок — Default, SortByColumn, SelectRow, ButtonLoadMode, InfiniteLoadMode, MultiSortTable, ResizeSingleColumn, ResizeNoMove, InfiniteScrollFar;
    - PaginationChange проверяет только наличие пагинации; SearchTable — условие, верное и до поиска.
  - Play не запускаются ни скриптами, ни в CI.
  - Клавиатура — только Default (Tab без expect). Stories под исправления (сортировка с клавиатуры, «Выбрать все» при поиске) не добавлены.
  - Тёмная тема — DarkTheme; длинный контент — LongContent.
  - Недетерминизм: WithImages грузит внешние `i.pinimg.com` и `avatars.mds.yandex.net` ×2, плюс `/api/paintings/{lion,wolf}.jpg` (404); RichContent — `/api/paintings/*.jpg` ×6 (404). Math.random и Date.now не используются.
  - InteractiveStates навешивает несуществующие классы `--hover`/`--focus`.
- **Открытые проблемы:**
  - P1: TBL-3, TBL-4, TBL-2 (остаток), TBL-6 (остаток);
  - P2: TBL-8, TBL-9, TBL-10, TBL-11, TBL-12 (остаток), TBL-13, TBL-14, TBL-15, TBL-18, TBL-20 (остаток);
  - P3: TBL-16 (остаток), TBL-17, TBL-19, TBL-21.
### BaseTree

- **Назначение и зрелость:** дерево с раскрытием, выбором single/multiple (с каскадом), ленивым монтированием детей и слотами. Семантики и клавиатуры по APG нет, ссылки узлов не реализованы. **Требует доработки.**
- **API:**
  - props: `items` (обязательный; `TreeNode {id, label, icon?, children?, isDisabled?, to?, href?}`), `selectionMode` (none/single/multiple, по умолчанию none), `arrowPosition` (left/right), `expandedIds?`, `selectedIds?`, `isDefaultExpandAll = false`, `variant`, `sizeScale`, `color`, `customClass` (9 ключей);
  - v-model: `expandedIds`, `selectedIds` (схема `prop ?? internal`, `update:*` эмитятся);
  - emits: `update:expandedIds`, `update:selectedIds`, `toggle(id, isExpanded)`, `select(id, isSelected)`;
  - slots: `icon{node}`, `arrow{node, isExpanded}`, `label{node, depth, isSelected, isExpanded}`, `actions{node}`;
  - expose: нет, типа Expose нет. BaseTreeNode и BaseTreeChildren внутренние.
- **Состояния:**
  - disabled-узел: визуально и защитой в обработчиках, но стиль гасит всё поддерево (TRE-10);
  - выбор single/multiple (каскад — TRE-4); «раскрыть всё» — только при mount (TRE-5);
  - empty: пустой div без текста и слота; loading и асинхронной загрузки детей нет;
  - длинные метки обрезаются ellipsis без title.
- **Доступность (после исправлений): нет.**
  - Ролей tree/treeitem/group и aria-состояний нет (TRE-1).
  - Клавиатура — только Enter; в режимах выбора ветку не раскрыть; каждый заголовок — отдельная Tab-остановка (TRE-2).
  - После исправления TRE-3 свёрнутые ветки не попадают в порядок Tab.
  - Actions невидимы при фокусе (TRE-7); чекбокс disabled-узла не заблокирован (TRE-4). Фокус заголовка виден.
  - Открытые: TRE-1, TRE-2, TRE-7, TRE-4, TRE-10.
- **Тесты:**
  - `BaseTree.spec.ts` — 30: рендер, варианты, классы, слоты, customClass, защита disabled от кликов.
  - `BaseTree.integration.spec.ts` — 22: раскрытие, single/multiple, каскад, эмиты v-model, Enter; плюс 3 новых теста на порядок Tab у свёрнутых веток. Формальные: `:269-285` (клик без проверки), `:287-301` (тривиальная проверка), `:303-317` (клика нет).
  - `BaseTreeChildren.spec.ts` — 4; e2e — 2 (клики с `force: true`); visual — 7 baseline.
  - BaseTree исключён из 100%-гейта.
  - Не покрыто: controlled `expandedIds`/`selectedIds` после mount; `isDefaultExpandAll` при асинхронных items; disabled-потомки в каскаде; роли и клавиатура APG; всплытие кликов из actions; циклы и дубли id.
- **Storybook:**
  - 31 story; docs.description.component нет; в argTypes нет `expandedIds`/`selectedIds` и событий, демо v-model нет.
  - 16 play-функций:
    - с проверками — Interactive, KeyboardEnterTogglePlay, ExpandCollapseWatcherCoverage, WasExpandedWatcherFullCycle;
    - только проверка наличия — IconSlotPlay, ArrowSlotPlay, ActionsSlotPlay, LabelContentChildrenPlay, LabelContentDeepDepth, WithCustomClass;
    - без проверок — SingleSelectionPlay, MultipleSelectionPlay, DisabledClickPlay, DisabledMultiplePlay, ArrowRightPlay;
    - Default нажимает ArrowDown/Enter без проверок, хотя навигации стрелками нет.
  - Play не запускаются. Клавиатура — только Enter (KeyboardEnterTogglePlay).
  - Тёмная тема — DarkTheme; длинный контент — LongContent; данные детерминированы (`generateTree`), внешних URL нет.
  - InteractiveStates использует несуществующие классы.
- **Открытые проблемы:** P1 — TRE-1, TRE-2, TRE-8 (остаток — защита `items` в коде); P2 — TRE-4, TRE-5, TRE-6, TRE-7; P3 — TRE-9, TRE-10, TRE-11.

## Редактор и чат
### BaseEditor

- **Назначение и зрелость:** WYSIWYG-редактор на `contenteditable` + `document.execCommand`: формат, блоки, цвет, заголовки, ссылка, изображение и видео, режим HTML-кода, меню медиа. XSS-синк (EDT-1) и обход readonly (EDT-3) устранены, но HTML не санитизируется (EDT-2), медиа сохраняются как `blob:` (EDT-4), доступности нет. Оценка: **Требует доработки**.
- **API:**
  - props: `modelValue` (HTML, не санитизируется — предупреждение в JSDoc и README), `placeholder`, `isReadonly`, `hasToolbar` (= true), `isAutofocus`, `variant` (`default|ghost|outline|shadow|soft`), `sizeScale` (= 100), `color`, `customClass` (root/toolbar/btn/group/colorPicker/headingSelect/fileInput/content/code);
  - v-model: `modelValue`; emits: `update:modelValue`, `focus`, `blur`;
  - slots: `toolbar` (без scoped-props — команд не получает);
  - expose: нет, типа Expose нет;
  - экспорт: `BaseEditorProps/Emits/Slots`, `EDITOR_VARIANTS`, `EditorAlign/Format/Heading` (в API не используются). `BaseEditorToolbar` — внутренний компонент.
- **Состояния:** есть focused, empty (placeholder через CSS `::before`), readonly (меню медиа закрыто — EDT-3; в режиме кода readonly не работает — EDT-11), code mode. Нет disabled, loading (story `Loading` — это readonly с текстом), error/label/required, лимитов файлов.
- **Доступность (после исправлений):** нет. У области нет роли, имени, `aria-multiline`/`aria-readonly`; у 17 иконочных кнопок нет имён и `aria-pressed`; тулбар без `role="toolbar"`; медиа с клавиатуры не загрузить и не изменить. Открыто: EDT-15.
- **Тесты:**
  - `BaseEditor.spec.ts` (30): рендер, классы, placeholder, variant, focus/blur, emit после ручного `innerHTML`; для цвета проверяется только класс индикатора (`execCommand` замокан);
  - `BaseEditor.integration.spec.ts` (5): ввод → emit, 3 регрессии EDT-1, readonly-меню (EDT-3);
  - `useEditorToolbar.spec.ts` (74): аргументы `execCommand` на моках Selection/Range;
  - `editorDomUtils.spec.ts` (73); visual — 3 снимка;
  - не покрыто: санитизация (EDT-2), вставка (EDT-6), режим кода с readonly (EDT-11), IME (EDT-7), undo (EDT-12, браузер), роли и имена (EDT-15), валидация ссылки (EDT-5), revoke blob (EDT-4), синхронизация селекта «Формат» (EDT-9).
- **Storybook:**
  - 27 stories; docs-описания компонента нет; argTypes — 8 props (`modelValue` скрыт), события и слот не описаны;
  - 13 play-функций: 7 с `expect` (Interactive, TypeInputFlow, FocusBlurFlow, ExternalModelUpdate, AutofocusOnMount, CodeModeFlow — только переключение режима, WithCustomClass), 6 без assert'ов (EDT-T1);
  - клавиатура — только Tab/Shift+Tab без проверки; a11y-stories нет; тёмная тема — `DarkTheme`; длинный контент — `LongContent`;
  - недетерминизм: `picsum.photos` (случайная картинка), `placehold.co`;
  - story о санитизации нет; play в CI не запускаются.
- **Открытые проблемы:** P1 — EDT-2, EDT-4; P2 — EDT-5, EDT-6, EDT-7, EDT-8, EDT-9, EDT-10, EDT-11, EDT-15, EDT-T1; P3 — EDT-13, EDT-14 (частично — README-пункт исправлен), EDT-1r, EDT-3r, EDT-CC1, EDT-CC2; гипотезы — EDT-12, EDT-6 (браузерная часть).
### BaseChat

- **Назначение и зрелость:** мессенджер: шапка с поиском, закрепы, лента (ответы, реакции, вложения, статусы, выделение, контекстное меню), ввод (упоминания, команды, эмодзи, вложения, быстрые ответы), подтверждение удаления, слайдовер (инфо, участники, медиа, файлы, ссылки, админ-действия). Пользовательские данные рендерятся безопасно: `v-html` нет, ссылками становятся только http(s) с `rel`, скачивание — только по безопасным схемам. После исправлений работают меню мышью и закрепление, черновик сохраняется, поиск сбрасывается, демо-данных нет. Оценка: **Пригоден с оговорками** — API-«пустышки» (CHAT-5), автоскролл (CHAT-7), смена чата только через `:key` (CHAT-14), нет клавиатурного доступа к действиям (CHAT-16), IME и многострочный ввод (CHAT-12/13).
- **API:**
  - props: `messages` (обяз.), `title` (обяз.; без него нет шапки), `subtitle`, `avatar`, `description` (новый, опц.), `isGroup`, `members`, `commands`, `quickReplies`, `currentUserRole` (`admin|member`), `isTyping`/`typingUsername`, `pinnedMessages` (игнорируется — CHAT-5), `height` (= '500px'), `variant` (`bubble|flat|modern`), `sizeScale`, `color`, `customClass{root}`;
  - v-model: нет — поиск, выделение, ответ, черновик и панель живут во внутреннем состоянии;
  - emits (20): `send`, `attach`, `avatar-click`, `search` (не эмитится), `message-select`, `info-click`, `message-reaction`, `quick-reply`, `download-file`, `delete-messages`, `forward-messages`, `pin-message`, `unpin-message`, `add-member` (не эмитится), `kick-member`, `ban-member`, `update-member-role`, `mention-click`, `command-click`, `error`;
  - slots: `default` объявлен, но не рендерится; expose: нет, типа Expose нет;
  - экспорт типов: `BaseChatProps/Emits/Slots`, `ChatMessage`, `ChatMessageSender`, `ChatMessageStatus`; не экспортированы `ChatMember`, `ChatCommand`, `ChatMessageAttachment`, `ChatMessageReaction`, `ChatInfoTab`.
- **Состояния:** есть typing (шапка и лента), статус сообщения (включая `sending`), выделение, ответ, поиск (сбрасывается при закрытии), закрепы, открытая панель. Нет empty-state, loading (story `Loading` — это подзаголовок), «ничего не найдено», disabled/readonly-композера, «не отправлено».
- **Доступность (после исправлений):** частично.
  - Есть: у иконочных кнопок `aria-label`, ссылки — `<a>`, упоминания и команды — `<button>`, подтверждение удаления — `role="dialog"` с именем (через BaseModal, вне группы).
  - Нет: меню открывается только ПКМ (мышью теперь работает), без роли, стрелок, Escape и фокуса; действия сообщения скрыты до `:hover`; нет `role="log"`/`aria-live`; `div @click` без роли; закрытый слайдовер в tab-порядке.
  - Открыто: CHAT-16, CHAT-13.
- **Тесты:**
  - `BaseChat.integration.spec.ts` (33): отправка, быстрые ответы, поиск (со сбросом), закрепы, ответ, скролл к цитате (`scrollIntoView` замокан), реакции, вложения, скачивание, выделение (с сохранением черновика), меню (`fireEvent.click`), админ-действия, панель без демо-данных;
  - `ChatMessageList.spec.ts` (54): в том числе реальный клик user-event по меню и id со спецсимволами;
  - `ChatSlideover.spec.ts` (42), `ChatInput.spec.ts` (32: автокомплит, вложения + revoke), ChatHeader (7), ChatPinnedPanel (10), ChatMessage (12), ChatMessageText (5), BaseChat.spec (12), spec composables (useChatState, useChatSearch и др.);
  - закрепляет баг: тест аватара шапки (CHAT-9);
  - не покрыто: CHAT-6, CHAT-7, CHAT-12–14, IME, клавиатура, роли и live-region, несколько чатов на странице, блокировка скачивания на уровне компонента; нет spec для `useChatActions`, `useChatInputState`, `useChatMessageActions`; visual — 3 снимка с внешними картинками.
- **Storybook:**
  - 85 stories; docs-описания компонента нет;
  - argTypes: основные props плюс новый `description` (`messages`/`members`/`commands`/`pinnedMessages` скрыты), события и слот не описаны;
  - 76 play-функций, которые не могут упасть (104 `catch {}`), 6 stories несуществующих фич (CHAT-T1);
  - клавиатура — `dispatchKeyDown` без проверок;
  - тёмная тема — `DarkTheme` через обёртку `data-theme` (телепортированное меню — гипотеза, A4); у `LongContent` a11y-проверка отключена (`!a11y`);
  - недетерминизм — CHAT-T2; play в CI не запускаются.
- **Открытые проблемы:** P2 — CHAT-5, CHAT-6, CHAT-7, CHAT-9, CHAT-10, CHAT-12, CHAT-13, CHAT-14, CHAT-15, CHAT-16, CHAT-19, CHAT-T1, CHAT-T2; P3 — CHAT-20, CHAT-1r, CHAT-2r, CHAT-3r, CHAT-8r, CHAT-11r, CHAT-CC1, CHAT-CC2 (частично); гипотезы — CHAT-17, CHAT-7 (в).
- **Подкомпоненты (внутренние, открытые ID):**
  - ChatHeader — CHAT-9, CHAT-16;
  - ChatInput / ChatEmojiPicker / ChatFilePreview — CHAT-12, CHAT-13, CHAT-16, CHAT-20, CHAT-3r, гипотеза CHAT-17;
  - ChatMessageList / ChatMessage / ChatMessageText / Attachments / Reply / Reactions / ContextMenu — CHAT-5, CHAT-7, CHAT-16, CHAT-20, CHAT-8r. Зум и галерея вложений восстановлены исправлением IMG-3 (группа media);
  - ChatPinnedPanel — CHAT-6;
  - ChatSelectionToolbar — CHAT-20;
  - ChatSlideover (+ Files/Links/Media) — CHAT-10, CHAT-15, CHAT-16, CHAT-2r.

## Медиа
### BaseFileUpload

- **Назначение и зрелость:** зона выбора и drag&drop файлов со списком, превью изображений и имитацией прогресса. Оценка: **требует доработки** — прогресс и статус фиктивные, контролируемой модели нет (FU-2).
- **API:**
  - Props:
    - `accept`;
    - `isMultiple=false` — теперь соблюдается;
    - `isDisabled`;
    - `maxSize=5` (МБ, `0` отключает проверку);
    - `maxCount=10` — только в множественном режиме;
    - `label`, `buttonText`, `previewSize=64`;
    - `allowPreview=true` — на деле включает только зум превью;
    - `error`;
    - `emptyText` — не используется.
  - v-model нет.
  - Emits: `change(File[])` (весь список), `error(string)`, `remove(UploadedFile)` — теперь приходит и при замене файла в одиночном режиме.
  - Slots: `trigger`; `default` объявлен, но не рендерится.
  - Expose: `rootRef, focus, blur, validate, reset`, без типа; тип Expose не экспортирован.
- **Состояния:**
  - disabled — теперь и в логике: клик, Enter и drop игнорируются, зона вне Tab;
  - error — prop и внутренние ошибки валидации;
  - dragover;
  - статусы элемента `pending`/`uploading`/`done`, `error` недостижим;
  - loading, readonly, required и текста пустого состояния нет.
- **Доступность:** частично.
  - Сделано: зона `role="button"`, Enter/Space, `label for`, `aria-disabled` (FU-1, FU-7).
  - Открыто: ошибки и статусы не озвучиваются, имена кнопок удаления одинаковые, у прогресса только общее имя «Прогресс» (FU-6); `focus()` не работает (FU-5).
- **Тесты:**
  - Проверяют: рендер, accept/multiple, ошибки maxSize/maxCount, change после remove, имитацию прогресса. Новые тесты — Enter/Space, связь label с полем, disabled (Tab, drop, клик, Enter), замену файла в одиночном режиме.
  - Не покрыто:
    - `useFileUploadState` без spec и исключён из coverage composables; компонент — только в «heavy»-прогоне с порогом 0;
    - гонка и усечение по maxCount (FU-4), validate/reset/focus (FU-5), unmount во время чтения FileReader (FU-10), озвучивание (FU-6);
    - unit мокает `createImagePreview` как `blob:`, хотя реальная функция отдаёт `data:`;
    - e2e — 4 smoke-теста.
- **Storybook:**
  - 25 stories, docs-описания компонента нет: в argTypes нет `error`, события скрыты, слот `trigger` не описан.
  - 11 play-функций: Tab/Shift+Tab, классы ошибки и DnD, удаление, maxCount, pending, onChange. `DropWithoutData` и `ChangeNoFiles` — формальные.
  - Некорректные stories:
    - `Error` изображает ошибку CSS-классом;
    - `Hover/Active/Focus/InteractiveStates` используют несуществующие классы;
    - `Loading` — это просто disabled;
    - `Empty` меняет неиспользуемый `emptyText`.
  - Stories на Enter/Space и замену файла нет. Тёмная тема есть.
  - Недетерминизм: прогресс через `Math.random`; внешних URL нет.
- **Открытые проблемы:** FU-2 (P1), FU-13/CHAT-11 (частично), FU-4, FU-5, FU-6, FU-8, FU-10, FU-11, FU-12; гипотезы FU-9, FU-1 (побочное).
### BaseImage

- **Назначение и зрелость:** изображение с плейсхолдером, ошибкой, `fallbackSrc`, `srcset`, опциональными `<source>` AVIF/WebP и полноэкранным зумом (масштаб, поворот, миникарта, галерея). Оценка: изображение — **пригоден с оговорками** (IMG-2 снят, IMG-1 частично); зум — **требует доработки**.
- **API:**
  - Props:
    - `src` — обязательный в типе;
    - `alt`, `fallbackSrc`;
    - `timeout=5000`, `loading='lazy'`, `fit='cover'`;
    - `width/height`, `aspectRatio`, `srcWidth`;
    - `zoomConfig` — `hasZoom=false`, `closeOnOverlay`, `initialScale`, `zoomStep`, `minScale`, `maxScale`, `showMinimap`;
    - `gallery: string[]`;
    - `convertToWebp=false`, `convertToAvif=false` (новый);
    - `hasPlaceholder`, `borderRadius=12`.
  - v-model нет.
  - Emits: `load`, `error` (без Event), `zoom(scale)`.
  - Slots: `placeholder`, `error`.
  - Expose нет — открыть зум программно нельзя.
  - Экспортируются типы Props, Emits, Slots, ImageFit, ImageLoading, ImageZoomConfig. `UseImageStateOptions` (с новыми опциями) и типы галереи не экспортируются.
- **Состояния:** loading (shimmer или слот), loaded, error (слот, `fallbackSrc`), zoomable, открытый зум, галерея. Пустой `src` даёт error.
- **Доступность:** частично.
  - Сделано: `alt` прокидывается, `alt=""` поддержан; оверлей — диалог с именем, кнопки именованы (IMG-4 частично).
  - Открыто:
    - зум открывается только мышью; фокус не переводится, не удерживается и не возвращается; миниатюры — `div`; клавиши висят на `document` (IMG-4, IMG-10);
    - в состоянии ошибки теряется `alt` (IMG-11);
    - shimmer без reduced-motion.
- **Тесты:**
  - Unit: src/alt/fit, плейсхолдер, источники, load/error, слоты. Новые — таймаут lazy через управляемый IntersectionObserver, таймаут eager, opt-in AVIF/WebP, fallback без source и srcset.
  - Integration: открытие и закрытие зума, диалог и имена кнопок, зум у потребителей (чат, BaseSlider), отсутствие зума после перетаскивания слайда мышью (SLD-11).
  - `useImageZoom.spec`: масштаб, поворот, клавиши, wheel, миникарта (+`enableAutoUnmount`).
  - `imageUtils.spec`: 100% покрытия.
  - Не покрыто:
    - медленная сеть после старта загрузки, `src=undefined` (IMG-9);
    - клавиатура и фокус зума, Esc внутри модалки (IMG-10);
    - клик по фону (IMG-7), pan и touch (IMG-6) — нужен браузер;
    - useImageState, useImageGallery, useImageZoom и useZoomMinimap исключены из coverage, spec есть только у useImageZoom; e2e нет.
- **Storybook:**
  - 29 stories, docs-описания нет, события и слоты не описаны.
  - 27 play-функций, в основном синтетические `load/error/keydown`.
  - Исправлены:
    - `EscapeClosesZoom`, `IgnoredKeyInZoom`, `GalleryShrinkFallback` — keydown теперь отправляется в `document`;
    - `WebpConversion` — src с расширением и проверка srcset;
    - `LocalSrcFormats`, `LocalSrcDefaultWebp` — форматы только по явным флагам.
  - Осталось:
    - `LoadingTimeout` таймаут не проверяет;
    - хелпер `cleanZoom` удаляет DOM вручную;
    - `Local*` ссылаются на несуществующий `/images/photo.png`;
    - открытия зума с клавиатуры нет.
  - Тёмная тема есть.
  - Внешние URL: `placehold.co` почти везде, `invalid.example` в ErrorState и FallbackOnError. Visual (4 stories) зависит от сети.
  - Play-функции ничем не запускаются.
- **Открытые проблемы:** IMG-1 (P0, частично), IMG-4 (P1, частично), IMG-6, IMG-8, IMG-9, IMG-10, IMG-11, IMG-12 (частично), IMG-13, IMG-14, IMG-15, IMG-16; гипотезы IMG-7, IMG-4 (aria-modal).
### BaseAvatar

- **Назначение и зрелость:** аватар — изображение (через BaseImage), инициалы или `?`, индикатор «онлайн», слот. Оценка: **пригоден с оговорками**. Унаследованные дефекты BaseImage сняты полностью (IMG-2, IMG-5) или частично (IMG-1); собственная доступность не сделана.
- **API:**
  - Props: `src?`, `alt=''`, `name?`, `shape='circle'` (circle или square), `isOnline=false`, `variant`, `sizeScale`, `color`, `customClass`.
  - Emits: `click(MouseEvent)`.
  - Slots: `default`.
  - v-model и expose нет; типы Props, Emits, Slots экспортируются.
- **Состояния:** изображение; инициалы или `?`; ошибка src → инициалы (сбрасывается при смене `src`); онлайн. Размеров-пресетов и статусов away/busy нет.
- **Доступность:** нет.
  - Доступного имени нет: картинка с `alt=""`, инициалы читаются по буквам.
  - «Онлайн» передаётся только цветом (AVA-2).
  - Кликабельный `div` недоступен с клавиатуры (AVA-1).
- **Тесты:**
  - Unit и integration содержательные: инициалы, передача src в BaseImage, error → инициалы и сброс, shape/variant, online, click, слот.
  - Не покрыто: эмодзи и пробельные символы в имени (AVA-3), клавиатура, доступное имя, поведение в прокручиваемых списках (нужен браузер).
  - Visual — 4 stories, `with-image` зависит от сети; e2e нет.
- **Storybook:**
  - 15 stories. Описания компонента нет, у stories есть `docs.source.code`.
  - 15 play-функций: клик, тексты, количество элементов, синтетический `error`. Клавиатуры нет.
  - Тёмная тема есть. Внешние URL `placehold.co` — в 4 stories. Длинных имён и эмодзи нет.
- **Открытые проблемы:** IMG-1/AVA-4 (P0, частично: на медленной сети аватар навсегда показывает инициалы), AVA-1, AVA-2, AVA-3, AVA-4 (остаток — в C); гипотеза AVA-4 (визуальная).
### BaseIcon

- **Назначение и зрелость:** иконка `<svg><use href="{спрайт}#name">` из спрайта на 91 SVG (`build/plugins/sprite.ts` → `dist/icons.svg`). Оценка: **пригоден с оговорками** — сам компонент корректен, но спрайт у потребителя требует явной настройки (ICON-1 частично), а корень `div` внутри кнопок (ICON-3).
- **API:**
  - Props:
    - `name: string` — без union имён;
    - `color: string` — CSS-цвет;
    - `rotate=0`, `isFlipX/isFlipY`;
    - `ariaLabel=''`, `sizeScale`, `customClass` (root/svg);
    - `variant` — не используется.
  - Emits нет. Slot `default` объявлен, но не рендерится. Expose нет.
  - Плагины: `createIconPlugin({ componentName?, spritePath? })`, `createUiKitPlugin({ prefix?, iconSpritePath? })`.
  - `useIcon()` → `spritePath, getIconUrl, isIconExists, getIconNames`.
  - Экспорт `ICON_SPRITE_PATH_KEY`; подпуть пакета `@ramzes1385/rise-ui-kit/icons.svg`.
- **Состояния:** декоративная иконка или иконка с именем; поворот, отражение, цвет. Для неизвестного имени — пустое место без предупреждения (ICON-2).
- **Доступность:** ОК для самого компонента.
  - Без `ariaLabel` — `aria-hidden` и `role="presentation"`; с ним — `role="img"` и `aria-label`; `focusable="false"`.
  - Имя icon-only кнопки задаёт потребитель: у BaseButton нет пропа `ariaLabel`, только fallthrough-атрибуты (BTN-2, группа display).
  - Открыто ICON-3.
- **Тесты:**
  - `BaseIcon.spec` (useIcon замокан): `<use>`, масштаб, поворот, отражение, цвет, aria.
  - Integration: реальный useIcon и путь из `createUiKitPlugin({ iconSpritePath })`.
  - `useIcon.spec`: путь через provide; `getIconNames` на искусственном DOM (ICON-2).
  - `iconPlugin.spec`: регистрация и `spritePath`.
  - `BaseIcon.utils.spec` дублирует `iconUtils.spec`.
  - Не покрыто: резолв на вложенном маршруте (e2e), подпуть `./icons.svg` в пакете (`pack:dry`), наличие всех используемых имён в `src/icons/svg`, `generateSprite`.
- **Storybook:**
  - 9 stories, описания нет; argTypes полные, `name` — select из 24 имён.
  - 1 play-функция (`WithCustomClass`), импорт `expect` добавлен.
  - `AllIcons` показывает 24 иконки из 91.
  - Нет story про подключение спрайта и про icon-only кнопку с `aria-label`.
  - Тёмная тема есть. Недетерминизма нет, но нужен `/icons.svg` от dev-middleware. Visual — 7 stories.
- **Открытые проблемы:** ICON-1 (P0, частично), ICON-2, ICON-3, ICON-4 (частично — README-опечатка исправлена), ICON-5 (частично); гипотеза ICON-6.

---

