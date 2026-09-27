# Находки группы «Выбор значений»

Состав: BaseSelect, BaseSearch, BaseColorPicker, BaseRange, BaseSlider, BaseRating; useSearchState, useListNavigation, useColorPicker, useRangeDrag, useRangeValues, useSlider, useSwipe.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

P0 нет.

#### SEL-1 / DRP-1 · P1 · BaseSelect (BaseDropdown) — поле поиска `isSearchable` не принимает фокус и ввод
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

#### SEL-2 · P1 · BaseSelect — нет клавиатурного выбора и семантики combobox/listbox
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

#### SRCH-1 · P1 · BaseSearch (useSearchState, useListNavigation) — устаревшая подсветка даёт TypeError или выбор невидимого результата
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

#### SRCH-2 · P1 · BaseSearch — клиентская фильтрация скрывает серверные результаты; гонки ответов не обработаны
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

#### CP-1 · P1 · BaseColorPicker (useColorPicker, colorUtils) — пресет и введённый HEX эмитятся с искажением
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

#### RNG-1 · P1 · BaseRange (useRangeDrag, useRangeValues) — управление с клавиатуры не эмитит `change`
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

#### SLD-1 · P1 · BaseSlider (useSlider) — autoplay нельзя поставить на паузу (WCAG 2.2.2)
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

#### RAT-1 · P1 · BaseRating — по умолчанию клик пишет дробную оценку, игнорируя `step`
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

### A2. P2

Если в строке не указано иное, «Не исправлено» означает, что находка не входила в этап исправлений (в работу взяли 6 P1).

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| SEL-3 | BaseSelect | `BaseSelect.vue:211-215` → `useFormField.ts:26-29` | `isMultiple isRequired` и `[]` → `validate()` возвращает `true`, ошибки нет | Предложение: считать `[]` пустым в useFormField. Composable общий (forms), проверить потребителей | Не исправлено |
| SEL-4 | BaseSelect | `BaseSelect.vue:61-66` | Крестик тега — `BaseIcon` (div) без фокуса и имени, Backspace не удаляет, `div` лежит внутри `span.base-badge` → удалить тег можно только мышью | Предложение: `<button type=button aria-label="Удалить …">`, Backspace удаляет последний тег | Не исправлено |
| SEL-5 | BaseSelect | `BaseSelect.vue:1-9, 23-31, 33-37` | Корень — BaseDropdown, поэтому `aria-label`/`id`/`data-testid` уходят на `div.base-dropdown`; `<label>` без `for`; у триггера нет `aria-labelledby`/`describedby`/`invalid`/`required` → поле без имени, ошибка не озвучивается | Предложение: `inheritAttrs:false`, `$attrs` на триггер, `useId`, связать label и ошибку | Не исправлено |
| SRCH-3 | BaseSearch | `useSearchState.ts:111-118, 30-39` | После выбора или Escape `isFocused=false`, хотя фокус остаётся в поле → при дальнейшем вводе подсказки не открываются до blur/focus. Обратная сторона (из предложения к SRCH-1, по коду): в закрытом состоянии ArrowDown → Enter выбирает скрытый результат | Предложение: разделить «в фокусе» и «закрыто пользователем», сбрасывать флаг при вводе; навигация и Enter — только при открытом списке | Не исправлено |
| SRCH-4 | BaseSearch | `BaseSearchInput.vue:2-15, 25-36`; `BaseSearchResults.vue:6-12`; `BaseSearchOverlay.vue:52-62` | Нет combobox/listbox/`aria-activedescendant` и live-статуса с числом результатов; кнопки «очистить» и «закрыть» без имени (4.1.2) | Предложение: APG «combobox with listbox popup», `role=status`, `aria-label` | Не исправлено |
| SRCH-5 | BaseSearchOverlay | `BaseSearchOverlay.vue:6-17, 28-34, 151-155` | Модалка открывается по фокусу (3.2.1), не `role=dialog`, нет ловушки и возврата фокуса → Tab «проваливает» в модалку, после Esc фокус в `body` | Предложение: триггер-кнопка `aria-haspopup=dialog`, открытие по click/Enter; диалог с `useFocusTrap` (добавлен overlays) | Не исправлено |
| SRCH-6 | BaseSearchOverlay | `BaseSearchOverlay.vue:124, 142-155` | Оверлей открыт и размонтирован (навигация, `v-if`, смена `mode`) → `body` остаётся `overflow:hidden`. Общий счётчик useScrollLock (overlays, SCROLL-LOCK) не снимает блокировку при unmount — чинить нужно в компоненте, как TOUR-1 | Предложение: `onBeforeUnmount(() => isOpen.value && unlockScroll())`; unit без мока useScrollLock | Не исправлено |
| CP-2 | BaseColorPicker | `BaseColorPicker.vue:42-48`; `useColorPicker.ts:59-60`; `colorUtils.ts:17-26` | «zzz», `#ff000080`, `rgb()` молча игнорируются и остаются в поле, `aria-invalid` нет; `presets:['red']` даёт кнопку без эффекта; дубликаты пресетов — дубли key | Предложение: откат поля или ошибка, dev-warn для пресетов, опционально rgb() и #rgba | Не исправлено |
| CP-3 | BaseColorPicker | `BaseColorPicker.vue:139-150` | Второй pointerdown до pointerup → первая пара window-слушателей не снимается, движение указателя по странице меняет цвет и эмитит; pointercancel не обрабатывается | Предложение: игнорировать повторный down, `button!==0`, `!isPrimary`; `setPointerCapture`; обработать pointercancel | Не исправлено |
| CP-4 | BaseColorPicker | `BaseColorPicker.vue:22-31` | SV-область `role=slider` без tabindex, клавиатуры и `aria-valuenow`; панель телепортирована, фокус в неё не переводится и не возвращается; `aria-label` потребителя уходит на обёртку → S/V с клавиатуры не выбрать (при `isHexHidden` произвольный цвет недостижим) | Предложение: tabindex и стрелки S/V, перевод и возврат фокуса, `aria-expanded` на swatch | Не исправлено |
| RNG-2 | BaseRange (rangeUtils) | `rangeUtils.ts:13-17`; вывод в `useRangeValues.ts:20-23`, `BaseRange.vue:46` | Дробный step → `0.30000000000000004`; громкость 0..1 с шагом 0.05 → `0.6000000000000001` в v-model, подписи, тултипе и `aria-valuenow` | `rangeUtils.ts`: `snapToStep` округляет до точности step/min (`countDecimals`, `toFixed`). Тесты: `rangeUtils.spec.ts` › «округляет результат до точности шага без хвостов плавающей точки», «учитывает точность смещённого минимума» (да), «учитывает шаг в экспоненциальной записи» (страховочный); `BaseRange.integration.spec.ts` › «должен эмитить значение без хвостов плавающей точки при step=0.1», «должен показывать точное значение в подписи и aria-valuenow через v-model» (да) | Исправлено (в отчёте описано внутри RNG-1) |
| RNG-3 | BaseRange (BaseRangeThumb) | `BaseRangeThumb.vue:2-12`; `useRangeDrag.ts:106-108` | Нет: Home/End/PageUp/PageDown; `aria-valuetext` и форматтера; имени ползунков (`aria-label` уходит на корень); `aria-orientation`; `aria-disabled`. Disabled остаётся в Tab-порядке (`tabindex="0"`). `mousedown.prevent` не даёт фокус, поэтому после drag мышью стрелки не работают | Предложение: `ariaLabel`/`ariaLabels[]`, `formatValue()`, недостающие клавиши, `tabindex=-1` при disabled, фокус на pointerdown | Не исправлено |
| RNG-4 | BaseRange (useRangeDrag) | `useRangeDrag.ts:72-77, 59-64`; `BaseRange.vue:28` | touchcancel не обрабатывается → слушатели и `activeIndex` остаются, любой свайп по странице двигает ползунок и эмитит. Берётся `touches[0]`, а не касание, начавшее drag. Трек реагирует только на mousedown — на таче тап и drag по треку не работают | Предложение: touchcancel и `identifier`, либо Pointer Events + `setPointerCapture` | Не исправлено |
| SLD-2 | BaseSlider | `BaseSlider.vue:28-33, 42-47, 255-259` | mousedown сразу запускает `setInterval(goNext, 150)`, а click делает ещё шаг → клик длиной от 150 мс листает на 2 и больше | Предложение: задержка перед автоповтором 400–500 мс; подавлять click после автоповтора | Не исправлено |
| SLD-4 | BaseSlider | `BaseSlider.style.scss:78-100` | В fade/scale неактивные слайды только `opacity:0`, без `pointer-events:none` и `visibility` → клики уходят последнему невидимому слайду; controls видео, ссылки и zoom активного недоступны (подтверждено по CSS) | Предложение: `visibility:hidden` + `pointer-events:none` или `inert` для неактивных | Не исправлено |
| SLD-5 | BaseSlider | `BaseSlider.vue:2-151` | Нет region, `aria-roledescription`, имени и «N из M»; стрелки и точки без имён, нет `aria-current`; миниатюры с `alt=''` без имени; скрытые слайды в Tab-порядке | Предложение: паттерн APG Carousel (роли, имена, `inert`, live-регион) | Не исправлено — большой объём |
| SLD-6 | BaseSlider (useSlider) | `BaseSlider.vue:70-78`; `useSlider.ts:159-165` | Видео неактивного слайда продолжает играть; autoplay уходит с играющего видео | Предложение: ставить на паузу видео неактивных слайдов, останавливать autoplay на `play` | Не исправлено |
| RAT-2 | BaseRating | `BaseRating.vue:7-14, 113-122` | Нет Home/End/PageUp/PageDown и цифр, нет `aria-valuetext` («3 из 5»); readonly остаётся `role=slider` с `tabindex=-1` (нужен `role=img`); нет `aria-disabled`; disabled визуально не отличается от readonly | Предложение: доработка ARIA и стиль `--disabled` | Не исправлено |
| SLD-11 / IMG-3 (побочное, media) | BaseSlider (useSwipe, useSlider) + зум BaseImage | `useSwipe.ts:113-126` (mouseup не гасит следующий click); `BaseSlider.vue:60` (viewport, `mousedown.prevent`) | Проявилось после IMG-3 (`isZoomable` заработал): перетаскивание слайда мышью заканчивается click по `<img>` → открывается зум; так же срабатывали бы ссылки и кнопки в слайде. Была гипотезой (A4), подтверждена тестом | Координатор: `useSwipe.ts` — `onClickCapture` гасит один click после перетаскивания дальше 5 px (признак сбрасывается новым mousedown или после текущей задачи); `useSlider` пробрасывает его, `BaseSlider.vue` вешает `@click.capture` на viewport. Тесты: `useSwipe.spec.ts` › describe «onClickCapture» (6 тестов); `BaseImage.integration.spec.ts` › «перетаскивание слайда мышью не открывает зум: click после drag гасится»; падали без правки: да (временный откат) | Исправлено. P2 — по решению координатора |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| SEL-6 | BaseSelect (useSelect) | `useSelect.ts:41-53` | «touched» ставится только при закрытии кликом снаружи или Escape → ошибка required не видна до `validate()` | onBlur по `focusout` вне панели и при любом закрытии | Не исправлено |
| SEL-7 | BaseSelect | `BaseSelectDropdown.vue:18`; `BaseSelect.vue:50`; `useSelect.ts:92-96` | Дубликаты `value` → дубли key, обе опции отмечены выбранными; `remove(label)` из слота tag удаляет опцию, у которой такой value | dev-warn; удалять строго по value | Не исправлено |
| SEL-8 | BaseSelect | `BaseSelect.style.scss:44-45` | При многих значениях часть тегов скрыта `overflow:hidden`, счётчика «+N» нет, их крестики недоступны | «+N» или перенос строк | Не исправлено |
| SEL-9 | BaseSelect (README) | `README.md:277` | Пример `ref(null)` не проходит по типу modelValue (strict vue-tsc) | README исправлен: `ref<BaseSelectProps['modelValue']>()` с комментарием о допустимых значениях. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322, текущий — без ошибок) | Исправлено (README) |
| SRCH-7 | BaseSearch | `BaseSearch.vue:246-254` | `blur()`: в default находит `div.base-input` и ничего не делает; в modal/sidebar снимает фокус с любого `document.activeElement` | `blur` в expose BaseSearchInput | Не исправлено |
| SRCH-8 | BaseSearchOverlay | `BaseSearchOverlay.vue:15` | Атрибут `readonly` вместо пропа `isReadonly` падает на `div.base-input` → поле-триггер редактируемо, на мобильных всплывает клавиатура | `:is-readonly="true"` или кнопка (SRCH-5) | Не исправлено |
| SRCH-9 | BaseSearchOverlay | `BaseSearchOverlay.vue:1-98` | Два корня (div и Teleport) → в modal/sidebar `class`/`id`/`aria-*` отбрасываются с warning | `inheritAttrs:false` + `$attrs` на div | Не исправлено |
| SRCH-10 | BaseSearch, useListNavigation | `useSearchState.ts:136-141`; `useListNavigation.ts:51-55, 70-72`; `BaseSearchOverlay.vue:133` | а) внешняя смена modelValue не отменяет debounce → `search` со старым значением; б) Enter всегда вызывает `preventDefault` (форма не отправляется), `isComposing` (IME) не учитывается; в) `customClass.modalOverlay/sidebarOverlay` не применяются; г) `@click.self` закрывает модалку, если выделение текста закончилось над фоном; д) нет Home/End/PageUp/PageDown и пропуска disabled, сам composable не ограничивает индекс по `itemCount()` (защита есть только в useSearchState, см. SRCH-1) | По пунктам | Не исправлено |
| CP-5 | BaseColorPicker | `BaseColorPicker.vue:124`; `useColorPicker.ts:65-69`; `colorUtils.ts:18` | После `reset` родитель ставит `''`, а swatch, HEX и aria-label показывают прежний цвет; `null` → TypeError в computed | Явное пустое состояние, тип `string \| null` | Не исправлено |
| CP-6 | BaseColorPicker | `BaseColorPicker.vue:117-120`; `BaseEditorToolbar.vue:30, 49` | `change` эмитится на каждый pointermove и input тона; редактор применяет цвет на каждое событие (про историю правок — гипотеза, A4) | `change` только при фиксации, непрерывное изменение — отдельным событием | Не исправлено — меняет контракт `change` |
| CP-7 | BaseColorPicker | `BaseColorPicker.vue:51-58`; SCSS | `customClass.preset` не применяется; `variant`/`color` игнорируются; `sizeScale` не влияет на swatch и панель (жёсткие 32px/220px) | Применить класс, `sz()` в SCSS | Не исправлено |
| RNG-5 | BaseRange | `rangeUtils.ts`, `useRangeValues.ts` | `step=0` → NaN (осталось и после RNG-2); `min>max` → эмит 100 и `aria-valuemin > aria-valuemax`; значение вне [min, max] или NaN → `left: NaN%`; `rangeValue [80,20]` не сортируется; `points: []` → ползунков нет | Валидация, dev-warn | Не исправлено |
| RNG-6 | BaseRange | `BaseRange.vue:46`; `useRangeDrag.ts:79-90` | Тултип только по mouseenter, без focus, `role=tooltip` и `aria-describedby`, пропадает при быстром drag (= TT-1, overlays). При `[0,0]` клик правее не двигает ползунок (nearestIndex=0 упирается в соседа), при `[100,100]` верхний нельзя увести влево | Тултип по фокусу и во время drag (после TT-1); выбор ползунка с учётом направления | Не исправлено — тултип зависит от overlays |
| SLD-7 | BaseSlider (useSwipe, useSlider) | `useSwipe.ts:58-87, 90-132`; `BaseSlider.vue:60`; `useSlider.ts:97-104` | Нет touchcancel (залипают `isDragging`, `transition:none` и сдвиг трека); повторный `onDragStart` без mouseup оставляет первую пару document-слушателей; `mousedown.prevent` срабатывает на любую кнопку и не даёт фокусировать поля в слайдах; `cross` игнорируется → диагональная прокрутка на таче листает слайды | touchcancel, очистка перед новым drag, фильтр кнопки, порог по оси | Не исправлено |
| SLD-8 | BaseSlider (useSlider) | `useSlider.ts:229-233` и др. | `items=[]` → одна точка, активные стрелки, `change(0)`; 1 слайд + loop + autoplay → `change(0)` каждые 4 с; `goTo` эмитит и при том же индексе; `watch(itemCount)` сравнивает с `itemCount`, а не с `maxIndex`; при perView>1 миниатюры с индексом больше `maxIndex` не работают; `slidesPerGroup` не кратен числу слайдов → вперёд и назад обходят разные индексы; `initialIndex=NaN` → индекс NaN; без `items` → TypeError | Guards, нормализация | Не исправлено |
| SLD-9 | BaseSlider | нет `defineExpose`; `README.md:806-813` | Нет expose goTo/next/prev/pause и v-model индекса; `initialIndex` лишь псевдо-управляемый; README передаёт `{id, title}` без обязательного `src` | README исправлен: слайды `{ src, alt, title }` с комментарием «src обязателен», `has-caption`; проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322, текущий — без ошибок). Предложение по коду: expose, `v-model:index` | Частично — README исправлен; осталось: expose `goTo/next/prev/pause`, `v-model:index` |
| SLD-10 | BaseSlider (useSlider) | `useSlider.ts:134` | Drag вправо на первом слайде → `translateX(--5%)`, браузер отбрасывает значение, визуального отклика нет | `${offset - base}%` | Не исправлено |
| RAT-3 | BaseRating (ratingUtils) | `ratingUtils.ts`; `BaseRating.vue` | `step ≤ 0` → NaN; дробный `max` → предупреждение v-for; `modelValue > max` → `aria-valuenow > max` | Валидация | Не исправлено |
| PCK-1 | Stories группы | BOM в Select/Search/Range/Slider.stories.ts; `BaseSelect.stories.ts:27-29`; `BaseSearch.stories.ts:17-72, 464` | BOM и mojibake в демо-данных («80Г—60 см», «рџҐ‰») | Перекодировать | Не исправлено (по-прежнему в файлах) |
| PCK-2 | Stories: Search, Range, Select | Hover/Active/FocusState, InteractiveStates | Классы `--hover`/`--active`/`--focus` нигде не стилизованы — stories ничего не показывают | Удалить или переделать | Не исправлено |
| PCK-3 / OVL-1 (а) | Select, Search, ColorPicker, Range (тултип) | Телепорт `to="body"` в BaseDropdown и BaseTooltip | Тема на поддереве `[data-theme=dark]` не доходит до панелей и тултипов: в DarkTheme-stories они светлые, в продукте так же | `teleportTo` или наследование темы — решение за overlays | Не исправлено — зависит от overlays |

### A4. Гипотезы (не подтверждены)

- **SLD-3 · P1 · BaseSlider.** `@touchstart.prevent` на стрелках (`BaseSlider.vue:32, 46`) подавляет эмулированный click. Ожидаемое поведение: тап короче 150 мс не листает, 150–300 мс даёт один шаг, дольше — несколько. Что нужно: Playwright с `hasTouch: true` и `page.tap('.base-slider__arrow--next')` или реальное устройство.
- **RNG-7 · P3 · BaseRange.** Drag начинается любой кнопкой мыши: нет проверки `event.button` (`BaseRangeThumb.vue:10`, `useRangeDrag.ts:66-100`). Если контекстное меню «съест» mouseup, ползунок будет следовать за курсором. Что нужно: Chrome на macOS, ПКМ или ctrl-click.
- **PCK-4 · P3 · visual-тесты.** Спеки снимают stories с play-функциями (`default` у Select/Range/Slider/Rating) и Search `with-image-results` с внешними картинками. Скриншот может зависеть от стадии play и от сети. Что нужно: серия прогонов Playwright и сравнение снимков.
- **CP-3 (часть).** Drag в SV-области начинается любой кнопкой; при контекстном меню pointerup не придёт, и drag «залипнет». Что нужно: браузер.
- **CP-6 (часть).** Непрерывный `change` может давать десятки операций в истории BaseEditor за одно перетаскивание. Что нужно: BaseEditor в браузере, undo после drag.
- **SLD-6 (часть).** Перетаскивание нативного таймлайна видео одновременно тянет карусель (`mousedown.prevent` на viewport, `BaseSlider.vue:60`). Что нужно: браузер.

---

---

## Примечания к перепроверке

1. **RNG-2 не назван в отчёте исправлений.** Округление в `snapToStep` описано внутри RNG-1. Правка и тесты есть в diff, поэтому статус «Исправлено».
2. **SLD-1: отчёт — «исправлен».** Тот же отчёт признаёт «No pause button was added». Из предложения ревью (APG Carousel: управление вращением, live-регион, сброс таймера) сделана только пауза по hover/фокусу и учёт reduced motion, поэтому статус «Частично».
3. **SRCH-2: отчёт — «исправлен, без breaking change».** Вторая часть находки (гонки ответов) не решена; отчёт это признаёт. Статус «Частично».
4. **SRCH-1: отчёт — «исправлен».** Три сценария ревью подтверждены тестами. Пункты предложения «ограничивать индекс в useListNavigation» и «Enter только при открытом списке» не реализованы: при закрытом списке ArrowDown → Enter по-прежнему выбирает скрытый результат (по коду). Этот остаток отнесён к SRCH-3 и SRCH-10д, а SRCH-1 помечен «Исправлено».
5. **SEL-1 исправил агент overlays** (DRP-1, `BaseDropdown.vue`), а не агент pickers.
   - Тест pickers `BaseSelect.integration` › «поиск…» на старом коде не запускался (это отмечено в его отчёте); тесты overlays до исправления падали.
   - Побочный эффект правки (по коду): фокус из поля поиска уходит в `body` после выбора или Escape, потому что BaseDropdown не возвращает фокус (DRP-2). Закрыт правкой координатора (п. 10).
6. **Ревью пропустило, что `isZoomable` у BaseSlider на HEAD не работал.** `BaseSlider.vue:85` передавал несуществующий проп `has-zoom`, а BaseImage принимает `zoomConfig`; ревью описало проп как рабочий.
   - Исправил агент media (IMG-3): `:zoom-config="{ hasZoom: isZoomable }"`. Тест: `src/components/BaseImage/__tests__/BaseImage.integration.spec.ts` › «слайд BaseSlider с isZoomable открывает зум по клику».
   - В `BaseSlider.vue` правки двух агентов; отчёт pickers эту правку не упоминает. Побочный эффект — гипотеза SLD-11; подтверждена и исправлена (п. 10).
7. **Коллизия ID.** `SLD-1…SLD-5` в ревью overlays относятся к BaseSlideover, здесь `SLD-*` — BaseSlider. В сводном отчёте нужен префикс группы.
8. **Межгрупповые дубликаты:**
   - SEL-1 = DRP-1 (overlays);
   - PCK-3 = OVL-1 (а) (overlays прямо ссылается на PCK-3);
   - тултипная часть RNG-6 = TT-1 (overlays).
   - В счёте группы pickers каждая из них учтена один раз.
9. **Перепроверка по HEAD.** Проверены все P1 и выборочно SEL-4, SEL-7, SRCH-6…SRCH-10в, CP-4, CP-7, RNG-3, RNG-4, SLD-2, SLD-4, SLD-10, README для SEL-9/SLD-9/RAT-1, PCK-1. Неверных находок нет. Уточнение к CP-4: у SV-области уже есть `aria-valuetext` (HEX); не хватает tabindex, клавиатуры и `aria-valuenow`.
10. **Обновление статусов (координатор), 26.09.** Изменено 3 статуса:
   - SLD-11 (P2): из гипотез (A4) в подтверждённые (A2), «Исправлено». Подавление click после drag в `useSwipe` (`onClickCapture`) + `@click.capture` на viewport BaseSlider; тесты `useSwipe.spec.ts` › «onClickCapture» (6) и `BaseImage.integration.spec.ts` › «перетаскивание слайда мышью не открывает зум: click после drag гасится». В media та же находка — «IMG-3 (побочное)».
   - SEL-9 (P3): «Не исправлено» → «Исправлено (README)». Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`).
   - SLD-9 (P3): «Не исправлено» → «Частично» (README исправлен; expose и `v-model:index` нет).
   - Без смены статуса: SEL-1 остаётся «Исправлено». Его побочный эффект (фокус в `body` после выбора или Escape в поиске) закрыт частичной правкой DRP-2 в `BaseDropdown.vue`, тесты в `BaseDropdown.integration.spec.ts`. RAT-1 ссылается на README только как на воспроизведение — не менялся.
   - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометки матрицы «argTypes без …» (Search, ColorPicker, Rating) могли быть следствием сломанного docgen: теперь props подтягиваются из `__docgenInfo`. Перепроверить по сборке Storybook.
