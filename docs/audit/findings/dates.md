# Находки группы «Даты»

Состав: BaseCalendar, BaseDatePicker; useCalendar и связанные composables, dateUtils.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

P0 нет.

#### CAL-2 · P1 · BaseCalendar — в 12h неверный AM/PM, ввод часов сдвигает дату
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

#### DP-1 · P1 · BaseDatePicker — регресс 1.2.2: календарные настройки не доходят до BaseCalendar
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

#### DP-2 · P1 · BaseDatePicker — нет клавиатурного доступа и паттерна APG Date Picker Dialog
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

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| CAL-1 | BaseCalendar | `BaseCalendarDays.vue:19,27-33`; `BaseCalendar.vue:20-27,36-43`; `BaseCalendarTime.vue:4,13,23` | Работа с клавиатуры или скринридером. Скринридер слышит «15, кнопка» без месяца и состояния, по сетке нельзя перемещаться стрелками. `role="grid"` без row/gridcell (внутри лежат номера недель и popover). У дня нет полной даты в имени, `aria-selected`, `aria-current`. Нет стрелок, PageUp/PageDown, Home/End и roving tabindex — 42+ остановки по Tab. У nav-кнопок нет имени, у полей времени — label. Popover без роли, Escape его не закрывает. Смена месяца не объявляется через aria-live | Кнопки навигации получили имена по виду (`navLabels` в `BaseCalendar.vue`; ключи `UI_ARIA.PREV_YEARS/NEXT_YEARS`). Тест `BaseCalendar.integration.spec.ts` на реальных BaseButton/BaseIcon: «в виде дней кнопки-иконки называются «Предыдущий месяц» / «Следующий месяц»», «в видах месяцев и лет имя отражает шаг навигации» (падали: да) | Частично — сделаны только имена nav-кнопок. Остальное — большой объём, нужны браузер и axe |
| CAL-3 | BaseCalendar (BaseCalendarTime) | `BaseCalendarTime.vue:4-30,71,79,86`; `dateUtils.ts:36-45` | Часы 99, 24 (ArrowUp на 23) или −1, минуты 75 → `buildDateWithTime` переносит лишнее на соседние сутки. 99 ч сдвигают дату на +4 дня | `parseTimeField` ограничивает ввод: часы 0–23 (1–12 в 12h), минуты и секунды 0–59; NaN не эмитится. Тесты в `BaseCalendar.time.integration.spec.ts`: «часы больше 23 ограничиваются 23 и не сдвигают дату», «минуты больше 59 ограничиваются 59 и не сдвигают час», «час больше 12 ограничивается 12 и не сдвигает дату» (падали: да) | Исправлено. Тестами не покрыты секунды и отрицательные значения. Атрибуты min/max/step не добавлены; семантика spinbutton отнесена к CAL-1 |
| CAL-4 | useCalendar | `useCalendar.ts:42-48` | Задан `initialMonth` (DatePickerPanel передаёт его всегда) → часы, минуты и секунды не берутся из modelValue. Поля показывают 0:0, клик по дню эмитит 00:00 — время значения теряется | В `useCalendar.ts` время синхронизируется всегда, `initialMonth` влияет только на месяц. Тесты: `useCalendar.spec.ts` › «должен брать время из modelValue и при заданном initialMonth, не меняя отображаемый месяц»; `BaseDatePicker.calendar.integration.spec.ts` › «showTime: показывает блок времени и сохраняет время значения при выборе другого дня» (падали: да) | Исправлено |
| CAL-5 | BaseCalendar (useCalendarInteraction) | `useCalendarInteraction.ts:113-119`; `BaseCalendar.vue:122-130` (у кнопки нет проверки ограничений) | Нажатие «Сегодня». В range получается start=сегодня > end, подсветка диапазона пропадает, в DatePicker поле показывает «25.09 — 05.06». В multiple эмитится `update:modelValue` вместо `selectedDates`. Сегодняшний день выбирается, даже если он вне min/max или попадает в `disabledWeekdays`. Эмитится текущее время вместо 00:00 или времени из полей | — | Не исправлено — вне задания этапа исправлений. После DP-1 в одномесячной панели DatePicker эта кнопка — единственный способ выбрать дату вне minDate/maxDate |
| CAL-6 | BaseCalendar | `BaseCalendar.types.ts:41,125,174,176`; `useCalendarResolvedProps.ts:21` | Prop `events`, слоты `event`/`navigation` и поле `CalendarHighlight.cssClass` объявлены, argTypes рекламирует `events` → всё переданное молча игнорируется | — | Не исправлено — удаление ломает совместимость, реализация — новая функциональность |
| CAL-12 | BaseCalendar (stories, visual) | `BaseCalendar.stories.ts`: `:14-16` и `ref(new Date())` в WithTime, Time12Hour, FullFeatured, ToggleAmPm, ChangeTime; argTypes с точками `:79-134`; mojibake «В·», «В±» `:304,544,746`; BOM. Baseline: `tests/visual-snapshots/…/base-calendar-*-visual-chromium.png` | Stories зависят от текущей даты, а baseline снят в июне 2026 → `test:visual` для Default, Range, Multiple, Dark расходится каждый месяц, подсветка today — каждый день. Контролы `timeConfig.*` и `constraints.*` ни на что не влияют | — | Не исправлено — нужна пересъёмка visual-baseline, а на этапе исправлений она запрещена |
| DP-3 / DU-1 | BaseDatePicker, dateUtils | `DatePickerField.vue:3-15`; `BaseDatePicker.types.ts:22`; `BaseDatePicker.vue:72`; `dateUtils.ts:59,118-138` | При `isReadonly=false` введённый текст не разбирается и не сохраняется: поле показывает ввод, модель остаётся прежней, «31.02.2025» не отклоняется. `dateFormat` и `DATE_FORMATS` игнорируются, формат всегда берётся из locale (для en-US — 06/10/2025) | — | Не исправлено — нужна новая функциональность (парсер, коммит или откат, учёт min/max) и решение о смысле `dateFormat` |
| DP-4 | BaseDatePicker (useDatePickerPanelNavigation) | `useDatePickerPanelNavigation.ts:25-38`; `DatePickerPanel.vue:125-134,180`; `useDropdownPosition.ts:51,90,180-181` | Watch-геттер читает весь `resolvedProps`, включая `panelStyle`, который пересоздаётся при каждом scroll и resize, и каждый раз возвращает новый массив. Поэтому вид открытой панели возвращается к месяцу значения: при scroll и resize, после каждого клика в multiple, после клика по началу диапазона во втором месяце multi-month. Мульти-выбор по нескольким месяцам практически не работает | — | Не исправлено — вне задания |
| DP-5 | BaseDatePicker (useDatePickerState) | `useDatePickerState.ts:56-62,80-83,120`; `BaseDatePicker.vue:88-92` | (a) Внешний сброс в `undefined` не очищает поле: остаётся старый innerValue. (b) `validate()` и required смотрят только на `modelValue`: в multiple и uncontrolled всегда «Обязательное поле», конец range не проверяется. (c) `isReadonly` (по умолчанию `true`) не блокирует открытие и выбор | — | Не исправлено. Для (c) придётся разделить смысл `isReadonly`, у которого дефолт `true`, — это ломает совместимость. Пункт (a) закреплён тестом `BaseDatePicker.spec.ts` › «игнорирует watch modelValue, когда новое значение undefined» |
| DP-6 | BaseDatePicker | `BaseDatePicker.vue:2` (нет `inheritAttrs: false`) | `id`, `name`, `aria-*`, `autocomplete` попадают на `div.base-date-picker` → внешние `<label for>` и `aria-describedby` не работают | — | Не исправлено — нужен проброс атрибутов на `<input>` через BaseInput (forms/FRM-1) |
| DP-9 | BaseDatePicker (stories) | `BaseDatePicker.stories.ts:495,978,1003` | Stories Interactive, ExternalEndUpdate и ExternalSelectedUpdate используют в шаблоне `UI_TEXT`, но не возвращают его из setup → TypeError при рендере | `UI_TEXT` добавлен в return из setup всех трёх stories. Проверено smoke-spec вне репозитория (рабочие заметки аудита); по отчёту он падал до исправления | Частично — правка есть, но регрессионного теста в репозитории нет: stories не входят в vitest, play-функции в CI не запускаются |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| CAL-7 | useCalendar, useCalendarInteraction | `useCalendarDateState.ts:37-41`; `useCalendarInteraction.ts:67-88` | Внешний диапазон с началом позже конца ничего не подсвечивает. Диапазон может проходить через disabled-даты. Клик в режиме range не применяет время, а `handleTimeChange` меняет только начало. После DP-1 блок времени появился и в range-панели DatePicker, поэтому дефект теперь виден пользователю | — | Не исправлено |
| CAL-8 | useCalendar (useCalendarViewNavigation), BaseCalendarMonths | `useCalendarViewNavigation.ts:12-38,50-52,66-68`; `BaseCalendarMonths.vue:10`; `BaseCalendar.vue:99` | canPrev/canNext считаются только для вида days → в видах months и years можно уйти за min/max и выбрать месяц, в котором все дни disabled. Описание story WithMinMaxDates («навигация блокируется») неверно | — | Не исправлено |
| CAL-9 | BaseCalendarDays, useCalendarInteraction | `BaseCalendarDays.vue:93-98`; `useCalendarInteraction.ts:40` | `mousedown` в фазе capture закрывает popover раньше, чем `click` его переключает → повторный клик по дню открывает popover снова. Escape его не закрывает | — | Не исправлено |
| CAL-10 | BaseCalendar, useCalendarResolvedProps | `useCalendarResolvedProps.ts:23`; `constants/ui.ts:12,136`; `useCalendarGrid.ts:93-97` | `firstDayOfWeek=1` при любой locale. «Сегодня» и «Событие» выводятся по-русски даже при en-US. Номер недели всегда ISO, даже при `firstDayOfWeek=0` | — | Не исправлено |
| DP-8 | BaseDatePicker | prop `variant`; `DatePickerPanel.vue:138-152`; `useDatePickerPanelNavigation.ts:18`; `useDatePickerState.ts:186-200`; `useExplicitPropDetection.ts:11` | Набор мелочей: `variant` не используется; ключи `customClass` панели, кроме `root`, не применяются; `monthsCount: "2"` превращается в 1; ResizeObserver создаётся, только если `isMultiMonth` был при mount; `wasPropPassed` читает снимок первого рендера (то же, что forms/EPD-1); z-index 1000, как у BaseModal (то же, что overlays/OVL-2); клик по иконке не закрывает панель; `reset()` не очищает значение | — | Не исправлено |
| DU-2 | dateUtils | `dateUtils.ts:164` | `formatMultiple` пишет «Выбрано: N дат» по-русски при любой locale и с неверным склонением («4 дат», «21 дат»), даты не сортирует. `formatRange(null, end)` возвращает « — 15.06.2025», «...» зашито в код | — | Не исправлено |
| DU-3 | dateUtils | хелперов нет | Компоненты эмитят локальную полночь → у потребителя `JSON.stringify`/`toISOString` дают предыдущий день в зонах UTC+ (Москва: `2025-06-09T21:00:00.000Z` для 10.06) | — | Не исправлено |

### A4. Гипотезы (не подтверждены)

- **DP-7 · P2 — панель вылезает за свои границы.**
  - Почему подозреваем: `maxHeight: 320px` (`useDatePickerState.ts:52` → `constants/ui.ts:71`), а календарь по baseline около 380 px плюс шапка около 65 px. В одиночном режиме `flex-direction: column; flex-wrap: wrap` без overflow (`DatePickerPanel.style.scss:16-19`). Позиция всегда bottom-start, без flip.
  - После DP-1 в панели появились блок времени и номера недель, так что высота только выросла.
  - Нужно: скриншот открытой панели (story Default с showTime, окно 800×600, поле у нижнего края).
- **CAL-11 · P3 — строковые даты.**
  - Механизм подтверждён скриптом (dates-check, п. 1): `'YYYY-MM-DD'` разбирается как UTC (`useCalendar.ts:40,56,64`; `useCalendarDateState.ts:64,72,75,78,81,97,103`). В America/New_York `disabledDates: ['2025-06-10']` отключает 9 июня, а `minDate: '2025-06-10'` не блокирует 9-е.
  - Гипотеза в том, передают ли потребители строки: типы их запрещают.
  - Нужно: решение о контракте для JS/JSON-входа и unit-тест с зафиксированным TZ.
- **CAL-1, часть про axe.**
  - Ожидаются нарушения `aria-required-children` (critical) и `button-name`; axe не запускался. После исправления у nav-кнопок имена есть.
  - Нужно: прогон axe в Storybook или браузере.
- **Play-функции stories ChangeTime12Hour и ChangeTime12HourPM (без ID).**
  - По симуляции (`time-typing.out.txt`) на HEAD они должны падать. После CAL-2 тот же сценарий (clear → type → change) проходит в `BaseCalendar.time.integration.spec.ts` › «ввод часа сохраняет половину суток (PM) и дату», так что гипотеза, скорее всего, неактуальна.
  - Нужно: запустить play-функции в браузере.
- **argTypes BaseDatePicker с `control: 'date'` (без ID).**
  - Контрол отдаёт число-timestamp, а `formatDate` вызывает `date.toLocaleDateString`. Без v-model это, вероятно, TypeError.
  - Нужно: проверить в Storybook.

---

---

## Примечания к перепроверке

1. **DP-9.** В отчёте агента stories «исправлены» и есть тест. Но тест — smoke-spec вне репозитория (рабочие заметки аудита), в `git diff HEAD` его нет. Поэтому статус «Частично».
2. **Источник отчёта.** отчёт этапа исправлений пустой (0 байт), статусы взяты из блока 18:14 в отчёт этапа исправлений и сверены с diff. Остальное в отчёте совпадает с кодом: список файлов, имена тестов, число тестов в таблице прогонов (9/26/9/10/15/43/11/39/6/5/90/41).
3. **Возврат фокуса после выбора мышью.** Отчёт («Изменения поведения») и `черновик раздела «Изменения поведения» README:19` утверждают, что фокус возвращается в поле и после выбора мышью. Тестами это не проверено: тесты покрывают только клавиатуру и Escape. `close()` возвращает фокус, только если активный элемент был внутри панели, так что результат зависит от браузера — например, Safari на macOS не фокусирует кнопку по клику. Это гипотеза, нужна проверка в браузере. Обновление: итоговый README обещает возврат фокуса только после выбора с клавиатуры и по Escape, расхождения с README больше нет. Поведение при выборе мышью — по-прежнему гипотеза.
4. **CAL-3.** В отчёте сказано «заодно CAL-3 для минут и секунд», но ограничение диапазона добавлено и для часов. Тестами покрыты часы (99, а также 13 в режиме 12h) и минуты (75); секунды и отрицательные значения — нет. Атрибуты min/max/step из предложенного в ревью исправления не добавлены.
5. **E-1 — новое при перепроверке** (вне ревью; найдено чтением кода, тестами не проверялось). После DP-1 каждый календарь панели получает одинаковый `timeConfig`: `v-for` с общим `calendarBindings` в `DatePickerPanel.vue` и `DatePickerRangePanel.vue`. Поэтому при `isMultiMonth` + `showTime` блок времени рисуется под каждым месяцем — N копий правят одно значение, а в range они меняют только начало (CAL-7). В «ожидаемых визуальных изменениях» отчёта это не упомянуто. Нужны скриншот и дизайн-решение. Исправлено координатором (п. 8).
6. **Гипотеза ревью о play ChangeTime12Hour/PM** относилась к коду HEAD. После CAL-2 тот же сценарий проходит в integration-тесте (см. A4).
7. **Неверных находок ревью** при перепроверке не нашлось. DP-4, DP-5, DP-6, DP-8, CAL-5…CAL-10 и DU-2/DU-3 подтверждаются текущим кодом: соответствующие места не менялись.
8. **Обновление статусов (координатор), 26.09.** Изменён 1 статус:
   - E-1 (побочный эффект DP-1, в A не заводился): «Не исправлено» → «Исправлено». Хелпер `withoutTimeBlock` (`BaseDatePickerCalendar.types.ts`); `DatePickerPanel.vue` и `DatePickerRangePanel.vue` передают `index === 0 ? calendarBindings : secondaryCalendarBindings`, то есть блок времени получает только первый календарь. Тесты: `DatePickerPanel.spec.ts` › «при нескольких месяцах блок времени получает только первый календарь», `DatePickerRangePanel.spec.ts` › «блок времени получает только первый календарь диапазона»; без правки падали (временный откат). Строка C удалена, в B пометка «Новое: E-1» снята. README («Изменения поведения») это описывает. Оставшийся в range дефект времени — CAL-7.
   - README-находок в группе нет. Сверено, что README не противоречит реестру (п. 3). Пример BaseDatePicker в README тоже исправлен: на HEAD `ref(null)` давал TS2322 в vue-tsc strictTemplates (`run2.log`), но в реестр он не заводился.
   - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометка матрицы «в argTypes нет …» (BaseDatePicker) могла быть следствием сломанного docgen. Перепроверить по сборке Storybook.
