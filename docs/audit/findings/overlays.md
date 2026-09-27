# Находки группы «Оверлеи»

Состав: BaseModal, BaseSlideover, BaseDropdown, BasePopover, BaseTooltip, BaseNotification, BaseTour; usePopup, useScrollLock, useEscapeKey, useClickOutside, useDropdownPosition, useFlyoutPosition, useFocusTrap.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

P0 нет.

#### SCROLL-LOCK · P1 · useScrollLock — блокировка прокрутки без общего счётчика
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

#### MOD-1 · P1 · BaseModal — длинный контент не прокручивается, футер уходит за экран
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

#### DRP-1 / SEL-1 (pickers) · P1 · BaseDropdown (BaseSelect) — в панель нельзя поставить фокус
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

#### CO-1 / DRP-3 / POPV-4 · P1 · useClickOutside (BaseDropdown, BasePopover) — клик во вложенном оверлее закрывает родителя
- **Где:** `src/composables/useClickOutside/useClickOutside.ts:48-58`, `src/components/BaseDropdown/ui/BaseDropdown.vue:97-101` (HEAD).
- **Условия:** в панели BaseDropdown или BasePopover лежит компонент со своей телепортированной панелью (BaseSelect, BaseDatePicker, вложенный поповер, подменю).
- **Последствие:** «внутри» определяется только вложенностью в DOM. Mousedown в панели потомка (она в `body`) закрывает родителя, и потомок размонтируется раньше `click` — выбор теряется. Основной сценарий «поповер-фильтр с селектом» не работает.
- **Воспроизведение:** `<BasePopover v-model:is-open="o"><template #trigger><button>Фильтр</button></template><BaseSelect v-model="v" :options="[{label:'A',value:'a'}]"/></BasePopover>` → открыть поповер → открыть селект → клик «A» → поповер закрыт, `v` не изменился.
- **Исправление:** не сделано. Предлагается реестр слоёв через provide/inject: панели потомков регистрируются у родителя, проверка идёт по `event.composedPath()`. Делать вместе с OVL-2 и ESC-STACK как общий менеджер слоёв.
- **Проверка:** не проверено: теста нет. Нужен integration без моков: в `BaseDropdown.integration.spec.ts` useClickOutside замокан.
- **Статус:** Не исправлено — архитектурное изменение (общий слой оверлеев), вне объёма этапа.

#### TOUR-1 · P1 · BaseTour — после размонтирования открытого тура страница не прокручивается
- **Где:** `src/components/BaseTour/ui/BaseTour.vue:218-237` (HEAD).
- **Условия:** тур открыт, и компонент размонтирован (смена маршрута, `v-if`).
- **Последствие:** `unlock()` вызывался только в watch при `isOpen → false`, поэтому `body{overflow:hidden}` остаётся навсегда.
- **Воспроизведение:** `<BaseTour v-if="show" :is-open="true" :steps/>` → `show=false` → `document.body.style.overflow === 'hidden'`.
- **Исправление:** `BaseTour.vue` — `unlock()` добавлен в `onBeforeUnmount`.
- **Проверка:** `src/components/BaseTour/__tests__/BaseTour.integration.spec.ts` › «снимает блокировку прокрутки при размонтировании открытого тура» (падал: да, по отчёту; мок useScrollLock из этого спека убран).
- **Статус:** Исправлено.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| OVL-1 / PCK-3 (pickers) | Tooltip, Dropdown/Popover/Select, Tour; Modal и Notification без `isContained`; Slideover без `container` | `BaseTooltip.vue:11`, `BaseDropdown.vue:5`, `BaseTour.vue:2` | Телепорт жёстко в `body` → тема на поддереве (`[data-theme=dark]`) не доходит (эталон dark-theme BaseTour — белая карточка); при fullscreen элемента оверлеи не видны; CSS-переменные обёртки не наследуются. PCK-3 в pickers — P3, здесь P2 по OVL-1: у той же причины есть ещё последствие для fullscreen | — | Не исправлено |
| OVL-2 | все оверлеи | z-index 1000: `BaseModal.style.scss:12`, `BaseSlideover.style.scss:8`, `BaseTour.style.scss:4`; 1100: `BaseDropdown.style.scss:15`; Notification 2000; Tooltip 9999 | При равном z-index порядок задаёт момент монтирования (якорь Teleport), а не открытия: модалка из App оказывается под slideover страницы, тур над модалкой — снизу. Порядок в DOM подтверждён, отрисовку проверить в браузере (A4) | — | Не исправлено |
| OVL-3 | Modal, Slideover, Notification, Tour | `BaseModal.vue:2`, `BaseSlideover.vue:2`, `BaseNotification.vue:2`, `BaseTour.vue:2` | Корень шаблона — Teleport, нет `inheritAttrs:false` и `v-bind="$attrs"` → `id`, `data-testid`, `aria-*`, `class` теряются с dev-warning; в том числе нельзя дать `aria-label` диалогу без title | — | Не исправлено |
| OVL-4 / TOUR-6 | usePopup и useScrollLock (Modal, Slideover), Tour, useDropdownPosition | `usePopup.ts:52-63` → `useScrollLock.ts:27-29`; `BaseTour.vue:218-233`; `useDropdownPosition.ts:106-144` | Оверлей открыт при SSR → immediate-watch и computed обращаются к `document`/`window` → `ReferenceError` | useFocusTrap сделан SSR-безопасным (watch внутри onMounted); usePopup по-прежнему `immediate: true`, остальное не тронуто | Не исправлено |
| OVL-6 | тесты группы | `BaseSlideover.visual.spec.ts:8`; `BaseTooltip.visual.spec.ts:28-29`; `build/tests/playwright.config.ts:39`; `build/tests/setup-vitest.ts:48-62` | (а) visual Slideover ссылался на несуществующие stories, эталоны — страница ошибки и спиннер; (б) visual Modal/Dropdown/Popover/Tooltip снимают закрытый триггер; (в) `maxDiffPixelRatio: 0.15`; (г) ключевые composables замоканы; (д) play в CI не запускаются, 5 play BaseTooltip заведомо ложные | (а) спек переведён на `opened-with-title`, `side-left-opened`, `full-width-opened`, `with-footer-slot` с ожиданием панели и шрифтов — не запускался; (г) из integration Modal/Slideover/Tour убраны моки useScrollLock/useEscapeKey/useClickOutside; play `LongContent` у Modal стал содержательным | Частично: эталоны Slideover не перегенерированы (тест упадёт до `test:visual:update`); (б), (в), (д), моки в unit-спеках и в Dropdown.integration — без изменений |
| MOD-A11Y (CONTEXT) / SLD-1 | BaseModal, BaseSlideover | `BaseModal.vue:16-37`; `BaseSlideover.vue:4-19` | Нет `role=dialog`, `aria-modal`, `aria-labelledby`; фокус не переводится, не удерживается и не возвращается; у «×» BaseModal нет имени → Tab уходит на страницу под оверлеем | Новый `useFocusTrap` (экспорт в `composables/index.ts`); `role="dialog"`; `aria-modal`, кроме `isContained`/`container`; `aria-labelledby` через `useId`; «Закрыть» у Modal. Тесты: `BaseModal.integration.spec.ts` и `BaseSlideover.integration.spec.ts` › «семантика диалога и управление фокусом» (по 5, падали: да), `useFocusTrap.spec.ts` (15) | Частично: без `title` (а у Slideover и со слотом `header`) у диалога нет доступного имени — нужен OVL-3 или проп; фон не `inert` (FT-2). Приоритет MOD-A11Y (в ревью не назначен) — P2, как у SLD-1 |
| MOD-2 / SLD-2 | BaseModal, BaseSlideover | `BaseModal.vue:18,29-37`; `BaseSlideover.vue:21,113` | Без `title` (и слота header) нет кнопки закрытия → при `closeOnOverlay=false` окно закрывается только по Escape | — | Не исправлено |
| ESC-STACK (CONTEXT) | useEscapeKey, все оверлеи | `useEscapeKey.ts:20-33` | У каждого экземпляра свой слушатель на document, стека нет → один Escape закрывает все открытые слои: BaseSelect в модалке закрывает и модалку; Esc в туре поверх модалки закрывает модалку | — | Не исправлено. Приоритет в ревью не назначен; P2, потому что ломается только отмена вложенного слоя, а основной сценарий доступен |
| POP-1 | usePopup (Modal, Slideover) | `usePopup.ts:33-36` | Родитель не закрыл окно (подтверждение, одностороннее связывание), а `close()` уже снял блокировку → страница прокручивается под открытым окном | `usePopup.ts`: `close()` не трогает блокировку; `lock`/`unlock` следуют фактическому `isOpen`. `usePopup.spec.ts` › «не снимает блокировку по Escape, пока родитель не закрыл popup» (падал: да); тест `:95`, закреплявший дефект, переписан | Исправлено |
| POP-2 | usePopup | `usePopup.ts:34,55,65-67` | `lockScroll` стал false при открытом окне (Modal перешёл в `isContained`, Slideover получил `container`) → `unlock` не вызывается ни при закрытии, ни при размонтировании | watch по `isOpen && lockScroll`, безусловный идемпотентный `unlock`, `onUnmounted(unlock)`. `usePopup.spec.ts` › «снимает блокировку при закрытии, если lockScroll стал false пока popup открыт», «снимает блокировку при размонтировании, если lockScroll стал false пока popup открыт» (падали: да) | Исправлено |
| DRP-2 | BaseDropdown (и Select, Search, TableToolbar) | `BaseDropdown.vue:2-19` | Нет id, `aria-expanded`, `aria-haspopup`, `aria-controls`, нет role панели и способа их задать (слоты без scoped props). Фокус не переводится в панель и не возвращается по Escape; панель в конце body, и Tab идёт мимо неё | Координатор (часть): при закрытии (`isOpen` → false), если фокус внутри панели, `BaseDropdown.vue` возвращает его на элемент, с которого панель открыли (`restoreFocusFromPanel` в watch с flush 'pre', пока панель ещё в DOM). `BaseDropdown.integration.spec.ts` › «при закрытии по Escape фокус из поля ввода панели возвращается на триггер, а не на body», «BaseSelect с поиском: после выбора опции фокус возвращается на триггер селекта» (падали без правки: да, временный откат), защитный «не перехватывает фокус, если к моменту закрытия он уже вне панели» | Частично — сделан возврат фокуса при закрытии. Нет id, `aria-expanded`/`aria-haspopup`/`aria-controls`, role панели, перевода фокуса в панель и стрелок; Tab по-прежнему идёт мимо телепортированной панели |
| DP-1 / DRP-4 | useDropdownPosition (Dropdown, Popover, Select) | `useDropdownPosition.ts:40-155` | Нет flip, сдвига и ограничения высоты по экрану → у нижнего края панель уходит за экран; внутри модалки (прокрутка заблокирована) нижние пункты недостижимы | — | Не исправлено |
| POPV-1 | BasePopover | `BasePopover.vue:15`, `BaseDropdown.style.scss:1-3`, `useDropdownPosition.ts:34-35` | Обёртки блочные, и измеряется обёртка, а не кнопка → клик в любом месте строки открывает поповер, `top` и `bottom` центрируются по строке (по CSS) | — | Не исправлено |
| POPV-2 | BasePopover | `BasePopover.style.scss:1-2` | Класс `.base-popover` не рендерится → правило `color: var(--color-text)` мёртвое, `color.text` варианта default игнорируется, текст наследует цвет body приложения. Визуальный эффект в тёмной теме — A4 | — | Не исправлено |
| POPV-3 | BasePopover | `BasePopover.vue:15-24` | Обёртка триггера — `div @click` без клавиатуры и ARIA; если в слоте не кнопка, с клавиатуры поповер не открыть; у панели нет role и имени | — | Не исправлено |
| TT-1 (см. RNG-6, pickers) | BaseTooltip | `BaseTooltip.vue:7-8,14-19`, `BaseTooltip.style.scss:16` | Показ только по mouseenter: нет показа по фокусу, Escape, `role=tooltip`, `aria-describedby`; из-за `pointer-events:none` на тултип нельзя навести (WCAG 2.1.1, 1.4.13, 4.1.2) | — | Не исправлено |
| TT-2 | BaseTooltip | `BaseTooltip.vue:5-6,16`, `BaseTooltip.style.scss:82-125` | Класс варианта и переменные `--size-scale`/`--custom-*` висят на обёртке, а попап в body их не получает → `variant`, `sizeScale`, `color` не действуют. Unit-тесты ложноположительные из-за стаба Teleport | — | Не исправлено |
| NTF-1 | BaseNotification | `BaseNotification.vue:3-17` | Нет live-региона → уведомления не озвучиваются (WCAG 4.1.3) | Контейнер `role="region"` с `aria-label` «Уведомления» (`UI_ARIA.NOTIFICATIONS`); у элемента error — `role="alert"`, у остальных — `role="status"`. `BaseNotification.spec.ts` › «контейнер — регион «Уведомления», ошибка объявляется как alert», «остальные типы объявляются вежливо как status» (падали: да) | Исправлено. Надёжность озвучивания вставленного `status` — A4 |
| NTF-2 | BaseNotification | `BaseNotification.vue:104`, `constants/ui.ts:62` | Автозакрытие через 3 с, без паузы при наведении и фокусе (WCAG 2.2.1) | — | Не исправлено |
| NTF-3 | BaseNotification | `BaseNotification.vue:54,104` | `duration: 0` → таймер 0 мс: уведомление исчезает сразу, хотя прогресс-бар рассчитан на 3 с; `Infinity` и значения больше 2³¹−1 переполняют `setTimeout`; режима «не закрывать» нет | `resolveDuration()`: 0, NaN, отрицательные и Infinity → 3000 мс, одно значение для таймера и прогресс-бара. `BaseNotification.spec.ts` › «duration=0 заменяется значением по умолчанию: через 100 мс уведомление на месте, через 3000 мс удалено», `it.each` «некорректная длительность %s заменяется значением по умолчанию» (Infinity, −500, NaN), «положительная длительность одинаково задаёт таймер и прогресс-бар» (падали: да) | Частично: режима без автозакрытия нет; конечные значения больше 2³¹−1 (например, `Number.MAX_SAFE_INTEGER` как «навсегда») по-прежнему переполняют `setTimeout`, теста нет |
| NTF-4 | BaseNotification | `BaseNotification.vue:125-129`, `types:39-40` | Декларативные props читаются один раз в onMounted; `notificationKey` не реализован → смена title или key не создаёт уведомление | — | Не исправлено |
| NTF-5 | BaseNotification | `BaseNotification.vue:42-50` | Кнопка закрытия — только иконка с `aria-hidden`, доступного имени нет | `:aria-label="UI_ARIA.CLOSE"`. `BaseNotification.spec.ts` › «кнопка закрытия имеет доступное имя» (падал: да) | Исправлено |
| TOUR-2 | BaseTour | `BaseTour.style.scss:7-21`, `BaseTour.vue:10` | Прозрачный оверлей на весь экран лежит поверх страницы → клик по подсвеченной цели вызывает `skip` и `close`, а сама цель клик не получает | — | Не исправлено |
| TOUR-3 | BaseTour, useTourLogic | `BaseTour.vue:4,13,20,223`, `useTourLogic.ts:72-76,109-114` | Цель не найдена или `steps` пуст либо приходит позже → оверлей без спотлайта и карточки (при пустых `steps` — только блокировка body); первый клик «съедается» skip; повторного поиска цели и `watch(steps)` нет | — | Не исправлено |
| TOUR-4 | BaseTour | `BaseTour.vue:2-9,218-233` | При `aria-modal="true"` фокус не переводится в карточку, ловушки и возврата нет, смена шага не объявляется | — | Не исправлено (useFocusTrap не подключён) |
| TOUR-5 | useTourLogic | `useTourLogic.ts:67-70,95-107` | `scrollIntoView` вызывается на каждый scroll и resize → при `lockScroll=false` страницу возвращает к цели | — | Не исправлено |
| DOC-OVL | README (Modal, Slideover, Dropdown, Popover, Tooltip) | `README.md:393-411, 416-433, 437-455, 459-477, 481-495` | Примеры не работают: `v-model` вместо `v-model:is-open`; у Dropdown слот `#trigger` и не привязан `isOpen`; у Tooltip `content` вместо `text`; `BaseButton label` | README переписан: Modal и Slideover — `v-model:is-open`; Dropdown — триггер в слоте по умолчанию, панель в `#dropdown`, `v-model:is-open` и открытие кликом (с пояснением); Popover — `#trigger`; Tooltip — `text`; у кнопок текст в слоте. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (примеры HEAD `examples-before/16…20` давали TS2353 — `modelValue`, `label`, `content`; текущие без ошибок) | Исправлено (README). ID и приоритет назначены здесь (в ревью без ID): P2, потому что не работали примеры основной документации |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| OVL-5 (см. ANI-2, display) | все, кроме Tour | `BaseModal.style.scss:137-156`, `BaseSlideover.style.scss:105-129`, `BaseDropdown.style.scss:46-66`, `BaseTooltip.style.scss:128-182`, `BaseNotification.style.scss:225-245`; у Tour `BaseTour.style.scss:112-123` без `:20` и без JS-задержки 450 мс | `prefers-reduced-motion` не учитывается | — | Не исправлено |
| MOD-4 | BaseModal | `BaseModal.types.ts:37` | Событие `confirm` объявлено, но не эмитится | — | Не исправлено |
| MOD-5 | BaseModal | `BaseModal.vue:91` | `closeOnEscape: () => true` → блокирующий диалог сделать нельзя | — | Не исправлено |
| SLD-4 | BaseSlideover | `BaseSlideover.types.ts:12`, `.vue:75-80` | `variant`, `sizeScale`, `color` объявлены, но молча игнорируются | — | Не исправлено |
| SLD-5 | BaseSlideover | `BaseSlideover.style.scss:18-21` | `hasOverlay=false` оставляет прозрачный оверлей, который перехватывает клики → немодальной панели нет | — | Не исправлено: по решению этапа `hasOverlay=false` остаётся модальным (aria-modal и ловушка) |
| DRP-5 | BaseDropdown | `BaseDropdown/index.ts:2`, `types:73-76` | `BaseDropdownExpose` не экспортирован → `ref.updatePosition` у потребителя без типа | — | Не исправлено |
| DRP-6 | BaseDropdown | `useClickOutside.ts:61` (только mousedown) | Уход фокуса по Tab не закрывает панель | — | Не исправлено |
| POPV-5 | BasePopover | `BasePopover.vue:64-72` | Закрытие повторным кликом по триггеру эмитит только `update:isOpen(false)`, без `close` | — | Не исправлено |
| TT-3 / TU-1 (см. PRG-4, display) | BaseTooltip, tooltipUtils | `BaseTooltip.vue:60-69`, `tooltipUtils.ts:6-35`, `BaseTooltip.style.scss:27-41` | Нет flip и сдвига у края экрана; rAF-цикл каждый кадр читает `getBoundingClientRect` и создаёт новый `coords` (при `isAlwaysVisible` — бессрочно); зазор ≈14–20px в зависимости от высоты тултипа | — | Не исправлено |
| TT-4 | BaseTooltip | `BaseTooltip.vue:2` | Обёртка `div` inline-block (невалидна в `<p>` и `<button>`), атрибуты уходят на обёртку, пустой `text` даёт пустой пузырь, нет show/hide | — | Не исправлено |
| NTF-6 | BaseNotification | `types:60-62`, `BaseNotification.vue:16-17` | default-слот не рендерится, действие «Повторить» не добавить; `variant`, `color`, `sizeScale`, `position`, `customClass` из `add()` игнорируются; без title рендерится пустой `h4` | — | Не исправлено |
| NTF-7 (см. ANI-3, display) | BaseNotification | `BaseNotification.vue:11`, `BaseAnimation.style.scss:214-235` | `TransitionGroup name="list"` опирается на глобальные `.list-*` из стилей чужого компонента | — | Не исправлено |
| NTF-8 | BaseNotification | `BaseNotification/index.ts:2` | Несколько экземпляров с одной позицией накладываются друг на друга (нет сервиса и очереди); `BaseNotificationExpose` не экспортирован | — | Не исправлено |
| TOUR-7 | BaseTour, useTourLogic, useTourCoordination | `useTourLogic.ts:11,35-46`; `useTourCoordination.ts:126-141` | Карточка не ограничена экраном; невалидный селектор даёт необработанный reject; rAF или таймер срабатывают после размонтирования; reduced motion не учитывает transition спотлайта и JS-задержку | — | Не исправлено |
| ESC-1 | useEscapeKey | `useEscapeKey.ts:20-25` | Не учитываются `defaultPrevented` и `isComposing` → вложенный виджет не может «поглотить» Escape (IME — A4) | — | Не исправлено |
| CO-2 | useClickOutside | `useClickOutside.ts:51,61` | Только `mousedown` и `event.target`: нет `composedPath()` (Shadow DOM) и `pointerdown` | — | Не исправлено |
| DP-2 / DRP-4 | useDropdownPosition | `useDropdownPosition.ts:106,114,118,122,128,131-132,136,144` | `right = innerWidth − x` и `bottom = innerHeight − y` включают скроллбар → позиции `*-end`, `top*`, `left*` смещены на 15–17px | — | Не исправлено |
| DP-3 | useDropdownPosition | `useDropdownPosition.ts:158-192` | Слушатели scroll (capture) и resize висят всё время жизни каждого экземпляра, без rAF и ResizeObserver | — | Не исправлено |
| DP-4 | useDropdownPosition | `useDropdownPosition.ts:95-97` | `matchWidth` задаёт `width`, а по документации — минимальную ширину | — | Не исправлено |
| FP-1 / MM-8 (navigation) | useFlyoutPosition | `useFlyoutPosition.ts:33,42` | Скроллбар считается свободным местом; панель выше окна прижимается к `top:8px` без `max-height`; нет ResizeObserver, а слушатели висят у каждого узла всё время жизни | — | Не исправлено |

### A4. Гипотезы (не подтверждены)

- **MOD-3.** Выделение текста в поле модалки с отпусканием кнопки над затемнением закрывает окно (`@click.self`, `BaseModal.vue:15`). Проверка: Playwright — `mouse.down` в input → `move` → `up` на оверлее.
- **SLD-3.** `container`, заданный селектором из того же шаблона, не находится при монтировании Teleport. Проверка: integration, host в том же шаблоне, затем `o=true`.
- **SL-1.** На iOS Safari `overflow:hidden` на body не блокирует прокрутку касанием; `position:fixed`-элементы сдвигаются на ширину скроллбара. Проверка: iOS-устройство; страница с классическим скроллбаром.
- **OVL-2 (отрисовка).** Порядок в DOM подтверждён, фактическое наложение слоёв нужно проверить в браузере.
- **POPV-2 (визуальный эффект).** Текст панели нечитаем при `html[data-theme=dark]`, если у body приложения не задан цвет. Проверка: visual тёмной темы с открытым поповером.
- **ESC-1 (IME).** Esc для отмены IME-ввода в поле модалки закрывает модалку. Проверка: браузер с IME.
- **MOD-1 (мобильные).** `max-height: calc(100vh − 40px)` больше видимой области при показанных панелях мобильного браузера → подвал может уйти под панель; `100dvh` не применён. Проверка: мобильный Safari или Chrome.
- **NTF-1 (озвучивание).** `role="status"` стоит на вставляемом элементе, а не на заранее существующем live-регионе. Часть скринридеров (NVDA или JAWS с Chrome) содержимое новой live-области не озвучивает. Проверка: NVDA и VoiceOver.
- **FT-1 (новая, useFocusTrap).** `getTabbableElements` отбрасывает только `[hidden]`, `[inert]` и `tabIndex<0`. Элементы в `display:none` (`v-show`), `visibility:hidden`, `fieldset[disabled]` (BaseForm при `isLoading`) считаются доступными по Tab. Если такой элемент крайний в списке, Tab или Shift+Tab на реально крайнем элементе не перехватывается, и фокус уходит из диалога. Проверка: браузер, модалка с последним полем под `v-show=false`.
- **FT-2 (новая, useFocusTrap).** Любой фокус вне контейнера считается «вложенным слоем», и Tab не перехватывается, а фон не `inert`. После Tab из телепортированной панели внутри модалки (поиск BaseSelect — теперь фокусируем после DRP-1, поповер) фокус уходит в конец документа или в UI браузера, затем на страницу под оверлеем, и ловушка больше не срабатывает. Проверка: браузер. Исправление: `inert` на фон или реестр слоёв.
- **NTF-3 (нестабильность e2e и visual Default).** Вероятно, снята: при `duration: 0` уведомление теперь видно 3 с.

---

---

## Примечания к перепроверке

1. **OVL-6(а).** В отчёте — «исправлен». Спек действительно переведён на существующие stories, но эталоны в `tests/visual-snapshots/src/components/BaseSlideover/__tests__/…` прежние: страница ошибки «Couldn't find story…», спиннер Storybook, снимки старых stories. Прогон visual на итоговом коде это подтвердил: `base-slideover--default` и `--left-side` отличаются от эталонов, фактический рендер — открытая панель (REPORT.md §5.3, `visual-changes/`). В реестре — «Частично» до перегенерации эталонов.
2. **MOD-1.** В отчёте — «исправлен». На момент сверки e2e и play не запускались; позже прогнаны в Chromium и прошли (REPORT.md §5.2, §5.4). Режим `isContained` не покрыт (`max-height` считается от `100vh`) — в реестре «Частично».
3. **DRP-1.** В отчёте — «исправлен». Исключение сделано только для полей ввода; кнопки, ссылки и `[tabindex]` в панели по-прежнему возвращают фокус на триггер. Ревью предлагало включить их в исключение и поменять значение по умолчанию. В реестре — «Частично».
4. **NTF-3.** В отчёте — «исправлены NTF-1/5/3». Режима без автозакрытия нет (отчёт сам относит его к предложениям); конечные значения больше 2³¹−1 не ограничены. В реестре NTF-3 — «Частично».
5. **Семантика диалогов (п. 5 отчёта).** В отчёте — «исправлено». Без title, а у Slideover и со слотом header, у диалога нет доступного имени; отчёт относит это к предложениям. В реестре MOD-A11Y / SLD-1 — «Частично».
6. **useImageZoom.spec.ts:527.** Отчёт пишет, что этот тест «теперь падает». Устранено вне этапа: `enableAutoUnmount(afterEach)` добавлен этапом media (отчёт этапа исправлений) и есть в diff. В прогоне after-state падает только `BaseEmpty.spec.ts`, он вне группы; позже исправлен координатором (п. 10).
7. **Неотслеживаемый `src/composables/useFocusTrap/`.** В `git status` каталог помечен `??`, поэтому в `git diff HEAD` его не видно. BaseModal и BaseSlideover его импортируют, `composables/index.ts` реэкспортирует. При коммите нужен `git add`, иначе сборка сломается. Статусы, которые от него зависят, поставлены по рабочей копии.
8. **черновике раздела «Изменения поведения» README (передать этапу README).**
   - Фраза «Dropdown/Popover с блокировкой прокрутки» неверна: BaseDropdown и BasePopover прокрутку не блокируют. Общий счётчик используют usePopup (Modal, Slideover), BaseTour, useImageZoom и BaseSearchOverlay.
   - В «aria-modal (кроме режима isContained)» не хватает режима `container`: у Slideover он тоже немодальный.
   - Обновление: в итоговом README учтены оба замечания. Общий счётчик перечисляет Modal, Slideover, Tour, зум и BaseSearch в режимах modal/sidebar, без Dropdown и Popover; `aria-modal` — «кроме режимов `isContained` / `container`».
9. **Неверных находок при перепроверке нет.** CO-1, TT-1, TT-2, POPV-2 (мёртвое правило), OVL-2 (значения z-index), OVL-3, MOD-2 и SLD-2 подтверждаются кодом рабочей копии. Эти места не изменялись.
10. **Обновление статусов (координатор), 26.09.** Изменено 2 статуса:
   - DRP-2 (P2): «Не исправлено» → «Частично». Возврат фокуса из панели на триггер при закрытии: `restoreFocusFromPanel` в `BaseDropdown.vue`, 3 теста в `BaseDropdown.integration.spec.ts`. ARIA-связка, role панели, перевод фокуса в панель и стрелки не сделаны. Из остатка DRP-1 закрыт пункт «после выбора из поиска фокус уходит на body»; статус DRP-1 прежний («Частично» — кнопки и ссылки в панели).
   - DOC-OVL (P2): «Не исправлено» → «Исправлено (README)». Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`).
   - Прогон after-state (п. «Соглашения», п. 6): `BaseEmpty.spec.ts` исправлен координатором — путь к SCSS через `fileURLToPath`/`node:path`; по его прогону файл проходит (17 тестов в BaseEmpty).
   - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометки матрицы «argTypes без …» (Dropdown, Tour) могли быть следствием сломанного docgen: теперь props подтягиваются из `__docgenInfo`. Перепроверить по сборке Storybook.
