# Находки группы «Навигация»

Состав: BaseTabs, BaseAccordion, BaseMenu, BaseMegaMenu, BaseSideBar, BaseBreadcrumbs, BaseStepper, BasePagination; useBreakpoint, useExpandTransition, navigationUtils.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

P0 нет.

#### ACC-1 · P1 · BaseAccordion — закрытые панели доступны фокусу и скринридеру
- **Где:** `src/components/BaseAccordion/ui/BaseAccordion.vue:45-53`, `styles/BaseAccordion.style.scss:101-128` (HEAD 9c848ae).
- **Условия:** в закрытой секции есть фокусируемое содержимое (ссылки, поля, кнопки) или текст.
- **Последствие:** панель скрыта только визуально (`grid-template-rows: 0fr` + `overflow: hidden` + `opacity: 0`), поэтому Tab уводит фокус в невидимые элементы, а скринридер читает закрытый контент.
- **Воспроизведение:** секция со слотом `<a href="#phone">Позвонить</a>` закрыта, фокус на заголовке, Tab → фокус на невидимой ссылке (HEAD). Сценарий демонстрирует тест ниже.
- **Исправление:** `BaseAccordion.vue` — у закрытой `.base-accordion__collapse` стоят `inert` и `aria-hidden="true"`. Атрибуты меняются сразу и CSS-анимацию не трогают. Панель стала `role=region` с `aria-labelledby`.
- **Проверка:** `src/components/BaseAccordion/__tests__/BaseAccordion.integration.spec.ts` › «доступность (APG Accordion)» › «содержимое закрытой панели скрыто от AT и находится в inert-поддереве (вне порядка фокуса)» и «должен снова скрывать содержимое после закрытия панели». Падали до исправления: да (по отчёту агента, согласуется с кодом HEAD). Что Tab пропускает ссылку в реальном браузере, не проверено: jsdom не реализует `inert`, нужен e2e.
- **Статус:** Исправлено (фокусное поведение подтвердить e2e).

#### MENU-1 · P1 · BaseMenu — пункты не активируются с клавиатуры
- **Где:** `src/components/BaseMenu/ui/BaseMenu.vue:7-18` (HEAD 9c848ae).
- **Условия:** управление с клавиатуры, скринридер.
- **Последствие:** пункты — `div tabindex=0` только с `@click`, без роли. Enter и Space ничего не делают, действие меню без мыши недоступно.
- **Воспроизведение:** Tab на «Профиль» → Enter → `select` не эмитится (HEAD).
- **Исправление:** `BaseMenu.vue` — у пунктов `role="button"` и `aria-disabled`. `@keydown.enter/space.prevent` вызывают тот же обработчик, что и клик (`select` + `item.click`). `role=menu` сознательно не введён: он обещает стрелочную навигацию APG Menu, которой нет, и не подходит, когда BaseMenu служит навигационным списком.
- **Проверка:** `src/components/BaseMenu/__tests__/BaseMenu.integration.spec.ts` › «клавиатура и семантика» › «должен активировать пункт по Enter», «должен активировать пункт по Space и вызывать item.click», «пункты доступны вспомогательным технологиям как кнопки с именем», «отключённый пункт помечен aria-disabled и не активируется с клавиатуры». Падали: да (по отчёту агента).
- **Статус:** Исправлено — минимальный вариант из ревью. Полный паттерн APG Menu вынесен в roadmap (C, «MENU-1 (развитие)»).

#### MM-1 · P1 · BaseMegaMenu — содержимое меню недостижимо с клавиатуры
- **Где:** `src/components/BaseMegaMenu/ui/BaseMegaMenuNode.vue:12`; `ui/BaseMegaMenu.vue:2, 23-30` (HEAD 9c848ae).
- **Условия:** управление с клавиатуры в обоих layout; на мобильном (аккордеон колонок) — ещё и открытие колонки.
- **Последствие:**
  - узлы дерева — `div @click.stop` без tabindex, role и keydown;
  - листья — не `<a href>`: нельзя открыть в новой вкладке, краулер не видит ссылок;
  - заголовок колонки — `h4 tabindex=0` без keydown: пустая Tab-остановка, на мобильном колонку не открыть;
  - корень — `div`, а не `<nav>`.
- **Воспроизведение:** layout `columns`, Tab по странице → фокус не попадает ни на один пункт; Enter на `h4` ничего не делает.
- **Исправление (предложение):** disclosure-навигация:
  - корень — `<nav aria-label>`;
  - узлы с детьми и заголовки колонок — `<button aria-expanded aria-controls>`;
  - листья — `<a :href>` или linkComponent, `href` через `isSafeUrl`;
  - Escape закрывает меню и возвращает фокус.
- **Проверка:** не проверено, теста нет. Нужен integration: `user.tab()` доходит до ссылки-листа, Enter на узле с детьми переключает `aria-expanded`.
- **Статус:** Не исправлено — большой объём: переработка разметки MegaMenu/Node и контракта слотов (вместе с MM-4, MM-5). На этапе исправлений вынесено в roadmap.

#### MM-2 · P1 · navigationUtils (BaseMegaMenu, BaseBreadcrumbs) — `javascript:` из href исполнялся при переходе
- **Где:** `src/utils/navigationUtils/navigationUtils.ts:18-21` (HEAD 9c848ae). Через `navigateAndEmit` переходят:
  - `BaseMegaMenu.vue:175` — верхние пункты dropdown, через `handleNavClick` (:222);
  - `BaseMegaMenuNode.vue:132` — листья дерева;
  - `BaseBreadcrumbs.vue:206` — крошки и кнопка «дом».
- **Условия:** `href` из недоверенных данных (CMS/API) со схемой `javascript:`, `vbscript:` или `data:`. При `target: '_self'` вызывается `location.href = href`, при `_blank` — `window.open` (исполнение в новом окне было гипотезой).
- **Последствие:** по клику исполняется код в контексте страницы (XSS).
- **Воспроизведение:** `navigateAndEmit({ href: 'javascript:alert(1)', target: '_self' }, emit)` → на HEAD присваивается `location.href` и эмитится `navigate`.
- **Исправление (координатор):**
  - новый `src/utils/urlUtils/urlUtils.ts` — `isSafeUrl`. Нормализует URL по URL Standard: удаляет `\t\n\r`, обрезает C0-символы и пробелы по краям. Относительные адреса разрешены, абсолютные — только `http`, `https`, `mailto`, `tel`;
  - `navigationUtils.ts` — `openExternalUrl` и `navigateAndEmit` при небезопасном URL пишут `console.warn` и не переходят; `navigateAndEmit` при этом не эмитит `navigate`;
  - защита покрывает BaseMegaMenu, BaseMegaMenuNode и BaseBreadcrumbs.
  - Что осталось открытым:
    - BaseSideBar рендерит `href` сам (`useSideBarNavigation.ts:70-74`) — это SB-6;
    - `to` не проверяется и эмитится как есть — это ответственность роутера или потребителя;
    - `resolveNavigation` возвращает сырой `href`, но в `src` не используется.
- **Проверка:**
  - `src/utils/navigationUtils/navigationUtils.spec.ts` › «защита от небезопасных URL»:
    - «navigateAndEmit не исполняет javascript: href с target _self и не эмитит его»;
    - «navigateAndEmit не открывает javascript: href в новом окне»;
    - «openExternalUrl не открывает javascript: URL»;
    - позитивные: «navigateAndEmit открывает безопасный внешний href и эмитит его», «navigateAndEmit эмитит внутренний маршрут без открытия окна».
  - `src/utils/urlUtils/urlUtils.spec.ts` › «urlUtils.isSafeUrl» › «отклоняет %j» (схемы, регистр, пробелы, табы, NUL), «разрешает %j», «отклоняет пустую строку и не-строки».
  - Падал до исправления: не проверялось. По коду HEAD тесты упали бы на ожиданиях `emitNavigate`, `console.warn` и `window.open`. Проверка неизменного `location.href` в jsdom ничего не доказывает: jsdom не выполняет навигацию.
  - Компонентного теста нет: спеки MegaMenu подменяют утилиту копией (см. E).
- **Статус:** Исправлено для путей через `navigateAndEmit` и `openExternalUrl`; смежный SB-6 открыт.

#### PG-1 · P1 · BasePagination — текущая страница не выделена при variant по умолчанию
- **Где:** `src/components/BasePagination/ui/BasePagination.vue:14-19`; `src/constants/ui.ts:164`; `src/composables/useVariant/useVariant.ts:28-31` (HEAD 9c848ae).
- **Условия:** `variant` не задан, то есть равен `'default'`.
- **Последствие:** текущая кнопка получает вариант `'default'`, для которого класс не ставится, и выглядит как все номера. `aria-current` тоже нет, поэтому текущую страницу не видят ни пользователь, ни скринридер.
- **Воспроизведение:** `<BasePagination v-model="p" :total="100" />` → текущую страницу не отличить от остальных.
- **Исправление:** `BasePagination.vue` — у текущей страницы `aria-current="page"`. При `variant='default'` неактивные номера рисуются вариантом `soft` (`inactivePageVariant`), текущая остаётся `default` (заливка). Ревью предлагало отдельный active-класс; выбранное решение меняет вид неактивных номеров у всех потребителей с вариантом по умолчанию.
- **Проверка:** `src/components/BasePagination/__tests__/BasePagination.integration.spec.ts` › «текущая страница» › «должен помечать ровно одну текущую страницу aria-current="page"», «должен переносить aria-current при внешней смене modelValue», «должен оформлять текущую страницу иначе, чем остальные, при variant по умолчанию». Падали: да (по отчёту агента). Последний тест сравнивает только строки классов, контраст не проверяет. Visual-baseline `default`, `many-pages`, `dark-theme` устарели: Playwright не запускался.
- **Статус:** Исправлено; нужно обновить visual-baseline.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| TAB-1 | BaseTabs | `ui/BaseTabs.vue:20-51` | Нет стрелок/Home/End и roving tabindex → Tab обходит все вкладки, стрелки не работают | `BaseTabs.vue`: roving tabindex, ←/→ с зацикливанием и пропуском disabled, Home/End, сочетания с Alt/Ctrl/Cmd не перехватываются; автоматическая активация — `change` на каждую стрелку (новое поведение). `BaseTabs.integration.spec.ts` › «клавиатура (APG Tabs)»: «ArrowRight переносит фокус и выбор на следующую вкладку», «ArrowRight пропускает отключённую вкладку и зацикливается на первую», «ArrowLeft пропускает отключённые вкладки, а с первой зацикливается на последнюю», «Home и End переносят фокус на первую и последнюю вкладки», «в порядке Tab участвует только выбранная вкладка (roving tabindex)»; падали: да | Исправлено (режима ручной активации нет) |
| TAB-2 | BaseTabs | `ui/BaseTabs.vue:31-51, 63-65` | Нет id/`aria-controls`, `tabpanel`/`aria-labelledby` → панель не связана с вкладкой | id через `useId`, `aria-controls`; контейнер — `role=tabpanel` + `aria-labelledby` + `tabindex=0`, только при default-слоте; одна общая панель на все вкладки. `BaseTabs.integration.spec.ts` › «панель вкладки» › «панель имеет role=tabpanel, подписана выбранной вкладкой и связана через aria-controls»; падал: да | Исправлено |
| TAB-3 | BaseTabs | `ui/BaseTabs.vue:47` | `v-html="item.icon"`: HTML из недоверенных данных исполняется (`<img onerror>`), иконка попадает в имя вкладки | — (см. C) | Не исправлено — breaking change контракта `icon` |
| TAB-4 | BaseTabs | `ui/BaseTabs.vue:11-19, 53-61` | Кнопки прокрутки без доступного имени | `aria-label` «Прокрутить вкладки влево/вправо» (`UI_ARIA.TABS_SCROLL_*`). `BaseTabs.spec.ts` › «кнопки прокрутки» › «должны иметь доступные имена»; падал: да | Исправлено (`tabindex=-1` не добавлен, кнопки остаются в Tab-порядке) |
| TAB-5 | BaseTabs | `README.md:544-564` | Пример с `{ label, value }` вместо `id` → ничего не выбрано, клик эмитит `undefined` | README исправлен: вкладки `{ id, label }`, пояснение «`v-model` хранит `id` активной вкладки», контент — в слоте по умолчанию. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322, текущий — без ошибок) | Исправлено (README) |
| ACC-2 | BaseAccordion | `ui/BaseAccordion.vue:17-22` | Нет button/`aria-expanded`/`aria-controls`/`aria-disabled`, `region`, Space; disabled-заголовок в Tab-порядке | `role=button`, `aria-expanded/controls/disabled`, Enter/Space, панель `role=region` + `aria-labelledby`. `BaseAccordion.integration.spec.ts` › «доступность (APG Accordion)»: «заголовок — кнопка, aria-expanded отражает состояние панели», «заголовок управляет панелью через aria-controls, панель подписана заголовком», «должен открывать элемент по Space на заголовке», «отключённый элемент помечен aria-disabled и не раскрывается с клавиатуры»; падали: да | Частично — нет уровня заголовка (`h3`), `div role=button` вместо `<button>`, disabled-заголовок в Tab-порядке (с `aria-disabled`) |
| ACC-3 | BaseAccordion | `ui/BaseAccordion.vue:7-8, 78, 80-86` | Состояние по индексу + `:key="index"`, `defaultOpen` читается только в `onMounted` → после удаления/подгрузки items открыта не та секция; анимация при первом mount, SSR-вспышка | — (см. C) | Не исправлено — нужен `id` у пунктов |
| ACC-4 | BaseAccordion | `ui/BaseAccordion.vue:95-101` | Нет controlled API; в single-режиме неявно закрытая секция не эмитит `toggle(i, false)` → рассинхрон у потребителя | — (см. C) | Не исправлено — новый API |
| ACC-5 | BaseAccordion | `README.md:568-580` | Пример с `title` без `items` → пустой рендер + `TypeError` в `onMounted` | README исправлен: `items` с `label`/`content` и пункт со `slot` + именованный слот, пояснение про `is-multiple`. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2353 `title`, текущий — без ошибок). `items: () => []` в коде не добавлен | Частично — README исправлен; осталось: у `items` нет значения по умолчанию, без `items` — `TypeError` в `onMounted` |
| MENU-2 | BaseMenu | `model/BaseMenu.types.ts:15, 21, 43` | `to`, `hasDivider`, слот `default` объявлены, но не работают | — (см. C) | Не исправлено — реализация или удаление (breaking) |
| MENU-3 | BaseMenu | `README.md:1032-1049` | Плоский `[{ label, value }]` вместо `BaseMenuItem[][]` → пустые пункты | README исправлен: `BaseMenuItem[][]` (группы с разделителем), `@select`, `click` у пункта. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322, текущий — без ошибок) | Исправлено (README) |
| MM-3 | BaseMegaMenu / useMegaMenuTree | `ui/BaseMegaMenuNode.vue:151-165`; `useMegaMenuTree.ts:27-29` | hover: таймер ушедшего узла A через `hoverDelay` закрывает уже открытый соседний B (`close` безусловно ставит путь родителя) | — (см. C) | Не исправлено |
| MM-4 | BaseMegaMenu | `ui/BaseMegaMenu.vue:49-50, 75-85, 101-102, 215-240` | dropdown не закрывается по клику вне, Escape, уходу фокуса и после выбора; нет `aria-expanded`; при повторном открытии восстанавливаются старые flyout | — (см. C) | Не исправлено — зависит от стека Escape (useEscapeKey) и MM-1 |
| MM-5 | BaseMegaMenu | `ui/BaseMegaMenu.vue:22-35, 74-86`; `ui/BaseMegaMenuNode.vue:11-25` | Слоты заменяют элемент с обработчиком, в slot-props нет `isOpen/toggle/navigate` → с кастомным слотом колонку/подменю не открыть, `anchorRef` не выставляется | — (см. C) | Не исправлено — меняет контракт слотов |
| MM-6 | BaseMegaMenu | `README.md:1009-1028`; `model/BaseMegaMenu.types.ts:37-40` | README передаёт `items` при layout `columns` → пусто, `@navigate` не показан; `MegaMenuColumn.to/href` не используются | README исправлен: `layout="dropdown"` + `:items` + `@navigate`, описаны раскладка `columns` и переход по `to` через `navigate`. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) — текущий пример без ошибок; типовой ошибки не было и на HEAD, смысл сверен по тексту. `MegaMenuColumn.to/href` не менялись | Частично — README исправлен; осталось: `MegaMenuColumn.to/href` не используются (реализовать или удалить — breaking) |
| SB-1 | BaseSideBar | `ui/BaseSideBarNavigation.vue:12-42`; `BaseTooltip/ui/BaseTooltip.vue:1-9` | В collapsed у ссылок нет имени (только `aria-hidden`-иконка), tooltip открывается только по hover | — (см. C) | Не исправлено |
| SB-2 | BaseSideBar | `ui/BaseSideBar.vue:16-37` | Кнопка toggle пересоздаётся (две ветки) → после Enter фокус уходит на `body`; нет `aria-expanded/controls` | — (см. C) | Не исправлено |
| SB-3 | BaseSideBar / useSideBarNavigation | `useSideBarNavigation.ts:93-103` | Группу с активным ребёнком нельзя свернуть; скрытое состояние «всплывает» после смены маршрута | — (см. C) | Не исправлено |
| SB-4 | BaseSideBar / useSideBarNavigation | `useSideBarNavigation.ts:105-107, 169-175` | В collapsed disclosure-группы «мёртвые»: дети не рендерятся, клик только эмитит | — (см. C) | Не исправлено — нужно дизайн-решение |
| SB-5 | BaseSideBar | `ui/BaseSideBar.vue:2-6, 40-71`; `ui/BaseSideBarNavigation.vue:2` | Нет ориентира `<nav>` (`aside role=complementary` + `ul role=list`) | — (см. C) | Не исправлено |
| SB-6 | BaseSideBar / useSideBarNavigation | `useSideBarNavigation.ts:18-20, 70-74` | При `linkComponent='a'` `href = item.to` без проверки схемы → `javascript:` исполняется по клику; object-`to` молча превращается в `href="#"` | Защита координатора (MM-2) сюда не доходит: SideBar рендерит `href` сам, минуя `navigateAndEmit`/`isSafeUrl`; diff `useSideBarNavigation` пуст | Не исправлено |
| BC-1 | BaseBreadcrumbs | `ui/BaseBreadcrumbs.vue:2-6`; `src/constants/ui.ts:39` | `aria-label` на `div` не озвучивается, ориентира нет | Корень — `<nav aria-label="Хлебные крошки">` (`UI_ARIA.BREADCRUMBS_NAV`). `BaseBreadcrumbs.integration.spec.ts` › «доступность» › «рендерит ориентир navigation «Хлебные крошки», текущей страницей помечен только последний элемент»; падал: да | Исправлено |
| BC-2 | BaseBreadcrumbs | `ui/BaseBreadcrumbs.vue:82-103, 205-207`; `navigationUtils.ts:17-24` | Крошки — `<button>`: нет `href` (новая вкладка, копирование, краулер); `href` всегда открывается в новой вкладке, поля `target` нет | Небезопасные схемы теперь блокируются (MM-2); семантика не менялась | Не исправлено — меняет разметку и семантику `navigate` |
| BC-3 | BaseBreadcrumbs | `ui/BaseBreadcrumbs.vue:21-32, 48-58, 180` | «Дом» без имени; «…» без `aria-label/aria-expanded`, свернуть нельзя, `isExpanded` не сбрасывается при смене items | «Дом» получил `aria-label` = `items[0].label`. `BaseBreadcrumbs.integration.spec.ts` › «доступность» › «кнопка «домой» имеет доступное имя — метку первой крошки, на которую она ведёт»; падал: да | Частично — «…» и сброс `isExpanded` не сделаны |
| BC-4 | BaseBreadcrumbs | `model/BaseBreadcrumbs.types.ts:36-37`; `ui/BaseBreadcrumbs.vue:13-44, 182-186` | `showHome` документирован как «вместо первой крошки», но первая крошка тоже рендерится → дубль; после BC-3 это ещё и два элемента с именем «Главная» | — (см. C) | Не исправлено |
| ST-1 | BaseStepper | `README.md:1092-1109` | `:steps` вместо `:items` → `TypeError` при рендере | README исправлен: `v-model="step"` (с 1) и `:items="steps"`. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2353 `steps`, текущий — без ошибок) | Исправлено (README) |
| ST-2 | BaseStepper | `ui/BaseStepper.vue:11-23`; `styles/BaseStepper.style.scss:93-97` | Шаги кликабельны только мышью; нет `ol/li`, `aria-current="step"`, текстового статуса «пройден» | — (см. C) | Не исправлено |
| ST-3 | BaseStepper | `ui/BaseStepper.vue:112-116` | Кликабелен любой шаг, включая будущие; `change` эмитится при клике по текущему | — (см. C) | Не исправлено — нужен новый проп |
| PG-2 | BasePagination | `ui/BasePagination.vue:5, 30, 83-88` | `modelValue > totalPages` или `total=0`: стрелки активны, но не работают — пользователь застревает | Блокировка по `<= 1` / `>= totalPages`; «назад» ведёт на последнюю существующую (`goToPrevPage`). Авто-clamp `modelValue` не добавлен осознанно: пока идёт загрузка, `total=0`. `BasePagination.integration.spec.ts` › «страница за пределами диапазона»: ««назад» ведёт на последнюю существующую страницу, если modelValue больше totalPages», ««вперёд» заблокирована, если modelValue больше totalPages», ««назад» и «вперёд» заблокированы, когда страниц нет (total=0)»; падали: да. Play story OutOfRangePage теперь проверяет блокировку | Исправлено |
| PG-3 | BasePagination | `ui/BasePagination.vue:2-10, 28-35` | Нет `<nav aria-label>`, prev/next без имени, номера без «Страница N» | Имена «Предыдущая/Следующая страница». `BasePagination.integration.spec.ts` › «доступные имена» › «кнопки «назад» и «вперёд» имеют доступные имена»; падал: да | Частично — нет `<nav>` и «Страница N» |
| PG-4 | BasePagination / paginationUtils | `paginationUtils.ts:30, 44-47, 63-65` | `showLastPage=false`: текущая последняя страница не выводится (`[1,'...',15..19]` при 20 из 20), правого «…» нет | — (см. C) | Не исправлено |
| BP-1 | useBreakpoint (→ BaseMegaMenu) | `useBreakpoint.ts:6-12, 37` | SSR: на сервере ширина lg, клиент сразу берёт `innerWidth` → hydration mismatch мобильного MegaMenu | — (см. C) | Не исправлено — нужна проверка SSR |
| EXP-1 | useExpandTransition (→ BaseTable) | `useExpandTransition.ts:42-48, 71-77` | `done()` вызывается только по `transitionend`: при `duration: 0` leave-элемент остаётся в DOM, enter-элемент — с фиксированной высотой; reduced motion не учитывается | — (см. C) | Не исправлено |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| TAB-6 | BaseTabs | `ui/BaseTabs.vue:104-109, 148-172` | drag, отпущенный вне вкладки, оставляет `hasDragMoved=true` → следующий клик или Enter по вкладке проглатывается. После TAB-1 стрелки не затронуты: они не проходят через `handleTabClick` | — | Не исправлено |
| TAB-8 | BaseTabs | `ui/BaseTabs.vue:115-116` | Клик по активной вкладке эмитит `update:modelValue`/`change`; клавиатурный путь после TAB-1 уже не эмитит | — | Не исправлено |
| ACC-6 | BaseAccordion | `ui/BaseAccordion.vue:81-85` | single-режим + несколько `defaultOpen` → открываются все | — | Не исправлено |
| MM-7 | BaseMegaMenu / useMegaMenuTree | `useMegaMenuTree.types.ts:23`; `ui/BaseMegaMenuNode.vue:84` | Идентичность по label: дубли открываются вместе и дают предупреждения о key; `/` в label делает соседа мнимым предком | — | Не исправлено |
| MM-8 | BaseMegaMenu | `src/composables/useFlyoutPosition/useFlyoutPosition.ts:73-83` | Каждый узел, включая листья, вешает на window `scroll` и `resize` → 2N глобальных слушателей | — | Не исправлено |
| SB-8 | BaseSideBar (stories) | `stories/BaseSideBar.stories.ts:346-396`; `src/styles/_variables.scss:113` | Тёмные stories используют класс `.dark`, а токены определены только под `[data-theme='dark']` → visual/e2e «dark» не проверяют тёмную тему | — | Не исправлено |
| SB-9 | BaseSideBar | `src/composables/useExplicitPropDetection/useExplicitPropDetection.ts:11` | controlled-режим определяется по снимку `vnode.props` в setup → переход uncontrolled↔controlled после mount не замечается | — | Не исправлено |
| SB-11 | useSideBarNavigation | `useSideBarNavigation.ts:138-160` | `activePath` сравнивается строго: при `exact` (по умолчанию) `/users/`, `/users?page=2`, `/users#top` не активируют `/users`; `startsWith` ловит только `/users/…` | — | Не исправлено |
| SB-12 | useSideBarNavigation | `useSideBarNavigation.ts:40-52` | Ключ по умолчанию — JSON `to` или label → дубли делят раскрытое состояние и дают предупреждения о key | — | Не исправлено |
| BC-5 | BaseBreadcrumbs | `ui/BaseBreadcrumbs.vue:11-19, 34, 121-122` | Микроразметка и JSON-LD дублируют один BreadcrumbList; ListItem «дома» без `name/item` и с `position=1`; `itemprop="url"` вместо `item` | — | Не исправлено |
| BC-6 | BaseBreadcrumbs | `ui/BreadcrumbsSeparator.vue:14` | `separator='arrow'` визуально совпадает с `chevron` | — | Не исправлено |
| ST-4 | BaseStepper | `ui/BaseStepper.vue:101-110`; `styles/BaseStepper.style.scss:194, 217` | `modelValue` не валидируется: при 0 или > длины нет активного шага; для «все завершены» (`length + 1`) масштаб прогресса > 1 и линия выходит за последний шаг | — | Не исправлено |
| ST-5 | BaseStepper | `model/BaseStepper.types.ts:12, 78` | Мёртвый API: `icon` шага не рендерится, слот `default` объявлен без `<slot>` | — | Не исправлено |
| PG-5 | BasePagination / paginationUtils | `ui/BasePagination.vue:13`; `paginationUtils.ts:53-65` | Два `'...'` при `:key="page"` → «Duplicate keys»; при чётном `maxVisible` показывается на номер больше, при `maxVisible ≤ 2` пропадает текущая страница | — | Не исправлено |
| PG-6 | BasePagination | `ui/BasePagination.vue:83-88` | Клик по текущей странице эмитит тот же номер → лишний запрос у потребителя | — | Не исправлено |
| PG-7 | paginationUtils | `paginationUtils.ts:76-81` | `calcPageInfo` при `total=0` возвращает «1–0 из 0» (тулбар BaseTable) | — | Не исправлено |
| BP-2 | useBreakpoint | `useBreakpoint.types.ts:10-16` | `isMobile` = `< md (768)`, хотя есть `BREAKPOINTS.mobile = 640`; resize без rAF-троттлинга | — | Не исправлено |
| EXP-2 | useExpandTransition | `useExpandTransition.ts:42-48, 71-77` | `transitionend` от потомка досрочно завершает анимацию: нет фильтра по `target`/`propertyName` | — | Не исправлено |

SB-11 и SB-12 в ревью описаны без номера («Дополнительно (P3)» у useSideBarNavigation); ID присвоены здесь.

### A4. Гипотезы (не подтверждены)
- **TAB-7 (P3)** — ResizeObserver следит за рамкой списка, поэтому после добавления вкладок кнопка «вправо» не появляется до скролла или resize. При внешней смене `modelValue` активная вкладка не прокручивается в видимую область; при навигации стрелками её прокручивает сам браузерный `focus()`. Проверить в браузере: смена `items` при `isScrollable`.
- **TAB-9 (P3)** — в варианте `arc` `box-shadow: inset` активной вкладки может перекрывать focus-ring BaseButton, а `overflow-x: auto` — обрезать кольцо. После TAB-1 вкладки фокусируются стрелками, поэтому проверка стала актуальнее. Проверить `:focus-visible` визуально.
- **SB-7 (P3)** — фокус-кольцо ссылок SideBar `rgba(249,115,22,0.28)` захардкожено, оценочный контраст ≈1.3:1 < 3:1 (WCAG 1.4.11). Нужен замер контраста в светлой и тёмной теме.
- **SB-10 (P3)** — при `linkComponent=RouterLink` fallthrough `aria-current=undefined` может затирать собственный `aria-current` RouterLink. Проверить в приложении с vue-router.
- **EXP-3 (P3)** — при прерывании перехода нет cancel-хуков, слушатели не снимаются, перед сворачиванием высота прыгает к полной. Проверить в браузере.
- **EXP-1, часть** — зависание при глобальном `transition: none !important` (reduced-motion reset приложения). Проверить в браузере с таким стилем; при `duration: 0` дефект подтверждён.
- **H-1 (группа)** — Playwright открывает `iframe.html?id=…`, где Storybook сам выполняет `play`. Тогда play-функции влияют на e2e и visual: ScrollButtons подменяет метрики под drag-тестами Tabs; Default в Pagination кликает по страницам, DeepNesting в MegaMenu и Default в Accordion меняют состояние до скриншота. Это противоречит CONTEXT.md («play не запускаются»). Проверить трассировкой play в Playwright (`page.on('console')`).
- Часть MM-2 про исполнение `javascript:` в окне `window.open(_blank)` снята: такие URL теперь блокируются до вызова `window.open`.

---

---

## Примечания к перепроверке
- **Прогоны не перепроверялись.** Тесты, eslint и vue-tsc из отчёта не запускались: правила этапа это запрещают. Статусы выставлены по `git diff HEAD` и чтению тестов. «Падал до исправления: да» — со слов агента; вручную сверено, что по коду HEAD каждый новый тест агента действительно упал бы.
- **MM-2 исправлен, но не агентом.** В отчёте агента MM-2 не значится: MegaMenu вынесен в roadmap. Исправление сделал координатор — правка `navigationUtils.ts` видна в diff.
- **urlUtils не попадает в `git diff HEAD`.** Модуль `src/utils/urlUtils/` (`urlUtils.ts`, `index.ts`, `urlUtils.spec.ts`) не отслеживается git — в `git status` он помечен `??`. Если при коммите не сделать `git add src/utils/urlUtils`, сломаются импорт `@utils/urlUtils` в `navigationUtils.ts` и `fileUtils.ts` и реэкспорт в `src/utils/index.ts`.
- **Защита MM-2 не проверена на уровне компонентов.**
  - `BaseMegaMenu.spec.ts:12-28` и `BaseMegaMenu.integration.spec.ts:12-29` подменяют `@utils/navigationUtils` копией `navigateAndEmit`, в которой нет `isSafeUrl`.
  - В спеках Breadcrumbs реальная утилита используется, но кейса с `javascript:` нет.
  - BaseSideBar защитой не покрыт вовсе: он рендерит `href` сам (SB-6).
- **ACC-2 закрыт частично, хотя в отчёте не заявлен.** Отчёт говорит «остальные пункты по ACC… не делал», но diff закрывает большую часть ACC-2: `role=button`, `aria-expanded/controls/disabled`, `region` + `aria-labelledby`, Space. В реестре статус «Частично».
- **TAB-1: утверждение отчёта верно только для клавиатуры.** Фраза «повторно для уже выбранной вкладки событие не шлётся» не относится к клику: `handleTabClick` по-прежнему эмитит `update:modelValue`/`change` при клике по активной вкладке. TAB-8 открыт.
- **TAB-6: последствие сузилось.** После TAB-1 стрелки не проходят через `handleTabClick`, так что застрявший флаг проглатывает только клик и Enter/Space. Приоритет не менял.
- **Слабая проверка в тесте `_self`.** В тесте «navigateAndEmit не исполняет javascript: href с target _self и не эмитит его» ожидание `expect(window.location.href).toBe(hrefBefore)` в jsdom проходит и без защиты: jsdom не выполняет навигацию. Защиту доказывают ожидания `emitNavigate` и `console.warn`.
- **Формальных play стало 30 из 82, а не 31.** Сводка ревью говорила о 31; после правки OutOfRangePage (BasePagination) его play содержит проверки.
- **Перепроверка находок ревью.** По HEAD и рабочей копии выборочно подтверждены:
  - MegaMenu: MM-1, MM-3, MM-6, MM-7, MM-8;
  - SideBar: SB-1…SB-6, SB-8, SB-9;
  - Breadcrumbs: BC-2…BC-6;
  - Stepper: ST-2…ST-5;
  - Menu: MENU-2;
  - Pagination: PG-4…PG-7;
  - composables: BP-1, BP-2, EXP-1, EXP-2;
  - Tabs: TAB-3, TAB-6, TAB-8;
  - Accordion: ACC-3, ACC-4, ACC-6;
  - README-примеры: TAB-5, ACC-5, MENU-3, MM-6, ST-1.
  
  Неверных находок нет. Приоритеты не менялись.
- **Обновление статусов (координатор), 26.09.** Изменено 5 статусов, все P2, после сверки с итоговым README. Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`):
  - TAB-5, MENU-3, ST-1: «Не исправлено» → «Исправлено (README)»;
  - ACC-5: «Не исправлено» → «Частично» (README исправлен; default `items: () => []` в коде нет);
  - MM-6: «Не исправлено» → «Частично» (README исправлен: `layout="dropdown"` + `@navigate`; `MegaMenuColumn.to/href` по-прежнему не используются).
  - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометки матрицы о неописанных в argTypes событиях и слотах не перепроверялись — нужна сборка Storybook (props теперь подтягиваются из `__docgenInfo`).
