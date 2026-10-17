# Изменения для приложений

Что заметит приложение после обновления на версию с редизайном.

Публичные props, события и слоты не удалялись, добавлены только необязательные props. Изменились значения по умолчанию, часть разметки и доступные имена — на них могут опираться CSS, вёрстка и тесты приложения.

Вид каждого компонента описан в [VISUAL_CHANGES.md](./VISUAL_CHANGES.md). Исправления аудита и остальные изменения 2.0 — в [v2/MIGRATION.md](../v2/MIGRATION.md#коротко-что-нового-и-что-изменилось), раздел «Коротко: что нового и что изменилось».

## Визуальные значения по умолчанию

Значения по умолчанию перенесены из props в стили. Если проп не передан, inline-переменные (`--btn-pad-*`, `--card-pad-*`, `--dd-pad-*`, `--slideover-pad-*`, `--tbl-pad-*`, `--sidebar-pad-*`, `--sep-pad-*`) больше не пишутся. Явно переданное значение (число или объект) работает как раньше.

| Компонент | Проп или параметр | Было | Стало |
|---|---|---|---|
| BaseButton | `padding` | `10` — 10px 20px, высота ≈39px | 5px 10px из `--rise-control-padding-y/x`, высота 32px |
| BaseCard | `padding` | `24` — 24px 48px | 16px 20px; корень задаёт содержимому 14/20 (было 16px) |
| BaseDropdown | `padding` | `8` — 8px 16px | 4px |
| BaseSlideover | `padding` | `24` — по горизонтали | 16px 20px |
| BaseTable | `padding` | `10` — 10px 20px | 12px 16px, строка 44px |
| BaseSideBar | `padding` | `12` (стили переменные не читали) | 8px 12px |
| BaseSeparator | `spacing` | `10` — 10px 20px у подписи | 0 12px |
| BaseImage | `borderRadius` | `12` — inline `calc(12px × масштаб)` | радиус md 6px из стилей |
| BaseFileUpload | `previewSize` | `64` | 40px из стилей |
| BaseDatePicker | `inputVariant` / `calendarVariant` | `outline` / `default` | `default` / `ghost` |
| BaseAvatar | размер при `sizeScale` 100 | 40px | 32px |
| BaseLoader | индикатор | 36px | 32px |
| BaseProgress | линия / круг | 10px / 100px | 8px / 64px |
| BaseEditor | высота области текста | не меньше 232px (200px + отступы) | от 160 до 600px вместе с отступами |

Размеры и раскладка:

- **Контролы стали ниже:** 32px вместо ≈39px. Проверьте ряды, где кнопки и поля кита стоят рядом с элементами приложения.
- **`sizeScale` влияет на ширину.** У BaseSlideover ширина `420px × width/100` дополнительно умножается на `sizeScale`. У BaseSideBar вместе с `sizeScale` масштабируются `width`, `collapsedWidth` и `gap`.
- **BasePopover.** Обёртка была блочной на всю строку, теперь это `inline-flex` по размеру триггера. Минимальная ширина панели — 128px (было 200px).
- **BaseNotification.** Контейнер закреплён у края экрана (`position: fixed`) с отступом 16px (было 20px). Уведомление — до 360px, на телефоне — во всю ширину.
- **BaseTable.** Слоты `header` и `footer` получили отступ 12px 16px и линию-разделитель. Если в слоте есть свой отступ, он удвоится.
- **BaseSlider.** Угловые стрелки стоят снаружи области слайдов — оставьте под них место. При одном слайде стрелок и точек нет.
- **Ширины панелей:** карточка BaseTour — 320px (было 300); минимум BaseMenu — 180px (было 160); выпадающие панели BaseMegaMenu — 240/220px (было 280); панель BaseColorPicker — 170px (было 220).
- **Кнопки закрытия** BaseModal и BaseSlideover (32px), BaseNotification (24px), а также кнопки BaseTour больше не получают inline-отступы: размер задают стили.

## Изменения DOM

Имена переходов получили префикс. Старые глобальные классы больше не объявляются:

| Компонент | Было | Стало |
|---|---|---|
| BaseModal | `modal-fade-*` | `base-modal-*` |
| BaseSlideover | `slideover-*` | `base-slideover-*` |
| BaseDropdown | `dropdown-*` | `base-dropdown-*` |
| BaseTooltip | `tooltip-{top,bottom,left,right}-*` | `base-tooltip-*` |
| BaseNotification | `.list-*` из BaseAnimation | `base-notification-*` |

**Element**

- **BaseButton:** текст слота обёрнут в `span.base-button__label`.
- **BaseIcon:** корень — `<span class="base-icon">` вместо `<div>`.
- **BaseBadge:** текст — `span.base-badge__text`, класса `base-text` на нём нет.
- **BaseChip:** индикатор — `span.base-chip__badge`; inline-переменные `--custom-*` перенесены с корня на индикатор.
- **BaseCard:** подвал — `div.base-card__footer` вместо `<footer>`; у корня `box-sizing: border-box`; при `scroll` у тела `tabindex="0"`.
- **BaseAlert:** описание — BaseText `.base-alert__text` в масштабе алерта; `weight` заголовка — 500.
- **BaseAvatar:**
  - вместо BaseImage и BaseText — `img.base-avatar__img` и `span.base-avatar__initials`; классов `base-image*` и `base-text` внутри нет;
  - 5-секундного таймаута больше нет: инициалы показываются только при ошибке загрузки.
- **BaseProgress:** подпись линии — `.base-progress__status > .base-progress__status-text` внутри `role="progressbar"`, без BaseTooltip и телепорта в `body`. Подпись круга — `span.base-progress__circle-label`.
- **BaseSeparator:** линия — рамка (`border-top`/`border-left`), а не фон. Переопределение `background` у `.base-separator__line` больше не действует.
- **BaseLoader:** `color.bg` больше не красит `dots`, `pulse` и `bars` — все виды берут `color.text`.
- **BaseAnimation, режим `isGroup`:** элементы — прямые потомки `tag` без обёртки `div`, у тега класс `base-animation--group`. Дочерним элементам нужен `key`; `after-enter`/`after-leave` приходят для каждого элемента.

**Form**

- **BaseInput, BaseTextarea:** у поля появился `id`, подпись — `<label for>`, у текста ошибки есть `id`.
- **BaseTextarea:** корень — `display: grid` (был flex-колонкой); модификаторы `--readonly` и `--has-counter`; при `maxlength` выводится `span.base-textarea__counter`.
- **BaseCheckbox, BaseSwitch:** обёртки `div` → `span`. Ошибка — в новой обёртке `div.base-checkbox__error` / `div.base-switch__error` с `id`; пустая обёртка скрыта через `:empty`.
- **BaseRadio:** обёртки `div` → `span`.
- **BaseSelect:**
  - подпись — `<span id>` вместо `<label>`; клик по ней фокусирует триггер;
  - у корня выпадающего списка — класс `base-select__dropdown`;
  - опции — `li[role=option]` с `id` и модификатором `--active`;
  - `__header` и `__footer` выводятся только при переданных слотах;
  - крестик тега — `<button>`; корень с тегами — `base-select--has-tags`.
- **BaseSearch:** поле — BaseInput `.base-search__field`; `TransitionGroup` убран; совпадения обёрнуты в `mark.base-search__match`; у корня модификаторы `--modal` и `--sidebar`.
- **BaseRating:** новые классы `--interactive` и `--disabled`; `--readonly` — только при `isReadonly`.
- **BaseForm:** у BaseLoader больше нет атрибута `size`; вне загрузки оверлей скрыт через `visibility: hidden`.
- **BaseFormField:** у подписи, описания и ошибки есть `id`; обёртка анимации ошибки рендерится только вместе с ошибкой.
- **FormFieldLabel:** inline-стиль `font-weight: 500`.
- **BaseFileUpload:** новый элемент `.base-file-upload__icon`; обе подсказки — в одной обёртке `.base-file-upload__hint`; `.base-file-upload__preview` выводится всегда; ошибки — `ul > li` без нумерации «1.».
- **BaseCalendar:** если вид переключить нельзя, заголовок — текст, а не кнопка.

**Data**

- **BaseTable, структура:**
  - новая обёртка `.base-table__content`;
  - подложка загрузки — BaseLoader `.base-table__loading-overlay`;
  - `thead.base-table__thead` и `tbody.base-table__tbody`;
  - у `<col>` классы `--check`, `--number`, `--expand` вместо inline-ширин;
  - у строк модификаторы `--even` и `--skeleton`.
- **BaseTable, содержимое:**
  - подпись заголовка — `span.base-table__th-label`, тултип «Сортировать» удалён;
  - пустое состояние — BaseEmpty `.base-table__empty`;
  - вложенная таблица без `variant="bordered"`;
  - фильтр удаляется кнопкой `.base-table__filter-remove`; `.base-table__filter-sep` удалены.
- **BaseTree:** метка — `span.base-tree__label`. У чекбокса в режиме multiple есть скрытая подпись, поэтому `getByText(метка)` находит два элемента.
- **BaseSlider:**
  - новая обёртка `.base-slider__stage`;
  - точки и миниатюры — нативные `<button>`, классы прежние;
  - невидимые слайды — `inert`;
  - если листать нечего, стрелок и навигации нет.
- **BaseImage:**
  - `<picture>` обёрнут в `.base-image__frame`: с зумом это `<button aria-haspopup="dialog">`, без зума — `div`;
  - миниатюры в просмотре — `<button>`.

**Navigation**

- **Подписи вместо BaseText:** в BaseTabs, BaseAccordion, BaseStepper и BaseMenu — `span`/`p`. Классы `base-tabs__label` и `base-accordion__label`.
- **BaseBreadcrumbs:** крошки, «домой» и «…» — `button.base-breadcrumbs__link` (без класса `base-button`). При `showHome` первая крошка не дублируется.
- **BasePagination:** классы `__page`, `__page--current`, `__arrow`; многоточие — «…».
- **BaseMegaMenu:** заголовок колонки — нативный `h4`. Режим аккордеона включает класс `--accordion`, а не медиазапрос.
- **BaseSideBar:** заголовок — нативный `h3`. Кнопка сворачивания одна для обоих состояний и всегда внутри BaseTooltip.

**Overlay**

- **BaseModal, BaseSlideover:** тело получает `tabindex="0"`, только когда прокручивается. У BaseSlideover теперь применяются `sizeScale` и `color`: на корне появляются `--size-scale` и `--custom-*`.
- **BaseTooltip:** класс варианта `base-tooltip--{variant}` → `base-tooltip-popup--{variant}`. Туда же перенесены `--size-scale` и `--custom-*`.
- **BasePopover:** у корня появился класс `base-popover`.
- **BaseTour:** карточка больше не BaseCard — это `.base-tour__panel` с элементами `__header`, `__content`, `__footer`; туда же вешается `customClass.cardInner`. «Далее» и «Завершить» — одна кнопка.
- **BaseNotification:** `add({ variant })` оформляет только это уведомление. Пустые участки контейнера пропускают клики.
- **Слоты не наследуют цвет.** Обёртки слотов (Card, Modal, Slideover, Dropdown, Table, Tree, Select, Chat и др.) сбрасывают `--custom-*`, поэтому проп `color` не перекрашивает кнопки и поля внутри.

**Chat, Editor**

- **BaseChat:**
  - внутри нет BaseText;
  - аватар в шапке — `button`, поиск — нативный `input[type=search]`;
  - реакции, цитата и закреп — кнопки;
  - время и статус вынесены в `.base-chat-message-list__footer`;
  - панель «Информация» — BaseSlideover и рендерится только открытой;
  - `.base-chat__confirm-actions` больше нет.
- **BaseEditor:**
  - группы тулбара — `div`;
  - класс кнопки загрузки `base-editor__btn--color` → `--file`;
  - `input[type=file]` скрыт визуально и доступен по Tab;
  - изображение вставляется с `alt=""`;
  - у корня `overflow: hidden`.
- **BaseImageMap** (new-image-map-2):
  - панель (`__toolbar`) и окно карты (`__viewport`) теперь внутри `.base-image-map__layout > .base-image-map__main` — селекторы вида `.base-image-map > .base-image-map__viewport` перестанут работать, используйте `.base-image-map .base-image-map__viewport` или `customClass`;
  - на корне `container: base-image-map / inline-size`: корень больше не растягивается по содержимому — в контейнере без явной ширины (flex-элемент с `width: auto`, `inline-block`) задайте ширину карте.
- **BaseImageMap3D** (maps-detail): без `hasDirectory` рядом с областью карты — скрытые визуально `ul.base-image-map-3d__objects` — по одному списку на каждый этаж, текущий первым (кнопки объектов этажа, `tabindex="-1"`); текст состояния слоя лежит в `span.base-image-map-3d__state-text` внутри `.base-image-map-3d__state` (плашка с фоном темы). Тесты приложения, которые ищут `button` или `role="button"` внутри карты, увидят кнопки списка — сужайте поиск до `.base-image-map-3d__viewport`.
- **BaseImageMap (2D)** (maps-detail):
  - SVG слоя без `viewBox` теперь растягивается по слою (`width`/`height` корня или размер слоя), а не рисуется в пикселях экрана — браузер такой SVG не масштабирует, кит делает это намеренно, чтобы план совпал с фигурами объектов. Явное соответствие — `viewBox="0 0 {layer.width} {layer.height}"` в корне SVG;
  - вид (масштаб и точка в центре) сохраняется при изменении размера окна и замене `data`; сбрасывается при смене слоя с планом другой пропорции. Приложение, которое после поворота экрана само вызывало `resetZoom`, может этого больше не делать;
  - на SVG слоя, кроме элементов объектов, — `pointer-events: none`: обработчики приложения на декоре SVG (подписи, линии, иконки) перестанут срабатывать.

## Доступность

**Формы**

- **BaseInput, BaseTextarea:** подпись связана с полем; ошибка — `aria-invalid` + `aria-describedby`; есть `aria-required`. У Textarea в описание входит и счётчик.
- **BaseCheckbox, BaseSwitch:** `aria-invalid` (у Switch также `aria-required`). Ошибка, в том числе из слота `error`, описывает контрол.
- **BaseRadio:** `radiogroup` с именем из заголовка и атрибутами `aria-required`/`aria-invalid`/`aria-describedby`.
- **BasePin:** `role="group"`; у ячеек имена «Символ N из M».
- **BaseFormField:** без `for` содержимое получает `role="group"` с `aria-labelledby`/`aria-describedby`.
- **BaseForm:** статус «Загрузка» скрытого оверлея больше не озвучивается.
- **BaseSelect:** триггер — `combobox` со списком `listbox`/`option`. Стрелки и Home/End перемещают, Enter/Space выбирают, Tab закрывает; при открытии фокус переходит в поиск.
- **BaseSearch:** у поля есть имя; «Очистить» не попадает в порядок Tab. Режимы modal и sidebar — `dialog` «Поиск».
- **BaseColorPicker:** SV-область — фокусируемый слайдер (стрелки). У пресетов `aria-pressed`, у образца `aria-expanded`.
- **BaseRange:** у ползунков есть имена (`ariaLabel`, «Минимум»/«Максимум», «Точка N»). Отключённый ползунок исключён из порядка Tab.
- **BaseRating:**
  - интерактивный — `slider` с `aria-valuetext` «3 из 5», работают Home/End;
  - readonly — `img` «Оценка 4.5 из 5» вне порядка Tab;
  - отключённый не получает фокус.
- **BaseCalendar, BaseDatePicker:** у дня полная дата в имени и `aria-pressed`; у сегодняшнего `aria-current="date"`; время — группа «Время».
- **BaseFileUpload:** ошибки связаны с зоной; кнопка удаления — «Удалить {имя}», в отключённом состоянии недоступна; прогресс назван именем файла.

**Отображение и данные**

- **BaseCard, BaseModal, BaseSlideover:** прокручиваемое тело доступно по Tab.
- **BaseAvatar:** точка статуса — `role="img"` «в сети».
- **BaseSkeleton:** `aria-hidden="true"`.
- **BaseImage:** изображение с зумом — кнопка (Enter/Space). В просмотре фокус удерживается и возвращается; миниатюры — «Изображение N из M».
- **BaseSlider:** «Предыдущий/Следующий слайд»; у точек и миниатюр — «Слайд N из M» с `aria-current`. Невидимые слайды — `inert`.
- **BaseTable:**
  - чекбоксы «Выбрать все строки» / «Выбрать строку N»;
  - у кнопки раскрытия `aria-expanded`, у отключённой строки `aria-disabled`, при загрузке `aria-busy`;
  - прокручиваемая область и панель «Колонки» доступны с клавиатуры.
- **BaseTree:** у отключённого узла `aria-disabled`; чекбокс назван меткой узла; действия видны при фокусе.

**Навигация и оверлеи**

- **BaseTooltip:** `role="tooltip"`; подсказка появляется при фокусе и скрывается по Escape и `focusout`.
- **BaseTour:** фокус удерживается в карточке и возвращается после закрытия.
- **BaseMegaMenu:** узел — `role="button"` с `aria-expanded`/`aria-disabled`, активируется Enter/Space.
- **BaseStepper:** шаг — `role="button"` в порядке Tab, у текущего `aria-current="step"`.
- **BaseSideBar:** у ссылок в свёрнутой панели есть `aria-label`; кнопка сворачивания не теряет фокус.

**Chat, Editor**

- **BaseChat:**
  - лента — `role="log"`;
  - реакции — кнопки с `aria-pressed`;
  - «Другие действия с сообщением» открывает `menu` со стрелками;
  - панель — диалог с вкладками `tablist`;
  - Enter во время IME не отправляет сообщение.
- **BaseEditor:**
  - `textbox` «Текстовый редактор» и `toolbar` «Форматирование»;
  - у кнопок есть имена и `aria-pressed`;
  - горячие клавиши Ctrl/⌘+B/I/U;
  - меню медиа — `dialog`.

Изменённые имена и роли (важно для `getByRole(…, { name })`):

| Компонент | Было | Стало |
|---|---|---|
| BaseChat, крестик панели | «Закрыть панель информации» | «Закрыть» |
| BaseEditor | «Сбросить цвет текста» / «Сбросить цвет фона» | «Сбросить цвет» / «Сбросить фон» |
| BaseFileUpload, удаление | `title="Удалить"` | `aria-label="Удалить {имя}"` |
| BaseSlider, миниатюры | alt слайда или «Video thumbnail» | `alt=""` |
| BaseRating, readonly | `slider` | `img` |

**Кнопки-шаги на пределе (small-fixes-9a/9b)**

- Кнопки, которые отключаются от собственного нажатия, на пределе получают `aria-disabled="true"` вместо `disabled` и остаются в фокусе и в порядке Tab: масштаб BaseImage, BaseImageMap и BaseImageMapEditor, «Назад»/«Вперёд» BasePagination и BaseCalendar, стрелки BaseSlider, скорость BaseMediaPlayer, перенос BaseTransfer, «Отменить штрих»/«Очистить» BaseSignaturePad, «Прочитать все» BaseNotificationCenter. Раньше фокус с такой кнопки уходил в `body`.
- Тесты приложений, которые проверяли `toBeDisabled()` или атрибут `disabled` у этих кнопок, — теперь `toHaveAttribute('aria-disabled', 'true')`; CSS `button:disabled` — `[aria-disabled='true']` или `.base-button--disabled`. При `isDisabled` всего компонента — по-прежнему `disabled`.
- Свои кнопки так же: `<BaseButton :is-disabled="…" is-focusable-when-disabled>` (MIGRATION, small-fixes-9a).

**BaseImageMap3D (maps-detail)**

- Без каталога карта даёт скринридеру скрытые списки объектов — по одному на каждый этаж, текущий первым: `ul` «Список объектов, Этаж 1», «Список объектов, Этаж 2», кнопки с `aria-current` у выбранного, `aria-disabled` у отключённого, `aria-haspopup="dialog"` у объектов с окном, ссылки `<a>` у объектов-ссылок. Нажатие — как щелчок по объекту (`select`, `update:active`, окно или действие). В Tab список не входит — для клавиатуры стрелки в области. Подробности — [MAP3D.md](../reference/MAP3D.md), «Выбор, клавиатура и скринридер».
- Загрузка плана этажа помечена `aria-busy` без озвучивания; ошибка загрузки и карта без слоёв — плашка поверх сцены (`aria-hidden`), текст — в единственном `role="status"` под картой (пока видна плашка, строка скрыта визуально; maps-detail-2).
- Если фокус был в скрытом списке объектов, а список перерисовался (переход по объекту с `action: 'layer'`, смена этажа, фильтры), фокус переходит на область карты, а не в `body`; внешние ссылки списка озвучиваются с «(откроется в новой вкладке)» (maps-detail-2).

## Новое в API

- **BaseRange:** необязательный проп `ariaLabel`.
- **FormFieldLabel и FormFieldError:** новые props `forId` и `id`.
- **`useScrollableRegion({ elementRef })` → `{ isScrollable }`** в `composables`: даёт `tabindex="0"` только прокручиваемой области.
- **BaseEditor:** CSS-переменные `--editor-min-height` и `--editor-max-height` на корне; по умолчанию 160 и 600px, масштабируются `sizeScale`.
- **Иконки:** новые `star-filled`, `upload` и `dots-horizontal` (в спрайте 94 иконки). BaseRating с `icon="star"` без `iconFilled` заливает звёзды иконкой `star-filled`.
- **Поведение существующих props:**
  - `allowedChars` у BaseInput теперь работает (раньше игнорировался);
  - `show` у BaseAnimation по умолчанию реактивный;
  - BaseTextarea с `maxlength` показывает счётчик.
- **BaseImageMap3D — 3D-карта этажей** (задача map3d, [MAP3D.md](../reference/MAP3D.md)): только для приложений, которым она нужна; остальным делать ничего не надо — основной вход three.js не тянет.
  - Импорт — из `@ramzes1385/rise-ui-kit/map3d`, не из корня пакета: в корень, `/components` и плагин компонент не входит.
  - Установить `three` (необязательная peer-зависимость, `>=0.180.0 <0.200.0`) и в dev `@types/three`. Без `three` сборка падает на импорте `/map3d` (Vite 8 — `[MISSING_EXPORT] … __vite-optional-peer-dep:three`), основной вход собирается.
  - Модели этажей GLB (`layer.model.url`) отдавать со своего домена или CDN с CORS; закрытое хранилище — через посредник приложения.
  - Сжатые модели (DRACO, KTX2, meshopt) — декодеры приложения через проп `configureLoader(loader)`; кит их не подключает.
  - JSON карты общий с BaseImageMap и BaseImageMapEditor: 3D-поля (`layer.elevation`, `layer.model`, `object.height3d`, `object.meshName`, `scene3d`) необязательны, редактор их сохраняет, 2D-карта их не читает. Без WebGL карта показывает 2D и шлёт `fallback`.
  - Редактор BaseImageMapEditor показывает поля 3D в панели свойств только с пропом `has3dFields` (по умолчанию `false`; или `defaults.BaseImageMapEditor.has3dFields` в плагине). Без него 3D-поля не видны, но импорт и экспорт JSON их сохраняют.
  - Касание (map3d-polish): при `hasOrbit: false` палец над картой прокручивает страницу; при `hasOrbit: true` (по умолчанию) жесты забирает камера, щипок двумя пальцами — масштаб. Уход Tab из карты снимает фокус объекта и карточку; имя области с `ariaLabel` теперь включает этаж.
  - Подробные объекты (maps-detail): `object.parts` (части объекта `svg` — свой элемент SVG, `height3d`, `base3d`), `scene3d.bevel` (скос кромок) и `scene3d.outline` (контур по рёбрам; по умолчанию включён — `outline: false` и `bevel: 0` возвращают прежние плоские призмы). Тип `ImageMap3DObjectPart` экспортируется из `/map3d`. Соответствие SVG и слоя, поддерживаемые элементы SVG — MAP3D.md, «План в SVG».
- **BasePresentationPlayer — озвучка сервисом** (presentation-tts): проп `speechProvider`, событие `speech-error` (`{ slide, error }`, слайд откатывается на синтез браузера) и утилита `createFetchSpeechProvider` из `@ramzes1385/rise-ui-kit/utils`. Ключ сервиса синтеза — только на сервере приложения: браузер ходит в свой посредник; пример посредника (Node и edge) — docs/reference/COMPONENTS.md, BasePresentationPlayer → «Озвучка через сервис».
- **Внутренние константы** (`@constants`, в пакет не экспортируются): добавлены `TABLE_TEXT`, `UI_RATING` и тексты `UI_CHAT_TEXT`/`UI_EDITOR`; удалены `ROW_SELECTION_WIDTH`, `ROW_NUMBER_WIDTH` и `ROW_EXPAND_WIDTH`.

## Токены

- **Компоненты читают только `--rise-*`.** Переменные 1.x (`--color-*`, `--shadow-*`, `--border-radius-*`, `--transition-*`, `--font-family-*`) остались алиасами новых токенов. Их можно читать в CSS приложения, но переопределение `--color-accent` компоненты больше не перекрашивает. В 2.0 алиасы остаются, удалены они будут в следующей мажорной версии.
- **Часть алиасов сменила значения.**
  - Светлая тема:
    - `--color-accent`: `#f97316` → `#c2410c`;
    - `--color-accent-hover`: `#e06a1d` → `#9a3412`;
    - `--color-error/success/warning/info` — оттенки 600/700 вместо 500;
    - `--color-primary-soft` — непрозрачный orange-50;
    - `--color-sidebar-*` — нейтральные.
  - Тёмная тема: `--color-bg`: `#09090b` → `#27272a`.
  - `--shadow-xl` — другая тень.
- **Бренд.** Переопределите палитру `--rise-color-primary-50…950` на `:root` (пример — Storybook, Foundations/Theming). Семантические токены вычисляются на `:root` и на элементах с `data-theme`, поэтому для части интерфейса палитру задают на элементе с `data-theme`.
- **Тема.** `data-theme="dark"` ставится на `<html>` или на контейнер; вложенная `data-theme="light"` возвращает светлую. `color-scheme` меняется вместе с темой. Правила `[data-theme='dark'] .base-x` не нужны.
- **Радиус.** `--rise-radius` (4px) задаёт шкалу: sm 4, md 6, lg 8px. Значение `0` делает интерфейс строгим, `8px` — мягким.
- **Плотность.** Сид `--rise-density` (1) умножает отступы контролов (`--rise-control-padding-y-base` 5px, `-x-base` 10px) и поверхностей (BaseCard; остальные — по мере групп тем). Высота контрола = 1 + отступ + 20 + отступ + 1. `--rise-control-padding-y/x` теперь производные и пересчитываются на каждом `[data-theme]`: значение, заданное на `:root`, во вложенной теме не действует — задайте `-base` или `--rise-density`.
- **Шрифты.** Токены `--rise-font-sans` и `--rise-font-mono`; `@font-face` подключает приложение (README, «Шрифты»). `styles.css` не задаёт шрифт `body` — добавьте `body, button, input, textarea, select { font-family: var(--rise-font-sans); }`.
- **Контраст.** Проверка — `npm run test:contrast`, отчёт — [contrast.md](./contrast.md). На `bg-elevated` вторичный текст — `--rise-text-toned`, на мягком фоне роли — `--rise-{роль}-text`.
- **Движение (motion-core).** Пресет — `data-rise-motion="none | subtle | standard | expressive"` на `<html>` или контейнере, для всего приложения — `createUiKitPlugin({ motion })`; выключить всегда — `reducedMotion: 'always'`. Новые токены `--rise-duration-xslow`, `--rise-ease-emphasized`, `--rise-ease-spring`, `--rise-motion-distance/-scale-from/-stagger`. Системное «уменьшить движение» действует и внутри областей с пресетом (DESIGN_SYSTEM, раздел 6).
- **Тема на области** — `data-rise-theme` и `data-theme` на одном элементе: без `data-theme` сиды (палитра, радиус, плотность) не пересчитают семантику. Телепортированные панели (выпадающие списки, подсказки, календарь, контекстные меню) копируют с якоря оба атрибута.
- **Токены компонентов** `--rise-<компонент>-…` (пока BaseButton, BaseInput, BaseCard — docs/design/COMPONENT_TOKENS.md) читаются с запасным значением: задайте на `:root`, в теме или контейнере. Заданные на произвольном контейнере не попадают в телепортированные панели — задайте их в теме или на `:root`.
- **Тени и фон темы**: `--rise-shadow-strength` (1) — сила всех теней; `--rise-color-neutral-0` (`#fff`) — фон светлой темы и инверсные белые; `--rise-font-heading` — шрифт заголовков (по умолчанию как `--rise-font-sans`).
- **Слой CSS**: `@ramzes1385/rise-ui-kit/styles.layer.css` кладёт кит в `@layer rise` — CSS приложения правит любую часть (`.base-card__header`) без `!important`. Классы частей — также проп `ui`.
- **Reduced motion** действует и внутри тем: длительности обнуляются на `[data-theme]` и `[data-rise-theme]`.

## Задача fix-ui: волны 5–6 и правки общей проверки

Записи по MIGRATION разделов `table-audit`, `table-2`, `chat-features`, `chat-2`, `a11y-fixes`, `editor-pickers`, `editor-2`, `maps-polish`, `misc-a` и `fix-ui`: то, что заметит приложение в DOM, порядке Tab и умолчаниях. Подробности и ломающие изменения (`!`) — в [v2/MIGRATION.md](../v2/MIGRATION.md).

**DOM**

- **BaseTable.** У свёрнутой раскрываемой строки нет пустого `tr.base-table__tr--expanded-content`: он появляется, пока строка раскрыта или сворачивается (селекторы и сдвиг строк в тестах). В режиме `loadMode: 'infinite'` под таблицей лежит `div.base-table__sentinel` (`aria-hidden`, высота 1px). Корень тулбара — `role="toolbar"` с именем «Инструменты таблицы», элементы панели получают `tabindex` и `data-toolbar-item`. Ручка ресайза — `role="separator"` на pointer events.
- **BaseEditor.** Внутри `.base-editor` появился слой `.base-editor__frame`, который несёт рамку, фон, радиус и тень: стили приложения на `.base-editor { border … }` перенесите на него. Кнопки «Изображение» и «Видео» — `BaseButton` вместо `<label>`, класс `base-editor__btn--file` удалён, файловое поле скрыто. С `name` добавляется скрытое `<input type="hidden">`. Диалог ссылки вместо `window.prompt`.
- **BaseSideBar.** Пункты-ссылки — `<a class="base-link base-link--ghost base-side-bar-nav__link">` (BaseLink): селекторы приложения по `.base-link` затрагивают и сайдбар.
- **BaseImageMap3D.** Список объектов для скринридера — по списку `ul.base-image-map-3d__objects` на каждый этаж (раньше один); в панели камеры новая кнопка «Во весь экран» (`:has-fullscreen="false"` убирает).
- **BaseProgress, BaseNotification, BaseTour.** Полоса таймера — BaseProgress с `countdown` (`div.base-progress--countdown`, `aria-hidden`); у BaseTour убраны `ui['progress-bar-fill']` и `--tour-progress`. RTL-правила написаны через `[dir='rtl'] &`.
- **BaseChat.** «Исключить» и «Забанить» спрашивают подтверждение; `ban-member` отдаёт только `{ memberId }`; «Открепить» вызывает `unpin-message`; для «не отправлено» (`status: 'failed'`) — кнопки «Повторить» и «Удалить» и скрытое меню.
- **BaseChat (правки fix-chat).** Публичные `useChatActions` и `useChatState` сменили контракт, появилось событие `write-message` — подробности в [MIGRATION](../v2/MIGRATION.md), «Задача fix-chat». «Не отправлено» у сообщения — обычный текст в группе, а не `role="alert"`: сбой, случившийся после открытия чата, озвучивает постоянная скрытая live-область ленты. Фокус после «Повторить» и «Удалить» уходит в поле ввода только при вызове с клавиатуры (после клика мышью остаётся как есть). `useChatState` возвращает новое поле `visibleSelectedCount`; у `ChatSelectionToolbar` появился необязательный проп `visibleSelectedCount`.
- **BaseInput `type="search"`.** Кнопка «Очистить» теперь в порядке Tab (раньше `tabindex="-1"`).

**Порядок Tab и клавиатура**

- **BaseEditor.** Панель — одна остановка Tab (было около 21), внутри стрелки, Home и End; область текста `isReadonly` входит в порядок Tab.
- **BaseTable, BaseToolbar.** Панель — одна остановка Tab; в текстовом поле стрелка уводит фокус только у края текста, в числовом поле и поле e-mail стрелки остаются в поле. Delete и Backspace на метке фильтра удаляют её. После «Повторить» и «Удалить» в BaseChat фокус переходит в поле ввода только при вызове с клавиатуры (после клика мышью остаётся как есть).
- **BaseChat.** Enter на открытой подсказке `@` и `/` выбирает пункт и не отправляет сообщение; ArrowUp в пустом поле открывает правку последнего своего сообщения.
- **BaseInput `type="search"`.** Esc в непустом поле очищает его и не доходит до окна, в котором оно стоит.
- **BaseFileManager.** После отмены окна фокус возвращается на кнопку, а при `activeElement === body` (Safari) — на элемент списка.

**Умолчания и поведение**

- **BaseTable.** Фильтр по датам считает сутки момента времени (`Date`, timestamp, ISO с зоной) в поясе пользователя, раньше в UTC; пояс задаёт `timeZone`. `selectAllScope="page"` не сбрасывает выбор других страниц; смена `pageSize` не сбрасывает управляемый `page`. Страницу, выбор и раскрытие строк можно вести снаружи: `v-model:page`, `v-model:selectedIds`, `v-model:expandedIds`. `useTableSelection().selectedIds` стал `ComputedRef`.
- **BaseEditor.** Enter вставляет абзац, Shift+Enter — `<br>`; цвет текста по умолчанию — цвет области, а не `#000000`.
- **BaseImageMap3D.** `hasFullscreen`, `hasLegend`, `isPulsing` работают в 3D-виде; `scene3d.outline: true` рисует контур по рёбрам GLB.
- **BaseBadge.** Кликабельная точка без `label` получила имя «Индикатор» и предупреждение в консоли.

**Сборка**

- Ленивые чанки плагина: приложению с `createUiKitPlugin` стартовая загрузка меньше, с именованными импортами — без изменений (измерения — FOLLOW_UPS, «Задача misc-a»).

## Задача layout-maps

- **BaseDashboardGrid**: в режиме редактирования у карточки вверху полоса-ручка высотой в верхний отступ тела (раньше — значок поверх угла); содержимое не сдвигается. Автопрокрутка у края окна включена всегда.
- **BaseGantt**: связи `{ id, type }` (`FS`, `SS`, `FF`, `SF`) в `dependencies`; у полосы с предшественниками — `aria-describedby` на описание связей.
- **BaseMegaMenu**: `drilldown="auto"` теперь переключается на drill-down и в меню уже 480px (проп `drilldownBelow`, `0` — как раньше).
- **BaseMap**: значок кнопки «Моё местоположение» — `crosshair`; выбор метки сбрасывается при пустом списке; цвета фигур следуют за темой страницы и приводятся к hex (Google).
- **BaseImageMapEditor**: удаление объекта (кнопка), этажа и группы идёт через окно подтверждения (`alertdialog`) — тесты приложения подтверждают диалог; Delete на холсте и `deleteSelected()` удаляют сразу.
- **BaseColorPicker**: принимает `var(--rise-…)` в `modelValue` и палитры с токенами (`getKitTokenPalette()`).
- **BaseImageMapEditor**: переключатель «Контур по рёбрам» у карты из одних GLB-этажей по умолчанию выключен (умолчание в JSON не менялось: без `scene3d.outline` у GLB контура нет). **BaseImageMap3D** в `layerMode: 'stack'` при смене этажа не пересоздаёт маршрут.

## Задача editor-3

- **BaseEditor, отмена**: Ctrl/⌘+Z, Ctrl/⌘+Shift+Z и Ctrl+Y (кроме macOS) выполняет сам редактор, а не браузер: набор склеивается в шаг по паузе 500 мс, каждая команда панели, вставка и перетаскивание — отдельный шаг. Внешнее изменение `v-model` очищает историю. Меню «Правка → Отменить» и жест iOS работают, только пока в нативном стеке браузера есть набор.
- **BaseEditor, вставка и перетаскивание**: вместо `paste` и `drop` — `beforeinput` с `insertFromPaste` и `insertFromDrop`. Тесты приложения, которые шлют синтетические `paste`, должны слать `beforeinput` с `dataTransfer`.
- **BaseEditor, абзацы**: вставленный блок (`<p>`, список, `<hr>`) разрезает текущий абзац; перенос строки Shift+Enter в конце блока ставит два `<br>`.
- **BaseEditor, разметка на выходе**: начертание — `<b>`, `<i>`, `<u>`, `<s>`; цвет и фон — `<span style>`; выравнивание — `style="text-align"` у блока; Enter всегда даёт `<p>`; `document.execCommand` не используется, поэтому результат одинаков в Chrome, Firefox и Safari. Вставка блока HTML режет текущий абзац.
- **BaseEditor, `rootRef.innerHTML`**: пока включено начертание или цвет на каретке, в области лежит невидимый символ U+200B; `update:modelValue` и `getHtml()` его убирают.


## Задача layout-fix

Запись добавил оркестратор при сведении волны 7; подробности — `docs/v2/MIGRATION.md`, «Задача layout-fix».

- **BaseDashboardGrid**: перенос и изменение размера указателем начинаются после смещения не меньше 3 px — тесты приложения, которые жмут на ручку и ждут `change` без движения, перестанут его получать. Автопрокрутка у края окна прокручивает мгновенно (`behavior: 'instant'`), даже если у страницы `scroll-behavior: smooth`.
- **BaseColorPicker**: доступное имя образца токена — имя токена («Пресет primary»), а не строка `var(--rise-primary)`; тесты и селекторы по старому имени нужно обновить.
- **`normalizeCssColor` / `resolveCssColor`**: цвет, который браузер не разобрал, даёт `null` вместо `#000000` — проверьте обработку `null`, если результат шёл дальше без проверки.

## Задача editor-4

Подробности — `docs/v2/MIGRATION.md`, «Задача editor-4».

- **`useHotkeys`, `matchesHotkey`**: буква сочетания — латинская из `event.key`, иначе физическая клавиша из `event.code`. Dvorak, Colemak и QWERTZ получают сочетания на клавише с нужной буквой; тесты с событиями без `key` нужно дополнить.
- **BaseEditor, `blob:`**: адреса вставленных изображений и видео освобождаются при размонтировании и при сбросе истории (если их больше нет в содержимом). Для постоянного хранения загружайте файл и подставляйте свой адрес.
- **BaseEditor, режим кода**: обёртки тегами из панели отменяются Ctrl+Z вместе с набором (нативная история поля).

## Задача table-search

Подробности — `docs/v2/MIGRATION.md`, «Задача table-search».

- **BaseTable**: у выбираемой таблицы (`behavior.selectable`) под таблицей появился пустой элемент `div[role="status"].base-table__selection-status`; он заполняется, когда выбранные строки скрыты поиском или фильтрами («Выбрано 2 скрытые строки — они остаются в выборе»). Выбор при смене фильтра по-прежнему не снимается, `select` содержит и скрытые выбранные строки. Селекторы тестов приложения по `role="status"` внутри таблицы стоит уточнить.
- **BaseTable**: `isManualFiltering` и `isManualSorting` отключают клиентские поиск, фильтры и сортировку (по умолчанию выключены) — для серверной таблицы со своим запросом по событиям `search`, `filter`, `sort`.

Порция 3 (BaseSearch):

- **BaseSearch**: новый проп `source` (асинхронный источник с защитой от гонок ответов). Без него поведение прежнее, но клавиатура изменилась: после Escape ввод снова открывает список, Enter в закрытом списке не выбирает скрытый пункт и не отменяется, пока нечего выбирать (форма отправится), Enter при композиции IME игнорируется, внешняя смена `modelValue` отменяет отложенный `search`. Тесты приложения, опиравшиеся на прежнее, нужно поправить.

## Задача player

Подробности — `docs/v2/MIGRATION.md`, «Задача player».

- **BaseMediaPlayer**: у кнопок панели, переключателя, блока субтитров и ссылок актёров больше нет атрибута `data-tooltip`: подсказка — `BaseTooltip` (`role="tooltip"`, внутри `.base-media-player__layer`). Тесты и стили приложения, которые читали `[data-tooltip]`, обновите; подсказка появляется после 100 мс наведения или при фокусе.
- **BaseMediaPlayer**: кнопки пресетов скорости — `BaseButton` (`.base-button`); стили приложения под `button.base-media-player__speed-preset` нужно переписать на `.base-media-player__speed-preset`.

## Задача nav-media

Подробности — `docs/v2/MIGRATION.md`, «Задача nav-media».

- **BaseSlider**: появился `v-model:index`; у `slidesPerGroup`, не кратного числу слайдов, добавилась остановка на последнем слайде (точек на одну больше); касание поперёк оси слайдер не листает.
- **BasePagination**: малый (меньше трёх) и дробный `maxVisible` показывают как минимум первую, текущую и последнюю страницы.
- **BaseStepper**: `modelValue` вне диапазона показывается ближайшим шагом и даёт предупреждение в консоли; `length + 1` больше не означает «все шаги пройдены».
- **BaseAccordion**: `items` необязателен.
- **BaseLoader**: подложка `isOverlay` лежит под окнами кита (`z-index` 999 вместо 9999); содержимое контейнера с `z-index` выше 999 окажется над ней.
- **BaseSubtitleEditor**: ошибка времени озвучивается скринридером; на шкале есть подсказка.

## Задача image-touch

- **BaseImage, просмотр**: увеличенное изображение двигается перетаскиванием мышью и пальцем, щипок двумя пальцами меняет масштаб. Область изображения не пропускает жесты браузеру (`touch-action: none`), курсор над увеличенным изображением — «рука». При увеличении стрелки двигают изображение, а не листают галерею (у края изображения и без увеличения листают). Тесты приложения, которые жмут стрелку при масштабе больше 100% и ждут следующего кадра, нужно перевести на кнопки галереи или на 100%.

## Задача notify-sidebar

Подробности — `docs/v2/MIGRATION.md`, «Задача notify-sidebar».

- **BaseNotification**: `add()` с `notificationKey` обновляет показанное уведомление, а не добавляет второе; `color`, `sizeScale`, `position`, `customClass` из `add()` теперь применяются (раньше игнорировались); уведомления с разными `position` рисуются отдельными областями-регионами. Если приложение передавало эти поля «про запас», проверьте вид. Новый проп `maxVisible` (по умолчанию без предела).
- **BaseSideBar**: `activePath` с «/» на конце, query или хешем теперь активирует пункт; группу с активным пунктом можно свернуть; пункты с одинаковым ключом раскрываются независимо, кит предупреждает в консоли; `isCollapsed` определяется по текущему значению пропа (непереданный = `undefined`).
- **BaseChat**: меню сообщения переворачивается у правого и нижнего края окна и ограничивает высоту при нехватке места; внутри предка с `transform` позиционируется верно. Тесты приложения, которые проверяли `style.top/left` меню у края окна, нужно обновить.

## Задача wave8-fix2a

- BaseTable: русский текст скрытых выбранных строк согласуется с числом («Выбрана 1 скрытая строка», «Выбраны 2 скрытые строки», «Выбрано 5 скрытых строк»); тесты приложения со старой строкой обновите. Живая область выбора больше не `display: none` (скрыта визуально). Запросы `getByRole('status')` в тестах приложения теперь находят и её (пустую): уточняйте по тексту.
- BaseSearch с `source`: при ошибке источника показывается «Не удалось выполнить поиск. Попробуйте ещё раз» вместо «Ничего не найдено»; внешняя смена `modelValue` отменяет идущий запрос.
- BaseEditor: вставка после выделения от начала области до середины списка попадает в пункт `<li>`; в режиме кода одно `update:modelValue` на правку.

## Задача wave8-fix3b

- BaseSlider: «Запустить» при включённом «уменьшить движение» запускает автопрокрутку; `index` за краем при монтировании возвращается в `update:index`.
- BaseSideBar: `defaults.BaseSideBar.isCollapsed` задаёт только начальное состояние, панель остаётся неуправляемой; управляемой её делает явно переданный `isCollapsed`.
- BaseNotification: при нескольких областях имена содержат положение («Уведомления: внизу слева»); тесты приложения, ищущие `region` по имени «Уведомления» при нескольких областях, уточните. Пауза по наведению — по областям.
- BasePagination: `modelValue` за краем: текущей считается ближайшая существующая страница (`aria-current`, «назад»/«вперёд» от неё).
- BaseChat: меню сообщения у нижнего края при открытии кнопкой «Другие действия» встаёт над кнопкой.

## Задача wave8-tails

- BaseEditor: у кнопок «Цвет текста» и «Цвет фона» на панели удалены классы `base-editor__color-picker` и `base-editor__color-picker--active` и переменная `--editor-swatch-color`. Замена: классы BaseColorPicker (`base-color-picker__swatch--indicated`, переменная `--picker-swatch-color`) или `ui`/`customClass` редактора. Вид кнопок не менялся.
- BaseDashboardGrid: при `gap` меньше 8 px ручка в режиме правки не ниже `24px − gap` (на недостающую часть выше), псевдоэлемент `::after` убран. Область нажатия не меньше 24 px и не заходит на верх карточки; при `gap` ≥ 8 px ничего не меняется.

## Задача wave8-fix3a

- BaseTooltip: id подсказки не добавляется в `aria-describedby` триггера, если её текст уже есть в одном из связанных описаний (элементы по id из `aria-describedby` триггера или самой подсказки). Читалка не повторяет «Доступно через N с» дважды.
- BaseImage (просмотр): клик мышью по изображению больше не закрывает окно (клик по фону закрывает, как раньше), а перетаскивание его не закрывает. Указатель захватывается только после сдвига на 5 px или при щипке, а не при каждом нажатии. Если приложение слушало `click` на контейнере зума, цель клика снова изображение, а не контейнер.

## Задача release-prep

- BaseInput с `type="password"`: кнопка показа пароля теперь в порядке Tab (раньше `tabindex="-1"`). Во формах входа на одну остановку Tab больше; имя кнопки меняется «Показать пароль» / «Скрыть пароль».
- `vue` — только `peerDependencies` (`^3.5.0`), в `dependencies` его нет: второй копии Vue в `node_modules` приложения не будет.

## Задача editor-upload

- BaseEditor: на панели две новые кнопки «Отменить» и «Повторить» (`hasHistoryButtons`, по умолчанию `true`). Приложение, чьи тесты или стили считают кнопки панели по порядку, обновляет выборки или отключает группу.
- BaseEditor: проп `uploadMedia` загрузки изображений и видео на сервер вместо `blob:` и событие `upload-error`; при заданном `uploadMedia` редактор начинает принимать файлы изображений и видео из буфера обмена и перетаскивания. Без него поведение прежнее.

## Задача text-anim

- BaseText: `weight` по умолчанию не задан, `font-weight` не пишется inline — вес идёт от тега, родителя и CSS приложения (`h1`–`h6`, `strong` жирные). Токен `--rise-text-font-weight` удалён. Вернуть прежнее: `defaults.BaseText.weight: 400` (подробности — MIGRATION, «Задача text-anim»).

- BaseAnimation: Vue-классы переходов получили префикс — `.fade-enter-active` → `.rise-fade-enter-active`, `.list-move` → `.rise-list-move` и так далее (таблица — MIGRATION, «Задача text-anim»). Проп `name` прежний. Если приложение стилизовало эти глобальные классы, добавьте `rise-`.

## Задача w12-c6-watch

- BaseMediaPlayer, окно совместного просмотра: метка статуса участника стала BaseBadge с палитрой `success`/`neutral` (цвета прежние). К классам метки добавлен `base-badge--status-success` или `base-badge--status-neutral`; собственное правило кита для `--joined` убрано — если приложение стилизовало метку, проверьте его: переменные `--custom-bg`/`--custom-text` по-прежнему перекрывают палитру. Подробности — MIGRATION, «Задача w12-c6-watch».

## Задача w12-css-split

- Плеер: стили `BaseMediaPlayer` и `BasePresentationPlayer` вынесены из `styles.css` в отдельный `@ramzes1385/rise-ui-kit/media.css` (`media.layer.css` — для слоя `rise`). Приложение, использующее плеер, добавляет `import '@ramzes1385/rise-ui-kit/media.css'` после `styles`, иначе плеер без оформления; остальные приложения получают `styles.css` меньше на ≈13% и ничего не меняют. Токены остаются только в `styles.css` (подробности — MIGRATION, «Задача w12-css-split»).

## Задача search-tails

- Модальные окна (BaseModal, BaseSlideover, BaseDrawer) и панели BaseSearch больше не закрываются, если кнопку мыши нажали внутри панели (например, выделяя текст в поле) и отпустили над подложкой. Обычный клик по подложке закрывает, как раньше.
- BaseAddressInput и BaseDadataInput при ошибке запроса подсказок показывают «Не удалось выполнить поиск. Попробуйте ещё раз» вместо «Ничего не найдено».
- BaseSearch: `blur()` в режиме по умолчанию снимает фокус с поля.

## Задача overlay-tails

- Выпадающие панели, подсказки и контекстные меню внутри контейнера с `transform: scale(…)` или `zoom` больше не сдвигаются: позиция считается в единицах контейнера.
- Если приложение начинает или перестаёт передавать проп (или слушатель клика на компонентах с `useClickable`) после монтирования, BaseDropdown, BaseMegaMenu и BaseDatePicker подхватывают это сразу. Приложение, которое «передавало и убирало» проп и полагалось на старое поведение, теперь получает значение по умолчанию.
- Открытое меню «Другие действия» в чате остаётся у сообщения при изменении размера окна.

## Задача stories-fix

- BaseEditor: видео из `uploadMedia` попадает в HTML без inline `style` (ширину и скругление задаёт CSS редактора) — подробности в MIGRATION, раздел «Задача stories-fix».

## Задача resp-a

- BaseSubtitleEditor и BaseStepper (горизонтальный): корень получил `container-type: inline-size` — компонент подстраивается под ширину своего блока, а не окна. Корень и так `width: 100%`; если приложение кладёт компонент в блок с шириной по содержимому (`inline-block`, колонка сетки `auto`, `float`), задайте ширину самому блоку — иначе компонент сожмётся до нуля.
- BaseStepper: у горизонтального степпера на корне появился атрибут `data-summary` («Шаг 2 из 4: Доставка»), до 480 px шириной он выводится псевдоэлементом под лентой. Текстовых узлов в DOM не добавилось — `getByText('Доставка')` по-прежнему находит одну подпись. Новые ключи словаря `stepper.PROGRESS` и `PROGRESS_TITLED` (ru и en).
- BaseTabs: слежение за переполнением ленты работает и без `isScrollable` (появились классы `base-tabs--fade-start` и `base-tabs--fade-end`); выбранная вкладка при монтировании и смене значения прокручивается в видимую часть — в тестах приложений на jsdom, где мокаются `scrollWidth`/`clientWidth` ленты, нужен и `scrollTo` на элементе.
- BaseKanban: колонки не фиксированные 272 px, а сжимаются до 200 px; в приложении, которое рассчитывало на ширину колонки 272 px у доски с многими колонками, колонки станут уже. Задать иначе можно через `ui.column`/`customClass` (`flex-basis`, `min-width`).

## Задача resp-b

- BaseCommentThread и BaseEventCalendar теперь занимают всю ширину контейнера (`width: 100%`). Если приложение клало их во flex-строку или `inline`-контейнер и рассчитывало на ширину по содержимому, задайте ширину обёртке.
- BaseImageMapEditor: в контейнере уже 760 px панель свойств прокручивается внутри (до 70 % высоты окна), а не растягивает страницу; переключатель инструментов переносится на строки.
- BaseEventCalendar в контейнере ≤ 420 px показывает компактные ячейки месяца (min-height 64 px).
- BaseSparkline: у точки вместо inline `left: N%` теперь переменная `--sparkline-x` (число 0–100); если приложение читало `style.left` у `.base-sparkline__dot`, читайте переменную.

## Задача anim-layout-2

- BaseKanban: корень на всю ширину контейнера (`width: 100%`). Кто клал доску во flex-строку и рассчитывал на ширину по содержимому, задаёт ширину обёртке.

## Задача w13-subpaths

- Точечная установка: `import { BaseButton } from '@ramzes1385/rise-ui-kit/BaseButton'` и один раз `import '@ramzes1385/rise-ui-kit/tokens.css'` — в сборку попадают JS и CSS только использованных компонентов (BaseButton: CSS 4,8 КБ gzip вместо 96,9 КБ у `styles.css`). Подпуть есть у каждого компонента из `/components`. Корень, `/components`, `styles.css` и плагин — без изменений (README, «Точечная установка»; MIGRATION, «Задача w13-subpaths»).
- Исправление: на Vite 8 компонент, импортированный по имени из корня пакета ветки 2.0, был `undefined` и не отрисовывался — теперь отрисовывается, а в сборку приложения попадает только использованный код. Файлов в `dist/chunks/` больше (≈390), `styles.css` и `media.css` прежние.
- SSR с подпутями: пакет — в `ssr.noExternal` (Vite) или `build.transpile` (Nuxt), иначе Node не импортирует `.css` из JS пакета.

## Задача w13-packages

- В `/composables` и `/utils` появились новые публичные имена для редактора (`useEditorHistory`, `getClipboardData`, `stripPlaceholders`, `selectRange`, `getShortcutLetter`, `foldSearchText` и другие — список в MIGRATION): поведение кита не меняется, конфликтов имён нет.
- Крупные компоненты можно ставить отдельными пакетами (`@ramzes1385/rise-media-player`, `rise-maps`, `rise-editor`) после их публикации владельцем; импорты из кита продолжают работать (README, «Отдельные пакеты»).

## Задача w13-l10n-core

- **Свой язык приложения:** `registerLocale(locale)` из корня пакета; после регистрации `setLocale('xx')`, `<BaseApp locale="xx">` и `createUiKitPlugin({ locale: 'xx' })` принимают код. Строки поверх готового языка — `defineLocale(ru, { text: { … } })` в плагине, в `<BaseApp locale>` и в `setLocale()`. `useLocale().locales` отдаёт список кодов для переключателя языка. Описание и живые примеры — Storybook «Foundations / Localization», README, раздел «Языки».
- **Поиск стал единым:** в списках, выпадающих списках, дереве, каскаде, таблице, чате и меню запрос сравнивается без учёта регистра по языку кита, а «е» и «ё» считаются одной буквой (раньше — только в части компонентов). Китайский, японский и корейский текст сравнивается как есть.
- **BaseHeatmap** при английском языке начинает неделю с воскресенья (как и календари кита); чтобы оставить понедельник, задайте язык `defineLocale(en, { firstDayOfWeek: 1 })`. По-русски вид прежний.
- Предупреждение о неизвестном коде языка пишет «Доступные: …; свой язык — registerLocale()». Тест приложения, сравнивавший прежний текст, нужно обновить.

## Задача w13-lang-a

- Новые языки: казахский (`kk`, кириллица, `kk-KZ`) и узбекский (`uz`, латиница, `uz-Latn-UZ`). Задаются как `ru` и `en`: `createUiKitPlugin({ locale: 'kk' })`, `<BaseApp locale="uz">`, `setLocale('kk')`. Словари `kk` и `uz` экспортируются из корня пакета рядом с `ru` и `en`, в `LOCALES` появились ключи `kk` и `uz`; тип `LocaleInput` расширился на эти коды.
- У обоих языков неделя в календаре начинается с понедельника, числа — `1 234,5` (пробел неразрывный, запятая), множественное число по CLDR: формы `one` (только 1) и `other`; существительное после числа в этих языках стоит в единственном числе, поэтому в `plural` обе формы одинаковы.
- Узбекский: апостроф в «oʻ» и «gʻ» — U+02BB, в «maʼlumot» (тутук белгиси) — U+02BC; прямого и типографского апострофа в словаре нет. Если приложение сравнивает или ищет строки словаря, учитывайте это.
- Приложения, которые перечисляют встроенные языки (например, меню выбора языка по `Object.keys(LOCALES)`), покажут два новых пункта; если нужны только `ru` и `en`, список составьте сами. Предупреждение о неизвестном языке теперь перечисляет «ru, en, kk, uz».
- Длина строк (замер по словарям без предупреждений разработчику): в сумме казахский на 3 %, узбекский на 11 % длиннее русского (английский на 9 % короче); у десятой части строк — на 36 % (kk) и 47 % (uz) длиннее русских. Подписи кнопок и вкладок в узких местах приложения стоит проверить глазами.
- Составные подписи, где порядок слов «число — предлог — число» не подходит агглютинативным языкам (`rating.OF`, `chat.PINNED_COUNTER`), в kk и uz написаны через «/»; готовые фразы со вставками (`{total} ішінен {current}-слайд`, `{total} tadan {current}-slayd`) подставляются как есть.
- Даты и числа kk и uz зависят от данных `Intl` среды: в Node 22 они полные, а в урезанной сборке Chromium (Playwright 141) для `kk` данных нет (формат en-US), для `uz` только корневые («2025 M05 7»). Подпись `intl` в словаре не подменяется. Если приложение запускается в такой среде (CI, встроенный браузер), проверьте вывод `useLocale().formatDate`/`formatNumber` и при необходимости задайте свой `intl` через `defineLocale`. Решение для самого кита — в задаче l10n-core (FOLLOW_UPS).
- Шрифт Inter в Storybook и в `src/styles/fonts/_fonts.scss` дополнен подмножеством `cyrillic-ext` (казахские Ә Ғ Қ Ң Ө Ү Һ). Приложения, которые подключают Inter сами, добавляют `@fontsource-variable/inter/files/inter-cyrillic-ext-wght-normal.woff2` (и `-italic`) c `unicode-range: U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F`; в `dist/styles.css` шрифты не входят, как и раньше.

## Задача w13-lang-b

- Новые языки: словари `zh` (китайский упрощённый, неделя с понедельника, `zh-CN`) и `ja` (японский, неделя с воскресенья, `ja-JP`) экспортируются из корня пакета; подключаются как `ru` и `en`: `setLocale('zh')`, `<BaseApp locale="ja">`, `createUiKitPlugin({ locale: 'zh' })`. Тексты написаны без носителя языка — перед выпуском в продукт покажите их переводчику. Свои правки — `defineLocale(zh, { text: { … } })`.
- Правила записи: между числом или подстановкой `{n}` и иероглифами стоит пробел (как в macOS), рядом с полноширинной пунктуацией и кавычками (“” в китайском, 「」 в японском) пробела нет. Форма множественного числа одна (`other`), счётное слово внутри строки.
- Шрифты: в `--rise-font-sans`, `--rise-font-heading` и `--rise-font-mono` (и в пресетах `createTheme`) перед `sans-serif` добавлены системные шрифты для китайского (PingFang SC, Hiragino Sans GB, Microsoft YaHei, Noto Sans CJK SC, Source Han Sans SC); на элементах с `lang="ja"` токены переопределены японскими (Hiragino Sans, Yu Gothic, Meiryo, Noto Sans CJK JP). Латиница и кириллица не меняются: запасные шрифты берутся только для иероглифов, которых нет в Inter. Файлов шрифтов в пакете нет. Задайте `lang` на `<html>`: без него у общих иероглифов будут китайские начертания. Пресет `rise` из `createTheme` пишет `--rise-font-sans` на свой элемент и перекрывает `:lang(ja)` — для японского передайте свой `font.sans`.
- Ввод через IME (пиньинь, кана, хангыль): Enter, который подтверждает выбор иероглифа, больше не считается действием поля (`event.isComposing` или `keyCode 229` — Safari присылает последнее нажатие уже после `compositionend`). Исправлено в BaseInputTags (добавление тега), BaseAutocomplete, BaseInplace, BaseCommentThread (отправка), BaseDatePicker, BaseInputNumber, BaseEmojiPicker, BaseSelect, BaseCascader, BaseTable (фильтр в тулбаре), а в BaseCommandPalette, BaseKanban, BaseFileManager, BaseSearch, BaseMention, BaseTreeSelect и BaseInput `isComposing` заменён тем же помощником `isImeKeydown`. Для русского и английского поведение не меняется.
- Цифры полной ширины (`１２３`, `＋７`, пробел `U+3000`), которые японский IME вставляет без переключения раскладки, приводятся к обычным в BaseInputNumber, BaseMoneyInput, BasePhoneInput, BaseCardInput, BaseRequisiteInput и в масках (`useInputMask`, фильтр `digits`). Новые утилиты `isImeKeydown` и `toHalfWidth` доступны как `utils.isImeKeydown` и `utils.toHalfWidth`.
- BaseDatePicker, ручной ввод даты: распознаются полноширинные цифры и разделители `年 月 日`, `.`, `/`, `-`, разделитель диапазона `~`, `〜`, `至` и 12-часовое время с `上午`/`下午` и `午前`/`午後`. Для остальных языков разбор тот же.
- Поиск: `foldSearchText` на китайском и японском регистр и диакритику не трогает, как и раньше; полноширинная латиница с NFKC не сводится к обычной (чтобы не сдвигать подсветку).

## Задача w13 (сведение языков)

- Казахский, узбекский, китайский и японский словари не встроены в `LOCALES` (там только `ru` и `en`): их подключают `registerLocale(kk)` перед `setLocale('kk')` / `createUiKitPlugin({ locale: 'kk' })` / `<BaseApp locale="kk">`. Так в сборку приложения попадают только нужные языки (все шесть словарей вместе — ≈+70 КБ gzip к каждому входу).

## Задача w14-plugin-config

- Новое: `createUiKitConfig(options)` (из `@ramzes1385/rise-ui-kit/config` или корня) — язык, тема, `defaults`, `icons`, `iconSpritePath`, `linkComponent`, `teleportTo`, `motion`, `reducedMotion` без регистрации компонентов и без их JS в сборке. Нужен приложениям с точечной установкой (`@ramzes1385/rise-ui-kit/BaseButton`): раньше настройки были только у `createUiKitPlugin`, который тянул все компоненты (451,8 КБ gzip стартового JS против 77,4 КБ с кнопкой и настройками). Существующие приложения — без изменений (README, «Точечная установка»; MIGRATION, «Задача w14-plugin-config»).
- BaseImageMap3D: проп `ui` (классы частей поверх классов кита) теперь работает и в 3D-виде и доходит до вложенных списка объектов, легенды и панели маршрута; части — `IMAGE_MAP_3D_PARTS` из `/map3d`, глобально — `defaults.BaseImageMap3D.ui`. У переключателя этажей, карточки у точки и окна карточки появились классы `base-image-map-3d__layers`, `__tooltip`, `__popup` (без стилей). Прежде `ui` применялся только в 2D-виде (MIGRATION, «Задача w14-plugin-config»).

## Задача w14-forms-misc

- **BaseInput и всё на его основе** (BaseInputNumber, BaseMoneyInput, BasePhoneInput, BaseSearch, BaseAutocomplete, поле BaseDatePicker, BaseCardInput, BaseRequisiteInput, BaseInputTags и др.): рамка поля теперь заканчивается ровно на правой границе корня — раньше при `width: 100%` она выходила за него на 2 px (`box-sizing` обёртки не был `border-box`). Поле больше не выступает за колонку; у приложений со своим выравниванием «на 2 px» правило можно убрать.
- **Первый день недели в BaseCalendar и BaseDatePicker с явным `locale`** определяется самим `locale` (`Intl.Locale.getWeekInfo()`): `locale="en-US"` на русском ките — неделя с воскресенья. Нужен прежний — задайте `firstDayOfWeek`. Данные недели берутся из движка браузера (Chromium 141 из Playwright отдаёт их и для `kk`, `uz`); нет `Intl.Locale.getWeekInfo` / `weekInfo` — первый день языка кита.
- **BaseHeatmap**: проп `firstDayOfWeek`.
- **BaseInputTags**: `，` и `、` — разделители по умолчанию (см. MIGRATION).
- **BaseFormWizard** в узкой колонке (до 480 px): под лентой «Шаг 2 из 4», название шага — только в заголовке ниже. Нужна прежняя подпись у ленты, собранной вручную, — `summary="titled"` у BaseStepper (по умолчанию).
- **BaseStepper**: проп `summary` (`titled`, `count`, `none`).
- **Подписи в верхнем регистре на китайском и японском** (BaseTimeline — день, BaseBankCard и BaseCardInput — имя владельца, плеер — «Достижение», «Актёры», «Участники») больше не разрежены (`letter-spacing: 0` на `:lang(zh)` и `:lang(ja)`); нужен `lang` на `<html>` или предке. Для остальных языков вид прежний.
- **BaseDatePicker**: ручной ввод диапазона понимает «から»; **BaseEditor**: Enter в полях размера медиа не срабатывает, пока IME подтверждает слово.

## Задача w14-editor-ui

- BaseImageMapEditor: когда область редактора уже 760 px, разделы панели сворачиваются (кнопка-заголовок с `aria-expanded`), а инструменты и кнопки файлов показываются иконками с подсказками. Приложение, которое в узкой колонке искало кнопки по видимому тексту, найдёт их по доступному имени (`getByRole('button', { name: 'Импорт JSON' })` работает, `getByText` — нет). Содержимое свёрнутого раздела не лежит в DOM. Новая часть `ui.toggle` — кнопка-заголовок.
- BaseSegmented: новый необязательный проп `isIconOnly` (подпись сегментов с иконкой скрыта визуально, остаётся именем и подсказкой). Без него разметка прежняя; сегмент теперь отдельный внутренний компонент, корень `label` и классы те же.
- Иконки кита: `tool-select`, `tool-point`, `tool-rect`, `tool-ellipse`, `tool-polygon`.
- BaseTabs в `dir="rtl"`: стрелки ← и → меняются местами (← — следующая вкладка, → — предыдущая), как в APG для письма справа налево; затухание краёв и прокрутка к выбранной вкладке учитывают направление. Направление берётся из вычисленного `direction` списка вкладок.
- BaseSparkline: наведение считается по геометрии линии (`<svg>`), а у столбцов — по реальному положению столбцов.

## Задача w14-fu-triage

- **Ошибки полей озвучиваются сразу**: текст ошибки у всех полей кита (`FormFieldError`, `BaseFormField`) — `role="alert"`; приложения, чьи тесты ищут единственный `role="alert"` на странице с невалидной формой, берут `getAllByRole('alert')`.
- **`useToast().add({ position, color, sizeScale, customClass })`** — оформление отдельного уведомления.
- **BaseEditor с `uploadMedia`**: кнопки изображения и видео принимают несколько файлов за раз.

## Задача w14-l10n-deep

- **Даты на казахском и узбекском не зависят от ICU браузера.** Календарь, выбор даты, события, Gantt, Heatmap, расписание ImageMap, канбан, лента, чат и относительное время (`formatRelativeTime`) показывали месяцы и дни английскими словами («May 7, 2025») или корневыми «M05» там, где у браузера нет данных языка. Теперь при нехватке данных берётся словарь языка (`calendarNames`, `relativeTime`); у `kk` и `uz` он есть, там, где данные `Intl` полные, вид строк тот же, что даёт ICU. Числа (`1,234.5`) не затронуты.
- **Составные подписи** («Оценка 4,5 из 5», «… печатает», «1 из 3», «Выбрано: 2», «Удалить файл», «Скачать файл …») на русском и английском выглядят как раньше; на казахском, узбекском и японском порядок слов свой («5 ішінен 4,5», «5 点中 4.5 点», «ファイル a.pdf をダウンロード»). Приложение, которое переопределяло прежние ключи-куски, получает прежнюю подпись; см. docs/v2/MIGRATION.md.
- **Поиск и подсветка.** `ＡＢＣ` находится по `abc`, `ｶﾞ` по `ガ`, а в японском катакана по хирагане; подсвечивается найденный исходный текст.
- **BaseImageMap, справочник `directoryGroupBy: 'alpha'`**: японский — разделы по рядам каны, китайский — без разделов.
- **Названия эмодзи** в BaseEmojiPicker на китайском и японском по-прежнему английские: данных CLDR для них в ките нет (см. docs/design/FOLLOW_UPS.md, «Задача w14-l10n-deep»).

## Задача w15-mobile

- **BaseAlert**: `box-sizing: border-box` на корне и перенос: корень `flex-wrap: wrap`, текст `flex: 1 1 120px`, блок `actions` тоже переносится. На узком контейнере действия переходят на следующую строку под текст; на достаточной ширине раскладка прежняя. Приложение, которое задавало алерту `width: 100%` и рассчитывало на `content-box`, получает ширину ровно родителя.
- **BaseChart**: невидимая таблица данных для скринридера теперь внутри `<div class="base-chart__hidden">` (раньше сама `<table class="base-chart__hidden">`). Таблица с `position: absolute; width: 1px` не сжимается, и её реальная ширина растягивала страницу на телефоне. Если приложение или тесты искали `table.base-chart__hidden`, ищите `.base-chart__hidden table` или `getByRole('table')`.

## Задача w16-autoimport

- Автоимпорт компонентов. Vite: `Components({ resolvers: [RiseUiResolver()] })` из `unplugin-vue-components` с `RiseUiResolver` из `@ramzes1385/rise-ui-kit/resolver` — `<BaseButton>` и `<BaseSelect>` без `import`, в сборке только они и то, что они используют (приложение из `npm pack`: 93,1 КБ gzip JS и 8,7 КБ CSS, без BaseTable и BaseEditor). Nuxt: `modules: [['@ramzes1385/rise-ui-kit/nuxt', { config: { locale: 'en' } }]]` — компоненты, токены, `build.transpile` и настройки кита одним модулем. Опции, ограничения и проверки — README, «Автоимпорт».
- Типы шаблонов: `/// <reference types="@ramzes1385/rise-ui-kit/global" />` (или `types` в tsconfig) — компоненты кита в `GlobalComponents`: опечатка в пропе и неверное значение ловятся `vue-tsc` (опечатка в имени пропа — со `strictTemplates`). Объявления для имён по умолчанию; с префиксом — `components.d.ts` плагина или `.nuxt/components.d.ts` (README, «Типы в шаблонах»).
- Существующие приложения не меняются: корень, `/components`, подпути, `createUiKitPlugin` и `createUiKitConfig` работают как раньше.

## Задача w16-security-tokens

- **`sanitizeHtml` и BaseEditor**: `<constructor>`, `<toString>` и другие теги с именами из `Object.prototype` не роняют очистку (раньше `TypeError`); разметка, которую браузер перестраивает после разворота неразрешённого тега (`<h1><x><h2>` — вложенные заголовки), выходит в уже устойчивом виде, и `v-model` редактора не получает «другое» значение на втором круге; вложенность элементов глубже 128 уровней отбрасывается.
- **BaseMarkdown, BaseAiMessage, сообщения с Markdown**: `![](data:text/html,…)` и другие `data:` кроме `data:image/*` выводятся текстом; вложенность глубже 32 уровней — обычный текст; патологические входы (`[a](` × 3000, `**a ` × 3000, `> ` × 3000) разбираются за миллисекунды.
- **BaseCommentThread, BaseNotificationCenter**: неверная дата (`'не дата'`, `NaN`) не роняет компонент: время не показывается, `datePublished` в JSON-LD пропускается.
- **Что кит гарантирует при выводе текста пользователей** — README, «Безопасность». Адреса ресурсов из данных приложения (аватары, вложения чата, `src` картинок и аудио) кит не фильтрует: браузеры не исполняют `javascript:` в `src` ресурсов; ссылки-переходы (`href`) и разметка из `sanitizeHtml`, BaseEditor и Markdown фильтруются всегда.
- **Токены для дизайна**: `dist/tokens.json` и `dist/tokens/<тема>.<режим>.json` (W3C Design Tokens). Приложениям, которые не используют токены в дизайне, ничего делать не нужно.

## Задача w16-lazy-locale

- **Английский без плагина нужно подключить.** Приложение без `createUiKitPlugin` (точечная установка, `createUiKitConfig`, только `<BaseApp>`), которое включает английский, вызывает `registerLocale(en)` при старте; иначе интерфейс кита остаётся русским, а в консоли — подсказка с кодом подключения. С `createUiKitPlugin` ничего не меняется: плагин подключает `en` сам и не затирает словарь `en` приложения.
- **Сборка легче.** Компоненты берут из русского словаря только свои разделы: BaseSelect с подпути — 53,7 КБ gzip JS вместо 92,4, BaseDatePicker — 68,1 вместо 105,8, кнопка с `createUiKitConfig` — 34,6 вместо 77,9 (с английским — 54,2). Приложение с плагином — 454,0 КБ против 455,5. Вес каждого компонента — docs/reference/SIZES.md.
- **Меню языков.** Без плагина и регистраций `useLocale().locales` — `['ru']`; `LOCALES` устарел и списком доступных языков больше не служит.
- **Свой словарь без части разделов** берёт недостающие строки из русского (раньше — `undefined`, пустые подписи).
- **Nuxt и кодмод (стык волны 16).** Модуль `@ramzes1385/rise-ui-kit/nuxt` с `config.locale` подключает словарь этого языка сам (только выбранный, своим чанком). `npx @ramzes1385/rise-ui-kit migrate` предупреждает о `setLocale('en')`, `locale: 'en'` и `<BaseApp locale="en">`, если в проекте нет `registerLocale` и `createUiKitPlugin`.
- Вид компонентов, DOM и доступность не меняются.

## Задача w16-codemod

- **Кодмод перехода 1.x → 2.0**: `npx @ramzes1385/rise-ui-kit migrate [папка] [--dry] [--write]`. В пакете появился `bin` (`rise-ui-kit` → `bin/rise-migrate.mjs`, каталог `bin` в `files`); зависимостей не прибавилось. По умолчанию `--dry`: diff и предупреждения, файлы не меняются; `--write` записывает правки, повторный запуск ничего не меняет.
- **Что для приложения**: механические шаги из «Порядка перехода» (импорты `/plugins` → `/icons` и `BaseMediaPlayer` → `/media`, `media.css` при плеере, объектные аргументы `calcTotalColumns`, `resolveTooltipPlacement`, `calcTooltipShift`, `getTooltipTransition`, `motion: 'standard'`, мёртвые пропсы `variant`/`sizeScale`/`color`, префикс `rise-` и `base-…` у классов переходов) можно не делать вручную. Остальное кодмод показывает как `файл:строка` с ссылкой на раздел MIGRATION («Автоматический переход» в начале документа).
- **Классы переходов**: из таблицы «Изменения DOM» (раздел «Имена переходов получили префикс») кодмод сам переименовывает `.modal-fade-*`, `.slideover-*`, `.dropdown-*` и классы `BaseAnimation`; классы `.tooltip-<сторона>-*` не переименовывает (у кита один переход `base-tooltip-*` на все стороны) и не трогает имена, которые совпадают с собственным `<Transition>` приложения.
- **Вид и поведение не меняются**: кодмод правит только код приложения; кит, стили и скриншоты не затронуты.

## Задача w16-rtl

Письмо справа налево теперь поддержано во всём ките. В LTR вид и поведение прежние; изменения касаются страниц и компонентов с `dir="rtl"` (на `<html>`, на предке или на самом компоненте).

- **Стили кита — логические свойства.** `margin-inline-start`, `inset-inline-end`, `border-start-start-radius`, `text-align: start` вместо `left`/`right`. Если приложение переопределяло BaseX физическими свойствами (`margin-left: 8px` на `.base-button__label`), правило по-прежнему работает в LTR, но в RTL останется на левой стороне (физическое свойство не зеркалится) и может перекрыть логическое правило кита: переопределяйте логическими (`margin-inline-start`). Сборка сохраняет логические свойства (`lightningcss exclude: LogicalProperties`). Размер `dist/styles.css` и CSS подпутей замерьте бюджетами `build/ratchets.json` при сборке.
- **Новое публичное API.** `isRtl(element)`, `getDirectionSign(element)`, `mirrorArrowKey(key, isRtl)`, `mirrorSide(side, isRtl)`, `resolveArrowKey(event)` (`@ramzes1385/rise-ui-kit/utils`) и `useDirection(target?)` (`composables`): `isRtl` читает вычисленный `direction`, поэтому работает при `dir` на любом предке.
- **Позиции панелей.** `left` и `right` в `position` у BaseDropdown и BaseTooltip остались физическими, `start` и `end` — по направлению строки: `bottom-start` в RTL выравнивает панель по правому краю триггера. Приложение, которое в RTL использовало `bottom-start` и рассчитывало на левый край, получит правый — это и есть начало строки; нужен левый — `bottom-end`.
- **Панели у края страницы** (BaseDrawer и BaseSlideover — `side`/`direction`, BaseNotification и BaseCookieConsent — углы `top-left`, `top-right`, `bottom-left`, `bottom-right`) в RTL зеркалятся: `left` — начало строки (справа), `right` — конец (слева); в LTR как раньше. Приложению, которому нужен физический край в RTL, нужна противоположная сторона (`side: 'left'` вместо `'right'`). BaseHeader (`menuDirection: 'right'` по умолчанию) и мобильная BaseSideBar (`left`) выбирают сторону в тех же терминах: меню шапки выезжает в конце строки, меню боковой панели — в начале.
- **BaseSideBar**: подсказки свёрнутого режима и подменю в RTL уходят влево от значка.
- **Клавиатура.** В RTL ← и → в BaseTree, BaseTreeSelect, BaseCascader, BaseDropdownMenu и подменю, MegaMenu, BaseToolbar, BaseTabs, BaseRating, BaseRange, BaseSlider, BaseStepper, BaseSplitter, BaseTransfer, BaseInputTags, BaseKanban, BaseFileManager, BaseEventCalendar, BaseDashboardGrid, BaseEmojiPicker, чат (контекстное меню и боковая панель) и ручка ширины колонки BaseTable меняются местами (← — «вперёд»). Тесты приложения, которые жмут `ArrowRight` в RTL-странице, обновите.
- **Шкалы.** BaseRange, ползунок BaseSlider и рейтинг в RTL идут справа налево (минимум справа), как нативный `<input type="range">`. Лента BaseSlider в RTL листается вправо вперёд, свайп вправо — следующий слайд.
- **Иконки направления** (`arrow-left`, `arrow-right`, `chevron-left`, `chevron-right`, `undo`, `redo`, `reply`, `send`) в RTL зеркальны (класс `base-icon--directional`, свойство `scale`); отключить — `scale: none`.
- **Не зеркалятся**: панель управления медиаплеера, ImageCompare, ячейки BasePin, блоки кода (BaseCode, код в BaseMarkdown), спарклайны, графики (BaseChart), диаграмма Ганта, JSON-просмотрщик, карты, холсты. Корень BaseChart, BaseGantt, BaseJsonViewer, BaseSparkline и BaseCode — «остров» `direction: ltr` (`@include ltr-surface`). Приложение, которому нужно иное, оборачивает их своим `dir`.
- **`useScrollLock`** компенсирует полосу прокрутки отступом `padding-inline-end` (слева в RTL), а не `padding-right`.
- **BaseTable**: у закреплённых колонок вместо `left`/`right` в inline-стилях — `inset-inline-start`/`inset-inline-end`; тесты приложения, проверявшие `style.left`, ищите по `insetInlineStart`.
- **BaseEventCalendar**: у полос «весь день» и событий внутри дня inline-стиль `inset-inline-start` вместо `left`; тесты, проверявшие `style.left`, — по `insetInlineStart`. Ручка ширины колонки BaseTable и перетаскивание в BaseKanban, BaseSplitter, BaseDashboardGrid, BaseRange учитывают направление строки.
- **Телепортированные панели** (выпадающие списки, меню, подсказки, окна) получают `dir` блока-источника, если он отличается от страницы (раньше слепо брали направление страницы).
- **Storybook**: переключатель «Направление» в тулбаре; `npm run test:stories -- --dir=rtl`; автоаудит `npm run test:rtl`.
