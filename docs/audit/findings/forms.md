# Находки группы «Формы»

Состав: BaseInput, BaseTextarea, BaseCheckbox, BaseRadio, BaseSwitch, BasePin, BaseFormField, BaseForm; useInputMask, useMaskedInputHandlers, useFormField, usePasswordVisibility, useExplicitPropDetection, useDebounce.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

P0 в группе нет.

#### FRM-1 · P1 · Группа (Input, Textarea, Checkbox, Radio, Switch, Pin, FormFieldLabel) — атрибуты, id и label не доходят до нативного контрола
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

#### MSK-1 · P1 · useInputMask (BaseInput) — маски с префиксом из 2+ литералов не набираются
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

#### MSK-2 · P1 · useInputMask (BaseInput) — позиционный `stripMask` теряет символы при правке и вставке
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

#### MSK-4 · P1 · useMaskedInputHandlers (BaseInput) — Backspace/Delete удаляют не тот символ
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

#### INP-1 · P1 · BaseInput — readonly-поле с маской меняется по Backspace/Delete
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

#### RAD-1 · P1 · BaseRadio — слот `option` удалял нативный radio
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

#### FFD-1 · P1 · BaseFormField — `validate()` обязательного поля всегда ложный
- **Где:** `src/components/BaseFormField/ui/BaseFormField.vue:55-59` (`useFormField({ value: () => undefined, … isRequired })`); `src/composables/useFormField/useFormField.ts:26-30` (HEAD 9c848ae).
- **Условия:** `isRequired=true` и вызов `validate()` через ref.
- **Последствие:** `validate()` возвращает `false` и показывает «Обязательное поле» независимо от того, заполнен ли дочерний контрол.
- **Воспроизведение:** `<BaseFormField ref="f" label="Имя" is-required><BaseInput model-value="Иван" /></BaseFormField>`; `f.validate()` → `false`, появляется текст ошибки.
- **Исправление:** в `BaseFormField.vue` обёртка больше не передаёт `isRequired` в `useFormField`: теперь `validate()` равен `!error`, а `isRequired` отвечает только за звёздочку. Контракт описан в JSDoc `BaseFormField.types.ts`.
- **Проверка:** `src/components/BaseFormField/__tests__/BaseFormField.spec.ts` › «defineExpose: validate/reset» — «validate() обязательного поля без внешней ошибки возвращает true и не показывает ложную ошибку», а также «validate() возвращает false при внешней ошибке и показывает её текст» и «reset() после validate() не оставляет сообщений об ошибке». Падал до исправления: да.
- **Статус:** Исправлено. Делегирование `validate()` дочернему контролу — отдельная задача FFD-2.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| FRM-2 | Группа (Input, Textarea, Checkbox, Radio, Switch, Pin, FormField) | `BaseInput.vue:57` (единственный `aria-*` в группе); `FormFieldError.vue:2-9`; `FormFieldLabel.vue:7`; `BaseSwitch.vue:39-46`; `BaseFormField.vue:16` | error/isRequired → нет `aria-invalid`, `aria-describedby`, `required`/`aria-required`; у ошибки нет id и live-региона; `*` без `aria-hidden` входит в имя (включая часть SWT-2) → скринридер не сообщает «недопустимо», текст ошибки и обязательность, ошибка после blur не озвучивается | Не исправлялось | Не исправлено |
| FRM-3 | Input, Textarea, Checkbox, Switch, Radio, Pin | `BaseInput.vue:43` + `useMaskedInputHandlers.ts:41`; `BaseTextarea.vue:28,93`; `BaseCheckbox.vue:20,84`; `BaseSwitch.vue:22,95`; `BaseRadio.vue:46,96`; `BasePin.vue:23,97` | родитель не принял значение (фильтр, `v-model.trim`, `:model-value` без обработчика, отказ переключить) → DOM показывает не `modelValue` (`12a` при модели `12`; у чекбокса нативный checked расходится с галочкой `v-if`) | Только у readonly/disabled BaseInput DOM возвращается к модели (в рамках INP-1); общий случай не исправлялся | Не исправлено |
| FRM-4 | BaseInput (варианты default/ghost/outline/shadow/soft), BaseRadio, BaseSwitch | `_mixins.scss:86-90`; `BaseInput.style.scss:72-76,145-149` (+ `outline:none` :125); `BaseRadio.style.scss:206-212`; `BaseSwitch.style.scss:35-41,138-144` | фокус с клавиатуры → `:focus-visible` навешан на нефокусируемые div/label, кольца нет (WCAG 2.4.7); story `FocusState` и visual-эталон «focus-state» используют принудительные классы и маскируют дефект | Не исправлялось; проверка требует браузера (реальный Tab + скриншот или `boxShadow`) | Не исправлено |
| INP-2 | BaseInput | `BaseInput.types.ts:84`; `BaseInput.stories.ts:33` | `allowedChars:'digits'` + ввод `abc` → эмитится `abc`: проп объявлен, но не реализован; argType описывает его как регэксп | — | Не исправлено |
| INP-3 | BaseInput | `BaseInput.vue:168-173` | маска + внешнее значение длиннее маски или с лишними символами (`'79991234567'`, `(###) ###-##-##`) → на экране `(799) 912-34-56`, в модели 11 цифр: отправится не то, что видно | — | Не исправлено |
| INP-4 | BaseInput | `BaseInput.vue:51-59` (`tabindex="-1"` :56) | `type="password"` → кнопку показа пароля не достать с клавиатуры, нет `aria-pressed`/`aria-controls` | — | Не исправлено |
| INP-5 | BaseInput | `BaseInput.vue:78-92` | `passwordRules` → выполнение правил видно только по цвету и иконке (BaseIcon `aria-hidden`); у списка нет `aria-live` и связи через `aria-describedby` | — | Не исправлено |
| MSK-3 | useInputMask (BaseInput) | `useInputMask.ts:186,204-206` (`getMaskPosition`), `:297-299` (`cursorAfterInput`) | любой ввод с маской → `getMaskPosition` всегда возвращает `mask.length`, каретка прыгает в конец, правка в середине перекидывает курсор; `useInputMask.spec.ts:151-172` закрепляет это поведение | — | Не исправлено |
| MSK-5 | useInputMask (BaseInput) | `useInputMask.ts:235-243` | жадные токены N/A/X → Backspace удаляет первый символ (`'$N'`, `12345` → `$2345`); литералы после жадного токена не выводятся (`'N руб'` → `1500`, в `'N.##'` точку не ввести); spec `:41-54`, `:245-248` закрепляют | — | Не исправлено |
| TXA-1 | BaseTextarea | `BaseTextarea.vue:82-88` (+ двойной вызов :95-97 и :109-116) | `isAutosize` + удаление строк → высота не уменьшается: перед измерением `height` не сбрасывается, а `scrollHeight ≥ clientHeight`. Часть про рост на padding — гипотеза (A4) | — ; нужен браузерный тест (в jsdom `scrollHeight=0`, autosize-тесты формальны) | Не исправлено |
| RAD-2 | BaseRadio | `BaseRadio.vue:13-22` | группа опций → нет `role="radiogroup"`/`fieldset`, заголовок — `span` без id; у группы нет имени, обязательность и ошибка группы не передаются | — | Не исправлено |
| RAD-4 / PIN-4 / FORM-4 / INP-7 (README-части) | BaseRadio, BasePin, BaseForm, BaseInput | `README.md:324,326` (`## BaseRadio`); `:1182` (`## BasePin`); `:362-363` (`## BaseForm`) | пример скопирован из README → Radio: пропа `value` нет, обязательные `options`/`name` не переданы — ничего не рендерится; Pin: `<BasePin />` без `modelValue` → TypeError в `cells` (`BasePin.vue:75`), описание «Pin/закреплённый элемент» неверно; Form: `<BaseButton label>` (пропа нет, `type="button"`) → форма не отправляется, у `<BaseInput>` нет обязательного `modelValue`. README-части FORM-4 и INP-7 подняты с P3 до P2: это тот же класс дефекта, что RAD-4 (пример из README не работает) | README переписан: Radio — `v-model` + `options` + обязательный `name` (и пояснение); Pin — `v-model="code"`, `:length`, `@complete`, описание «ввод PIN-кода / кода подтверждения по ячейкам»; Form — `<BaseInput v-model="email">`, `<BaseButton type="submit">Отправить</BaseButton>` и абзац про `type="submit"` и блокировку. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (примеры HEAD `examples-before/12_baseradio`, `14_baseform`, `56_basepin` давали TS2322/TS2345/TS2353, текущие — без ошибок) | Исправлено (README) |
| SWT-1 | BaseSwitch | `BaseSwitch.vue:17-24` | переключатель → `input type=checkbox` без `role="switch"`, озвучивается как «флажок» | `BaseSwitch.vue`: `role="switch"` (без явного `aria-checked`). `BaseSwitch.spec.ts` › «доступность» › «должен объявляться как switch с доступным именем и включённым состоянием», «должен объявлять выключенное состояние» (падали: да); `BaseSwitch.integration.spec.ts:19,30,42,56,80` переведены на `getByRole('switch')` | Исправлено |
| PIN-1 | BasePin | `BasePin.vue:15-27` (`maxlength="1"` :20, `slice(-1)` :93) | OTP-сценарий → нет `autocomplete="one-time-code"`, `inputmode`, `pattern`; нет фильтра символов (`12ab` проходит); многосимвольный input (SMS-автозаполнение, подсказка клавиатуры) не распределяется по ячейкам | — | Не исправлено |
| PIN-2 | BasePin | `BasePin.vue:14-28` | ячейки без имён, нет `role="group"` и имени группы, ошибка не связана → скринридер слышит N безымянных полей; `aria-label` на компонент не доходит (FRM-1) | — | Не исправлено |
| PIN-3 | BasePin (+ BaseInput, BaseTextarea, BaseCheckbox, BaseRadio) | `BasePin.stories.ts:57` (meta args), `:78` (Default) и ещё 9 stories; `BaseInput.stories.ts:631,651`; `BaseTextarea.stories.ts:450,470`; `BaseCheckbox.stories.ts:378`; `BaseRadio.stories.ts:510` (stories Empty/LongContent) | `args.modelValue` + `v-model="value" … v-bind="args"` → args перетирают v-model, модель заморожена: в Pin/Default эмитится `'1'`, `' 2'`…, `complete` не приходит никогда; в Checkbox/LongContent галочка расходится с checked | — | Не исправлено |
| FFD-2 | BaseFormField | `BaseFormField.vue:13-32` (нет provide/useId) | `<BaseFormField label error>` с контролом кита → id, errorId, descriptionId, error, isRequired не передаются; без `for` id не генерируется; описание и ошибка не связаны; дочерний BaseInput не показывает ошибку поля и не получает `aria-invalid` | — | Не исправлено |
| FORM-1 | BaseForm | `BaseForm.style.scss:9-22` | `isDisabled`/`isLoading` → только `pointer-events:none`: поля фокусируемы и редактируемы с клавиатуры, AT видит их включёнными, `aria-busy` нет | `BaseForm.vue`: слот в `<fieldset :disabled="isLoading \|\| isDisabled" role="presentation">`, `aria-busy`, возврат фокуса после разблокировки; `BaseForm.style.scss`: сброс UA-стилей fieldset. `BaseForm.integration.spec.ts` › «блокировка полей» › «isDisabled должен отключать поля формы, в том числе для клавиатуры», «isLoading должен отключать поля и помечать форму как занятую» (+3 теста фокуса); падали: да | Частично — fieldset отключает только нативные элементы; в заблокированной форме с клавиатуры работают BaseSelect (триггер `div[tabindex=0]`, Enter/Space), BaseRange и BaseRating (`div role=slider tabindex=0`, стрелки), BaseEditor (`contenteditable`). Побочный эффект с раскладкой (flex/grid из `customClass.content` получал один fieldset) закрыт координатором: `.base-form__fieldset { display: contents }` (`BaseForm.style.scss`); теста в jsdom нет (раскладка), проверка: visual base-form--* (Playwright), результат позже. Ограничение и FormData описаны в README |
| FORM-2 | BaseForm | `BaseForm.vue:15-17`; `BaseForm.style.scss:31-52`; `BaseLoader.vue:6-7` | оверлей с `role="status"` и текстом «Загрузка...» всегда в DOM и скрыт только opacity → «Загрузка» читается в каждой форме, а переход в загрузку не озвучивается (содержимое региона не меняется) | Не исправлялось (BaseLoader менял другой агент: имя берётся из `label`, на FORM-2 не влияет) | Не исправлено |
| FORM-3 | BaseForm | `BaseForm.vue:44-48` | submit эмитится без проверки полей; нет реестра полей, `validate()`/`reset()` в expose и события `invalid`; `FormFieldExpose` никем не используется (пробел дизайна) | — | Не исправлено |
| DEB-1 | useDebounce | `useDebounce.ts:8-14`; `README.md:1268-1278` (`## useDebounce`) | `useDebounce(searchQuery, 300)` с Ref-источником, как в JSDoc → внутри хранится сам Ref, изменения источника не отслеживаются, `watch` не срабатывает; README передаёт в `useDebounce` функцию (это задача `useDebounceFn`) и импортирует `{ useDebounce }` из корня, где composables — только namespace | README исправлен: импорт из `@ramzes1385/rise-ui-kit/composables`, функция — через `useDebounceFn`, `useDebounce('', 300)` показан как ref с отложенной записью. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2614, текущий — без ошибок). Код и JSDoc `useDebounce.ts` не менялись | Частично — README исправлен; осталось: `useDebounce` с Ref-источником не отслеживает его изменения (код и JSDoc) |
| EPD-2 (ID присвоен в реестре; в ревью — «P2-пробел» без номера) | useExplicitPropDetection | `src/composables/useExplicitPropDetection/` (нет `*.spec.ts`) | у composable нет ни одного теста, хотя на нём держатся дефолты BaseDatePicker, DatePickerPanel, DatePickerField, BaseDropdown, BaseSideBar и BaseAnimation → регрессии (в том числе EPD-1) не ловятся | — | Не исправлено |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| INP-6 | BaseInput | `useMaskedInputHandlers.ts:13-20,53,58` | `mask` + `type="number"`/`"email"` → `setSelectionRange` бросает InvalidStateError в rAF, `selectionStart === null`, Backspace всегда выходит; `type=number` обнуляет значение с литералами | — | Не исправлено |
| INP-7 | BaseInput (+ вся группа) | `BaseInput.vue:184-193`; `index.ts` всех компонентов группы; `useFormField.types.ts:24-42` | при числовом `modelValue` эмитится строка (нужен `v-model.number`, в документации не указано); `rootRef` отдаёт input вопреки контракту `FormFieldExpose` («корневой элемент»); тип Expose не экспортирован ни у одного компонента группы; `FormFieldExpose`/`FormFieldValidateExpose` не применяются в `defineExpose`. README-часть — в строке RAD-4 | — | Не исправлено |
| TXA-2 | BaseTextarea (+ BaseRadio, BasePin) | `BaseTextarea.types.ts:47`; `BaseRadio.types.ts:45`; `BasePin.types.ts:35` | объявленный слот `default` не рендерится ни у одного из трёх; у Textarea нет класса readonly и эмита `keydown` — API группы неоднороден | — | Не исправлено |
| CHK-1 | BaseCheckbox | `BaseCheckbox.types.ts` (props) | нет `indeterminate` (нужен для «выбрать все»), массивного v-model/`value` и `isRequired`: `validate()` всегда true без внешней ошибки | — | Не исправлено |
| RAD-3 | BaseRadio | `BaseRadio.vue:29` и др. | дубликаты `value` дают дубликаты `key`; нет `name` по умолчанию через `useId`, поэтому два экземпляра с одним name сливаются в одну нативную группу; `focus()` ставит фокус на первую, а не выбранную опцию; нет `isDisabled` у группы; blur не отмечает поле touched | — | Не исправлено |
| UFF-2 / SWT-2 | useFormField, BaseSwitch | `useFormField.ts:26-30,52-54` | required считает пустыми только `null`/`undefined`/`''`: строка из пробелов проходит; `false` у BaseSwitch не считается пустым, поэтому `isRequired` свитча декоративен и `validate()` всегда true. Часть SWT-2 про `*` в имени — в FRM-2 | — | Не исправлено |
| PIN-4 | BasePin | `BasePin.vue:75,137-139` | paste пустого или пробельного буфера стирает код; после paste фокус не переходит; служебные пробелы уходят наружу (`'1 34'`); `modelValue` null/undefined → TypeError в `cells`; `validate()` всегда true. README-часть — в RAD-4, гипотеза про maxlength — в A4 | — | Не исправлено |
| FFD-3 | BaseFormField | `BaseFormField.vue:28-32`; `BaseAnimation.vue:3-13`; `BaseFormField.style.scss:35-41` | Transition висит на всегда присутствующем div → появление ошибки не анимируется, пустой div даёт лишний gap 6px; `--ghost` ставит `opacity:0.8` на всё поле вместе с input, страдает контраст | — | Не исправлено |
| FORM-4 | BaseForm | `BaseForm.style.scss:78-80` | тёмный оверлей задан только через `:root[data-theme='dark']` и не работает, если тема выставлена на контейнере; нет `prefers-reduced-motion` для blur/scale-переходов. README-часть — в RAD-4 | — | Не исправлено |
| UFF-1 | useFormField | `useFormField.ts:10-16` | `initialValue` фиксируется в setup → асинхронная загрузка сразу помечает поле dirty; возврат к исходному значению dirty не снимает, `reset()` базу не переустанавливает; `isDirty` не экспонирует ни один компонент | — | Не исправлено |
| PWD-1 | usePasswordVisibility | `usePasswordVisibility.ts:9-16` | password → text → password после переключения видимости → пароль сразу показан открытым: состояние не сбрасывается при смене `type` | — | Не исправлено |
| EPD-1 | useExplicitPropDetection | `useExplicitPropDetection.ts:11` | снимок `vnode.props` фиксируется в setup → если набор ключей в `v-bind="obj"` меняется после mount, `wasPropPassed` отвечает по старому снимку (`isReadonly:false` у BaseDatePicker резолвится в `true`); так же затронуты BaseSideBar (`isCollapsedControlled`) и BaseDropdown | — | Не исправлено |
| DEB-2 | useDebounce / useDebounceFn | `useDebounce.ts:33-35,66-68` | вызов вне setup компонента → безусловный `onBeforeUnmount` без инстанса даёт warning; нет `cancel`/`flush` и throttle | — | Не исправлено |

### A4. Гипотезы (не подтверждены)
- **TXA-1 (часть 2) — autosize растёт на padding, поле шире контейнера.** У `.base-textarea__field` заданы `width:100%` + padding + border (`BaseTextarea.style.scss:42-45`) без `box-sizing`, глобального reset нет. При content-box каждый вызов `adjustHeight` прибавляет вертикальный padding, а вызовов два на нажатие (`BaseTextarea.vue:95-97` и `:109-116`). Поле при этом шире контейнера на 30px.
  - Проверка: Playwright — 5 символов в одной строке → высота стабильна; 10 строк → рост; удаление → возврат ±1px; ширина ≤ контейнера. Результат зависит от CSS приложения.
- **MSK-6 — IME и Android.**
  - `handleInput` перезаписывает `target.value` посреди композиции, а `preventDefault` на Backspace рвёт её. Страдают маски `@`/`A`/`X`.
  - На Android keydown приходит с `key='Unidentified'`, поэтому удаление литерала через input не срабатывает.
  - Проверка: браузер (CDP `Input.imeSetComposition`) и реальное Android-устройство.
- **PIN-4 (часть) — заполненную ячейку нельзя перезаписать.** После перехода стрелками ввод в заполненную ячейку блокируется `maxlength="1"`: программный `focus()` не выделяет текст.
  - Проверка: реальный браузер. Если подтвердится — `select()` на focus.

---

---

## Примечания к перепроверке
1. **MSK-1 — «маски с префиксом набираются посимвольно» (отчёт, черновике раздела «Изменения поведения» README).**
   - Это верно, кроме одного случая: при пустом поле первая цифра, совпадающая с цифрой-литералом префикса, поглощается `stripMask`. `8 (###)…` + ввод `8` → поле пустое: не набрать 8-800 и 812; `+7 (###)…` + ввод `7` → то же.
   - Найдено трассировкой кода (`useInputMask.ts:137-141` HEAD), тестом не покрыто. Поэтому статус «Частично», а не «Исправлено».
   - Обновление: итоговый README описывает это ограничение («Изменения поведения», BaseInput с маской), расхождения с README больше нет. Код прежний, статус «Частично».
2. **FORM-1 — «исправлен без breaking change» (отчёт) / «поля блокируются через fieldset disabled» (черновике раздела «Изменения поведения» README).**
   - (а) `fieldset[disabled]` отключает только нативные элементы формы. BaseSelect (`div[tabindex=0]`, Enter/Space), BaseRange и BaseRating (`div role=slider tabindex=0`, стрелки), BaseEditor (`contenteditable`) внутри заблокированной формы по-прежнему управляются с клавиатуры. Отсюда статус «Частично».
   - (б) Побочные эффекты (подтверждаются кодом и спецификацией HTML). Если FormData собирается после выставления `isLoading` — например, после `await` в обработчике submit, — поля в него не попадают. `form.elements` теперь содержит fieldset. Контент слота лежит внутри fieldset, и единственным потомком `.base-form__content` стал fieldset: селекторы `.base-form__content > *` и flex/grid-раскладка, заданная через `customClass.content`, теперь работают иначе. Первые два пункта в отчёте названы, третий — нет.
   - (в) Visual-эталоны `base-form` loading/disabled не перепроверены — агент сам это отметил.
   - Обновление: раскладку координатор закрыл `display: contents` у fieldset (E6). Селекторы вида `.base-form__content > *` по-прежнему попадают на fieldset, потому что `display: contents` не меняет DOM. README теперь описывает и блокировку только нативных полей, и потерю данных в FormData.
3. **EPD-1 (ревью) — список потребителей неполон.** Ревью называет только BaseAnimation и BaseDatePicker. На HEAD composable используют также DatePickerPanel, DatePickerField, BaseDropdown (`closeOnEscape`, `preventMousedown`) и BaseSideBar. В BaseSideBar `isCollapsedControlled` — `computed` без реактивных зависимостей, поэтому режим controlled фиксируется при mount. Влияние EPD-1 шире, но приоритет не меняю: нужен редкий сценарий со сменой набора ключей `v-bind`.
4. **FRM-1 (ревью) — дополнение.** Дефект проявляется внутри самого кита: `ChatHeader.vue:35` передаёт `aria-label` в BaseInput, атрибут оседает на `div`. Кроме того, `DatePickerField.vue:15` и `ChatInput.vue:136-137` полагаются на fallthrough `@click`/`@keyup` на корень — это нужно учесть в шаге 3 миграции.
5. **Не расхождение, для полноты:** в первом отчёте `BaseInput.spec` 61/1. Падение вызвано старым раннером (`vi.resetModules`); в отчёте исправлений на настоящем Vitest тест проходит. К коду отношения не имеет.

Остальное совпадает: все 6 заявленных исправлений (FFD-1, RAD-1, INP-1, SWT-1, MSK-1, FORM-1) видны в `git diff HEAD`, названные в отчёте тесты есть в diff, правки существующих тестов и stories (`BaseSwitch.integration.spec.ts:19,30,42,56,80`, три play в `BaseRadio.stories.ts`) совпадают с описанием.

6. **Обновление статусов (координатор), 26.09.** Изменено 2 статуса:
   - RAD-4 / PIN-4 / FORM-4 / INP-7 (README-части, P2): «Не исправлено» → «Исправлено (README)». Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`). Кодовые части PIN-4, FORM-4, INP-7 (P3) не менялись.
   - DEB-1 (P2): «Не исправлено» → «Частично» (README исправлен, `useDebounce.ts` и JSDoc — нет).
   - Без смены статуса: FORM-1 остаётся «Частично». Побочный эффект с раскладкой закрыт (`.base-form__fieldset { display: contents }`); проверка — visual base-form--* в Playwright, результат позже. Кастомные контролы внутри заблокированной формы по-прежнему не блокируются.
   - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометки матрицы «в argTypes нет …» (BaseFormField — `for`) надо перепроверить по сборке Storybook: теперь props подтягиваются из `__docgenInfo`.
