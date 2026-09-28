# Rise UI KIT

`@ramzes1385/rise-ui-kit` — UI-kit библиотека компонентов для Vue 3.

Библиотека содержит готовые переиспользуемые компоненты интерфейса, composables, utils, иконки, глобальные стили и Vue plugin для быстрой интеграции в приложение.

Пакет подходит для использования в Vue 3 проектах, дизайн-системах, админ-панелях, личных кабинетах, внутренних корпоративных интерфейсах и frontend-шаблонах.

---

## Возможности

- Vue 3 компоненты;
- TypeScript типизация;
- готовый npm package;
- поддержка глобальной регистрации компонентов через plugin;
- поддержка прямого импорта компонентов;
- готовые стили библиотеки на дизайн-токенах `--rise-*`: светлая и тёмная тема, перекраска бренда, скругления и плотность без правок стилей;
- composables для повторного использования логики;
- utils для работы с датами, файлами, цветами, таблицами и навигацией;
- набор базовых компонентов для построения сложных интерфейсов;
- Storybook/dev-окружение для разработки компонентов;
- unit/integration тесты;
- автоматический release через `semantic-release`;
- npm publish через CI/CD.

---

## Изменения путей импорта (с 1.2.2)

Мажорного релиза 2.0.0 не было: изменения ниже вошли в линейку 1.x (версия 1.2.2), публичный API не удалялся.

- **`createIconPlugin` перенесён в `src/plugins/iconPlugin/`** (ранее — внутри `useIcon`). Каноничный путь — `@ramzes1385/rise-ui-kit/plugins` (или namespace `plugins` из корня: `import { plugins } from '@ramzes1385/rise-ui-kit'`); импорт из `@ramzes1385/rise-ui-kit/composables` сохранён для обратной совместимости.
- **Subpath-экспорты `./components`, `./composables`, `./utils`, `./icons`, `./plugins` теперь разрешаются корректно** (ранее `dist/` содержал только `index.js`, и subpath-импорты указывали на несуществующие файлы). Главный импорт `@ramzes1385/rise-ui-kit` работает без изменений.
- Внутренние изменения без влияния на публичный API: добавлены константы `UI_SIZE.GAP`, `UI_SIZE.PADDING`, `UI_FONT_WEIGHT.REGULAR`, `UI_TIMING.TOUR_FOCUS_DURATION`, `UI_TIMING.SLIDER_AUTOPLAY_INTERVAL` (из пакета не экспортируются); stories и компоненты приведены к единому контракту `defineExpose<...>` / `defineSlots<...>`; литералы текстов заменены на `UI_TEXT.*`.

---

## Изменения поведения (не выпущено)

**Редизайн.** Все компоненты переведены на дизайн-токены `--rise-*` и новый визуальный язык в духе Nuxt UI: нейтральная палитра, тонкие рамки, контролы высотой 32px, фокус-кольцо, тёмная тема на тех же токенах. Публичный API не менялся, но изменились визуальные значения по умолчанию (например, отступы `BaseButton` — 5px 10px вместо 10px 20px, `BaseCard` — 16px 20px вместо 24px 48px) и часть внутренней разметки. Что заметит приложение — [docs/design/CHANGES_FOR_APPS.md](docs/design/CHANGES_FOR_APPS.md); изменения по компонентам — [docs/design/VISUAL_CHANGES.md](docs/design/VISUAL_CHANGES.md); правила дизайн-системы — [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md).

Исправления по итогам аудита. Публичный API не удалялся, новые props и опции необязательны; ниже — то, что может заметить приложение.

**Безопасность**

- `BaseEditor` очищает HTML по умолчанию (проп `sanitize`, функция `sanitizeHtml`): при показе `v-model`, вставке из буфера и перетаскивании, выходе из режима кода и в `update:modelValue`. Разметка вне списка разрешённых элементов, атрибутов и CSS-свойств удаляется. Кнопка «Ссылка» не вставляет адреса с небезопасной схемой (`javascript:`, `data:`), а адрес без схемы (`example.com`) дополняет до `https://`.
- `BaseSideBar`: пункт со строковым `to` небезопасной схемы показывается кнопкой без `href`, в консоль — предупреждение.
- Новые утилиты: `sanitizeHtml`, `escapeHtml`, `normalizeLinkUrl`.

**Уведомления и окна из кода**

- Новый `BaseApp` — корень приложения: показывает уведомления `useToast()` и окна `useOverlay()` / `useConfirm()` (см. [«BaseApp: уведомления и окна из кода»](#baseapp-уведомления-и-окна-из-кода)). Новый компонент `BaseConfirm` — окно подтверждения с `role="alertdialog"`.
- `BaseNotification`: автозакрытие останавливается, пока указатель над уведомлениями или фокус внутри, и продолжается с остатка времени (WCAG 2.2.1). Новые props `isPersistent` (без автозакрытия), `actions` (кнопки вроде «Отменить»), `items` (управляемый список) и событие `remove(id)`. `add()` возвращает id; уведомление из `add()` без своего `duration` берёт `duration` компонента; длительность больше 2³¹−1 мс ограничивается этим значением.
- `BaseModal`: props `dialogRole` (`dialog` или `alertdialog`) и `ariaDescribedby`, событие `after-leave` после анимации закрытия.

**Тема, настройки и ссылки**

- Тема «как в системе»: `data-theme="system"` включает тёмные токены при `prefers-color-scheme: dark`. `useColorMode()` переключает светлую, тёмную и системную тему и запоминает выбор; `BaseColorModeButton` — кнопка тёмной темы для шапки.
- `createUiKitPlugin` принимает `defaults` (значения props по умолчанию для всех компонентов или для одного), `icons` (замена иконок кита своими) и `linkComponent` (RouterLink, NuxtLink). Компоненты с вариантами оформления теперь объявляют `variant: 'default'` по умолчанию — вид не меняется, но вариант можно задать через `defaults`.
- Новый `BaseLink`: маршрут (`to`) или внешний адрес (`href`), небезопасные схемы не попадают в `href`, для `target="_blank"` — `rel="noopener noreferrer"` и подсказка для скринридера.
- `BaseBreadcrumbs`: крошки — настоящие ссылки (RouterLink приложения или `<a href>`), а не кнопки; крошка без адреса — кнопка с `item-click`. Новые `linkComponent` и `target` у крошки.
- `BaseSideBar`: без пропа `linkComponent` берёт компонент из плагина или RouterLink подключённого vue-router; внешний адрес в `to` (`https://…`) открывается обычной ссылкой.

**Языки**

- Строки интерфейса кита — в словарях `ru` (по умолчанию) и `en`. Язык задают `createUiKitPlugin({ locale })`, `<BaseApp locale>` или `setLocale()`; `useLocale()` возвращает язык и форматирование по его правилам. Свой язык — `defineLocale(en, { … })`.
- Константы `UI_TEXT`, `UI_ARIA`, `UI_CHAT_TEXT` и другие со строками возвращают строку текущего языка, а шаблоны перерисовываются при его смене.
- Календарь и выбор даты берут формат дат и первый день недели из языка кита (по-русски — как раньше), если не заданы `locale` и `firstDayOfWeek`.
- Числа — через `Intl`: размер файла по-русски с запятой (`1,5 КБ`), большие номера страниц с разделителем разрядов. Множественное число по правилам языка: «3 участника», «Выбрано: 4 даты».

**Слои оверлеев**

- Escape и клик снаружи получает только верхний открытый слой: из окна с открытым списком первое нажатие Escape закрывает список, второе — окно; клик в панели вложенного списка не закрывает внешнюю. Нажатия, для которых элемент вызвал `preventDefault()`, и Escape при вводе через IME не обрабатываются.
- Порядок наложения — порядок открытия: окно, открытое из меню, — над меню, список в окне — над окном. z-index задают токены `--rise-z-overlay`, `--rise-z-toast`, `--rise-z-tooltip`, `--rise-z-max`; подсказка теперь 3000 (было 9999).
- Выпадающие панели у края окна открываются с противоположной стороны и сдвигаются внутрь окна.
- Контейнер слоёв — `createUiKitPlugin({ teleportTo })` и `<BaseApp teleport-to>`. Панели, подсказки и контекстные меню берут `data-theme` блока, из которого открыты.
- Подробности и что сделать приложению — [docs/v2/MIGRATION.md](docs/v2/MIGRATION.md), раздел «Слои оверлеев».

**Меню и подсказки**

- Новые компоненты: `BaseDropdownMenu` (меню у кнопки по APG: флажки, переключатели, подменю, поиск по буквам), `BaseContextMenu` (меню по правому клику, клавише «Меню» и Shift+F10), `BasePopconfirm` (вопрос у кнопки).
- `BaseTooltip`: элемент описан подсказкой (`aria-describedby`), на подсказку можно навести указатель, у края окна она переворачивается и сдвигается, пустой `text` не показывается. Обёртка — `span` вместо `div`.
- `BasePopover`: кнопке ставятся `aria-haspopup`, `aria-expanded` и `aria-controls`, панель — диалог с именем кнопки; закрытие повторным кликом эмитит `close`.
- `BaseMegaMenu`: листья с `to` или `href` — ссылки (`BaseLink`): RouterLink приложения или `<a href>`.
- Окна, панели и подсказки монтируют телепорт после приложения (`defer`): контейнер слоёв может стоять в том же шаблоне, что и меню.
- Подробности — [docs/v2/MIGRATION.md](docs/v2/MIGRATION.md), раздел «Меню и тултипы».

**Выбор и дерево**

- `BaseSelect`: закрытое поле открывается буквой и сразу подсвечивает опцию по началу подписи (повтор буквы — следующая опция, пробел во время поиска — часть слова); Home/End открывают список на первой и последней опции. В поле с поиском (`isSearchable`) буквы вводятся в поле.
- `BaseSearch`: поле — `role="combobox"` со списком результатов `role="listbox"` (`aria-expanded`, `aria-controls`, `aria-activedescendant` подсвеченного результата); число найденного объявляется через `role="status"` («Найдено 3 результата»).
- `BaseTree` по образцу APG Tree View: корень — `role="tree"` (имя — новый проп `ariaLabel`), узлы — `treeitem` с `aria-level`, `aria-setsize`, `aria-posinset`, `aria-expanded`; выбор — `aria-selected` (single) или `aria-checked` (multiple). В порядке Tab один узел; по дереву — стрелки, Home/End, `*` (раскрыть соседей), буквы (поиск по началу подписи), Enter и пробел. Ветки раскрываются с клавиатуры и в режимах выбора.
- `BaseTree`: флажок в режиме `multiple` — только вид (`inert`): не получает фокус и не объявляется отдельно, клик по нему — клик по узлу.
- `BaseTree`: узел с `to` или `href` — ссылка `BaseLink` (у узла новое поле `target`). Клик по подписи и Enter переходят по ней, в режиме `single` узел становится выбранным; раскрытие не меняется.
- Подробности — [docs/v2/MIGRATION.md](docs/v2/MIGRATION.md), раздел «Выбор и дерево».

**Формы**

- `BaseFormField` передаёт контролу кита внутри (BaseInput, BaseTextarea, BaseSelect, BaseCheckboxGroup) свой id, описание, ошибку и обязательность: подпись обёртки — имя поля (`for` не нужен), описание или ошибка — его `aria-describedby`, ошибка обёртки красит поле. Новый проп `name` — ошибка из проверки `BaseForm` по схеме.
- `BaseInput`, `BaseTextarea`: новые `ariaLabel` (имя без видимой подписи) и `inputAttrs` (`name`, `autocomplete`, `inputmode`, `aria-*`, `data-*`, свой `id` — на нативное поле). Звёздочка обязательного поля скрыта от скринридера — обязательность объявляет `aria-required`.
- `BaseForm`: `schema` (Standard Schema — Zod, Valibot, ArkType) и `state` — проверка перед `submit`, событие `invalid`, фокус на первом поле с ошибкой, `validate()` и `reset()` через ref; `submit` получает данные вторым аргументом. Отключённая или отправляемая форма блокирует и кастомные контролы кита (BaseSelect, BaseRange, BaseRating, BaseFileUpload, BaseEditor).
- `BaseCheckbox`: частичный выбор `isIndeterminate`. Новый компонент `BaseCheckboxGroup` — группа флажков с массивом в `v-model` и флажком «Выбрать все».
- Подробности — [docs/v2/MIGRATION.md](docs/v2/MIGRATION.md), раздел «Формы».

**Новые поля**

- `BaseKbd`, `BaseTimeline`, `BaseAvatarGroup`, `BaseUser`, `BaseButtonGroup`, `BaseSplitButton`, `BaseToolbar` (APG Toolbar), `BaseFab`, `BaseInplace` — отображение и действия (порция 2.2).
- `BaseLayout`, `BaseHeader`, `BaseFooter`, `BaseContainer` — каркас страницы со ссылкой «Перейти к содержимому»; `BaseSplitter` (APG Window Splitter), `BaseScrollArea`, `BaseDrawer`, `BaseBackTop`, `BaseInfiniteScroll` — каркас и прокрутка (порция 2.3).
- `BaseVirtualList` — список на тысячи строк (в DOM только видимые) и composable `useVirtualList`; виртуальная прокрутка в `BaseTable` (`isVirtual`, `rowHeight`) и `BaseTree` (`isVirtual`, `height`, `itemSize`) — порция 2.4.
- `BaseInputNumber` — число с кнопками −/+ по образцу APG Spinbutton; `BaseAutocomplete` — поле с подсказками (APG Combobox), свой вариант и загрузка с сервера; `BaseTimePicker` — время из списка с шагом или набором «930» → 09:30; `BaseInputTags` — поле тегов; `BaseSegmented` — переключатель сегментами на нативных radio. Все подключаются к `BaseFormField` и `BaseForm`.

**Медиа**

- `BaseMediaPlayer` — видеоплеер со своей панелью поверх `<video>`: перемотка с загруженными отрезками, время, звук и громкость, полноэкранный режим, горячие клавиши в любой раскладке, ошибка с «Повторить», отказ автозапуска (порция 4.1). Компонент экспериментальный: до выхода 2.0 в него добавятся меню скорости и качества, аудио, субтитры, а API может меняться. Позже плеер выйдет отдельным входом пакета.

**Доступность и клавиатура**

- `BaseModal`, `BaseSlideover`: `role="dialog"`, `aria-modal` (кроме режимов `isContained` / `container`), `aria-labelledby` на заголовок; при открытии фокус переходит внутрь (`[autofocus]` → первый фокусируемый → контейнер), Tab/Shift+Tab не выходят из окна, при закрытии фокус возвращается на прежний элемент. Новый composable `useFocusTrap`.
- `BaseTabs`: в порядке Tab только выбранная вкладка; стрелки, Home/End; выбор следует за фокусом — `update:modelValue`/`change` приходят при каждом переходе стрелками.
- `BaseAccordion`: заголовок — `role="button"` с `aria-expanded`/`aria-controls`, Enter/Space; закрытая панель получает `inert`.
- `BaseMenu`: пункты — `role="button"`, активируются Enter/Space.
- `BaseBreadcrumbs`: корень — `<nav aria-label="Хлебные крошки">`.
- `BasePagination`: `aria-current="page"` у текущей страницы, имена у стрелок; при `variant="default"` неактивные номера рисуются вариантом `soft` (визуальное изменение); при `modelValue > totalPages` или `total=0` кнопки блокируются корректно.
- `BaseSwitch`: `role="switch"` (раньше объявлялся как checkbox).
- `BaseButton`: при `isLoading` — `aria-busy` и `aria-disabled` вместо нативного `disabled`: кнопка остаётся в фокусе, а клик/Enter не эмитят `click`, не отправляют форму и не всплывают к обработчикам предков (как с нативным `disabled`).
- `BaseAlert`: `role="alert"` только для error/warning, для info/success — `role="status"`; у кнопки закрытия есть имя.
- `BaseNotification`: контейнер — регион с именем; error — `role="alert"`, остальные — `role="status"`.
- `BaseLoader`: доступное имя берётся из `label`. `BaseProgress`: новый проп `ariaLabel`, в неопределённом режиме нет `aria-valuenow`, некорректный `max` не даёт «NaN». `BaseSeparator`: `role="separator"` в обеих ориентациях, подпись связана через `aria-labelledby`.
- `BaseFileUpload`: зона загрузки — кнопка (Enter/Space), подпись связана с полем; при `isDisabled` зона вне порядка Tab и не принимает drop.
- `BaseTable`: сортируемые заголовки — кнопки с `aria-sort`, сортировка с клавиатуры. `BaseTree`: элементы свёрнутых веток не достижимы по Tab (клавиатура дерева — в разделе «Выбор и дерево»).
- `BaseDatePicker`: Enter/↓ в поле открывают календарь с фокусом на выбранной дате; после выбора даты с клавиатуры и по Escape фокус возвращается в поле; у кнопок есть имена. `BaseCalendar`: имена у кнопок навигации.
- `BaseImageZoom`: оверлей — модальный диалог, у кнопок управления есть имена.

**Поведение**

- `BaseInput`: курсор после маски и фильтра `allowedChars` ставится сразу, а не в следующем кадре: при быстром вводе он больше не переносится назад (раньше «12ab34» с фильтром цифр могло дать «1243»).
- Оверлеи с блокировкой прокрутки (Modal, Slideover, Tour, зум изображения, оверлей `BaseSearch` в режимах `modal`/`sidebar`) используют общий счётчик: закрытие одного слоя не разблокирует страницу, пока открыт другой.
- `BaseNotification`: `duration: 0` и некорректные значения заменяются значением по умолчанию (3000 мс); раньше уведомление исчезало почти сразу.
- `BaseImage`: `<source>` AVIF/WebP добавляются только при явных `convertToAvif`/`convertToWebp` (новый проп `convertToAvif`, по умолчанию `false`); раньше AVIF и WebP запрашивались для любого локального src. Таймаут загрузки `loading="lazy"` отсчитывается с момента попадания в зону видимости.
- Иконки: путь к спрайту задаётся `createUiKitPlugin({ iconSpritePath })` или `createIconPlugin({ spritePath })`; спрайт доступен как подпуть пакета `@ramzes1385/rise-ui-kit/icons.svg`.
- `BaseForm`: во время `isLoading`/`isDisabled` поля блокируются через `<fieldset disabled>` (раскладка контента не меняется — у fieldset `display: contents`), после разблокировки фокус возвращается на прежнее поле. Кастомные контролы кита (`BaseSelect`, `BaseRange`, `BaseRating`, `BaseFileUpload`, `BaseEditor`) блокируются вместе с формой через её контекст (раздел «Формы»). Заблокированные поля не попадают в FormData: если данные собираются после выставления `isLoading` (например, после `await`), соберите FormData до перевода формы в loading.
- `BaseFormField`: `validate()` больше не сообщает ложное «Обязательное поле» — обязательность проверяет сам контрол/форма, `isRequired` отвечает за звёздочку.
- `BaseRadio`: слот `option` заменяет только подпись — нативный input и кружок рендерятся всегда.
- `BaseInput` с маской: в readonly/disabled поле Backspace/Delete ничего не удаляют; маски с несколькими литералами в начале (`+7 (`) набираются посимвольно. Известное ограничение осталось: если первая набранная цифра совпадает с цифрой префикса маски (`+7 (###)…` и ввод «7», `8 (###)…` и ввод «8»), она поглощается префиксом.
- `BaseRating`: клик всегда привязывается к `step` (раньше при `isHoverSmooth` сохранялось дробное значение вроде 2.65).
- `BaseColorPicker`: в модель уходит точный HEX пресета/ввода (раньше искажался при пересчёте через HSV).
- `BaseRange`: управление с клавиатуры эмитит `change`; шаг 0.1 не даёт хвостов плавающей точки.
- `BaseSearch`: новый проп `isRemote` — результаты с сервера показываются без клиентской фильтрации; подсветка сбрасывается при изменении списка.
- `BaseSlider`: автопрокрутка останавливается при наведении и фокусе внутри, отключается при `prefers-reduced-motion`. С `isZoomable` клик по слайду открывает зум (раньше проп не работал), а перетаскивание слайда мышью зум не открывает.
- `BaseDropdown`: клик в поле ввода внутри выпадающего списка оставляет фокус в поле (поиск в `BaseSelect` работает мышью); при закрытии (Escape, выбор опции) фокус из поля ввода панели возвращается на триггер (например, на поле `BaseSelect`), а не теряется на body.
- `BaseTable`: пустые и нераспознанные значения при сортировке всегда в конце, числовые строки сравниваются как числа; даты в колонках `sortType: 'date'` распознаются как ISO 8601-строки, объекты `Date` и числовые timestamp, а строки вида ДД.ММ.ГГГГ датами не считаются (сортируются как нераспознанные, после корректных); «Выбрать все» при поиске работает по найденным строкам; `columns-change` отдаёт копии колонок, изменения `isHidden`/`width` из props применяются после монтирования.
- `BaseDatePicker`: настройки `minDate`/`maxDate`/`disabledWeekdays`/`showTime`/`showWeekNumber` снова доходят до календаря (регрессия 1.2.2); при нескольких месяцах (`isMultiMonth`) и `showTime` блок времени показывается один раз — под первым месяцем. `BaseCalendar`: AM/PM считается из часов, ввод времени ограничен диапазоном; `v-model:is-am` при PM-значении эмитит `update:isAm` при монтировании.
- `BaseEditor`: автоконвертация набранной разметки ограничена парой простых inline-тегов без атрибутов (`<b>`, `<i>`, `<u>`, `<s>`, `<code>` …), остальное остаётся текстом; в `isReadonly` меню медиа не открывается.
- `BaseChat`: из панели «Информация» убраны демо-данные (описание, телефон, e-mail) — описание передаётся новым пропом `description`; при закрытии поиска запрос сбрасывается; черновик и вложения сохраняются при входе в режим выделения.
- `BaseFileUpload`: в одиночном режиме новый файл заменяет выбранный (раньше накапливались).
- Навигация по ссылкам (`openExternalUrl`, переходы компонентов через `navigateAndEmit`) и `downloadFile` блокируют опасные схемы URL (`javascript:`, `vbscript:`, `data:` для навигации и т. п.) с предупреждением в консоли. Новые утилиты: `isSafeUrl`, `NAVIGATION_PROTOCOLS`, `DOWNLOAD_PROTOCOLS`.
- `utils` больше не содержит вспомогательные функции Storybook (`storybookUtils`): они импортировали `storybook/test`, которого нет в зависимостях пакета.

---

## Стек

Основной стек проекта:

```txt
Vue 3
TypeScript
Vite
SCSS
Vitest
Storybook
ESLint
Prettier
Stylelint
Husky
Commitlint
semantic-release
```

Дополнительно используются:

```txt
Vite library mode
vue-tsc
Conventional Commits
GitHub Actions
npm Trusted Publisher / NPM_TOKEN
```

---

## Установка

```bash
npm install @ramzes1385/rise-ui-kit
```

или:

```bash
yarn add @ramzes1385/rise-ui-kit
```

или:

```bash
pnpm add @ramzes1385/rise-ui-kit
```

---

## Подключение стилей

Стили библиотеки нужно подключить один раз в точке входа приложения.

Например, в `main.ts`:

```ts
import '@ramzes1385/rise-ui-kit/styles'
```

Тот же файл доступен как `@ramzes1385/rise-ui-kit/styles.css`.

### Шрифты

Дизайн-токены `--rise-font-sans` и `--rise-font-mono` ссылаются на `Inter Variable` и `JetBrains Mono Variable`, но `dist/styles.css` не содержит `@font-face` — файлы шрифтов подключает приложение. Пакеты `@fontsource-variable/inter` и `@fontsource-variable/jetbrains-mono` устанавливаются вместе с библиотекой (они в `dependencies`):

```ts
// main.ts
import '@fontsource-variable/inter/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
```

Это те же файлы, что и при `import '@fontsource-variable/inter'`; явный путь к `.css` нужен TypeScript 6, где `noUncheckedSideEffectImports` включён по умолчанию: импорт без расширения даёт ошибку TS2882, а `*.css` покрывается объявлениями `vite/client`.

Без этих импортов браузер берёт запасные шрифты из токенов (`system-ui`, `Segoe UI`, `Roboto`, `Arial`; для моноширинного — `ui-monospace`, `Menlo`, `Consolas` и т. п.), то есть системный шрифт. `styles.css` также не задаёт шрифт для `body`, `button` и полей ввода: чтобы весь интерфейс использовал шрифт библиотеки, добавьте в стили приложения `body, button, input, textarea, select { font-family: var(--rise-font-sans); }`.

### Дизайн-система и темы

Внешний вид задают CSS-переменные `--rise-*` из `dist/styles.css`: палитры, семантические цвета (фон, текст, рамки, роли primary/success/info/warning/error), радиусы, тени, шрифты и размеры контролов. Полный список и правила — [docs/design/DESIGN_SYSTEM.md](docs/design/DESIGN_SYSTEM.md), живые примеры — Storybook, раздел **Foundations**.

```css
/* Тёмная тема — атрибутом на <html> или на любом контейнере; data-theme="light" возвращает светлую внутри тёмной */
/* <html data-theme="dark"> */

:root {
  /* Бренд: палитра primary (оттенки 50…950). Семантические токены обеих тем пересчитаются сами */
  --rise-color-primary-400: #a78bfa;
  --rise-color-primary-700: #6d28d9;
  --rise-color-primary-800: #5b21b6;
  /* …остальные оттенки */

  --rise-radius: 6px;            /* база скруглений: 0 — строгий интерфейс, 8px — мягкий */
  --rise-control-padding-y: 7px; /* плотность: контролы 36px вместо 32px */
}
```

- **Тема «как в системе»** — `data-theme="system"`: тёмная при `prefers-color-scheme: dark`. Переключать тему из кода — `useColorMode()` (`mode`: `light`, `dark`, `system`; выбор сохраняется в localStorage), кнопка для шапки — `BaseColorModeButton`. Чтобы тема из localStorage применялась до загрузки скриптов, добавьте в `<head>`: `<script>document.documentElement.dataset.theme = localStorage.getItem('rise-color-mode') || 'system'</script>`.
- **Размер компонента** — проп `sizeScale` (проценты): 75 / 87.5 / 100 / 112.5 / 125 ≈ xs / sm / md / lg / xl, контролы 24–40px. Кнопка, поле, селект и переключатели одного `sizeScale` одной высоты.
- **Цвет одного компонента** — проп `color` (`{ bg: { base, hover, active, focus }, text: { … } }`). Вложенные в него компоненты этот цвет не наследуют.
- **Слои** — токены `--rise-z-overlay` (1000: окна, боковые панели, тур, поиск на весь экран, выпадающие панели, календарь, контекстные меню — сверх токена добавляется место слоя в порядке открытия), `--rise-z-toast` (2000: уведомления), `--rise-z-tooltip` (3000: подсказки), `--rise-z-max` (9999: просмотр изображения). Если у приложения свои слои (липкая шапка с `z-index: 1000` и т. п.), переопределите токены в `:root` (см. «Слои»).
- **Контраст.** Пары «текст/фон» токенов проходят WCAG 2.2 AA в обеих темах — `npm run test:contrast`, отчёт [docs/design/contrast.md](docs/design/contrast.md).
- **Переменные 1.x** (`--color-accent`, `--color-text-muted`, `--border-radius-base`…) оставлены алиасами новых токенов для CSS приложения, но компоненты их больше не читают: перекрашивайте через `--rise-*`. Алиасы будут удалены в 2.0.

---

## Быстрый старт

### Подключение через Vue plugin

Этот способ удобен, если нужно зарегистрировать компоненты глобально.

```ts
import { createApp } from 'vue'
import App from './App.vue'

import { createUiKitPlugin } from '@ramzes1385/rise-ui-kit'
import '@ramzes1385/rise-ui-kit/styles'

const app = createApp(App)

// iconSpritePath — абсолютный путь к SVG-спрайту иконок (см. раздел «Иконки»)
app.use(createUiKitPlugin({ iconSpritePath: '/icons.svg' }))

app.mount('#app')
```

Опции `createUiKitPlugin`:

- `prefix` — префикс глобальных имён (`prefix: 'Ui'` → `UiBaseButton`);
- `iconSpritePath` — путь к спрайту иконок;
- `defaults` — значения props по умолчанию: `global` — для всех компонентов, по имени — для одного. Переопределяются props со значением по умолчанию в компоненте (строки, числа, логические значения); props из шаблона важнее;
- `icons` — замена иконок кита: имя символа в спрайте, полный адрес символа или компонент с `<svg>`;
- `linkComponent` — компонент ссылок на маршруты (RouterLink, NuxtLink). Без него компоненты берут RouterLink, если подключён vue-router, иначе рендерят `<a href>`;
- `locale` — язык строк кита: `ru` (по умолчанию), `en` или свой словарь (см. «Языки»);
- `teleportTo` — куда телепортировать окна, выпадающие панели, тултипы и уведомления: CSS-селектор или элемент, по умолчанию `body` (см. «Слои»).

```ts
import { RouterLink } from 'vue-router'
import CloseIcon from './icons/CloseIcon.vue'

app.use(
	createUiKitPlugin({
		iconSpritePath: '/icons.svg',
		defaults: { global: { sizeScale: 90 }, BaseButton: { variant: 'soft' }, BaseModal: { closeOnOverlay: false } },
		icons: { close: CloseIcon, 'chevron-down': 'arrow-down' },
		linkComponent: RouterLink,
		locale: 'en',
	}),
)
```

### Языки

Строки интерфейса кита (подписи кнопок, доступные имена, «Нет данных», формат дат и чисел) есть на русском и английском. Язык один на страницу: его задают `createUiKitPlugin({ locale: 'en' })`, `<BaseApp locale="en">` или `setLocale('en')` — компоненты перерисовываются сразу.

```ts
import { defineLocale, en, setLocale, useLocale } from '@ramzes1385/rise-ui-kit'

// Свой язык или правки поверх готового словаря
setLocale(defineLocale(en, { code: 'en-GB', intl: 'en-GB', firstDayOfWeek: 1, text: { EMPTY: 'Nothing here yet' } }))

// Формат по правилам текущего языка
const { locale, formatNumber, formatDate, plural } = useLocale()
plural({ one: '{n} file', other: '{n} files' }, 3) // '3 files'
```

Календарь и выбор даты берут из языка формат дат и первый день недели, если не заданы пропсы `locale` и `firstDayOfWeek`. Строки из props (`placeholder`, `label`) приложение переводит само.

После этого компоненты можно использовать в шаблонах без локального импорта, если они зарегистрированы plugin API. Типы глобальных компонентов пакет не объявляет (`GlobalComponents`), поэтому props в шаблоне проверяются только при прямом импорте.

```vue
<template>
	<BaseButton>Сохранить</BaseButton>
</template>
```

---

### BaseApp: уведомления и окна из кода

Оберните приложение в `BaseApp` один раз — обычно в корневом `App.vue`. Он не добавляет разметки: рендерит слот и поверх страницы — уведомления и окна, которые вызывают из кода.

```vue
<!-- App.vue -->
<script setup lang="ts">
import { BaseApp } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseApp :toaster="{ position: 'bottom-right', max: 3 }">
		<RouterView />
	</BaseApp>
</template>
```

В любом компоненте внутри:

```ts
import { useConfirm, useOverlay, useToast } from '@ramzes1385/rise-ui-kit'

const toast = useToast()
const confirm = useConfirm()
const overlay = useOverlay()

// Уведомление; с тем же id — заменяет показанное
const id = toast.add({ title: 'Готовим отчёт…', isPersistent: true })
toast.update(id, { type: 'success', title: 'Отчёт готов', isPersistent: false })
toast.add({ title: 'Комментарий удалён', actions: [{ label: 'Вернуть', onClick: restore }] })

// Подтверждение: true — подтвердили, false — отменили (кнопкой, Escape, кликом по фону)
if (await confirm({ title: 'Удалить проект?', description: 'Это необратимо.', confirmLabel: 'Удалить', isDanger: true })) {
	await api.deleteProject(projectId)
}

// Своё окно: компонент получает props и isOpen, результат передаёт в emit('close', value)
const rename = overlay.create(RenameProjectModal)
const newName = await rename.open({ name: project.name })
```

- `toaster` — настройки уведомлений: `position`, `duration` (3000 мс), `max` (5 одновременно, старые закрываются), `variant`, `sizeScale`.
- Окно для `useOverlay()` закрывается событием `close` (с результатом) или `update:isOpen` (без результата); если компонент шлёт оба, `close` должен идти первым. После анимации (`after-leave`) окно удаляется из DOM.
- Вызовы вне дерева `BaseApp` (в сторе, роутере, обработчике запросов) идут в последний смонтированный `BaseApp`. Без `BaseApp` вызов пишет предупреждение в консоль и ничего не показывает; `confirm()` при этом отвечает `false`.

### Слои: окна, панели и подсказки

Окна, боковые панели, выпадающие списки, меню и подсказки — слои. Кит ведёт их общий стек в порядке открытия:

- **Escape и клик снаружи получает только верхний слой.** Из окна с открытым списком первое нажатие Escape закрывает список, второе — окно. Клик в панели вложенного списка (фильтр в поповере, выбор в окне) не закрывает внешний слой, хотя обе панели телепортированы в body.
- **Свой обработчик Escape** внутри слоя вызывает `event.preventDefault()` — тогда слои это нажатие не трогают: поле с собственной отменой по Escape не закроет окно.
- **Свои всплывающие элементы** подключаются к стеку через `useEscapeKey` и `useClickOutside` (или `useLayer`) из `@ramzes1385/rise-ui-kit/composables`, место в порядке наложения даёт `useLayerIndex` — см. раздел «Composables».
- **Край окна.** Выпадающие панели (`BaseDropdown`, `BaseDropdownMenu`, `BaseContextMenu`, `BaseSelect`, `BasePopover`, `BasePopconfirm`, `BaseSearch`, `BaseDatePicker`) и подсказки `BaseTooltip` открываются с противоположной стороны, если на выбранной не хватает места, а вдоль края окна сдвигаются, оставляя 8px.
- **Тема.** Панель, открытая из блока с `data-theme`, берёт тему этого блока, а не страницы: тёмный плеер на светлой странице получает тёмное меню. Так работают выпадающие панели, подсказки, календарь и контекстные меню редактора и чата.
- **Контейнер слоёв.** По умолчанию слои телепортируются в `body`. Свой контейнер задают `createUiKitPlugin({ teleportTo: '#layers' })` или `<BaseApp teleport-to="#layers">` (он важнее плагина для компонентов внутри); контейнер может стоять в том же шаблоне, что и меню. Это нужно, например, в полноэкранном режиме: панели в `body` не видны поверх элемента, развёрнутого через Fullscreen API. У контейнера не должно быть `transform`, `filter` и `contain` — панели позиционируются через `position: fixed`.
- **Порядок наложения — порядок открытия.** Окно, открытое из меню, — над меню; список в окне — над окном; тур, запущенный из окна, — над окном. z-index такого слоя — `--rise-z-overlay` плюс его место среди открытых (`--rise-layer-index`), поэтому порядок компонентов в DOM не важен. Уведомления, подсказки и просмотр изображения всегда выше — у них свои токены (см. «Дизайн-система и темы»).

```vue
<!-- Плеер: при переходе в полноэкранный режим меню и подсказки должны оставаться видимыми -->
<template>
	<div ref="playerRef" class="player">
		<video … />
		<div id="player-layers" />
	</div>
</template>
```

```ts
app.use(createUiKitPlugin({ teleportTo: '#player-layers' }))
```

---

### Прямой импорт компонентов

Этот способ предпочтителен, если нужно контролировать используемые компоненты явно.

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton>Сохранить</BaseButton>
</template>
```

---

## Публичный API

Компоненты и их типы импортируются из корня пакета. Composables, utils и icons из корня экспортируются только как namespace (`composables`, `utils`, `icons`) — либо импортируйте их из подпутей пакета:

```ts
import { BaseButton, BaseInput, BaseModal, BaseTable, composables, utils } from '@ramzes1385/rise-ui-kit'
import { useDebounceFn } from '@ramzes1385/rise-ui-kit/composables'
import { formatFileSize } from '@ramzes1385/rise-ui-kit/utils'

import '@ramzes1385/rise-ui-kit/styles'

const size = utils.formatFileSize(1024) // то же, что formatFileSize(1024)
```

Исключение — сервисы всего приложения: `useToast`, `useOverlay`, `useConfirm`, `useColorMode`, `useLocale`, а также `setLocale`, `defineLocale` и словари `ru`, `en` импортируются из корня пакета по имени, как компоненты.

Подпути из `package.json#exports`: `/components`, `/composables`, `/utils`, `/icons` (константы спрайта и `createIconPlugin`), `/styles` (`/styles.css`), `/icons.svg`.

Не рекомендуется импортировать внутренние файлы из `dist` напрямую:

```ts
// Не использовать
import BaseButton from '@ramzes1385/rise-ui-kit/dist/components/BaseButton/BaseButton.vue'
```

Правильно:

```ts
import { BaseButton } from '@ramzes1385/rise-ui-kit'
```

---

## Структура пакета

```txt
src/
  components/      # UI-компоненты: index.ts, ui/, types/, model/, styles/, stories/, __tests__/
  composables/     # Vue composables: useX.ts, types/, __tests__/
  icons/           # SVG-иконки, спрайт и createIconPlugin
  locales/         # словари ru и en
  stories/         # вводная страница и Foundations в Storybook, хелперы stories
  styles/          # глобальные стили и токены
  utils/           # утилиты
  plugin/          # Vue-плагин createUiKitPlugin
  index.ts         # главный публичный API

Типы лежат в `types/` своей папки, тесты — в `__tests__`; тесты пакета целиком (границы входов, плагин, структура) — в `build/tests/`.

build/
  config/          # общие части Vite-конфигов: алиасы, SCSS, сборка библиотеки
  plugins/         # Vite-плагины: Vue, SVG, спрайт иконок
  utils/           # вспомогательные функции сборки
  lib/             # сборка npm-библиотеки
  storybook/       # конфигурация Storybook
  tests/           # Vitest, Playwright
  husky/           # git-хуки
  release/         # semantic-release
  commitlint/      # правила сообщений коммитов

dist/              # результат сборки библиотеки
```

---

# Компоненты

Ниже приведён список основных компонентов библиотеки.

---

## BaseButton

Базовая кнопка.

Подходит для действий, форм, тулбаров, модальных окон и карточек.

Текст кнопки передаётся в слот по умолчанию (иконки — в слоты `left` / `right`). По умолчанию `type="button"`; кнопке отправки формы нужен `type="submit"`. `is-loading` показывает индикатор и подавляет клики.

### Пример

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton>Сохранить</BaseButton>

	<BaseButton variant="ghost">Отмена</BaseButton>

	<BaseButton is-disabled>Недоступно</BaseButton>
</template>
```

---

## BaseButtonGroup

Склеенные кнопки связанных действий: общие скругления у крайних, рамки соседей совпадают. `role="group"` с именем `aria-label`; каждая кнопка — отдельный таб-стоп (стрелки между кнопками — у `BaseToolbar`).

```vue
<BaseButtonGroup aria-label="Период">
	<BaseButton variant="outline">День</BaseButton>
	<BaseButton variant="outline">Неделя</BaseButton>
	<BaseButton variant="outline">Месяц</BaseButton>
</BaseButtonGroup>
```

---

## BaseSplitButton

Основное действие и меню похожих: `click` — основная кнопка, `select` — пункт меню (формат пунктов — как у `BaseDropdownMenu`). Кнопка меню называется «Другие действия» (`menu-label`).

```vue
<BaseSplitButton label="Сохранить" :items="[{ label: 'Сохранить как черновик' }, { label: 'Сохранить и закрыть' }]" @click="save" @select="handleMenu" />
```

---

## BaseFab

Плавающая кнопка главного действия страницы в углу окна (`position`), слоем под окнами и панелями. Круглая с иконкой — имя из `label`; `is-extended` — широкая с подписью; `is-contained` — в углу контейнера; `to`/`href` — ссылка.

```vue
<BaseFab label="Новая задача" icon="plus" @click="createTask" />
```

---

## BaseBackTop

Кнопка «Наверх» (BaseFab): появляется после прокрутки на `visibility-height` и возвращает окно или контейнер (`target`) к началу — плавно, если пользователь не включил уменьшение движения. После прокрутки фокус переходит в контейнер или в `<main>` страницы (`focus-target` — своё место).

```vue
<BaseBackTop :visibility-height="600" />
<BaseBackTop target="#feed" is-contained label="К началу ленты" is-extended />
```

---

## BaseToolbar

Панель инструментов по образцу APG Toolbar: `role="toolbar"` с именем, в порядке Tab один элемент, ←/→ (у вертикальной — ↑/↓) ведут по элементам, Home/End — первый и последний, в текстовом поле стрелки двигают курсор, отключённые кнопки пропускаются.

```vue
<BaseToolbar aria-label="Форматирование">
	<BaseButton variant="ghost" aria-label="Полужирный"><BaseIcon name="bold" /></BaseButton>
	<BaseButton variant="ghost" aria-label="Курсив"><BaseIcon name="italic" /></BaseButton>
</BaseToolbar>
```

---

## BaseInput

Базовое поле ввода.

### Пример

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from '@ramzes1385/rise-ui-kit'

const value = ref('')
</script>

<template>
	<BaseInput v-model="value" placeholder="Введите текст" />
</template>
```

У `BaseInput` и `BaseTextarea` имя без видимой подписи задаёт `aria-label`, атрибуты нативного поля — `input-attrs`:

```vue
<BaseInput v-model="email" type="email" aria-label="E-mail" :input-attrs="{ name: 'email', autocomplete: 'email', 'data-testid': 'email' }" />
```

---

## BaseTextarea

Многострочное поле ввода.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTextarea } from '@ramzes1385/rise-ui-kit'

const description = ref('')
</script>

<template>
	<BaseTextarea v-model="description" placeholder="Описание" />
</template>
```

---

## BaseInplace

Текст с правкой на месте: по клику, Enter или пробелу — поле с выделенным текстом, Enter сохраняет, Escape отменяет, выход из поля сохраняет (`is-save-on-blur`). В просмотре — кнопка «что: значение» с подсказкой для скринридера; шрифт наследуется от окружения.

```vue
<h2><BaseInplace v-model="title" label="Название проекта" placeholder="Без названия" /></h2>
```

---

## BaseInputNumber

Поле числа: кнопки −/+ по краям, ввод `1,5` и `1.5`, границы `min`/`max`, шаг `step`, знаков после запятой — `precision`. По образцу APG Spinbutton: ↑/↓ — шаг, PageUp/PageDown — десять шагов, Home/End — границы. Число вне границ при выходе из поля поднимается или опускается до границы, нечисло возвращает прежнее значение.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInputNumber } from '@ramzes1385/rise-ui-kit'

const guests = ref<number | null>(2)
</script>

<template>
	<BaseInputNumber v-model="guests" label="Гостей" :min="1" :max="10" :format-value-text="n => `${n} гостей`" />
</template>
```

---

## BaseInputTags

Поле тегов: Enter или запятая (`separators`) добавляют тег, вставка «a, b, c» — несколько тегов, повторы не добавляются (`isUnique`), `maxTags` ограничивает число, `validate` отклоняет тег (текст остаётся в поле). В пустой строке ← или Backspace ведут к последнему тегу, ←/→ — между тегами, Backspace и Delete удаляют тег.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInputTags } from '@ramzes1385/rise-ui-kit'

const skills = ref(['Vue', 'TypeScript'])
</script>

<template>
	<BaseInputTags v-model="skills" label="Навыки" placeholder="Добавьте навык" :max-tags="10" />
</template>
```

---

## BaseSelect

Компонент выбора значения из списка.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSelect } from '@ramzes1385/rise-ui-kit'
import type { BaseSelectProps } from '@ramzes1385/rise-ui-kit'

// string | number | (string | number)[] (массив — при is-multiple); undefined — ничего не выбрано
const selected = ref<BaseSelectProps['modelValue']>()

const options = [
	{ label: 'Активен', value: 'active' },
	{ label: 'Неактивен', value: 'inactive' },
]
</script>

<template>
	<BaseSelect v-model="selected" :options="options" placeholder="Выберите статус" />
</template>
```

Клавиатура по образцу APG (combobox со списком): ↓/↑, Enter и пробел открывают список, Home/End — первая и последняя опция, буквы — опция по началу подписи, Escape закрывает список.

---

## BaseAutocomplete

Поле с подсказками: список фильтруется по вводу, выбор — мышью или ↓/↑ и Enter (APG Combobox: фокус остаётся в поле, `aria-activedescendant`). Escape закрывает список, а при закрытом — очищает поле. Текст без выбора при выходе из поля заменяется выбранным значением; `is-custom-allowed` делает его значением (`normalize` — привести текст к значению). Варианты с сервера — `is-remote`, событие `search` и `is-loading`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseAutocomplete } from '@ramzes1385/rise-ui-kit'
import type { AutocompleteOption } from '@ramzes1385/rise-ui-kit'

const city = ref<string | number | null>(null)
const cities: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'kzn', label: 'Казань' },
]
</script>

<template>
	<BaseAutocomplete v-model="city" :options="cities" label="Город доставки" placeholder="Начните вводить город" />
</template>
```

---

## BaseTimePicker

Время `HH:MM`: список с шагом `step` (по умолчанию 30 минут) в границах `min-time`–`max-time` и свободный ввод — «930», «9:30», «9.30» становятся 09:30. Построено на `BaseAutocomplete`.

```vue
<BaseTimePicker v-model="time" label="Время звонка" :step="15" min-time="09:00" max-time="18:00" />
```

---

## BaseCheckbox

Чекбокс.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox } from '@ramzes1385/rise-ui-kit'

const checked = ref(false)
</script>

<template>
	<BaseCheckbox v-model="checked" label="Согласен с условиями" />
</template>
```

`is-indeterminate` — частичный выбор (флажок с чертой, скринридер слышит «частично отмечен»): например, «Выбрать все», когда отмечена часть. Клик отмечает флажок, снимать частичный выбор — задача родителя.

---

## BaseCheckboxGroup

Группа флажков: `v-model` — массив отмеченных значений в порядке вариантов, `options` — `value`, `label`, `isDisabled`. Группа — `role="group"` с именем из `label` (или подписи `BaseFormField` вокруг), ошибка описывает группу. `has-select-all` добавляет флажок «Выбрать все»: при части отмеченных он частично отмечен, клик отмечает все доступные варианты.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckboxGroup } from '@ramzes1385/rise-ui-kit'

const channels = ref<(string | number)[]>(['email'])

const options = [
	{ value: 'email', label: 'Электронная почта' },
	{ value: 'push', label: 'Push-уведомления' },
	{ value: 'sms', label: 'SMS', isDisabled: true },
]
</script>

<template>
	<BaseCheckboxGroup v-model="channels" :options="options" label="Каналы уведомлений" has-select-all />
</template>
```

---

## BaseRadio

Группа radio button: варианты передаются в `options`, `name` (имя группы нативных `input`) обязателен.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRadio } from '@ramzes1385/rise-ui-kit'

const value = ref<string | number>('email')

const options = [
	{ value: 'email', label: 'Email' },
	{ value: 'phone', label: 'Телефон' },
]
</script>

<template>
	<BaseRadio v-model="value" name="contact" :options="options" label="Способ связи" />
</template>
```

---

## BaseSegmented

Переключатель сегментами для двух–пяти коротких вариантов: период отчёта, вид списка. Нативные radio с общим `name` — один таб-стоп, стрелки переключают выбор; группа названа `label`, `aria-label` или подписью `BaseFormField`. `is-block` — во всю ширину, у сегмента может быть иконка.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSegmented } from '@ramzes1385/rise-ui-kit'

const period = ref<string | number | null>('week')
const periods = [
	{ value: 'day', label: 'День' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'month', label: 'Месяц' },
]
</script>

<template>
	<BaseSegmented v-model="period" :options="periods" aria-label="Период отчёта" />
</template>
```

---

## BaseSwitch

Переключатель.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSwitch } from '@ramzes1385/rise-ui-kit'

const enabled = ref(false)
</script>

<template>
	<BaseSwitch v-model="enabled" label="Включить уведомления" />
</template>
```

---

## BaseForm

Контейнер формы.

Событие `submit` приходит без перезагрузки страницы (нативная отправка отменяется). Кнопке отправки нужен `type="submit"` — у `BaseButton` по умолчанию `type="button"`. При `is-loading` / `is-disabled` `submit` не эмитится, нативные поля блокируются через `<fieldset disabled>`, а кастомные контролы кита (`BaseSelect`, `BaseRange`, `BaseRating`, `BaseFileUpload`, `BaseEditor`, `BaseCheckboxGroup`) — через контекст формы. Заблокированные поля не попадают в FormData — собирайте данные до перевода формы в `is-loading`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseForm, BaseInput, BaseButton } from '@ramzes1385/rise-ui-kit'

const email = ref('')

function handleSubmit(): void {
	console.log(email.value)
}
</script>

<template>
	<BaseForm @submit="handleSubmit">
		<BaseInput v-model="email" type="email" placeholder="Email" />
		<BaseButton type="submit">Отправить</BaseButton>
	</BaseForm>
</template>
```

Проверка по схеме: `schema` — любая схема [Standard Schema](https://standardschema.dev) (Zod 3.24+, Valibot 1.0+, ArkType 2.0+), `state` — данные формы. При отправке кит проверяет `state`: ошибки показывают `BaseFormField` с тем же `name` (путь через точку: `address.city`), приходит событие `invalid`, фокус уходит на первое поле с ошибкой. После первой отправки ошибки исчезают по мере исправления. Без ошибок `submit` получает вторым аргументом данные после схемы. Через ref доступны `validate()`, `reset()` и `errors`. Кит не зависит от библиотеки схем — её ставит приложение.

```vue
<script setup lang="ts">
import { reactive } from 'vue'
import { z } from 'zod'
import { BaseButton, BaseForm, BaseFormField, BaseInput } from '@ramzes1385/rise-ui-kit'

const schema = z.object({
	name: z.string().trim().min(1, 'Введите имя'),
	email: z.string().email('Введите e-mail'),
})
const state = reactive({ name: '', email: '' })

function handleSubmit(_event: Event, data: unknown): void {
	console.log(data as z.infer<typeof schema>)
}
</script>

<template>
	<BaseForm :schema="schema" :state="state" @submit="handleSubmit">
		<BaseFormField label="Имя" name="name" is-required><BaseInput v-model="state.name" /></BaseFormField>
		<BaseFormField label="E-mail" name="email" is-required><BaseInput v-model="state.email" type="email" /></BaseFormField>
		<BaseButton type="submit">Отправить</BaseButton>
	</BaseForm>
</template>
```

---

## BaseFormField

Обёртка для поля формы.

Обычно используется для label, ошибок и вспомогательного текста. Контрол кита внутри (`BaseInput`, `BaseTextarea`, `BaseSelect`, `BaseCheckboxGroup`) сам получает от обёртки id, описание, ошибку и обязательность: подпись становится его именем, описание или ошибка — описанием (`aria-describedby`), ошибка обёртки красит поле. Для другого поля подпись связывает `for`, без него содержимое — группа с именем из подписи. `name` — имя поля в данных `BaseForm`: ошибку проверки по схеме обёртка показывает сама.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseFormField, BaseInput } from '@ramzes1385/rise-ui-kit'

const email = ref('')
</script>

<template>
	<BaseFormField label="Email" error="Некорректный email">
		<BaseInput v-model="email" placeholder="example@mail.com" />
	</BaseFormField>
</template>
```

---

## BaseModal

Модальное окно.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseModal, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Открыть</BaseButton>

	<BaseModal v-model:is-open="isOpen" title="Подтверждение">
		<p>Вы уверены?</p>
	</BaseModal>
</template>
```

Открытием управляет `v-model:is-open`. Окно — модальный диалог: фокус переводится внутрь, Tab не выходит за его пределы, после закрытия фокус возвращается на элемент, с которого окно открыли (composable `useFocusTrap`). Для подтверждений есть готовый `BaseConfirm`; открыть окно из кода — `useOverlay()` (см. `BaseApp`).

---

## BaseConfirm

Окно подтверждения: вопрос, последствия и две кнопки. Из кода — `useConfirm()` внутри `BaseApp` (см. [«BaseApp: уведомления и окна из кода»](#baseapp-уведомления-и-окна-из-кода)), в шаблоне — так:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseButton, BaseConfirm } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Удалить проект</BaseButton>

	<BaseConfirm
		v-model:is-open="isOpen"
		title="Удалить проект?"
		description="Задачи и файлы удалятся без возможности восстановления."
		confirm-label="Удалить"
		is-danger
		@confirm="deleteProject" />
</template>
```

`role="alertdialog"`: скринридер читает вопрос и описание вместе. `isDanger` красит кнопку подтверждения цветом ошибки и ставит фокус при открытии на «Отмену». События: `confirm`, `cancel`, `close(result)`.

---

## BaseApp

Корень приложения для `useToast()`, `useOverlay()` и `useConfirm()`: рендерит слот без обёртки, а поверх страницы — уведомления и окна. Проп `toaster` настраивает уведомления. Пример — в разделе [«BaseApp: уведомления и окна из кода»](#baseapp-уведомления-и-окна-из-кода).

---

## BaseSlideover

Выезжающая панель.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSlideover, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton @click="isOpen = true">Открыть панель</BaseButton>

	<BaseSlideover v-model:is-open="isOpen" title="Настройки"> Содержимое панели </BaseSlideover>
</template>
```

---

## BaseDrawer

Выдвижная панель у края окна: нижний лист (`direction="bottom"`), сверху или сбоку. Модальный диалог: имя из `title`, описание из `description`, фокус заперт внутри и возвращается к кнопке. Закрывают кнопка «Закрыть», Escape, клик по затемнению и перетаскивание за ручку или шапку к краю (`is-draggable`).

```vue
<BaseButton @click="isOpen = true">Фильтры</BaseButton>
<BaseDrawer v-model:is-open="isOpen" title="Фильтры" description="Заказы за сентябрь">
	<BaseCheckboxGroup v-model="statuses" :options="options" label="Статус" is-vertical />
	<template #footer><BaseButton @click="isOpen = false">Показать</BaseButton></template>
</BaseDrawer>
```

---

## BaseDropdown

Выпадающее меню.

Триггер — слот по умолчанию, содержимое панели — слот `dropdown`. Открытием управляет `v-model:is-open`: открывает панель приложение, закрывается она сама — по клику снаружи и Escape.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseDropdown, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseDropdown v-model:is-open="isOpen">
		<BaseButton @click="isOpen = !isOpen">Меню</BaseButton>

		<template #dropdown>
			<div>Пункт меню</div>
		</template>
	</BaseDropdown>
</template>
```

---

## BaseDropdownMenu

Меню у кнопки по паттерну APG Menu Button: действия, флажки, переключатели, подменю, ссылки. Кнопка — слот по умолчанию: кит ставит ей `aria-haspopup="menu"`, `aria-expanded` и `aria-controls` и открывает меню по клику, Enter, Space и стрелкам.

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseButton, BaseDropdownMenu } from '@ramzes1385/rise-ui-kit'
import type { DropdownMenuItem } from '@ramzes1385/rise-ui-kit'

const showAuthor = ref(true)

const items = computed((): DropdownMenuItem[][] => [
	[
		{ label: 'Переименовать', icon: 'code', shortcut: 'F2', onSelect: rename },
		{ label: 'Скачать', icon: 'download', children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }] },
		{ label: 'Открыть на сайте', href: 'https://example.com/episodes/3', target: '_blank' },
	],
	[{ type: 'checkbox', label: 'Показывать автора', isChecked: showAuthor.value, onUpdateChecked: value => (showAuthor.value = value) }],
	[{ label: 'Удалить', icon: 'trash', isDanger: true, onSelect: remove }],
])
</script>

<template>
	<BaseDropdownMenu :items="items" @select="item => console.log(item.label)">
		<BaseButton variant="outline">Действия</BaseButton>
	</BaseDropdownMenu>
</template>
```

- Пункты — список или группы (группы разделены линией). Типы: `item`, `checkbox`, `radio`, `label` (подпись группы), `separator`. Пункт с `to` или `href` — ссылка (`BaseLink`), `isDanger` — цвет ошибки, `shortcut` — подпись сочетания клавиш, `children` — подменю.
- Клавиатура: стрелки по кругу, Home/End, буквы — поиск по началу подписи, стрелка вправо открывает подменю, влево — закрывает, Escape закрывает верхнее меню и возвращает фокус на кнопку, Tab из меню не уходит.
- Обычный пункт закрывает меню. Флажок и переключатель по клику и Space меню не закрывают, по Enter — закрывают. Отметки хранит приложение: `isChecked` и `onUpdateChecked`.

---

## BaseContextMenu

Меню по правому клику на области — те же пункты и клавиатура, что у `BaseDropdownMenu`. Открывается у указателя, клавишей «Меню» или Shift+F10 — у элемента с фокусом; `isDisabled` возвращает меню браузера.

```vue
<template>
	<BaseContextMenu :items="items" @select="handleSelect">
		<EpisodeCard :episode="episode" />
	</BaseContextMenu>
</template>
```

Правый клик — не единственный путь: то же действие должно быть доступно кнопкой или меню у кнопки.

---

## BasePopover

Панель с содержимым у кнопки: форма, фильтр, подробности. Кнопка — слот `trigger`: кит ставит ей `aria-haspopup="dialog"`, `aria-expanded` и `aria-controls`, панель — немодальный диалог с именем кнопки. Закрывается повторным кликом, Escape и кликом снаружи (событие `close` во всех трёх случаях).

```vue
<script setup lang="ts">
import { BasePopover, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BasePopover>
		<template #trigger>
			<BaseButton>Открыть popover</BaseButton>
		</template>

		<div>Контент popover</div>
	</BasePopover>
</template>
```

Если кнопка вложена глубже (в своём компоненте), привяжите атрибуты из слота: `<template #trigger="{ triggerProps }"><MyButton v-bind="triggerProps" /></template>`.

---

## BasePopconfirm

Вопрос у кнопки перед действием: «Снять с публикации?», «Удалить комментарий?». Легче окна `BaseConfirm`: не закрывает страницу. Ответ — события `confirm` и `cancel`; Escape и клик снаружи — отмена.

```vue
<template>
	<BasePopconfirm
		title="Удалить комментарий?"
		description="Ответы на него тоже удалятся."
		confirm-label="Удалить"
		is-danger
		@confirm="removeComment">
		<BaseButton variant="ghost">Удалить</BaseButton>
	</BasePopconfirm>
</template>
```

`isDanger` — значок предупреждения, кнопка цвета ошибки и фокус на «Отмене». Панель — `role="alertdialog"`, Tab ходит между кнопками по кругу.

---

## BaseTooltip

Короткая подсказка к элементу: по наведению и по фокусу, Escape скрывает. Пока подсказка на экране, элемент описан ею (`aria-describedby`); на подсказку можно навести указатель — она не пропадает. У края окна подсказка переворачивается и сдвигается.

```vue
<script setup lang="ts">
import { BaseTooltip, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseTooltip text="Подсказка">
		<BaseButton>Наведи на меня</BaseButton>
	</BaseTooltip>
</template>
```

Подсказка — описание, а не имя: у кнопки-иконки нужен свой `aria-label`. Пустой `text` подсказку не показывает.

---

## BaseTable

Таблица данных.

Значения ячеек строки лежат в `data` под ключами из `columns[].key` (типы `TableColumn`, `TableRow`).

```vue
<script setup lang="ts">
import { BaseTable } from '@ramzes1385/rise-ui-kit'

const columns = [
	{ key: 'name', label: 'Название' },
	{ key: 'status', label: 'Статус' },
]

const rows = [
	{ id: 1, data: { name: 'Задача 1', status: 'Активна' } },
	{ id: 2, data: { name: 'Задача 2', status: 'Завершена' } },
]
</script>

<template>
	<BaseTable :columns="columns" :rows="rows" />
</template>
```


Тысячи строк без пагинации — виртуальная прокрутка: `is-virtual` вместе с `height`. В DOM только видимые строки и запас, таблица объявляет полное число строк (`aria-rowcount`), строки — своё место (`aria-rowindex`); `row-height` — высота строки до замера.

```vue
<BaseTable :columns="columns" :rows="orders" height="480px" is-virtual />
```
---

## BasePagination

Пагинация.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePagination } from '@ramzes1385/rise-ui-kit'

const page = ref(1)
</script>

<template>
	<BasePagination v-model="page" :total="100" :page-size="10" />
</template>
```

---

## BaseInfiniteScroll

Бесконечная прокрутка: событие `load` приходит, когда конец списка подходит к краю окна или контейнера (`root`), и несёт `done` — итог подгрузки: `ok`, `empty` (конец списка) или `error` (кнопка «Повторить»). Пока идёт загрузка — `aria-busy`, состояние объявляет `role="status"`. `mode="manual"` — подгрузка кнопкой «Загрузить еще»; `reset()` через ref — начать заново после смены фильтра.

```vue
<BaseInfiniteScroll @load="loadMore">
	<OrderRow v-for="order in orders" :key="order.id" :order="order" />
</BaseInfiniteScroll>

<script setup lang="ts">
async function loadMore({ done }: InfiniteScrollLoadEvent) {
	try {
		const page = await api.orders(orders.value.length)
		orders.value.push(...page)
		done(page.length < 20 ? 'empty' : 'ok')
	} catch {
		done('error')
	}
}
</script>
```

---

## BaseVirtualList

Список на тысячи строк: в DOM только видимые строки и запас. Строки разной высоты замеряются после отрисовки (`item-size` — высота до замера), ключ — `item-key` (по умолчанию `id`). Список — `role="list"` с именем, строки — `listitem` с `aria-setsize` и `aria-posinset`; строка с фокусом не уходит из DOM при прокрутке. `scrollToIndex(index, align)` через ref; та же логика — в composable `useVirtualList`.

```vue
<BaseVirtualList :items="orders" :height="480" aria-label="Заказы">
	<template #default="{ item }">
		<OrderRow :order="item" />
	</template>
</BaseVirtualList>
```

---

## BaseTabs

Табы.

`v-model` хранит `id` активной вкладки; содержимое панели передаётся в слот по умолчанию.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTabs } from '@ramzes1385/rise-ui-kit'

const activeTab = ref('main')

const tabs = [
	{ id: 'main', label: 'Основное' },
	{ id: 'settings', label: 'Настройки' },
]
</script>

<template>
	<BaseTabs v-model="activeTab" :items="tabs">
		<p v-if="activeTab === 'main'">Основные параметры</p>
		<p v-else>Настройки профиля</p>
	</BaseTabs>
</template>
```

---

## BaseAccordion

Аккордеон.

Элементы передаются в `items`: заголовок — `label`, текст — `content`, либо имя слота в `slot` для произвольной разметки. `is-multiple` разрешает открывать несколько элементов.

```vue
<script setup lang="ts">
import { BaseAccordion } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Подробнее', content: 'Контент аккордеона' },
	{ label: 'Доставка', slot: 'delivery' },
]
</script>

<template>
	<BaseAccordion :items="items">
		<template #delivery>
			<p>Произвольная разметка из слота</p>
		</template>
	</BaseAccordion>
</template>
```

---

## BaseCard

Карточка.

```vue
<script setup lang="ts">
import { BaseCard } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCard>
		<h3>Заголовок</h3>
		<p>Описание карточки</p>
	</BaseCard>
</template>
```

---

## BaseAlert

Alert-сообщение.

```vue
<script setup lang="ts">
import { BaseAlert } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAlert type="success" title="Успешно" description="Данные сохранены" />
</template>
```

---

## BaseNotification

Всплывающее уведомление. В приложении их удобнее показывать через `useToast()` внутри `BaseApp`; сам компонент нужен для отдельного списка уведомлений.

```vue
<script setup lang="ts">
import { BaseNotification } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseNotification title="Новое уведомление" description="Данные обновлены" />
</template>
```

Список — методом `add()` через ref (возвращает id) или управляемым `items` с событием `remove(id)`. Уведомление закрывается кнопкой и само через `duration` мс; пока указатель над уведомлениями или фокус внутри, таймер стоит. `isPersistent` — без автозакрытия, `actions` — кнопки под текстом: нажатие вызывает `onClick` и закрывает уведомление.

---

## BaseBadge

Badge-компонент.

```vue
<script setup lang="ts">
import { BaseBadge } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseBadge label="New" />
</template>
```

---

## BaseKbd

Клавиша в тексте: `<kbd>`, служебные клавиши (`meta`, `shift`, `enter`, стрелки…) — символом с названием для скринридера; `meta` и `alt` на macOS — ⌘ и ⌥, на других системах — Ctrl и Alt.

```vue
<p>Нажмите <BaseKbd value="meta" /> + <BaseKbd value="K" />, чтобы открыть поиск</p>
```

---

## BaseChip

Индикатор-счётчик поверх вложенного элемента (например, число непрочитанных): обёртываемый элемент — слот по умолчанию, значение индикатора — проп `content`, позиция — `placement`. С `has-overflow` значения больше `max-value` (по умолчанию 99) выводятся как `99+`.

```vue
<script setup lang="ts">
import { BaseChip, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseChip :content="5">
		<BaseButton>Сообщения</BaseButton>
	</BaseChip>

	<BaseChip :content="120" has-overflow>
		<BaseButton>Уведомления</BaseButton>
	</BaseChip>
</template>
```

---

## BaseAvatar

Аватар пользователя.

```vue
<script setup lang="ts">
import { BaseAvatar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAvatar name="Иван Иванов" src="/avatar.png" />
</template>
```

---

## BaseAvatarGroup

Аватары внахлёст с остатком «+N»: список, скринридер слышит имена и «и ещё N»; если сверх `max` остаётся один человек, показывается он.

```vue
<BaseAvatarGroup :items="[{ name: 'Анна Смирнова', src: '/anna.jpg' }, { name: 'Иван Петров' }]" :max="4" aria-label="Участники" />
```

---

## BaseUser

Человек: аватар, имя и подпись. Аватар скрыт от скринридера, статус «в сети» — скрытым текстом; `to`/`href` делают блок ссылкой на профиль, `orientation="vertical"` — аватар над текстом.

```vue
<BaseUser name="Анна Смирнова" description="Дизайнер" src="/anna.jpg" to="/users/1" is-online />
```

---

## BaseImage

Компонент изображения.

`<source>` в форматах AVIF/WebP добавляются только по явным `convert-to-avif` / `convert-to-webp` (оба по умолчанию `false`). Включайте их, только если рядом с файлом на сервере лежит копия `.avif` / `.webp`: при 404 браузер не вернётся к `src`.

```vue
<script setup lang="ts">
import { BaseImage } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseImage src="/image.jpg" alt="Описание изображения" />

	<!-- рядом на сервере лежит /photo.avif -->
	<BaseImage src="/photo.jpg" alt="Фото" convert-to-avif />
</template>
```

---

## BaseIcon

Компонент иконки. Иконки берутся из SVG-спрайта пакета — как сделать его доступным приложению, см. раздел «Иконки».

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
</template>
```

Иконки кита можно заменить своими для всего приложения: `createUiKitPlugin({ icons: { close: 'x-mark', search: SearchIcon } })` — имя символа в спрайте, полный адрес символа (`/brand.svg#search`) или компонент, который рисует `<svg>`.

---

## BaseColorModeButton

Кнопка тёмной темы для шапки приложения.

```vue
<script setup lang="ts">
import { BaseColorModeButton, useColorMode } from '@ramzes1385/rise-ui-kit'

const { mode } = useColorMode() // 'light' | 'dark' | 'system'
</script>

<template>
	<BaseColorModeButton />
</template>
```

Кнопка-переключатель: имя «Тёмная тема» постоянное, нажатое состояние (`aria-pressed`) — тёмная тема. Тему меняет `useColorMode()`: ставит `data-theme` на `<html>` и сохраняет выбор в localStorage. Режим «как в системе» — `mode.value = 'system'`. Проп `colorMode` принимает свой экземпляр `createColorMode({ target })`, чтобы переключать тему части интерфейса.

---

## BaseLoader

Loader.

```vue
<script setup lang="ts">
import { BaseLoader } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseLoader />
</template>
```

---

## BaseSkeleton

Skeleton-заглушка.

Размеры задаются `width` / `height` (число — px, строка — любое CSS-значение). Без `height` заглушка формы `rect` (по умолчанию) и `circle` имеет нулевую высоту; у `shape="text"` высота строки задана.

```vue
<script setup lang="ts">
import { BaseSkeleton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSkeleton width="100%" :height="120" />

	<BaseSkeleton shape="text" width="60%" />

	<BaseSkeleton shape="circle" :width="40" :height="40" />
</template>
```

---

## BaseEmpty

Empty state.

```vue
<script setup lang="ts">
import { BaseEmpty } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseEmpty title="Нет данных" description="Попробуйте изменить фильтры" />
</template>
```

---

## BaseProgress

Progress bar.

```vue
<script setup lang="ts">
import { BaseProgress } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseProgress :value="65" ariaLabel="Загрузка файла" />
</template>
```

Проп `ariaLabel` — доступное имя индикатора для скринридеров (по умолчанию «Прогресс»). В шаблоне он записан в camelCase: атрибут `aria-label` Vue тоже передаст в проп, но vue-tsc со `strictTemplates` считает `aria-*` HTML-атрибутами и не сопоставляет их с пропами.

---

## BaseRange

Range input.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRange } from '@ramzes1385/rise-ui-kit'

const value = ref(50)
</script>

<template>
	<BaseRange v-model="value" :min="0" :max="100" />
</template>
```

---

## BaseSlider

Slider/carousel.

```vue
<script setup lang="ts">
import { BaseSlider } from '@ramzes1385/rise-ui-kit'

// src обязателен; type: 'video' — для видео
const slides = [
	{ src: '/slides/1.jpg', alt: 'Слайд 1', title: 'Слайд 1' },
	{ src: '/slides/2.jpg', alt: 'Слайд 2', title: 'Слайд 2' },
]
</script>

<template>
	<BaseSlider :items="slides" has-caption />
</template>
```

---

## BaseMediaPlayer

Видеоплеер со своей панелью управления. Играет первый источник из `sources`, который поддерживает браузер; абсолютные адреса — только `http:`, `https:` и `blob:` (`allowed-protocols`). Ошибки загрузки и отказ автозапуска показываются в плеере и приходят событием `error`.

```vue
<script setup lang="ts">
import { BaseMediaPlayer } from '@ramzes1385/rise-ui-kit'
import type { MediaPlayerError } from '@ramzes1385/rise-ui-kit'

const sources = [
	{ src: '/video/intro.webm', type: 'video/webm; codecs="vp9, opus"' },
	{ src: '/video/intro.mp4', type: 'video/mp4' },
]

function handleError(error: MediaPlayerError): void {
	console.warn('Видео не воспроизводится:', error.code)
}
</script>

<template>
	<BaseMediaPlayer :sources="sources" title="Знакомство с сервисом" poster="/video/intro.webp" @error="handleError" />
</template>
```

Клавиши работают, пока фокус внутри плеера: Space/K — пуск и пауза, ←/→ — 5 с (`seek-step`), J/L — 10 с (`seek-step-large`), 0–9 — переход к доле записи, ↑/↓ — громкость, M — звук, F — полный экран, Shift+. и Shift+, — скорость. Отключаются `:has-keyboard-shortcuts="false"`.

---

## BaseRating

Рейтинг.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRating } from '@ramzes1385/rise-ui-kit'

const rating = ref(4)
</script>

<template>
	<BaseRating v-model="rating" />
</template>
```

---

## BaseSearch

Поиск.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSearch } from '@ramzes1385/rise-ui-kit'

const query = ref('')
</script>

<template>
	<BaseSearch v-model="query" placeholder="Поиск" />
</template>
```

Переданные в `results` результаты по умолчанию фильтруются на клиенте по подстроке в `title`/`description`. Если их уже отобрал сервер (транслит, опечатки, другие поля), укажите `is-remote` — список покажется как есть (с ограничением `max-results`):

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSearch } from '@ramzes1385/rise-ui-kit'
import type { SearchResult } from '@ramzes1385/rise-ui-kit'

const query = ref('')
const results = ref<SearchResult[]>([])

async function handleSearch(value: string): Promise<void> {
	const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
	results.value = await response.json()
}
</script>

<template>
	<BaseSearch v-model="query" :results="results" is-remote placeholder="Поиск" @search="handleSearch" />
</template>
```

Поле поиска — `role="combobox"`, результаты — `role="listbox"`: ↓/↑ подсвечивают результат (`aria-activedescendant`), Enter открывает его. Сколько найдено, скринридер слышит из скрытой области `role="status"`.

---

## BaseDatePicker

Выбор даты.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseDatePicker } from '@ramzes1385/rise-ui-kit'

const date = ref<Date | null>(null)
</script>

<template>
	<BaseDatePicker v-model="date" />
</template>
```

---

## BaseCalendar

Календарь.

```vue
<script setup lang="ts">
import { BaseCalendar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCalendar />
</template>
```

---

## BaseColorPicker

Выбор цвета.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseColorPicker } from '@ramzes1385/rise-ui-kit'

const color = ref('#42b883')
</script>

<template>
	<BaseColorPicker v-model="color" />
</template>
```

---

## BaseFileUpload

Загрузка файлов.

Событие `change` передаёт массив `File[]` — текущий список выбранных файлов (без `is-multiple` — один файл: новый выбор заменяет прежний). Файлы проверяются по `accept` (MIME, `image/*` или расширения) и `max-size` (в МБ, по умолчанию 5); ошибки приходят в событии `error`.

```vue
<script setup lang="ts">
import { BaseFileUpload } from '@ramzes1385/rise-ui-kit'

function handleFiles(files: File[]): void {
	console.log(files)
}
</script>

<template>
	<BaseFileUpload accept="image/*,.pdf" :max-size="10" is-multiple @change="handleFiles" />
</template>
```

---

## BaseEditor

Редактор текста.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseEditor } from '@ramzes1385/rise-ui-kit'

const content = ref('')
</script>

<template>
	<BaseEditor v-model="content" />
</template>
```

> BaseEditor очищает HTML при показе `v-model`, вставке из буфера обмена, перетаскивании, выходе из режима кода и в `update:modelValue`: скрипты, обработчики `on*`, ссылки `javascript:`, `<iframe>`, `<svg>` и `<style>` удаляются. Очистку задаёт проп `sanitize` — по умолчанию `sanitizeHtml` из `utils`; для доверенного HTML её можно отключить функцией `html => html`. Ссылка с небезопасной схемой не вставляется. Сохранённый HTML всё равно проверяйте на сервере: клиентскую очистку можно обойти, отправив запрос напрямую.

---

## BaseChat

Компонент чата.

Сообщение (`ChatMessage`) обязательно содержит `id`, `text`, `sender` (`'me'` — своё, `'other'` — собеседника) и `time` — строку для отображения. `title` — заголовок чата (обязателен), `description` — описание чата или собеседника для панели «Информация» (без него блок описания не выводится).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseChat } from '@ramzes1385/rise-ui-kit'
import type { ChatMessage } from '@ramzes1385/rise-ui-kit'

const messages = ref<ChatMessage[]>([
	{
		id: '1',
		text: 'Привет',
		sender: 'other',
		senderName: 'Анна',
		time: '10:15',
	},
])

function handleSend(payload: { text: string }): void {
	messages.value.push({
		id: String(Date.now()),
		text: payload.text,
		sender: 'me',
		time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
	})
}
</script>

<template>
	<BaseChat title="Анна" description="Менеджер проекта" :messages="messages" @send="handleSend" />
</template>
```

---

## BaseTree

Дерево данных.

```vue
<script setup lang="ts">
import { BaseTree } from '@ramzes1385/rise-ui-kit'

const nodes = [
	{
		id: '1',
		label: 'Родитель',
		children: [{ id: '1-1', label: 'Дочерний элемент' }],
	},
]
</script>

<template>
	<BaseTree :items="nodes" />
</template>
```

Выбор узлов включается `selection-mode` (`'single'` / `'multiple'`), раскрытые и выбранные узлы доступны через `v-model:expanded-ids` / `v-model:selected-ids`.

Клавиатура по образцу APG Tree View: в порядке Tab один узел дерева; ↓/↑ — соседний видимый узел, → — раскрыть или перейти к первому вложенному, ← — свернуть или перейти к родителю, Home/End, `*` — раскрыть все ветки уровня, буквы — узел по началу подписи, Enter — действие узла, пробел — выбор. Имя дерева для скринридера — `aria-label`.

Узел с `to` (маршрут) или `href` (внешний адрес) — ссылка: маршрут открывает RouterLink приложения или `linkComponent` плагина. Клик по подписи и Enter переходят по ссылке, в режиме `single` узел становится выбранным:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTree } from '@ramzes1385/rise-ui-kit'
import type { TreeNode } from '@ramzes1385/rise-ui-kit'

const current = ref(['intro'])
const pages: TreeNode[] = [
	{ id: 'intro', label: 'Введение', to: '/docs/intro' },
	{ id: 'guide', label: 'Руководство', to: '/docs/guide', children: [{ id: 'install', label: 'Установка', to: '/docs/install' }] },
	{ id: 'source', label: 'Исходный код', href: 'https://github.com/…', target: '_blank' },
]
</script>

<template>
	<BaseTree v-model:selected-ids="current" :items="pages" selection-mode="single" aria-label="Документация" />
</template>
```


Дерево на тысячи видимых узлов — `is-virtual` и `height`: узлы рисуются плоским списком (`aria-level`, `aria-setsize`, `aria-posinset`), в DOM только видимые; стрелки и Home/End к неотрисованному узлу сначала прокручивают к нему. `item-size` — высота узла до замера.

```vue
<BaseTree :items="staff" is-virtual :height="480" aria-label="Сотрудники" />
```
---

## BaseTimeline

Лента событий: упорядоченный список, дата — `<time datetime>` в формате языка, текущее событие (`current-id`) — `aria-current="step"`, следующие приглушены. Маркер — иконка или точка цвета роли события, `orientation="horizontal"` — лента слева направо.

```vue
<BaseTimeline
	current-id="shipped"
	:items="[
		{ id: 'created', title: 'Заказ оформлен', date: '2026-05-12T10:24:00', icon: 'check', color: 'success' },
		{ id: 'shipped', title: 'Передан в доставку', date: '2026-05-14T16:40:00', icon: 'send' },
		{ id: 'delivered', title: 'Доставлен', date: 'ожидается 15 мая' },
	]" />
```

---

## BaseMegaMenu

Многоуровневое меню.

`items` используются в раскладке `layout="dropdown"`; раскладка по умолчанию — `columns` (колонки `{ title, items }` в пропе `columns`). Вложенность `children` не ограничена. По пунктам с `to` компонент сам не переходит, а эмитит `navigate` с путём — переход выполняет приложение (например, `router.push`); ссылки `href` открываются компонентом, небезопасные схемы URL блокируются.

```vue
<script setup lang="ts">
import { BaseMegaMenu } from '@ramzes1385/rise-ui-kit'

const items = [
	{
		label: 'Раздел',
		children: [{ label: 'Подраздел', to: '/section' }],
	},
]

function handleNavigate(path: string): void {
	console.log(path) // например, router.push(path)
}
</script>

<template>
	<BaseMegaMenu layout="dropdown" :items="items" @navigate="handleNavigate" />
</template>
```

---

## BaseMenu

Меню.

`items` — массив групп (массив массивов), между группами выводится разделитель. Выбор пункта приходит в событии `select`; у пункта можно задать собственный обработчик `click`.

```vue
<script setup lang="ts">
import { BaseMenu } from '@ramzes1385/rise-ui-kit'
import type { BaseMenuItem } from '@ramzes1385/rise-ui-kit'

const items: BaseMenuItem[][] = [
	[{ label: 'Профиль' }, { label: 'Настройки' }],
	[{ label: 'Выход', click: () => console.log('logout') }],
]

function handleSelect(item: BaseMenuItem): void {
	console.log(item.label)
}
</script>

<template>
	<BaseMenu :items="items" @select="handleSelect" />
</template>
```

---

## BaseLayout

Каркас страницы на всю высоту окна: слоты `header`, `sidebar`, default (содержимое в `<main>`) и `footer`. Первая остановка Tab — ссылка «Перейти к содержимому» (видна только в фокусе) переносит фокус в `<main>`. Шапка прилипает к верху (`is-header-sticky`), боковое меню стоит под ней и прокручивается отдельно, подвал прижат к низу окна. На экране уже 768px боковое меню скрыто — положите навигацию в слот `menu` у BaseHeader.

```vue
<BaseLayout>
	<template #header><BaseHeader title="Rise CRM" to="/" /></template>
	<template #sidebar><BaseSideBar :items="menu" /></template>
	<BaseContainer><RouterView /></BaseContainer>
	<template #footer><BaseFooter>© 2026 Rise</BaseFooter></template>
</BaseLayout>
```

---

## BaseHeader

Шапка (`<header>`, ориентир banner): название `title` (ссылка при `to` / `href`) или слот `start`, навигация в слоте по умолчанию, действия в слоте `end`. Слот `menu` — меню для узкого экрана: ниже 768px навигация прячется, а кнопка «Меню» открывает меню в BaseDrawer; слот получает `close`.

```vue
<BaseHeader title="Rise CRM" to="/" container-size="xl">
	<nav aria-label="Основное"><BaseLink to="/orders">Заказы</BaseLink></nav>
	<template #end><BaseColorModeButton /></template>
	<template #menu="{ close }">
		<BaseLink to="/orders" @click="close">Заказы</BaseLink>
	</template>
</BaseHeader>
```

---

## BaseFooter

Подвал (`<footer>`, ориентир contentinfo): слоты `start`, по умолчанию и `end`; на узком экране зоны встают столбиком. `container-size` — ширина содержимого, как у BaseContainer.

```vue
<BaseFooter container-size="xl">
	<template #start>© 2026 Rise Studio</template>
	<BaseLink href="/terms">Условия</BaseLink>
</BaseFooter>
```

---

## BaseContainer

Контейнер страницы: ограничивает ширину (`size`: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `full`), центрирует содержимое и даёт боковые отступы, растущие с экраном.

```vue
<BaseContainer size="lg" tag="section">…</BaseContainer>
```

---

## BaseSplitter

Две панели с разделителем по образцу APG Window Splitter: `v-model` — размер первой панели в процентах, `min` / `max` — границы, `change` — итог. Разделитель — `role="separator"`; стрелки двигают его на `step`, Home/End — к границам, Enter сворачивает первую панель и возвращает её. `orientation="vertical"` — панели одна над другой.

```vue
<BaseSplitter v-model="listSize" :min="20" :max="60" label="Список писем" @change="saveLayout">
	<template #start><MailList /></template>
	<template #end><MailView /></template>
</BaseSplitter>
```

---

## BaseScrollArea

Область прокрутки с тонкой полосой поверх содержимого, одинаковой во всех системах. Прокручивает родной элемент (колесо, касание, клавиатура работают как обычно), область с прокруткой получает tabindex="0". `orientation`: `vertical`, `horizontal`, `both`; `max-height`; `scrollbar`: `hover` или `always`; `aria-label` делает область ориентиром. Методы через ref: `scrollTo`, `scrollToTop`, `scrollToBottom`, `update`.

```vue
<BaseScrollArea :max-height="320" aria-label="Журнал склада">
	<LogRow v-for="row in rows" :key="row.id" :row="row" />
</BaseScrollArea>
```

---

## BaseSideBar

Боковая панель навигации.

```vue
<script setup lang="ts">
import { BaseSideBar } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Главная', to: '/' },
	{ label: 'Настройки', to: '/settings' },
]
</script>

<template>
	<BaseSideBar :items="items" />
</template>
```

Пункты с `to` — ссылки: компонент из пропа `linkComponent`, из `createUiKitPlugin({ linkComponent })` или RouterLink подключённого vue-router, иначе `<a href>`. Внешний адрес (`https://…`) открывается обычной ссылкой.

---

## BaseLink

Ссылка на маршрут приложения (`to`) или внешний адрес (`href`).

```vue
<script setup lang="ts">
import { BaseLink } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseLink to="/projects/42/settings">Настройки проекта</BaseLink>
	<BaseLink href="https://example.com/guide" target="_blank">Руководство</BaseLink>
</template>
```

`to` рендерит RouterLink приложения (как и остальные компоненты с навигацией), без роутера — `<a href>`. Небезопасные схемы (`javascript:`, `data:`) в `href` не попадают: ссылка показывается отключённой. Для `target="_blank"` добавляются `rel="noopener noreferrer"`, стрелка и подсказка «откроется в новой вкладке» для скринридера. Шрифт берётся у окружающего текста. Варианты: `default` — цвет ссылки и подчёркивание (в тексте ссылку видно не только по цвету), `ghost` — цвет текста и подчёркивание при наведении, для навигации и списков ссылок.

---

## BaseBreadcrumbs

Хлебные крошки.

```vue
<script setup lang="ts">
import { BaseBreadcrumbs } from '@ramzes1385/rise-ui-kit'

const items = [{ label: 'Главная', to: '/' }, { label: 'Пользователи', to: '/users' }, { label: 'Профиль' }]
</script>

<template>
	<BaseBreadcrumbs :items="items" />
</template>
```

Крошки — ссылки: `to` рендерит RouterLink приложения (из `linkComponent`, плагина или vue-router), без роутера — `<a href>`; `href` открывается в новой вкладке (`target` у крошки меняет это). Небезопасные схемы URL в адрес не попадают. Крошка без адреса — кнопка с событием `item-click`; `navigate(url)` сообщает о переходе по ссылке.

---

## BaseStepper

Stepper.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseStepper } from '@ramzes1385/rise-ui-kit'

// номер текущего шага — с 1
const step = ref(1)

const steps = [{ label: 'Данные' }, { label: 'Проверка' }, { label: 'Готово' }]
</script>

<template>
	<BaseStepper v-model="step" :items="steps" />
</template>
```

---

## BaseTour

Компонент пользовательского тура по интерфейсу.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTour } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(true)

const steps = [
	{
		target: '#first-step',
		title: 'Первый шаг',
		content: 'Описание первого шага',
	},
]
</script>

<template>
	<BaseTour v-model:is-open="isOpen" :steps="steps" />
</template>
```

---

## BaseText

Компонент текста.

```vue
<script setup lang="ts">
import { BaseText } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseText tag="p" :weight="600"> Текст </BaseText>
</template>
```

---

## BaseSeparator

Разделитель.

```vue
<script setup lang="ts">
import { BaseSeparator } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSeparator />
</template>
```

---

## BasePin

Ввод PIN-кода / кода подтверждения по ячейкам (по одному символу в ячейке, `length` — число ячеек, по умолчанию 4). Когда заполнены все ячейки, эмитится `complete`.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePin } from '@ramzes1385/rise-ui-kit'

const code = ref('')

function handleComplete(value: string): void {
	console.log(value)
}
</script>

<template>
	<BasePin v-model="code" :length="4" @complete="handleComplete" />
</template>
```

---

## BaseAnimation

Компонент анимации.

```vue
<script setup lang="ts">
import { BaseAnimation } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAnimation>
		<div>Анимированный контент</div>
	</BaseAnimation>
</template>
```

---

# Список компонентов

```txt
BaseAccordion
BaseAlert
BaseAnimation
BaseAutocomplete
BaseAvatar
BaseAvatarGroup
BaseBackTop
BaseBadge
BaseBreadcrumbs
BaseButton
BaseButtonGroup
BaseCalendar
BaseCard
BaseChat
BaseCheckbox
BaseCheckboxGroup
BaseChip
BaseColorPicker
BaseConfirm
BaseContainer
BaseContextMenu
BaseDatePicker
BaseDrawer
BaseDropdown
BaseDropdownMenu
BaseEditor
BaseEmpty
BaseFab
BaseFileUpload
BaseFooter
BaseForm
BaseFormField
BaseHeader
BaseIcon
BaseImage
BaseInfiniteScroll
BaseInplace
BaseInput
BaseInputNumber
BaseInputTags
BaseKbd
BaseLayout
BaseLoader
BaseMegaMenu
BaseMenu
BaseModal
BaseNotification
BasePagination
BasePin
BasePopconfirm
BasePopover
BaseProgress
BaseRadio
BaseRange
BaseRating
BaseScrollArea
BaseSearch
BaseSegmented
BaseSelect
BaseSeparator
BaseSideBar
BaseSkeleton
BaseSlideover
BaseSlider
BaseSplitButton
BaseSplitter
BaseStepper
BaseSwitch
BaseTable
BaseTabs
BaseText
BaseTextarea
BaseTimeline
BaseTimePicker
BaseToolbar
BaseTooltip
BaseTour
BaseTree
BaseUser
BaseVirtualList
```

---

# Composables

Библиотека также экспортирует composables — из подпути `@ramzes1385/rise-ui-kit/composables` или как namespace `composables` из корня пакета (`import { composables } from '@ramzes1385/rise-ui-kit'`). Именованного экспорта composables из корня нет. Вызывайте их внутри `setup` / `<script setup>`: они подписываются на хуки жизненного цикла компонента.

## useDebounce

Отложенный вызов функции (`useDebounceFn`) или отложенное значение (`useDebounce`).

```ts
import { useDebounce, useDebounceFn } from '@ramzes1385/rise-ui-kit/composables'

// функция выполнится через 300 мс после последнего вызова
const debouncedSearch = useDebounceFn((value: string) => {
	console.log(value)
}, 300)

debouncedSearch('vue')

// ref, запись в который применяется через 300 мс после последнего присваивания
const query = useDebounce('', 300)

query.value = 'vue'
```

---

## useClickOutside

Отслеживает клик вне элемента.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useClickOutside } from '@ramzes1385/rise-ui-kit/composables'

const rootRef = ref<HTMLElement | null>(null)

useClickOutside({
	targets: [rootRef],
	callback: () => {
		console.log('Клик вне блока')
	},
})
</script>

<template>
	<div ref="rootRef">Контент</div>
</template>
```

Необязательная опция `isActive: () => boolean` включает обработку только когда нужно (например, пока открыт попап).

Компонент с `useClickOutside` становится слоем (см. «Слои»): нажатие мыши в слоях, открытых после него (вложенный список, меню в поповере), не считается нажатием снаружи. Реагирует на `mousedown`; `isCapture: true` — в фазе перехвата, раньше обработчиков на элементах.

---

## useEscapeKey

Закрытие по Escape. Escape получает только верхний открытый слой с обработчиком: из окна с открытым списком первое нажатие закрывает список, второе — окно. Нажатие, для которого элемент вызвал `event.preventDefault()`, не обрабатывается.

```ts
import { ref } from 'vue'
import { useEscapeKey } from '@ramzes1385/rise-ui-kit/composables'

const isOpen = ref(true)

useEscapeKey({
	isActive: () => isOpen.value,
	callback: () => {
		isOpen.value = false
	},
})
```

---

## useLayerIndex

Место своего всплывающего элемента в порядке наложения слоёв кита: открытый позже — выше.

```vue
<script setup lang="ts">
import { useLayerIndex } from '@ramzes1385/rise-ui-kit/composables'

const props = defineProps<{ isOpen: boolean }>()
const layerStyle = useLayerIndex(() => props.isOpen) // { '--rise-layer-index': '2' }
</script>

<template>
	<Teleport to="body">
		<div v-if="isOpen" class="my-panel" :style="layerStyle">…</div>
	</Teleport>
</template>

<style>
.my-panel {
	position: fixed;
	z-index: calc(var(--rise-z-overlay) + var(--rise-layer-index, 0));
}
</style>
```

---

## useScrollLock

Блокировка прокрутки страницы.

```ts
import { useScrollLock } from '@ramzes1385/rise-ui-kit/composables'

const { lock, unlock } = useScrollLock()

lock()
unlock()
```

Счётчик блокировок общий для всех экземпляров: прокрутка вернётся, когда разблокирует последний (вложенные оверлеи).

---

## useBreakpoint

Работа с breakpoint значениями.

```ts
import { computed } from 'vue'
import { useBreakpoint } from '@ramzes1385/rise-ui-kit/composables'

const { width, current, isMobile, isGreaterOrEqual, isSmallerThan } = useBreakpoint()

const isDesktop = computed(() => isGreaterOrEqual('lg'))
const isTablet = computed(() => !isMobile.value && isSmallerThan('lg'))
```

`isMobile` — ширина меньше `md` (768 px), `current` — наибольший активный брейкпоинт (`xs`, `sm`, `mobile`, `md`, `lg`, `xl`, `xxl`), `width` — ширина окна.

---

## useTableData

Помощник для работы с табличными данными: поиск, фильтры, сортировка и пагинация (фасад, который использует `BaseTable`).

```ts
import { ref } from 'vue'
import { useTableData } from '@ramzes1385/rise-ui-kit/composables'
import type { TableColumn, TableRow } from '@ramzes1385/rise-ui-kit'

const rows = ref<TableRow[]>([])
const columns = ref<TableColumn[]>([{ key: 'name', label: 'Название', isSortable: true }])

const { displayedRows, handleSort, handleSearchInput, currentPage, totalPages } = useTableData({
	rows,
	columns,
	loadMode: () => 'pagination',
	pageSize: ref(10),
	isMultiSort: () => false,
	searchDebounce: () => 300,
})
```

---

## useFocusTrap

Удерживает фокус внутри модального окна (используется в `BaseModal` и `BaseSlideover`): при активации переводит фокус внутрь (`[autofocus]` → первый фокусируемый элемент → сам контейнер), зацикливает Tab / Shift+Tab, а при деактивации или размонтировании возвращает фокус на элемент, с которого окно открыли.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useFocusTrap } from '@ramzes1385/rise-ui-kit/composables'

const isOpen = ref(false)
const dialogRef = ref<HTMLElement | null>(null)

useFocusTrap({
	containerRef: dialogRef,
	isActive: () => isOpen.value,
})
</script>

<template>
	<button type="button" @click="isOpen = true">Открыть</button>

	<div v-if="isOpen" ref="dialogRef" role="dialog" aria-modal="true" aria-label="Диалог">
		<input aria-label="Имя" />
		<button type="button" @click="isOpen = false">Закрыть</button>
	</div>
</template>
```

---

## Список composables

Основные composables (полный перечень экспортов — `src/composables/index.ts`):

```txt
useAutoScroll
useBreakpoint
useCalendar
useClickOutside
useColorPicker
useCustomClass
useCustomColor
useCustomStyle
useDebounce
useDropdownPosition
useEditorToolbar
useEscapeKey
useFlyoutPosition
useFocusTrap
useIcon
useImageZoom
useInputMask
useLayer
useLayerIndex
useListNavigation
useMegaMenuTree
usePadding
usePasswordVisibility
usePopup
useScrollLock
useSizeScale
useSlider
useSwipe
useTableData
useTeleportTarget
useTriggerAttributes
useVariant
useVirtualList
```

---

# Utils

Библиотека экспортирует набор утилит — из подпути `@ramzes1385/rise-ui-kit/utils` или как namespace `utils` из корня пакета (`import { utils } from '@ramzes1385/rise-ui-kit'`).

## fileUtils

Утилиты для работы с файлами.

```ts
import { formatFileSize } from '@ramzes1385/rise-ui-kit/utils'

const size = formatFileSize(1024) // '1.0 КБ'
```

---

## dateUtils

Утилиты для работы с датами.

```ts
import { formatDate } from '@ramzes1385/rise-ui-kit/utils'

const date = formatDate({
	date: new Date(),
	dateFormat: 'dd.MM.yyyy',
	showTime: false,
	showSeconds: false,
	is24Hour: true,
	locale: 'ru-RU',
})
```

---

## colorUtils

Утилиты для работы с цветами.

```ts
import { isValidHex } from '@ramzes1385/rise-ui-kit/utils'

const valid = isValidHex('#42b883') // true; допускаются 3 и 6 знаков, с # и без
```

---

## urlUtils

Проверка URL из недоверенных данных (пункты меню, CMS, API) перед переходом, `window.open` или скачиванием. `isSafeUrl` пропускает относительные адреса и схемы из списка: по умолчанию `NAVIGATION_PROTOCOLS` (`http:`, `https:`, `mailto:`, `tel:`), для скачивания — `DOWNLOAD_PROTOCOLS` (`http:`, `https:`, `blob:`, `data:`). Эту же проверку выполняют `openExternalUrl`, `navigateAndEmit` и `downloadFile`.

```ts
import { DOWNLOAD_PROTOCOLS, isSafeUrl } from '@ramzes1385/rise-ui-kit/utils'

isSafeUrl('https://example.com') // true
isSafeUrl('/users/42') // true — относительный адрес
isSafeUrl('javascript:alert(1)') // false
isSafeUrl('blob:https://example.com/7f3c', DOWNLOAD_PROTOCOLS) // true
```

---

## Список utils

```txt
clipboardUtils
colorUtils
dateUtils
domUtils
editorDomUtils
fileUtils
iconUtils
idUtils
imageUtils
navigationUtils
paginationUtils
rangeUtils
ratingUtils
schemaUtils
tableUtils
tooltipUtils
treeUtils
typeUtils
urlUtils
```

---

# Иконки

Иконки используются через `BaseIcon`.

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
	<BaseIcon name="close" />
	<BaseIcon name="send" />
</template>
```

## Спрайт

BaseIcon берёт иконки из спрайта `dist/icons.svg` пакета. Сделайте его доступным приложению: скопируйте `node_modules/@ramzes1385/rise-ui-kit/dist/icons.svg` в `public/` или импортируйте URL — `import iconSpriteUrl from '@ramzes1385/rise-ui-kit/icons.svg?url'` (подпуть `./icons.svg` добавлен в `exports`). Передайте абсолютный путь: `app.use(createUiKitPlugin({ iconSpritePath: '/icons.svg' }))` или `iconSpriteUrl`; если нужны только иконки — `createIconPlugin({ spritePath: '/icons.svg' })`. Без опции используется относительный `'icons.svg'`: он резолвится от URL страницы, и на вложенных маршрутах (`/users/42` → `/users/icons.svg`) файл не находится. Спрайт должен отдаваться с того же origin, что и страница; при деплое под подпутём укажите `${import.meta.env.BASE_URL}icons.svg`.

```ts
// main.ts: URL спрайта из пакета (Vite)
import { createApp } from 'vue'
import App from './App.vue'
import { createUiKitPlugin } from '@ramzes1385/rise-ui-kit'
import iconSpriteUrl from '@ramzes1385/rise-ui-kit/icons.svg?url'

createApp(App).use(createUiKitPlugin({ iconSpritePath: iconSpriteUrl })).mount('#app')
```

```ts
// main.ts: только иконки — глобальный BaseIcon без остальных компонентов
import { createApp } from 'vue'
import App from './App.vue'
import { createIconPlugin } from '@ramzes1385/rise-ui-kit/icons'

createApp(App).use(createIconPlugin({ spritePath: '/icons.svg' })).mount('#app')
```

---

# Разработка проекта

## Установка зависимостей

```bash
npm install
```

## Storybook — среда разработки

```bash
npm run storybook
```

Отдельного демо-приложения нет: компоненты разрабатываются и проверяются в Storybook (порт 6006).

- **Разделы:** Introduction, Foundations (цвета, типографика, радиусы и тени, размеры, темы), Element, Form, Data, Navigation, Layout, Overlay, Chat, Editor.
- **Тема** переключается кнопкой «Тема» на панели инструментов; для ссылок и скриншотов — параметр `&globals=theme:dark`.
- **Stories каждого компонента** устроены одинаково: `Default` (песочница с рабочим v-model) → варианты, размеры, кастомный цвет → состояния → сценарии → `Keyboard`. Правила — [docs/design/STORIES_GUIDE.md](docs/design/STORIES_GUIDE.md).
- Описания props из JSDoc попадают во вкладку Docs: в `build/storybook/main.ts` плагин `vite:vue` подключается раньше docgen-плагина Storybook (при обратном порядке описания молча терялись).

---

# Тестирование

## Все unit/integration тесты

```bash
npm run test:unit
```

## Один тестовый файл

```bash
npm run test:unit -- src/components/BaseChat/__tests__/ChatInput.spec.ts
```

---

# Сборка

## Сборка npm-библиотеки

```bash
npm run build:lib
```

Результат:

```txt
dist/index.js
dist/components.js
dist/composables.js
dist/utils.js
dist/icons.js
dist/index.d.ts
dist/plugin.d.ts
dist/styles.css
dist/styles.d.ts
dist/icons.svg
```

---

# Проверка npm-пакета

```bash
npm run pack:dry
```

Команда собирает библиотеку и показывает, какие файлы попадут в npm package.

---

# Локальная установка `.tgz`

Создать локальный пакет:

```bash
rm -rf dist
rm -f *.tgz

npm run build:lib
npm pack
```

Установить в тестовый проект:

```bash
npm install "D:/IT/IT/Портфолио/Rise-UI-KIT/ramzes1385-rise-ui-kit-x.y.z.tgz"
```

---

# CI/CD

Для локальной проверки перед push:

```bash
npm run ci:validate
```

Команда должна выполнять:

```txt
lint
typecheck (vue-tsc)
unit tests
npm package dry-run
```

---

# Release

Релизы управляются через `semantic-release`.

Локальная проверка:

```bash
npm run release:dry
```

Реальный релиз запускается только в CI/CD после push в `main`.

---

## Conventional Commits

Примеры:

```txt
fix: preserve chat autocomplete enter submit
feat: add base timeline component
docs: update readme
ci: configure semantic release
```

Правила релиза:

```txt
fix      -> patch
perf     -> patch
refactor -> patch
build    -> patch
deps     -> patch
feat     -> minor

docs     -> без релиза
test     -> без релиза
chore    -> без релиза
ci       -> без релиза
style    -> без релиза
```

---

## Нельзя делать вручную

После подключения `semantic-release` не нужно вручную выполнять:

```bash
npm version patch
npm version minor
npm version major
git tag v...
npm publish
```

За версии, changelog, теги, GitHub Release и npm publish отвечает `semantic-release`.

---

# Проверка перед push

```bash
npm run lint
npm run lint:styles
npm run lint:unused
npm run format:check
npm run typecheck
npm run test:unit
npm run build:lib
npm run pack:dry
npm run release:dry
```

После проверки:

```bash
git status
git add .
git commit -m "docs: update readme"
git push origin main
```
