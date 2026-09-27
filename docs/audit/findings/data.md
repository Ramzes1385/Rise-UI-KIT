# Находки группы «Таблица и дерево»

Состав: BaseTable, BaseTree; composables таблицы, tableUtils, treeUtils, schemaUtils.

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

#### TBL-1 · P1 · BaseTable / useTableData — сортировка ломается на пустых, нечисловых и невалидных значениях
- **Где:** `src/composables/useTableData/useTableData.ts:108-126`, выражение компаратора — `:117-121` (HEAD 9c848ae).
- **Условия:** в сортируемой колонке есть null, undefined, `''` или `'—'` (sortType number), либо Invalid Date или дата не в ISO (sortType date).
- **Последствие:**
  - компаратор возвращает NaN, `Array.sort` считает такие пары равными, и порядок получается произвольным (эксперимент ревью: 147 из 200 наборов не отсортированы);
  - null в числовой колонке равен 0, а в строковой сортируется как слово "null".
- **Воспроизведение:** number asc: `[30, undefined, 10, 20]` остаётся без изменений. Тест: `useTableData.spec.ts` › «number: числа (в т.ч. числовые строки) по возрастанию, нечисловые — после них, пустые — в самом конце».
- **Исправление:** `src/utils/tableUtils/tableUtils.ts` (+ `.types.ts`, `index.ts`) — новые `toSortKey`/`compareSortKeys`.
  - Ранги: распознанное → нераспознанное → пустое. Пустые значения в конце при любом направлении.
  - number — только конечные числа (из чисел, числовых строк, bigint, Date).
  - date — Date, timestamp, ISO 8601 с проверкой календарной даты; строка без зоны считается UTC.
  - string — `Intl.Collator(undefined, { numeric: true })`.
  - `useTableData.ts`: ключи считаются один раз на строку, `columns.find` из компаратора убран.
  - Новые экспорты `utils`: `toSortKey`, `compareSortKeys`, `TableSortKey`, `TableSortRank`.
- **Проверка:**
  - `src/composables/useTableData/useTableData.spec.ts` › describe «Сортировка: пустые и нераспознанные значения»: «number: числа …», «number desc: направление меняет порядок чисел, но пустые значения остаются в конце», «date: null и не-ISO даты не ломают сортировку корректных дат», «date: несуществующая календарная дата считается нераспознанной», «мультисортировка: строка с пустым первичным ключом уходит в конец, вторичный ключ сортирует остальные» — падали: да.
  - `src/components/BaseTable/__tests__/BaseTable.spec.ts` › «TBL-1: пустые значения остаются в конце при сортировке по числу» — падал: да.
  - `src/utils/tableUtils/tableUtils.spec.ts` › describe «toSortKey» (5) и «compareSortKeys» (3) — новый код.
  - 5 тестов покрытия из блока 22:20 (зоны, Date, timestamp, boolean) до исправления не прогонялись.
- **Статус:** Исправлено. Поведение изменилось: null и `''` в числовой колонке больше не равны 0 и уходят в конец.

#### TBL-2 · P1 · BaseTable / useTableSelection — «Выбрать все» захватывает строки, скрытые поиском или фильтром
- **Где:**
  - `src/composables/useTableComposition/useTableComposition.ts:93-96` — в выбор передаются исходные rows;
  - `src/composables/useTableSelection/useTableSelection.ts:36-39` (`isAllSelected`), `:54-64` (`toggleAll`).
- **Условия:** `behavior.selectable` плюс активный поиск или фильтр.
- **Последствие:**
  - `select` после клика по чекбоксу заголовка содержит все rows, включая невидимые. Массовое действие потребителя (удаление, экспорт) затронет скрытые данные — по риску граничит с P0;
  - чекбокс заголовка не отмечается, даже когда выбраны все видимые строки.
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-2: «Выбрать все» при поиске выбирает только найденные строки и так же снимает выбор». На HEAD payload `['1','2','3']` вместо `['1','3']`.
- **Исправление:**
  - `useTableSelection.ts` и `.types.ts`: новая опция `filteredRows?` (по умолчанию rows). `isAllSelected`/`toggleAll` работают по отфильтрованному набору всех страниц;
  - при действии заголовка ранее выбранные скрытые строки снимаются, выбор disabled-строк не меняется, пустой набор игнорируется;
  - `useTableComposition.ts` передаёт `processedRows`.
- **Проверка:**
  - `src/composables/useTableSelection/useTableSelection.spec.ts` › describe «toggleAll с filteredRows»: «выбирает только отфильтрованные строки, скрытые не попадают в payload», «isAllSelected учитывает только отфильтрованные строки», «снимает выбор симметрично: ранее выбранная скрытая строка тоже не остаётся в payload», «не меняет выбор disabled-строк: …», «ничего не делает, если в отфильтрованном наборе нет доступных строк» — падали: да;
  - `BaseTable.spec.ts` › «TBL-2: …» — падал: да.
- **Статус:** Частично — действие заголовка исправлено. Осталось:
  - (1) строки, выбранные поштучно до поиска, остаются в payload `select` при следующих кликах по чекбоксам строк (решение агента);
  - (2) выбранные родителем disabled-строки попадают в payload, даже если скрыты поиском;
  - (3) нет indeterminate (нужен в BaseCheckbox, см. CHK-1) и опции области `selectAllScope`;
  - (4) строки других страниц выбираются по-прежнему — осознанное решение.

#### TBL-3 · P1 · BaseTable — смена rows сбрасывает страницу и выбор, clamp нет
- **Где:**
  - `src/composables/useTableData/useTableData.ts:169-174` — `resetPage` на любое изменение rows;
  - `src/composables/useTableSelection/useTableSelection.ts:15-23` — выбор пересобирается из `row.isSelected`;
  - `src/components/BaseTable/ui/BaseTable.vue:167` — total = `processedRows.length`.
- **Условия:** новая ссылка `rows` (рефетч, поллинг, `computed(() => data.map(...))`, удаление через новый массив) или удаление через `splice`.
- **Последствие:**
  - пользователь со страницы N попадает на первую;
  - выбор, сделанный кликами, теряется, если родитель не пишет `isSelected` обратно;
  - после `splice` получается `currentPage > totalPages`: тело «Нет данных», инфо «41–40 из 40»;
  - серверная пагинация невозможна.
- **Воспроизведение:** pageSize 2, 6 строк, `currentPage = 3` → `setProps({ rows: rows.slice() })` → страница 1. Выбрать строку чекбоксом → `setProps({ rows: [...rows] })` → выбор снят.
- **Исправление:** не выполнено. Предложение:
  - при смене rows не сбрасывать страницу, а клампить `currentPage` по `totalPages`;
  - хранить выбор по id и удалять только исчезнувшие id, либо дать `v-model:selectedIds`;
  - для серверного режима — `totalRows`/`manual`.
- **Проверка:** не проверено: теста нет.
  - Побочное смягчение от группы навигации: в BasePagination кнопка «назад» со страницы вне диапазона ведёт на последнюю. Тест: `src/components/BasePagination/__tests__/BasePagination.integration.spec.ts` › ««назад» ведёт на последнюю существующую страницу, если modelValue больше totalPages».
  - Тело таблицы при этом остаётся пустым, пока пользователь не нажмёт кнопку.
- **Статус:** Не исправлено — меняет поведение и требует нового API (controlled-выбор, серверный режим). Агент отнёс к roadmap.

#### TBL-4 · P1 · BaseTable — режимы button/infinite «схлопываются» после догрузки строк родителем
- **Где:**
  - `src/composables/useTablePagination/useTablePagination.ts:27-32` — `loadedCount = pageSize` при любом изменении длины;
  - `:49-55` — `hasMoreRows` считается только по переданным строкам;
  - `useTableData.ts:169-174`.
- **Условия:** `loadMode` = `'button'` или `'infinite'`, родитель дописывает строки по `load-more`.
- **Последствие:**
  - после дописывания снова видно только pageSize строк, скролл прыгает;
  - если передать ровно одну порцию, `hasMoreRows = false`: кнопки нет, `load-more` не эмитится никогда;
  - серверная подгрузка невозможна.
- **Воспроизведение:** button, pageSize 2, 4 строки → «Загрузить ещё» → `setProps` с 6 строками → видно 2 строки. Поведение закреплено тестом `src/composables/useTableData/useTableData.spec.ts:563-591` («изменение rows.value.length сбрасывает loadedCount»).
- **Исправление:** не выполнено. Предложение:
  - props `hasMore`/`totalRows`;
  - при росте данных `loadedCount` не уменьшать; сбрасывать его только при поиске, фильтре, сортировке и смене pageSize;
  - переписать тест `:563-591`.
- **Проверка:** не проверено: теста нет.
- **Статус:** Не исправлено — нужен новый API и смена поведения, закреплённого тестом. Roadmap.

#### TBL-5 · P1 · BaseTable / useTableColumns — мутация колонок из props, рассинхрон «Настроек колонок»
- **Где:**
  - `src/composables/useTableColumns/useTableColumns.ts:12` — поверхностная копия массива; `:14-26` — watch; `:68` — запись `isHidden`;
  - `src/composables/useColumnResize/useColumnResize.ts:56,65` — запись `width`;
  - `src/components/BaseTable/ui/BaseTable.vue:19` → `BaseTableToolbar.vue:55-60` — тулбар читает `props.columns`.
- **Условия:** скрытие колонки в настройках, ресайз, любое обновление prop `columns` после mount.
- **Последствие:**
  - (a) `isHidden`/`width` пишутся в объекты родителя: общие конфиги, модульные константы, общий `COLUMNS` в тестах (появляется скрытая зависимость от порядка тестов);
  - (b) после обновления `columns` чекбокс настроек показывает скрытую колонку как видимую;
  - (c) изменения `isHidden`/`width`, сделанные родителем после mount, игнорируются.
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-5: после обновления props columns чекбокс настроек отражает фактическую видимость».
- **Исправление:**
  - `useTableColumns.ts` (+ `.types.ts`): `localColumns` хранит копии. При смене props значение `isHidden`/`width` из props применяется, только если родитель его изменил; иначе сохраняется выбор пользователя. Для эмитов добавлен `snapshotColumns()`;
  - `useTableComposition.ts`: `columns-change` после ресайза отдаёт копии;
  - `BaseTable.vue`: тулбар получает `localColumns`.
- **Проверка:** `BaseTable.spec.ts`:
  - «TBL-5: переключение видимости не мутирует объект колонки из props», «TBL-5: ресайз меняет ширину во внутреннем состоянии, не мутируя объект колонки из props», «TBL-5: после обновления props columns чекбокс настроек отражает фактическую видимость», «TBL-5: isHidden и width, изменённые родителем в props, применяются к таблице» — падали: да, 4 из 4;
  - защитный «TBL-5: выбор пользователя сохраняется, если родитель пересоздал колонки с теми же значениями» проходил и до правки.
- **Статус:** Исправлено.
  - Поведение изменилось: изменения `isHidden`/`width` от родителя после mount применяются; `columns-change` отдаёт копии (отдельного теста на это нет — см. TBL-16).
  - `v-model:columnState` не добавлялся.

#### TBL-6 · P1 · BaseTable — сортировка недоступна с клавиатуры, нет aria-sort
- **Где:** `src/components/BaseTable/ui/BaseTableHeader.vue:9-24` — `@click` на `<th>` без tabindex, кнопки и `aria-sort`; `:31-44` — приоритет мультисортировки выводится просто цифрой.
- **Условия:** любая сортируемая колонка.
- **Последствие:** сортировку нельзя включить с клавиатуры (WCAG 2.1.1), скринридер не знает текущий порядок (4.1.2).
- **Воспроизведение:** `BaseTable.spec.ts` › «TBL-6: сортировка с клавиатуры кнопкой в заголовке, состояние передаётся через aria-sort». На HEAD кнопки нет.
- **Исправление:**
  - `BaseTableHeader.vue`: подпись сортируемой колонки обёрнута в `<button type="button">` без своего обработчика — click от Enter/Space всплывает к `th`;
  - на сортируемых `th` выставляется `aria-sort` (ascending/descending/none), блок иконок помечен `aria-hidden`;
  - `styles/_header.scss`: сброс стилей кнопки и outline 2px при фокусе.
- **Проверка:**
  - `BaseTable.spec.ts` › «TBL-6: сортировка с клавиатуры кнопкой в заголовке, состояние передаётся через aria-sort» (Enter → ascending, Space → descending, порядок строк) — падал: да;
  - защитный «TBL-6: у несортируемой колонки нет кнопки сортировки и aria-sort» проходил и до правки;
  - visual `base-table--default` и `--dark-theme` на итоговом коде прошли без изменений; axe по stories BaseTable — REPORT.md §5.4; скринридер не проверялся.
- **Статус:** Частично — клавиатура и `aria-sort` исправлены. Осталось:
  - номер приоритета мультисортировки теперь внутри `aria-hidden` (рабочая копия `BaseTableHeader.vue:35-48`) и не озвучивается совсем. Ревью предлагало «приоритет N» через aria-describedby;
  - в кастомном слоте `header-<key>` кнопки нет;
  - подсказка «Сортировать» по фокусу не показывается (TT-1, overlays).

#### TBL-7 · P1 · BaseTable (README) — пример из README падает с TypeError
- **Где:** `README.md:512-519` — строки `{ id, name, status }` без `data`; `src/components/BaseTable/ui/BaseTableRow.vue:47-48` — обращение `row.data[column.key]`.
- **Условия:** потребитель копирует пример из README.
- **Последствие:** TypeError при рендере первой строки.
- **Воспроизведение:** смонтировать пример README как есть.
- **Исправление:** этап правки README переписал пример в `README.md`, раздел «BaseTable»: строки `{ id: 1, data: { name: 'Задача 1', status: 'Активна' } }` и пояснение про `data`/`columns[].key`. Правка видна в `git diff HEAD` (состояние на 01:54).
- **Проверка:** vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5). Пример HEAD (`examples-before/21_basetable.vue`) давал TS2322 «Property 'data' is missing in type … 'TableRow'», текущий (`examples/22_basetable.vue`) — без ошибок. Проверка запускается вне репозитория, doc-snippet-теста в репозитории нет (C).
- **Статус:** Исправлено (README). Пример событий из предложения ревью не добавлен — вынесен в C как развитие.
  - Приоритет оставлен P1, как в ревью. При сведении стоит учесть, что похожие README-дефекты других групп оценены как P2 (например, ST-1).

#### TRE-1 · P1 · BaseTree — нет ARIA-семантики дерева
- **Где:**
  - `src/components/BaseTree/ui/BaseTree.vue:2-5` — нет `role=tree`, имени и `aria-multiselectable`;
  - `BaseTreeNode.vue:2-8` — нет `role=treeitem`, `aria-expanded/selected/checked/level/setsize/posinset/disabled`;
  - `BaseTreeChildren.vue:2-5` — нет `role=group`.
- **Условия:** всегда.
- **Последствие:** скринридер получает плоский набор div без состояния раскрытия и выбора (WCAG 4.1.2, 1.3.1).
- **Воспроизведение:** `getByRole('tree')` и `getAllByRole('treeitem')` ничего не находят.
- **Исправление:** не выполнено. Предложение:
  - на корне `role=tree` и `aria-label`/`aria-labelledby` (через prop);
  - на фокусируемом заголовке `role=treeitem`: `aria-expanded` только у узлов с детьми, `aria-selected` (single) или `aria-checked` (multiple; сам чекбокс — `aria-hidden` и `tabindex=-1`), `aria-level`, `aria-setsize`/`aria-posinset`, `aria-disabled`;
  - на контейнере детей `role=group`.
- **Проверка:** не проверено: теста нет.
- **Статус:** Не исправлено — большой объём (модель WAI-ARIA APG вместе с TRE-2). Roadmap.

#### TRE-2 · P1 · BaseTree — клавиатура не по APG, в режимах выбора ветку не раскрыть
- **Где:** `src/components/BaseTree/ui/BaseTreeNode.vue`:
  - `:6-8` — только `tabindex=0` и `@keydown.enter`;
  - `:9-17`, `:39-47` — стрелка сделана как `<span @click>`;
  - `:156-165` — в режимах выбора Enter только выбирает.
- **Условия:** `selectionMode` single или multiple; любое большое дерево.
- **Последствие:**
  - в режимах выбора дочерние узлы недоступны с клавиатуры (WCAG 2.1.1);
  - нет ↑/↓/←/→/Home/End/`*`, поиска по буквам, Space и roving tabindex — у большого дерева сотни Tab-остановок.
- **Воспроизведение:** `selectionMode='single'`, фокус на «Металл», Enter/→/Space — узел не раскрывается, стрелка фокус не получает.
- **Исправление:** не выполнено. Предложение:
  - roving tabindex (один `tabindex=0` на дерево);
  - keydown на корне по APG: →/← раскрывают/сворачивают или переходят к ребёнку/родителю, ↑/↓ — по видимым узлам, Home/End, `*`, поиск по буквам, Space — выбор, Enter — активация.
- **Проверка:** не проверено: теста нет. Play story Default нажимает ArrowDown/Enter без проверок.
- **Статус:** Не исправлено — большой объём, меняет порядок Tab. Roadmap вместе с TRE-1.

#### TRE-8 · P1 · BaseTree (README) — пример README падает, защиты от undefined items нет
- **Где:** `README.md:1003` — `<BaseTree :nodes="nodes" />`; `src/composables/useTreeState/useTreeState.ts:94-101` — вызов `buildDescendantsCache(undefined)`.
- **Условия:** пример из README или не переданный `items`.
- **Последствие:** setup падает с TypeError «not iterable».
- **Воспроизведение:** смонтировать пример README.
- **Исправление:** этап README исправил пример: `<BaseTree :items="nodes" />` плюс абзац про `selection-mode` и `v-model:expanded-ids`/`v-model:selected-ids` (правка в `git diff HEAD`, состояние на 01:54). Защита `items ?? []` в `useTreeState.ts` не добавлена.
- **Проверка:** README-пример — vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2353 «'nodes' does not exist», текущий — без ошибок). На `items = undefined` теста нет.
- **Статус:** Частично — README исправлен. Осталось: защита от undefined items в коде и тест на неё.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| TBL-8 | BaseTable / useTablePagination | `useTablePagination.ts:93-95` | При смене prop `pageSize` страница не сбрасывается и не клампится. 30 строк, pageSize 5, стр. 6 → pageSize 10 → пустое тело, «51–30 из 30». | Предложение: в watch — страница 1, пересчёт `loadedCount`, общий clamp (TBL-3). Смягчение от группы навигации: «назад» в BasePagination ведёт на последнюю страницу (`BasePagination.integration.spec.ts` › ««назад» ведёт на последнюю существующую страницу, если modelValue больше totalPages»). | Не исправлено: `useTablePagination.ts` в diff не менялся. |
| TBL-9 | BaseTable / useTableSearch | `useTableSearch.ts:16, 22-25` | Запрос применяется сразу, а сброс страницы — только после debounce. На стр. ≥ 2 тело около 300 мс показывает «Нет данных»; `processedRows` пересчитывается на каждый символ. | Предложение: фильтровать по применённому (debounced) запросу, `resetPage` вызывать синхронно в момент применения. | Не исправлено |
| TBL-10 | BaseTable / useTableData | `useTableData.ts:70-75` | Поиск идёт по `Object.values(row.data)`: находит по скрытым колонкам и полям вне колонок; «object» находит все строки с вложенным объектом, «null»/«undefined» — строки с пустыми полями. Значения formatter не ищутся, нет trim и нормализации ё/е. | Предложение: искать по видимым или searchable колонкам через `formatCellValue`/`searchAccessor`, null пропускать, запрос trim-ить. | Не исправлено |
| TBL-11 | BaseTable / useTableData, useTableToolbar, типы | `useTableToolbar.ts:5-13`; `useTableData.ts:81, 92-99`; `BaseTable.types.ts:22, 27-49, 74, 110, 120, 146, 261` | Операторы gt/gte/lt/lte предлагаются для любой колонки: фильтр по дате (`Number('2024-03-20')` = NaN) исключает все строки. `ne` отбрасывает строки с undefined. `between`/`in` молча ничего не фильтруют. `valueTo`, `filterConfig`/`ColumnFilterConfig`/`ColumnFilterType`, обязательный `NestedTableConfig.childrenKey`, слот `default` и `_depth` объявлены, но не работают. | Предложение: выбирать операторы по `sortType`/`filterConfig.type`, даты сравнивать по timestamp; остальное реализовать или убрать из публичных типов. | Не исправлено |
| TBL-12 | BaseTable / useColumnResize | `useColumnResize.ts:45-51, 117-118, 121-124`; дефект маскировал `useColumnResize.spec.ts:39-42` | Unmount посреди drag: во всём приложении отключается выделение текста и остаётся курсор col-resize. Ресайз только мышью: нет pointer/touch/клавиатуры, `event.button` не проверяется. `column.minWidth/maxWidth` игнорируются, mousemove обрабатывается без rAF. | Сделано: `releaseDrag()` вызывается в `stopResize` и в `onBeforeUnmount`, исходные `cursor`/`user-select` возвращаются. Тесты: `useColumnResize.spec.ts` › «при размонтировании во время ресайза снимает слушатели и возвращает стили body», «после ресайза возвращает стили body, которые были до его начала»; `BaseTable.spec.ts` › «TBL-12: размонтирование во время ресайза возвращает user-select и курсор body» (падали: да). | Частично. Осталось: pointer events с `setPointerCapture`/`pointercancel`, проверка `event.button`, min/maxWidth колонки, rAF, ресайз с клавиатуры. |
| TBL-13 | BaseTable / useTableComposition | `BaseTable.vue:49-54`; `useTableComposition.ts:166-176` | `loadMode: 'infinite'` без `height` (скроллится страница, а не обёртка) или первая порция ниже контейнера: scroll обёртки не происходит, `load-more` не эмитится. | Предложение: IntersectionObserver на строке-sentinel, после рендера проверять, не ниже ли контент контейнера; dev-предупреждение для infinite без height. | Не исправлено (сценарий story — в A4) |
| TBL-14 | BaseTable (Header, Row, Toolbar) | `BaseTableHeader.vue:5`; `BaseTableRow.vue:15-19, 25-34`; `BaseTableToolbar.vue:34-36, 47-53, 67-75` | Чекбоксы «выбрать всё» и строк без имени, indeterminate нет. Кнопка раскрытия без имени и `aria-expanded`. Иконочные «+» и «настройки» без имени. Поиск и фильтр подписаны только placeholder. Чипы фильтров — `<span @click>`, удалить их с клавиатуры нельзя. Панель настроек колонок с клавиатуры недостижима. Нет caption/aria-label таблицы и `aria-busy`. `row-click` работает только мышью. | Предложение: props `caption`/`ariaLabel`, `getRowLabel(row)`; чипы — `<button aria-label>`; aria-label из UI_ARIA; скрытый label у поиска; `aria-expanded`; `aria-busy`. Зависит от FRM-1 и CHK-1 (BaseCheckbox, forms) и DRP-1/DRP-2 (BaseDropdown, overlays). | Не исправлено: нужна доработка BaseCheckbox (чужой компонент) |
| TBL-15 | BaseTable (типы) | `BaseTable.types.ts:279`; `BaseTableRow.vue:47` | Тип слота `cell-*` — `{ column; row }`, хотя передаются ещё `value` и `index`. Деструктуризация `#cell-price="{ value }"` (так сделано в stories) не проходит vue-tsc strict у потребителя. | Предложение: `{ row; value: unknown; column; index?: number }` (у child-строк index нет) и type-test. | Не исправлено |
| TBL-18 | BaseTable | `useTablePagination.ts:38`; `BaseTableBody.vue:27-78, 45-47, 63-65`; `BaseTable.vue:80-85, 112-117` | Виртуализации нет, а по умолчанию `pageSize = 0` — рендерятся все строки. На строку создаются 3 компонента. Слоты генерируются через v-for (DYNAMIC_SLOTS), поэтому Header, Body и каждая строка перерисовываются при любом рендере BaseTable (ввод в поле фильтра, выбор, isLoading) — O(rows × cols) на каждое нажатие. | Предложение: виртуализация, статическая передача слотов, состояние полей фильтра — в тулбар, `v-memo`, не создавать NestedRow/ExpandedRow без надобности; замер на 5k строк. Попутно в рамках TBL-1 `columns.find` вынесен из компаратора (тестом не измеряется). | Не исправлено |
| TBL-20 | BaseTable / useTableData | `useTableData.ts:120-121` | `localeCompare` без явной локали и `numeric`: «Item 10» < «Item 2»; без `sortType` `[10, 9, 100, 2]` → `[10, 100, 2, 9]`. `'01.02.2024'` парсится как 2 января, `'15.03.2024'` — как Invalid Date. | Сделано: `Intl.Collator(undefined, { numeric: true })`; даты не в ISO получают ранг «не распознано» и идут после корректных. Тесты: `useTableData.spec.ts` › «string: пустые значения в конце при любом направлении, числа внутри строк сравниваются численно», «date: null и не-ISO даты не ломают сортировку корректных дат» (падали: да); `tableUtils.spec.ts` › «направление меняет порядок внутри ранга, строки сравниваются с numeric-коллацией» (новый код). | Частично. Осталось: локаль берётся из окружения (prop нет); ДД.ММ.ГГГГ не сортируются как даты; нет `sortAccessor`/`compare` у колонки. |
| TBL-22 | useTableData (README) | `README.md:1351-1356`; `useTablePagination.ts:16` | Импорт `import { useTableData } from '@ramzes1385/rise-ui-kit'` не работает: composables доступны только через namespace `composables` или подпуть `/composables`. Вызов `useTableData({ rows: [], columns: [] })` падает с TypeError в `ref(pageSize.value)`; к тому же rows/columns должны быть Ref. | Этап README переписал пример: импорт из `@ramzes1385/rise-ui-kit/composables`, `rows`/`columns` как `ref`, `pageSize: ref(10)`, `loadMode`, `isMultiSort`, `searchDebounce` (правка в `git diff HEAD`). Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2614, импорт из корня; текущий — без ошибок). | Исправлено (README). ID присвоен в реестре. |
| TRE-3 | BaseTree (BaseTreeChildren) | `BaseTreeChildren.vue:3`; `BaseTree.style.scss:132-148` | Если ветку раскрыть и свернуть, её узлы остаются в DOM с `tabindex=0`: Tab попадает в невидимые заголовки и чекбоксы, скринридер читает скрытые узлы. | Сделано: `BaseTreeChildren.vue` ставит свёрнутому контейнеру inline `visibility: hidden`. Тесты: `BaseTree.integration.spec.ts` › describe «свёрнутые ветки»: «заголовки свёрнутой после раскрытия ветки не достижимы по Tab», «чекбоксы свёрнутой ветки в режиме multiple не достижимы по Tab» (падали: да), защитный «раскрытая ветка остаётся достижимой по Tab». Проверено в jsdom (user-event учитывает visibility); в браузере и скринридере не проверялось. | Исправлено. Замечание ревью о неработающей анимации `grid-template-rows` не затронуто. |
| TRE-4 | BaseTree / useTreeState | `useTreeState.ts:60-78`; `BaseTreeNode.vue:18-25` | В режиме multiple каскад выбирает и disabled-потомков. Выбор всех детей не отмечает родителя, а снятие одного ребёнка оставляет родителя выбранным — в `update:selectedIds` уходит противоречивое состояние. Indeterminate нет. Чекбокс disabled-узла без `is-disabled`: он фокусируется и «отмечается». | Предложение: пропускать disabled при каскаде, считать checked/indeterminate снизу вверх, передать `:is-disabled` в чекбокс (indeterminate зависит от CHK-1). | Не исправлено |
| TRE-5 | BaseTree / useTreeState | `useTreeState.ts:103-113` | Watch следит только за флагом `isDefaultExpandAll`. Если items приходят асинхронно (сначала `[]`), дерево не раскрывается. | Предложение: следить и за items, раскрывая новые id, или ввести prop `defaultExpandedIds`. | Не исправлено |
| TRE-6 | BaseTree (типы) | `BaseTree.types.ts:28, 30` | `TreeNode.to`/`href` объявлены, но нигде не используются: узлы-ссылки не работают, Enter на листе ничего не делает. | Предложение: рендерить RouterLink/`<a>` с проверкой схемы (в utils уже есть `isSafeUrl`) и `rel` для внешних ссылок — либо убрать поля. | Не исправлено |
| TRE-7 | BaseTree (BaseTreeNode, стили) | `BaseTree.style.scss:118-130`; `BaseTreeNode.vue:48-50` | Actions видны только при hover: `:focus-within` нет (WCAG 2.4.7). Клик и Enter по кнопке в actions всплывают на заголовок и раскрывают или выбирают узел. | Предложение: `:focus-within`; `@click.stop` и `@keydown.stop` на обёртке actions. | Не исправлено |
| SCH-1 | schemaUtils | `schemaUtils.ts:29-31`; `schemaUtils.spec.ts` (4 теста, экранирование не проверяется) | Экранирование `<`/`>` — единственная защита v-html в BaseBreadcrumbs от XSS, но тестом оно не покрыто: регрессия пройдёт незамеченной. | Предложение: unit с `label: '</script><script>alert(1)</script>'` и `'<!--'` — в результате нет `<`, а `JSON.parse` возвращает исходную строку. | Не исправлено: тест не добавлен |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| TBL-16 | useTableSort, useTableFilter, useTableColumns, useColumnResize | `useTableSort.ts:43, 55`; `useTableFilter.ts:22, 28, 33-34`; `useTableColumns.ts:69`; `useColumnResize.ts:84` | Эмиты отдают живые внутренние массивы (в мультисортировке `direction` мутируется на месте), и сохранённый потребителем payload меняется задним числом. | Сделано в рамках TBL-5: `columns-change` отдаёт копию (`snapshotColumns`). Теста на неизменность payload нет. | Частично: `sort` и `filter` по-прежнему отдают живые массивы |
| TBL-17 | BaseTable / useTableExpand | `useTableExpand.ts:16-26, 37, 40-45`; `BaseTableExpandedRow.vue:2` | Свернуть строку через `isExpanded: false` нельзя, устаревшие id копятся. Клик по кнопке или ссылке в cell-слоте переключает раскрытие, `isDisabled` его не блокирует. `expand` эмитит копию строки. Для каждой isExpandable-строки рендерится пустой `<tr>`. Дубли `row.id` не проверяются. | Предложение: `v-model:expandedIds`; игнорировать клики из `button, a, input, [role=button]`; рендерить `<tr>` только при раскрытии; dev-предупреждение о дублях. | Не исправлено |
| TBL-19 | BaseTable (стили), tableUtils | `_cell.scss:75-87`; `BaseTableNestedRow.vue:30`; `tableUtils.ts:41-45` (закреплено тестом `tableUtils.spec.ts:128-132`) | У всех sticky-колонок `left:0`/`right:0`, поэтому несколько таких колонок налезают друг на друга. У child-строк нет sticky-классов. Flex-колонка получает процент от всей таблицы (`['200px', '100%']`), а не от остатка. | Предложение: накопленные смещения sticky, sticky-классы у child-строк, flex от оставшейся ширины. | Не исправлено (визуальная часть — в A4) |
| TBL-21 | useTableToolbar, useColumnResize, namespace `composables` | `useTableToolbar.ts:5-13, 31-33`; `useColumnResize.ts:121-124`; `src/composables/index.ts:55-56, 64` | `showToolbar` читает нереактивный `useSlots()`: слоты toolbar-*, добавленные через v-if после mount, тулбар не покажут. Метки операторов захардкожены вне constants. `onBeforeUnmount` вызывается без проверки `getCurrentInstance`. Namespace `composables` экспортирует внутренние useTableComposition, useTableColumns и useTableToolbar, которым нужны emit и slots BaseTable. | Предложение: проверять слоты в render, метки вынести в constants, добавить guard, убрать внутренние composables из публичного экспорта (breaking change). | Не исправлено |
| TRE-9 | treeUtils, useTreeState | `treeUtils.ts:6-13, 16-25, 28-37`; `useTreeState.ts:94-101` | Цикл в children даёт бесконечную рекурсию и RangeError уже при mount. Дубли id делят раскрытие и выбор, перезаписывают кэш. Изменение children на месте не перестраивает кэш (watch не deep). `ids.push(...)` (`:33`) на ~10⁵ элементов даёт RangeError. Кэш потомков занимает O(n·depth). | Предложение: visited-Set и dev-предупреждение, итеративный обход, ленивый кэш или parent-map. | Не исправлено |
| TRE-10 | BaseTree (стили) | `BaseTree.style.scss:40-43` | `opacity: .5` и `pointer-events: none` висят на всём `.base-tree__node--disabled`, включая детей: раскрытые дети disabled-родителя некликабельны мышью (с клавиатуры работают). | Предложение: применять эти стили к `.base-tree__header`. | Не исправлено |
| TRE-11 | useTreeState | `useTreeState.ts:53-58, 80-92` (на смену режима ничего не реагирует) | После смены `selectionMode` с multiple на single выбранными остаются несколько узлов — до следующего клика. | Предложение: при переходе в single оставлять не больше одного id и эмитить `update:selectedIds`. | Не исправлено. ID присвоен в реестре (в ревью — «мелочь» в разделе useTreeState) |
| SCH-2 | schemaUtils | `schemaUtils.ts:29-31` | `escapeJsonForScript` приватная, и поддерживается только BreadcrumbList: для VideoObject/AudioObject безопасный сериализатор переиспользовать нельзя. | Предложение: экспортировать сериализатор JSON-LD и добавить билдеры схем. | Не исправлено |

### A4. Гипотезы (не подтверждены)
- **SCH-3.** В `item` попадают относительные URL из `to` (например `'/catalog'`), а Google рекомендует абсолютные.
  - Для проверки нужны Rich Results Test / Search Console на реальном домене.
  - Смежная подтверждённая часть (микроразметка дублирует JSON-LD, `position=1` у «домой» и первой крошки) — это BC-5 группы навигации, учитывать её там.
- **TBL-13 (сценарий story).** В WithInfiniteScroll (height 300px, 8 строк, порция 5 ≈ 250px) оставшиеся 3 строки, вероятно, не подгрузить. Нужен браузер или Playwright.
- **TBL-17 (внешний вид).** Пустой `<tr>` из BaseTableExpandedRow может сбивать чётность striped (`_root.scss:41`, nth-child) и давать лишние границы. Нужен visual-снимок.
- **TBL-19 (внешний вид).** Как именно налезают sticky-колонки и какие ширины получают flex-колонки — проверить в браузере.
- **Изоляция stories BaseTable.** Play Interactive через TBL-5 мутировал общий `COVERAGE_COLUMNS`. После исправления TBL-5 объекты из props не мутируются, так что проблема, скорее всего, ушла; подтвердить в Storybook.
- **TBL-6 (снимки).** По оценке агента, кнопка в заголовке может сдвинуть baseline `base-table--default`/`dark-theme` на ≤1px. Нужен прогон Playwright visual.
- **TBL-14 (панель настроек колонок).** Группа overlays поправила BaseDropdown: `isTextEntryTarget` пропускает любой `input`, включая checkbox, поэтому фокус в чекбоксе панели больше не возвращается на триггер. Можно ли попасть в панель по Tab (она телепортирована в body), по-прежнему неясно — проверить в браузере.

---

## Примечания к перепроверке
1. **TBL-12.** Отчёт 20:05: «исправлен». В коде исправлены только cleanup при unmount и возврат стилей body. Ресайз по-прежнему только мышью, `event.button` не проверяется, min/maxWidth колонки игнорируются, rAF нет — в реестре «Частично».
2. **TBL-6.** Отчёт: «исправлен… Иконки сортировки помечены `aria-hidden`». На деле `aria-hidden` стоит на всём `.base-table__sort-icon` вместе с номером приоритета мультисортировки (рабочая копия `BaseTableHeader.vue:35-48`), так что приоритет перестал озвучиваться совсем. Пункт ревью «приоритет N» не сделан — «Частично».
3. **TBL-2.** Отчёт: «исправлен». Остаются поштучно выбранные строки, скрытые поиском (агент сам отнёс их в roadmap), нет indeterminate и опции области.
   - Фраза отчёта «после действия заголовка payload `select` не содержит скрытых строк» неточна: выбранные родителем disabled-строки, скрытые поиском, сохраняются в выборе и попадают в payload (`toggleAll` обходит все rows).
   - В реестре — «Частично».
4. **TBL-20.** Отчёт объединяет его с TBL-1 как «исправлен». Локаль не настраивается, ДД.ММ.ГГГГ не сортируются как даты, `sortAccessor` нет (ДД.ММ.ГГГГ агент сам вынес в roadmap) — «Частично».
5. **Число тестов в блоке 22:20.** Отчёт: «закрыл их шестью тестами». В diff за этот этап в `useTableData.spec.ts` добавлено 5 `it` (65 → 76 = 6 тестов из этапа 20:05 + 5). Общий итог 285 → 290 тоже даёт +5.
6. **Нестыковки в ревью.**
   - Пункт «README useTableData» в своём разделе помечен P2, а в сводке перечислен среди P1. В реестре — TBL-22, P2.
   - Итоговое сообщение ревьюера (отчёт этапа исправлений) говорит «Всего 32 дефекта», хотя пронумеровано 34 (TBL-1…21, TRE-1…10, SCH-1…3) плюс README-пункт.
7. **Перепроверка находок.** Все «Где» для P1 и выборочно для P2/P3 сверены с кодом HEAD; неверных находок не обнаружено.
8. **README правится параллельно.** Этап правки README менял README.md во время сверки. На 01:52 были изменены только общие разделы, на 01:54 — уже примеры BaseTable, BaseTree и useTableData.
   - Статусы TBL-7/TRE-8/TBL-22 даны по состоянию на 01:54: «Частично», потому что проверочного теста в репозитории нет, а для TRE-8 нет и защиты `items ?? []`.
   - Если README изменится ещё, эти три статуса нужно сверить заново. Сверены с итоговым README — п. 10.
9. **Неточность в README.** В новом разделе «Изменения поведения» сказано: «даты в колонках `sortType: 'date'` распознаются только в формате ISO 8601». Это неполно: код принимает также объекты Date и числовые timestamp (`tableUtils.ts`, `toSortTimestamp`; тесты `useTableData.spec.ts` › «date: объекты Date сортируются по времени, Invalid Date — после корректных», «date: timestamp-числа сортируются по времени, NaN — после корректных»). Снято: итоговый README перечисляет ISO 8601-строки, объекты `Date` и числовые timestamp и оговаривает, что ДД.ММ.ГГГГ датами не считаются.
10. **Обновление статусов (координатор), 26.09.** Изменено 2 статуса после сверки с итоговым README. Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`):
    - TBL-7 (P1): «Частично» → «Исправлено (README)». Пример событий BaseTable (предложение ревью, не дефект) вынесен в C как развитие.
    - TBL-22 (P2): «Частично» → «Исправлено (README)».
    - Без смены статуса: TRE-8 остаётся «Частично» — README исправлен и проверен, `items ?? []` в `useTreeState.ts` нет. TBL-20 остаётся «Частично»; README-часть строки C закрыта, JSDoc `sortType` не менялся.
    - Проверка примеров README пока живёт вне репозитория; перенос в CI — в C.
    - Docgen (`vue()` раньше docgen-плагина в `build/storybook/main.ts`): находок про описания props в Docs в группе нет. Пометка матрицы «в argTypes нет `expandedIds`/`selectedIds`» (BaseTree) могла быть следствием сломанного docgen. Перепроверить по сборке Storybook.
