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
- **BaseSideBar.** Пункты-ссылки — `<a class="base-link base-link--ghost base-sidebar__link">` (BaseLink): селекторы приложения по `.base-link` затрагивают и сайдбар.
- **BaseImageMap3D.** Список объектов для скринридера — по списку `ul.base-image-map-3d__objects` на каждый этаж (раньше один); в панели камеры новая кнопка «Во весь экран» (`:has-fullscreen="false"` убирает).
- **BaseProgress, BaseNotification, BaseTour.** Полоса таймера — BaseProgress с `countdown` (`div.base-progress--countdown`, `aria-hidden`); у BaseTour убраны `ui['progress-bar-fill']` и `--tour-progress`. RTL-правила написаны через `[dir='rtl'] &`.
- **BaseChat.** «Исключить» и «Забанить» спрашивают подтверждение; `ban-member` отдаёт только `{ memberId }`; «Открепить» вызывает `unpin-message`; для «не отправлено» (`status: 'failed'`) — кнопки «Повторить» и «Удалить» и скрытое меню.
- **BaseChat (правки fix-chat).** Публичные `useChatActions` и `useChatState` сменили контракт, появилось событие `write-message` — подробности в [MIGRATION](../v2/MIGRATION.md), «Задача fix-chat». «Не отправлено» у сообщения теперь `role="status"`, а не `alert`. Фокус после «Повторить» и «Удалить» уходит в поле ввода только при вызове с клавиатуры (после клика мышью остаётся как есть). `useChatState` возвращает новое поле `visibleSelectedCount`; у `ChatSelectionToolbar` появился необязательный проп `visibleSelectedCount`.
- **BaseInput `type="search"`.** Кнопка «Очистить» теперь в порядке Tab (раньше `tabindex="-1"`).

**Порядок Tab и клавиатура**

- **BaseEditor.** Панель — одна остановка Tab (было около 21), внутри стрелки, Home и End; область текста `isReadonly` входит в порядок Tab.
- **BaseTable, BaseToolbar.** Панель — одна остановка Tab; в текстовом поле стрелка уводит фокус только у края текста, в числовом поле и поле e-mail стрелки остаются в поле. Delete и Backspace на метке фильтра удаляют её. После «Повторить» и «Удалить» в BaseChat фокус переходит в поле ввода.
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
