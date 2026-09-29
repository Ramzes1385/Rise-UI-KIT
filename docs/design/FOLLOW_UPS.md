# Что осталось после редизайна

Сводка разделов «Найдено, но не исправлено» и «Запросы координатору» из отчётов 11 групп. Одинаковые запросы разных групп объединены в одну строку. ID вида TBL-3 — номера находок аудита (`claude/audit/REPORT.md`, `ROADMAP.md`).

**Шкалы** (как в ROADMAP):
- Тип изменения: patch — исправление без изменения API; minor — новое необязательное API или поведение; major — несовместимое изменение.
- Объём: S — до дня; M — несколько дней; L — неделя и больше.

**В список не входят:**
- перегенерация baseline — см. [VISUAL_CHANGES.md](./VISUAL_CHANGES.md);
- вопросы, которые уже решены гайдами:
  - BaseEmpty находится в разделе `Data` (STORIES_GUIDE §2);
  - HEX допустим в story `CustomColor` (STORIES_GUIDE §8);
  - вариант BaseTabs по умолчанию — `underline` (DESIGN_SYSTEM §4).

## Сквозные задачи

| # | Суть | Где | Почему не сейчас | Тип | Объём |
|---|---|---|---|---|---|
| 1 | Доступное имя полей без видимой подписи: ~~`ariaLabel` и `inputAttrs` у BaseInput и BaseTextarea~~ — порция 1.8. Остались BaseSelect, BaseCheckbox (имя через скрытый `label` в `customClass`), триггер BaseColorPicker; атрибуты с корня на нативный контрол (`inheritAttrs: false`, FRM-1 шаг 3) | BaseSelect, BaseCheckbox, BaseColorPicker | `inheritAttrs: false` несовместим | minor; major для `inheritAttrs` | M |
| 2 | ~~Контекст BaseFormField для полей кита через provide/inject: id подписи, `aria-describedby`, ошибка (FFD-2)~~ — порция 1.8: BaseInput, BaseTextarea, BaseSelect, BaseCheckboxGroup, поле BaseDatePicker. Не подключены BaseCheckbox, BaseSwitch, BaseRadio (внутри обёртки — группа, как раньше) | BaseFormField → BaseCheckbox, BaseSwitch, BaseRadio | Одиночному флажку и группе радиокнопок нужна своя схема имени | minor | S |
| 3 | CORE-1: переменные `--custom-*` наследуются во вложенные компоненты | Слоты уже сбрасываются через `reset-custom-color`, но цвет родителя красит Loader, Progress, Avatar, Separator, кнопки прокрутки Tabs и кнопку сворачивания SideBar (`color.bg.base`). В Tabs, Pagination, MegaMenu и SideBar это перекрыто двойным классом | Нужна сквозная правка SCSS (`--custom-*: initial` на корне или `@property { inherits: false }`): меняет вид вложенных компонентов и baseline | minor¹ | M |
| 4 | Значение 100 в `useSizeScale` означает «наследовать». Поэтому `calcIconScale`, давший ровно 100 (`'sm'` при 125, `'xs'` при ≈166), не фиксирует размер иконки | Иконка пароля BaseInput при `sizeScale` 125: 25px вместо 20px. Вероятно, также BaseSelect и др. (CORE-2). В BaseAlert обойдено CSS-размером | Меняет размеры иконок в масштабированных родителях | minor | S |
| 5 | ~~DP-1: нет flip и shift при позиционировании~~ — сделано в 2.0: панели на `useDropdownPosition` (Dropdown, Popover, Select, Search, ColorPicker, календарь DatePicker, меню) — порция 1.5, тултип — порция 1.6; ~~панели внутри предка с `transform` (страница Docs в Storybook, окно плеера) уезжали на смещение этого предка~~ — поправка `getFixedOrigin` в `useDropdownPosition`, `useFlyoutPosition`, подсказке и контекстном меню (правки плеера, П1). Осталось: меню «Другие действия» в чате со своей логикой — у своих сообщений упирается в край окна, поправку на предка с `transform` не делает (как и `useTourLogic`, меню медиа в редакторе); высота панели не ограничивается свободным местом, если его не хватает с обеих сторон (помогает `maxHeight`) | `useChatMessageActions`, `useDropdownPosition` | Отдельные правки | minor | S |
| 6 | Кликабельные элементы недоступны с клавиатуры: `click` на `span`/`div` без фокуса и Enter; `isHoverable` не делает карточку фокусируемой | BaseBadge, индикатор BaseChip (`click-badge`), BaseAvatar, BaseCard (BDG-2, CHP-1, AVA-1, CRD-1). Пока совет — кнопка в слоте, как в Chat, Table и Select | Меняет семантику и порядок Tab у всех потребителей | minor | M |
| 7 | ~~Проп `isIndeterminate` у BaseCheckbox~~ — порция 1.8 (и BaseCheckboxGroup с «Выбрать все»). Осталось применить его в «Выбрать все» BaseTable (TBL-2) и каскаде BaseTree (TRE-4) | BaseTable, BaseTree | Правки другой группы | minor | S |
| 8 | Глобальное правило шрифта (`:where(body, button, …, [class^='base-'])`) не попадает в `dist/styles.css`. README («Шрифты») советует `--font-family-base` — это алиас 1.x | `src/styles/index.scss` подключают только Storybook и playground; BaseText держит явный `font-family` | Нужно решить, что входит в пакет | patch | S |
| 9 | ~~Нет токена z-index для оверлеев~~ — токены `--rise-z-*` и порядок открытия, порция 1.5. Осталось: подложка BaseLoader `isOverlay` — `z-index: 9999`; если у контейнера нет своего контекста наложения (`isolation: isolate`, как у BaseTable), подложка оказывается над открытым окном | BaseLoader | Нужна проверка в браузере на реальных контейнерах: меньшее значение может уйти под содержимое с z-index | patch | S |
| 10 | `useScrollableRegion` не видит горизонтальную прокрутку и рост содержимого | Признак пересчитывается только при изменении размера самого элемента. В BaseTable это решено локально (`updateScrollable`) — перенести в composable | Не мешает текущим сценариям Modal и Slideover | patch | S |
| 11 | `useExpandTransition` не учитывает `prefers-reduced-motion` | Раскрытие строк BaseTable (300 мс, JS). При нулевой длительности не приходит `transitionend` (EXP-1) | Общий composable | patch | S |
| 12 | ~~`<fieldset disabled>` не блокирует кастомные контролы (FORM-1)~~ — порция 1.8: контекст формы блокирует BaseSelect, BaseRange, BaseRating, BaseFileUpload, BaseCheckboxGroup, BaseEditor (только чтение) | BaseForm | — | minor | M |
| 13 | Строки доступности — в `UI_ARIA`/`UI_TEXT` | Строки в компонентах: «Символ N из M» (BasePin), `SLIDER_LABEL` (BaseSlider), «Изображение N из M» (BaseImageZoom). Нужны новые: «Пагинация», «Страница N» (PG-3), «Показать скрытые крошки» (BC-3), «пройден» (ST-2) | Общий `src/constants/ui.ts` вне зоны групп; заодно шаг к i18n | patch | S |
| 14 | Общие миксины и классы в `src/styles` | Сброс нативной кнопки (`chat-button-reset`); иконочная кнопка тулбара (`base-editor-tool-button`, нужна Table и Chat); `field-counter` (Textarea); класс визуально скрытого текста (сейчас `.base-table__visually-hidden`, `.base-tree__visually-hidden`, в stories — `story-visually-hidden`) | Общие файлы группы не трогали | patch | S |
| 15 | Цвета цветовой модели и медиа-подложки заданы без токенов | `--picker-white/black` и спектр `hsl()` в BaseColorPicker; `$media-*` (black 32–88%, white 16–72%) в BaseImage и BaseSlider | Нужны токены (`--rise-media-*` пригодятся видеоплееру) или явное исключение в DESIGN_SYSTEM | patch | S |

¹ ROADMAP относил CORE-1 к 2.0. Но правило 11 DESIGN_SYSTEM уже обещает, что цвет не протекает во вложенные компоненты, так что исправление приводит поведение к документированному.

## Компоненты: доступность и поведение

| # | Суть | Где | Почему не сейчас | Тип | Объём |
|---|---|---|---|---|---|
| 16 | ~~`aria-describedby` (TT-1), `triggerProps`, `span` вместо `div` у тултипа (TT-4), ARIA кнопки поповера~~ — сделано в 2.0, порция 1.6. Осталось: `div @click` у поповера — если в слоте не кнопка, с клавиатуры поповер не открыть (POPV-3); у тултипа нет событий show/hide, rAF-цикл читает положение триггера каждый кадр (TT-3, теперь без лишних перерисовок) | BaseTooltip, BasePopover | Кнопка-обёртка поповера меняет разметку; события — новый API | minor | S |
| 17 | Tab уходит из открытой панели BaseDropdown: нет ловушки фокуса и стрелок (DRP-2). Для меню — ~~сделано~~ в 2.0, порция 1.6: `BaseDropdownMenu` по APG Menu Button; панель «Колонки» BaseTable можно перевести на него (флажки) | BaseDropdown, BaseTable | Панель «Колонки» — вместе с таблицей (этап 2) | minor | S |
| 18 | `confirm` объявлен, но не эмитится (MOD-4); Escape закрывает всегда, блокирующий диалог сделать нельзя (MOD-5) | BaseModal | Меняет API | minor (`closeOnEscape`), major (удалить `confirm`) | S |
| 19 | При `hasOverlay=false` прозрачный оверлей перехватывает клики: немодального режима нет (SLD-5) | BaseSlideover | Меняет поведение | minor | S |
| 20 | ~~Повторный клик закрывает поповер, но эмитит только `update:isOpen`, без `close` (POPV-5)~~ — сделано в 2.0, порция 1.6 | BasePopover | — | patch | S |
| 21 | ~~Автозакрытие не ставится на паузу при наведении и фокусе (NTF-2, WCAG 2.2.1)~~ и ~~`duration` компонента не наследуется `add()`~~ — исправлено в 2.0, порция 1.2. Не работают: `notificationKey` (NTF-4), слот default, поля `color`/`sizeScale`/`position`/`customClass` в `add()` (NTF-6). Уведомления с одной позицией накладываются (NTF-8; в приложении с `BaseApp` контейнер один) | BaseNotification | Новая логика таймера и API | minor | M |
| 22 | Подсвеченная цель не кликабельна (TOUR-2); шаг без цели не обрабатывается (TOUR-3); смена шага не объявляется, нет `aria-describedby` (TOUR-4) | BaseTour | Логика тура | minor | M |
| 23 | BaseLoader: при `hasLabel=false` в `role=status` только `aria-label`, и появление может не озвучиваться (LDR-1); оверлей не делает содержимое `inert`/`aria-busy` (LDR-3). BaseProgress: нет `aria-valuetext` (PRG-2); `complete` срабатывает по округлению (PRG-3); смонтированный на 100% не эмитит `complete`; литерал `r="52"` (CNS-1) | BaseLoader, BaseProgress | Логика и API вне редизайна | patch | S |
| 24 | Нет валидации входных размеров. Separator: `thickness` NaN или ≤0 молча убирает линию, `spacing` действует только на подпись (SEP-3). Skeleton: `0` отбрасывается, `'auto'` при масштабе ≠100 даёт невалидный `calc`, `rect`/`circle` без высоты невидимы (SKL-3) | BaseSeparator, BaseSkeleton | Валидация, а не дизайн | patch | S |
| 25 | Глобальные классы без префикса (`.fade-*`, `.list-*`) — это API пропа `name` (ANI-3). Без `interpolate-size` (Firefox, Safari) `collapse` меняет высоту скачком | BaseAnimation | Префикс ломает приложения | major (префикс) | M |
| 26 | `v-html` в `icon` (TAB-3); не сбрасывается `hasDragMoved` (TAB-6); `change` при клике по активной вкладке (TAB-8) | BaseTabs | TAB-3 несовместим; остальное вне объёма | major (TAB-3), patch | S |
| 27 | Крошки — кнопки, а не `<a href>` (BC-2). У «…» нет имени и `aria-expanded`, свернуть нельзя (BC-3); дубль Schema.org (BC-5). Нет `<nav aria-label>` и «Страница N» (PG-3); PG-4, PG-6, PG-7 | BaseBreadcrumbs, BasePagination | Нужны строки (№ 13) и смена семантики `navigate` | minor (BC-2), patch | M |
| 28 | ~~Нет полного APG Menu (MENU-1)~~ — `BaseDropdownMenu` и `BaseContextMenu` в 2.0, порция 1.6 (BaseMenu остаётся списком действий). MegaMenu: ~~листья не `<a href>`~~ — ссылки через BaseLink (порция 1.6); осталось: заголовок колонки `h4 tabindex=0` без клавиатуры, верхние пункты dropdown с адресом — кнопки, нет `<nav>` (MM-1); MM-3, MM-4 (Escape, клик вне — можно на стеке слоёв), MM-5 (слоты), MM-7, MM-8 | BaseMegaMenu | Большой объём, контракт слотов | minor | M |
| 29 | ~~`href` не проходит `isSafeUrl` (SB-6)~~ — сделано в 2.0, порция 1.1; нет `<nav>` (SB-5); SB-3, SB-4 (flyout в свёрнутой панели), SB-9…SB-12 | BaseSideBar | Логика `useSideBarNavigation`, вне редизайна | patch (SB-5, SB-6), minor | M |
| 30 | Stepper: нет текста «пройден» (ST-2); кликабельны все шаги, `change` при клике по текущему (ST-3). Accordion: `div role=button` без уровня заголовка (ACC-2); ACC-3, ACC-4 (`v-model:open`), ACC-6 | BaseStepper, BaseAccordion | Разметка и новый API | minor | M |
| 31 | Смена `rows` сбрасывает страницу и выбор (TBL-3); догрузка «схлопывается» (TBL-4). Клик по строке и ресайз — только мышью. У `cell-<key>` нет `value`/`index`. Закреплённые колонки перекрывают колонку выбора. У `header-<key>` нет кнопки сортировки. Один текст для «нет данных» и «ничего не найдено». TBL-8…TBL-21 | BaseTable | Поведение и API не менялись | minor | L |
| 32 | ~~Нет ролей `tree`/`treeitem`, клавиатуры APG и roving tabindex (TRE-1, TRE-2); подписи с `to`/`href` не ссылки (TRE-6)~~ — порция 1.7. Нет каскада и indeterminate (TRE-4); TRE-5/8/9/11; кнопки слота `actions` у каждого узла — в порядке Tab (TRE-7) | BaseTree | Каскад и indeterminate ждут `indeterminate` у чекбокса (порция 1.8) | minor | M |
| 33 | Select: ~~нет typeahead (SEL-2)~~ — порция 1.7; `isMultiple` + `isRequired` с `[]` проходит валидацию (SEL-3). Search: нет защиты от гонок ответов (SRCH-2); SRCH-3, SRCH-10; ~~результаты без `listbox`/`option` — активный пункт не озвучивается~~ — порция 1.7 (SRCH-4) | BaseSelect, BaseSearch, `useFormField` | Остатки аудита вне этапа | patch, minor | M |
| 34 | Range: нет Home/End/PageUp/PageDown (RNG-3), нет валидации (RNG-5). Rating: при `step ≤ 0` — NaN, дробный `max` не проверяется, `modelValue > max` даёт `aria-valuenow > max` (RAT-3) | BaseRange, BaseRating | Валидация, а не дизайн | patch, minor | S |
| 35 | Нужен триггер «кнопка-иконка» и `ariaLabel`. Сейчас редактор перекрывает `.base-color-picker__swatch` своим селектором и называет пикер через `role="group"` | BaseColorPicker ← BaseEditor | Новый API другой группы | minor | S |
| 36 | Описание из слота `default` лежит внутри `<label>` и попадает в доступное имя | BaseSwitch | Не вынести в `aria-describedby`, не изменив поведение клика | minor | S |
| 37 | Прогресс и статус «Загружено» имитируются (`Math.random`), управлять ими нельзя (FU-2). Ошибки не озвучиваются (FU-6). FU-4, FU-5, FU-8, FU-11, FU-12. При переносе подсказки «·» попадает в начало строки | BaseFileUpload | Новый API загрузки | minor; major, если менять поведение по умолчанию | L |
| 38 | Имя диалога не меняется при листании (IMG-4). Клавиши зума слушаются на `document` (IMG-10): ~~Esc в BaseModal закрывает и зум, и окно~~ — Escape идёт через стек слоёв с порции 1.5; `+`, `-`, `0` по-прежнему глобальные. Нет touch и pinch (IMG-6). IMG-8, IMG-9, IMG-12…IMG-16 | BaseImage, `useImageZoom` | Composables вне объёма | patch, minor | M |
| 39 | Нет Pause/Play и live-региона (SLD-1); нет `region` и имени карусели (SLD-5); 1 слайд + loop + autoplay эмитит `change(0)` (SLD-8); SLD-2, 3, 6, 7, 9, 10 | BaseSlider, `useSlider` | Новые элементы UI и логика | minor | M |
| 40 | Нет заявленных функций: разделителей дат и «непрочитанных», подгрузки истории, редактирования, состояния загрузки. `pinnedMessages` игнорируется, `search` и `add-member` не эмитятся (CHAT-5). «3 из 2» (CHAT-6); CHAT-7, 9, 10, 14, 15, 19, 20. Enter на подсказке @ или / сразу отправляет сообщение | BaseChat | Новый API и контракт | minor | L |
| 41 | **Безопасность.** ~~HTML не санитизируется (EDT-2)~~ и ~~`insertLink` не проверяет схему (EDT-5)~~ — сделано в 2.0, порция 1.1. Осталось: медиа сохраняются как `blob:` без revoke (EDT-4) | BaseEditor | Меняет контракт; вне объёма редизайна | patch (EDT-5), minor | M |
| 42 | Асинхронный родитель v-model откатывает DOM и сбивает каретку. В тулбаре 21 остановка Tab. Меню медиа открывается только правым кликом. У «Блок кода» и «Режим кода» одна иконка. `isEmpty` не учитывает медиа (EDT-14). Цвет по умолчанию `#000000` не виден в тёмной теме. Нет `isDisabled`/`error`/`label` (EDT-10). Enter вставляет `<br>`. Разделитель групп переносится в начало строки | BaseEditor | Логика и API вне редизайна | patch, minor | M |
| 43 | `weight` по умолчанию (400) пишется inline и перебивает `strong`, `h1–h6` и CSS потребителя. Предложение — дефолт `undefined` | BaseText | Меняет публичное поведение и тесты | major | S |

## API-гигиена

| # | Суть | Где | Почему не сейчас | Тип | Объём |
|---|---|---|---|---|---|
| 44 | Объявленные, но неработающие props и слоты скрыты в Controls. Реализовать или удалить в 2.0 | Слот `default`: BaseIcon, BaseLoader, BaseTextarea, BasePin, BaseRadio, BaseRating, BaseFileUpload (+ `emptyText`), BaseChat. `variant`: BaseSlideover (SLD-4), BaseImage (IMG-15). `variant` и `color`: BaseSlider. `variant`, `sizeScale`, `color`: BaseAnimation (CORE-7). `to` и слот: BaseMenu (MENU-2). `sizeScale`: ChatMessageReply | Удаление ломает типы | major (удаление), minor (реализация) | M |
| 45 | Константы есть в моделях, но не экспортированы из `index.ts` (у остальных `*_VARIANTS` экспорт есть) | `ALERT_TYPES`, `ALERT_VARIANTS`, `EMPTY_VARIANTS`, `CHAT_VARIANTS`, `PROGRESS_SHAPES` | Публичный API не меняли | minor | S |
| 46 | Мёртвые экспорты | `getTooltipTransition` (публичный `utils`): deprecate, удалить в 2.0. Внутренние `MODAL_CLOSE_BUTTON_PADDING`, `SIZE_SCALE_OFFSET` и лишние ключи `UI_CHAT_SCALE` удалены в 2.0 вместе с `src/constants`; осталась строка словаря `chat.CLOSE_PANEL` | Решение о депрекации | minor → major; patch для внутренних | S |
| 47 | Группа аватаров сделана inline-стилями в story `Group` (кольцо 2px, перекрытие −8px) | Нужен `BaseAvatarGroup` или класс | Новый компонент | minor | M |

## Документация, stories, тесты

| # | Суть | Где | Почему не сейчас | Тип | Объём |
|---|---|---|---|---|---|
| 48 | Записать сознательные отклонения. Плейсхолдер триггера BaseSelect — `--rise-text-muted`: это не `::placeholder`, а у dimmed контраст ниже 4.5:1. Фокус образца BaseColorPicker — `focus-ring`, а не `field-focus` | DESIGN_SYSTEM §4 | Найдено в конце работы группы pickers | patch (docs) | S |
| 49 | Обновить README: в «Шрифтах» — `--rise-font-sans`; раздел о токенах и темах; ссылка на CHANGES_FOR_APPS | README | Найдено при сведении | patch (docs) | S |
| 50 | Поправить тестовую инфраструктуру Storybook или описать её ограничения в STORIES_GUIDE (список ниже²) | `build/storybook/preview.ts`, `src/stories/helpers`, STORIES_GUIDE | Особенности тестовой среды | patch | S |
| 51 | Вынести повторяющиеся помощники stories: `resolveColor()` (дублирован в группе Overlay) и обёртку `docs.story.inline: false` + `height` для оверлеев, открытых при монтировании | `src/stories/helpers` | Общие файлы | patch | S |
| 52 | E2E «форма: заполняет поля и отправляет» заканчивается `expect(true).toBeTruthy()` | `BaseForm.e2e.spec.ts` | Сценарий e2e по брифу не меняли | patch (тесты) | S |
| 53 | Тесты BaseSideBar кликают по `<a href>`, и jsdom 12 раз пишет «Not implemented: navigation»: отменять переход в тестах, как в BaseBreadcrumbs | `BaseSideBar.*.spec.ts` | Найдено в порции 1.3, шум был и раньше | patch (тесты) | S |
| 54 | BaseColorModeButton при серверном рендере: на сервере тема светлая, и при сохранённой тёмной иконка и `aria-pressed` расходятся при гидратации. Нужен рендер после монтирования | BaseColorModeButton, `useColorMode` | Кит не рендерится на сервере; найдено в порции 1.3 | patch | S |
| 55 | Поле HEX в BaseColorPicker управляется `:value="swatchColor"`: любая перерисовка панели во время ввода (сдвиг панели при прокрутке, смена темы) возвращает в поле прежний цвет, и набранное теряется. Нужен черновик поля, который сбрасывается только при смене цвета | BaseColorPicker | Найдено в порции 1.5: лишние перерисовки панели убраны, но хрупкость поля осталась | patch | S |
| 56 | `openStory` в скриншот-тестах останавливает часы (`page.clock.setFixedTime`), а Vue пропускает обработчик на родителе, если время события не больше времени подключения обработчика (`e._vts <= invoker.attached` в runtime-dom). При остановленных часах срабатывает только самый внутренний обработчик: например, клик по кнопке-триггеру BaseDropdownMenu не открывает меню. Play-функции с такими кликами в скриншот-тестах молча падают (фаза `errored` засчитывается как готовность), и снимок фиксирует не то состояние. Вариант: `page.clock.install({ time })` — дата та же, но время идёт; фазу `errored` считать ошибкой | `build/tests/visual.ts` | Меняет снимки других компонентов — только после просмотра эталонов владельцем; найдено в порции 4.12, скриншот-тест плеера открывает stories без остановки часов | patch (тесты) | S |
| 57 | ~~Пункты-переключатели BaseDropdownMenu (radio, checkbox) при выборе мышью не закрывают меню (Enter закрывает). В плеере после выбора серии меню «Серии» остаётся открытым поверх кадра~~ — проп `closeOnCheck` (правки плеера, П3); поведение по умолчанию прежнее | BaseDropdownMenu, меню серий BaseMediaPlayer | — | minor | S |

² Ограничения тестовой среды Storybook:
- `resetAllMocksLoader` после `updateArgs` (`useModelArg`) стирает вызовы шпионов `fn()`;
- play, который в конце меняет args, сталкивается с afterEach-axe («Axe is already running»);
- шпион с ключом `'onDelete-messages'` при `@delete-messages` в шаблоне — вызывается только один обработчик;
- `userEvent.tab()` не учитывает `inert`;
- `useModelArg` с contenteditable отдаёт значения асинхронно.

## С чего начать

1. ~~**Безопасность.** Проверка схем ссылок (EDT-5, SB-6) и очистка HTML в BaseEditor (EDT-2)~~ — сделано в 2.0, порция 1.1.
2. **Сквозные задачи, которые разблокируют остальное:** № 1–3 (имена полей, контекст формы, CORE-1); ~~№ 5 (flip/shift)~~ — сделано для выпадающих панелей в порции 1.5.
3. **Быстрые patch:** № 8, 10, 11, 13, 14, 48, 49, 52.
