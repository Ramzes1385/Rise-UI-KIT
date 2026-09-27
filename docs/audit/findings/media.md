# Находки группы «Медиа и иконки»

Состав: BaseFileUpload, BaseImage (+ зум, галерея), BaseAvatar, BaseIcon (+ спрайт, iconPlugin).

Реестр подтверждённых находок аудита. Номера строк в «Где» — по исходному коммиту `9c848ae` (после исправлений строки сдвинулись). Статусы — на момент завершения аудита: **Исправлено** (правка в рабочей копии и тест), **Частично** (что осталось — в тексте), **Не исправлено** (причина — в тексте). Приоритеты: P0 — блокирующая, P1 — значимый дефект, P2 — локальный дефект или пробел в тестах/доступности, P3 — улучшение. Строки матрицы компонентов — в [COMPONENT_MATRIX.md](../COMPONENT_MATRIX.md), кандидаты в план — в [ROADMAP.md](../ROADMAP.md), выводы для плеера — в [MEDIA_PLAYER_PLAN.md](../MEDIA_PLAYER_PLAN.md).

Термины: «ревью» — первичный разбор группы, «этап исправлений» и «отчёт агента» — правки и отчёт исполнителя по группе, «координатор» — сводная перепроверка и правки после этапа исправлений.

## A. Реестр находок

### A1. P0 и P1

#### IMG-1 / AVA-4 · P0 · BaseImage, BaseAvatar — lazy-изображение через 5 с навсегда уходит в ошибку
- **Где:** `src/composables/useImageState/useImageState.ts:91-101,109-121,123-132`, `src/components/BaseImage/ui/BaseImage.vue:28,76,78`; в аватаре — `src/components/BaseAvatar/ui/BaseAvatar.vue:9-15` (HEAD 9c848ae).
- **Условия:** значения по умолчанию (`loading="lazy"`, `timeout=5000`), и при этом:
  - изображение ниже первого экрана — браузер его ещё не запрашивал;
  - или медленная сеть.
- **Последствие:**
  - Таймер стартует при монтировании. Через 5 с `hasError=true`, и `<picture v-if="!hasError">` удаляется: картинка уже не загрузится, пользователь видит «Ошибка загрузки».
  - Затронуты ленты, вложения чата, превью BaseFileUpload, BaseSlider, BaseSearch.
  - Аватары в списках навсегда переключаются на инициалы (AVA-4).
- **Воспроизведение:** страница с BaseImage ниже 3000 px → подождать 6 с → прокрутить → вместо фото блок ошибки.
- **Исправление:** `useImageState.ts` (+ `.types.ts`), `BaseImage.vue` (`ref` на `<img>`).
  - Для `lazy` отсчёт таймаута начинается, когда `<img>` попадает в зону видимости (IntersectionObserver).
  - Без IntersectionObserver таймаут к lazy не применяется; eager — как раньше.
  - Observer отключается при load, error и unmount.
- **Проверка:** `src/components/BaseImage/__tests__/BaseImage.spec.ts` › «таймаут загрузки»:
  - «не переводит lazy-изображение в ошибку, пока браузер не начал его загрузку» — падал до исправления: да. В jsdom нет IntersectionObserver, поэтому тест проверяет ветку «без IO».
  - «отсчитывает таймаут lazy-изображения с момента попадания в зону видимости» — да (управляемая замена IO).
  - «eager-изображение по-прежнему переводится в ошибку по истечении таймаута» — контрольный, нет.
  - Не проверено: Playwright со скроллом через 6 с.
- **Статус:** Частично. Основной сценарий (изображения вне экрана) устранён. Осталось:
  - по таймауту `<img>` по-прежнему удаляется, и поздний `load` картинку не восстанавливает;
  - поэтому на медленной сети (eager или lazy, > 5 с после появления на экране) ошибка остаётся навсегда, а аватар — инициалами;
  - `timeout` по умолчанию — 5000.

  Исправление остатка меняет поведение и вынесено в C.

#### IMG-2 / AVA-4 · P0 · BaseImage, BaseAvatar — AVIF/WebP-источники ломали любой локальный src
- **Где:** `src/composables/useImageState/useImageState.ts:63-74`, `src/components/BaseImage/ui/BaseImage.vue:29-30`, `src/utils/imageUtils/imageUtils.ts:4-6` (HEAD).
- **Условия:** `src` — относительный путь или путь от корня: `/image.jpg`, ассет Vite, примеры `README.md:677` (`/avatar.png`) и `:693`.
- **Последствие:**
  - Всегда рендерились `<source type="image/avif" srcset="….avif">` и `.webp`.
  - Браузер выбирает AVIF, получает 404 и к `<img src>` не возвращается → ошибка.
  - `fallbackSrc` не помогал, `convertToWebp=false` генерацию не отключал.
  - Аватар из примера README всегда показывал инициалы.
- **Воспроизведение:** `<BaseImage src="/favicon.svg" alt="">` в dev-сервере → запрос `/favicon.avif` возвращает 404 → блок ошибки.
- **Исправление:** `useImageState.ts`, `BaseImage.types.ts`, `BaseImage.vue` (новый проп `convertToAvif=false`), `imageUtils.ts`.
  - Производные `<source>` добавляются только по явным `convertToAvif`/`convertToWebp`.
  - Они не строятся для `data:`/`blob:`, для файла без расширения и пока показан `fallbackSrc` (в этот момент убирается и `srcset`).
  - `replaceExtension` ищет расширение только в имени файла.
- **Проверка:**
  - `BaseImage.spec.ts` › «производные источники AVIF/WebP»:
    - «не добавляет <source> AVIF/WebP для локального src без явного запроса форматов» — да;
    - «не строит производный источник, если в пути нет расширения файла» — да;
    - «показывает fallbackSrc, даже если включены производные источники и srcset» — да;
    - «добавляет AVIF-источник по явному convertToAvif» — контрольный.
  - `src/utils/imageUtils/imageUtils.spec.ts`:
    - «не принимает точку в домене за расширение файла» — да;
    - «не принимает точку в каталоге за расширение файла»;
    - «обрабатывает protocol-relative URL: расширение берётся из имени файла, а не из домена»;
    - «заменяет расширение в URL с доменом, каталогами с точкой и hash».
  - Существующий тест «должен генерировать avif source для локальных изображений при convertToAvif» получил `convertToAvif: true`: раньше он закреплял дефект.
  - Не проверено: Playwright `naturalWidth>0`.
- **Статус:** Исправлено. Остаток P3 касается только оптимизации: `srcWidth`/`sizes` не применяются к `<source>` (см. C).

#### ICON-1 · P0 · BaseIcon — у потребителя пакета спрайт иконок не находится
- **Где (HEAD):**
  - `src/constants/ui.ts:167`, `src/composables/useIcon/useIcon.ts:5-7`;
  - `src/components/BaseIcon/ui/BaseIcon.vue:11`, `src/icons/index.ts:1`;
  - `src/plugins/iconPlugin/iconPlugin.ts:10-18`, `package.json:22-26,33-69`;
  - `build/plugins/sprite.ts:23-24,113-119`, `README.md:1455-1469`.
- **Условия:** любое из:
  - приложение с history-роутером на вложенном маршруте;
  - деплой под подпутём;
  - раздача ассетов с CDN;
  - спрайт не скопирован в `public/`.
- **Последствие:**
  - `<use href="icons.svg#…">` резолвится от URL страницы: `/users/42` → `/users/icons.svg`. Результат — 404 или `index.html`, и пропадают все иконки кита.
  - Путь нельзя настроить.
  - `dist/icons.svg` не входит в `exports` (`ERR_PACKAGE_PATH_NOT_EXPORTED`).
  - README об этом молчит.
- **Воспроизведение:** открыть `/a/b` с `<BaseIcon name="close"/>` → браузер запрашивает `/a/icons.svg`.
- **Исправление:**
  - Путь передаётся через provide/inject. Ключ `ICON_SPRITE_PATH_KEY` (`Symbol.for`) экспортирован.
  - Опции: `createIconPlugin({ spritePath })` и `createUiKitPlugin({ iconSpritePath })` — `useIcon.ts`, `iconPlugin.ts`, `iconPlugin.types.ts`, `plugin.ts`. По умолчанию прежний `'icons.svg'`.
  - Координатор добавил в `package.json#exports` подпуть `"./icons.svg": "./dist/icons.svg"` — это пункт 3 находки.
- **Проверка:**
  - `src/plugins/iconPlugin/iconPlugin.spec.ts`:
    - «BaseIcon ссылается на спрайт по пути из опции spritePath» — да;
    - «без spritePath сохраняет прежний относительный путь icons.svg» — контрольный.
  - `src/components/BaseIcon/__tests__/BaseIcon.integration.spec.ts` › «должен ссылаться на спрайт по пути из createUiKitPlugin({ iconSpritePath })» — да.
  - `src/composables/useIcon/useIcon.spec.ts` › «внутри компонента использует путь к спрайту, переданный через provide» — да.
  - Подпуть `exports` не проверен: теста нет. Нужны `npm run pack:dry` и `import.meta.resolve('@ramzes1385/rise-ui-kit/icons.svg')` после сборки.
  - E2E «приложение-потребитель на `/a/b`» нет.
- **Статус:** Частично. Путь настраивается, файл экспортирован. README теперь описывает подключение: разделы «Иконки → Спрайт» и «Быстрый старт» — копирование в `public/` или импорт `?url`, `iconSpritePath`/`spritePath`, `BASE_URL` при подпути, тот же origin. Примеры 72–73 проходят vue-tsc strictTemplates: проверка примеров README (REPORT.md §5). Осталось:
  - дефолт по-прежнему относительный: без `iconSpritePath` на вложенных маршрутах иконки пропадают (теперь это описано в README);
  - спрайт с другого origin (CDN) внешний `<use>` не загрузит;
  - автотеста на подпуть нет.

#### FU-1 · P1 · BaseFileUpload — зона загрузки недоступна с клавиатуры, label не связан
- **Где:** `src/components/BaseFileUpload/ui/BaseFileUpload.vue:15-35`, `src/components/BaseFileUpload/styles/BaseFileUpload.style.scss:31-33` (HEAD).
- **Условия:** всегда.
- **Последствие:** пользователь клавиатуры или скринридера не может выбрать файл (WCAG 2.1.1, 4.1.2):
  - зона — `div tabindex=0` без роли и без обработки Enter/Space;
  - `<label>` без `for`.
- **Воспроизведение:** Tab до зоны → Enter → `input.click` не вызывается; `getByRole('button', {name: /выберите файлы/i})` не находит элемент.
- **Исправление:** `BaseFileUpload.vue`:
  - зона получила `role="button"`, Enter/Space вызывают `triggerUpload`;
  - `<label :for>` связан с input через `useId`, у input `tabindex=-1`;
  - при `isDisabled` у зоны `tabindex=-1` и `aria-disabled`.
- **Проверка:** `src/components/BaseFileUpload/__tests__/BaseFileUpload.integration.spec.ts` › «клавиатурная доступность», все три падали до исправления:
  - «зона загрузки — кнопка, открывающая выбор файла по Enter и Space»;
  - «подпись связана с полем выбора файла»;
  - «отключённая зона загрузки исключена из порядка табуляции».

  axe по 25 stories BaseFileUpload (REPORT.md §5.4): нарушения `list`/`listitem` только в 3 stories со списком ошибок; `nested-interactive` не выявлен (stories со слотом-кнопкой нет).
- **Статус:** Исправлено. `aria-describedby` для подсказки и ошибок относится к FU-6. Input остался `display:none`: фокус на нём не нужен.

#### FU-2 · P1 · BaseFileUpload — прогресс и «Загружено» имитируются, управлять ими нельзя
- **Где:** `src/composables/useFileUploadState/useFileUploadState.ts:74-110`, `src/components/BaseFileUpload/ui/BaseFileUpload.vue:84-99`, `src/components/BaseFileUpload/model/BaseFileUpload.types.ts:25` (HEAD).
- **Условия:** выбран любой файл-изображение; не-изображения навсегда остаются в `pending`.
- **Последствие:**
  - Без реальной отправки UI показывает «N%» (`Math.random`), затем «Загружено»; статус `error` недостижим.
  - Если загрузка у потребителя упала, пользователь уходит, считая файл сохранённым. Это риск потери данных.
- **Воспроизведение:** выбрать `a.png` без сервера → через ~1 с «Загружено»; выбрать `a.pdf` → «Ожидание» навсегда. Имитацию закрепляет `BaseFileUpload.spec.ts` › «имитация прогресса загрузки» › «должен завершать загрузку изображения со статусом done при достижении 100%».
- **Исправление (предложение):**
  - убрать `simulateUploadProgress`;
  - сделать модель контролируемой: `v-model:files` (`UploadedFile[]` со `status/progress/error`) или expose `setProgress/setStatus`;
  - опционально проп `uploader(file, {onProgress, signal})` с abort и retry.
- **Проверка:** не проверено — не исправлялось. Нужен unit: статус и прогресс берутся только из prop и без внешнего обновления не меняются (fake timers).
- **Статус:** Не исправлено. Нужны новый API и смена поведения по умолчанию (дизайн-решение), поэтому пункт вынесен в roadmap.

#### FU-3 · P1 · BaseFileUpload — в одиночном режиме файлы накапливаются
- **Где:** `src/components/BaseFileUpload/ui/BaseFileUpload.vue:199-215`, `src/composables/useFileUploadState/useFileUploadState.ts:48-72,130-135` (HEAD).
- **Условия:** `isMultiple=false` (по умолчанию), повторный выбор файла или drop нескольких файлов.
- **Последствие:**
  - Файлы копятся до `maxCount=10`, `change` отдаёт `[A, B]`.
  - Потребитель, берущий `files[0]`, загрузит старый файл.
  - Drop трёх файлов добавляет все три.
- **Воспроизведение:** выбрать A, затем B → в списке 2 элемента, последний `change` = `[A, B]`.
- **Исправление:** `useFileUploadState.ts` (опция `getIsMultiple`, `replaceFile`), `BaseFileUpload.vue`.
  - Новый валидный файл заменяет выбранный: для старого приходит `remove`, затем `change=[новый]`.
  - Из drop берётся первый валидный файл; невалидный файл выбранный не вытесняет.
  - Устаревшее чтение превью отбрасывается; `maxCount` в одиночном режиме не применяется.
  - Без `getIsMultiple` composable работает по-старому.
- **Проверка:** `BaseFileUpload.integration.spec.ts` › «одиночный режим (isMultiple=false)»:
  - «повторный выбор заменяет файл, а не добавляет второй» — да;
  - «из перетащенных нескольких файлов оставляет один» — да;
  - «невалидный файл не заменяет уже выбранный» — контрольный, нет.

  В существующий тест `BaseFileUpload.spec.ts` › «должен эмитить error при превышении maxCount» добавлен `isMultiple: true`.
- **Статус:** Исправлено. Лишние файлы из drop отбрасываются без сообщения. Это дизайн-решение, как у нативного input.

#### IMG-3 · P1 · BaseImage (потребители) — удалённый проп `hasZoom` молча выключал зум
- **Где:** `src/components/BaseSlider/ui/BaseSlider.vue:85`, `src/components/BaseChat/ui/ChatMessageList/ui/ChatMessageAttachments.vue:13`, `src/components/BaseChat/ui/ChatSlideover/ChatSlideoverMedia.vue:12` (HEAD).
- **Условия:** вложения и медиа-панель чата, BaseSlider с `isZoomable`.
- **Последствие:** `:has-zoom` (проп удалён в 1.2.2) уходит атрибутом на корневой `div`. Зум и галерея не открываются, vue-tsc без `strictTemplates` этого не видит.
- **Воспроизведение:** кликнуть по изображению-вложению в чате → `.base-image__zoom` не появляется.
- **Исправление:** в трёх местах `:zoom-config="{ hasZoom: … }"`.
- **Проверка:** `src/components/BaseImage/__tests__/BaseImage.integration.spec.ts` › «потребители BaseImage включают зум актуальным API», все три падали до исправления:
  - «изображение-вложение в сообщении чата открывает зум по клику»;
  - «изображение в медиа-панели чата открывает зум по клику»;
  - «слайд BaseSlider с isZoomable открывает зум по клику».
- **Статус:** Исправлено. Story `BaseTable.stories.ts:1173` позже исправлена (IMG-17); включение `strictTemplates` — в C.

#### IMG-4 · P1 · BaseImage, BaseImageZoom — зум и галерея недоступны с клавиатуры и скринридеру
- **Где (HEAD):**
  - `src/components/BaseImage/ui/BaseImage.vue:31-44` — `<img @click>` без роли и tabindex;
  - `src/components/BaseImage/ui/BaseImageZoom.vue:3-6` — нет `role="dialog"`, `aria-modal`, имени;
  - `BaseImageZoom.vue:8-72` — 8 кнопок-иконок без имён;
  - `BaseImageZoom.vue:78` — один `alt` на всю галерею;
  - `BaseImageZoom.vue:85-94` — миниатюры сделаны `div @click`.
- **Условия:** `zoomConfig.hasZoom=true`.
- **Последствие:**
  - с клавиатуры зум не открыть;
  - скринридер восемь раз произносит «кнопка» без названия;
  - фокус не переходит в оверлей и по Tab уходит на страницу под ним;
  - клавиши зума срабатывают и при фокусе в поле ввода на фоне.
- **Воспроизведение:** изображение не получает фокус по Tab; после открытия зума мышью `getByRole('dialog')` ничего не находит (HEAD).
- **Исправление:** `BaseImageZoom.vue`:
  - `role="dialog"`, `aria-modal="true"`, имя «Просмотр изображения: {alt}» (при `alt=""` без суффикса);
  - `aria-label` у 6 кнопок тулбара и 2 кнопок навигации — из новых констант `UI_ARIA` (`src/constants/ui.ts`).
- **Проверка:** `BaseImage.integration.spec.ts` › «доступность оверлея зума» › «оверлей — модальный диалог с именованными кнопками управления» — да. axe по 29 stories BaseImage, включая 9 stories с зумом (REPORT.md §5.4), — без нарушений.
- **Статус:** Частично. Осталось:
  - открытие зума с клавиатуры;
  - перевод, ловушка и возврат фокуса (подойдёт новый `useFocusTrap`);
  - миниатюры как кнопки с `aria-current`;
  - отдельный `alt` для каждого элемента галереи;
  - клавиши на `document` (IMG-10).

  Причина: этап был ограничен условием «без переделки фокуса».

#### IMG-5 / AVA-4 · P1 · BaseImage (useImageZoom) — зум и размонтирование снимали чужой scroll lock
- **Где:** `src/composables/useImageZoom/useImageZoom.ts:187-192,199-204` (HEAD).
- **Условия:** открыт BaseModal или BaseSlideover (useScrollLock), и при этом:
  - внутри или рядом размонтируется любой BaseImage — удаление превью, перерисовка списка аватаров (AVA-4), смена вкладки;
  - или внутри открыт и закрыт зум.
- **Последствие:** зум писал `document.body.style.overflow` напрямую, а при unmount безусловно ставил `''`. Фон прокручивается под открытым оверлеем.
- **Воспроизведение:** в открытом BaseModal открыть и закрыть зум → `body.style.overflow === ''`.
- **Исправление:** сделано группой overlays.
  - `useImageZoom.ts` блокирует прокрутку через `useScrollLock`.
  - `useScrollLock.ts` получил общий счётчик блокировок: `unlock()` экземпляра, который не блокировал, ничего не снимает, а стили body восстанавливает последняя разблокировка.
  - В `useImageZoom.spec.ts` добавлен `enableAutoUnmount(afterEach)`.
- **Проверка:**
  - `src/components/BaseModal/__tests__/BaseModal.integration.spec.ts` › «блокировка прокрутки» › «закрытие зума изображения внутри модалки не снимает её блокировку» — да, по отчёту overlays.
  - `src/composables/useScrollLock/useScrollLock.spec.ts` › «несколько экземпляров (общий счётчик блокировок)» › «повторные lock/unlock одного экземпляра не сбивают счётчик» — `unlock` без `lock` не снимает чужую блокировку; это сценарий размонтирования BaseImage без зума.
- **Статус:** Исправлено. Прямого теста «mount/unmount BaseImage при открытой модалке» нет: сценарий покрыт на уровне useScrollLock.

### A2. P2

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| FU-4 | BaseFileUpload | `useFileUploadState.ts:52-67` | (а) выбрано больше файлов, чем осталось мест → лишние молча отброшены; `slice` выполняется до валидации: `maxCount=2`, `[bad.exe, bad2.exe, ok.png]`, `accept="image/*"` → `ok.png` потерян без ошибки. (б) два добавления подряд во время чтения FileReader → итог больше maxCount | Предложено: сначала валидировать, потом ограничивать с ошибкой; резервировать слоты синхронно или ставить `addFiles` в очередь. Проверка — unit с отложенным превью | Не исправлено — не входило в объём этапа |
| FU-5 | BaseFileUpload | `BaseFileUpload.vue:191-194,239-245` | `focus()` фокусирует `div` без tabindex (ничего не делает); `validate()` = `!props.error`; `reset()` не очищает список; `isRequired` нет; тип expose не экспортирован | Предложено: focus на зону; `value: () => uploadedFiles.length`, `isRequired`; reset очищает; `defineExpose<FormFieldExpose & {clear}>` с экспортом типа | Не исправлено — новый контракт, не входило в объём |
| FU-6 | BaseFileUpload | `BaseFileUpload.vue:58-64,84-110,114-128` | Ошибки и статусы («Загружено», %) не озвучиваются; у кнопок удаления одинаковый `title`; `BaseProgress` без имени; `alt` превью дублирует имя файла | Предложено: `role="alert"`/`aria-live="polite"`, `aria-label="Удалить {name}"`, передавать в BaseProgress `ariaLabel` с именем файла, `alt=""`, `aria-describedby` у зоны | Не исправлено — не входило в объём. После правки группы display у BaseProgress есть общее имя «Прогресс», но не имя файла |
| FU-7 | BaseFileUpload | `BaseFileUpload.vue:28-35,228-230`, `useFileUploadState.ts:130-135`, `.style.scss:20-23` | disabled защищён только CSS → программный или синтетический drop добавляет файлы, фокус попадает в отключённую зону | Вместе с FU-1: ранний выход в `triggerUpload`, drop и dragover; `tabindex=-1`, `aria-disabled`. Тесты: `BaseFileUpload.integration.spec.ts` › «не принимает перетаскиваемые файлы и не открывает выбор файла», «отключённая зона загрузки исключена из порядка табуляции» (оба падали до исправления) | Исправлено. Проверка стоит в компоненте, `useFileUploadState.handleDrop` про disabled не знает |
| FU-13 / CHAT-11 | fileUtils (`downloadFile`) | `fileUtils.ts:140-148` ← `useChatActions.ts:41` | URL вложения из данных чата уходит в `<a href download target=_blank>.click()` без проверки схемы (`javascript:`); `rel` не задан; для cross-origin `download` игнорируется | Координатор добавил `isSafeUrl(url, DOWNLOAD_PROTOCOLS)`: http/https/blob/data и относительные, иначе `console.warn` и выход. Тесты `fileUtils.spec.ts` › «downloadFile»: «не переходит по javascript: URL из данных вложения» (не запускалось, по коду HEAD упал бы), «разрешает blob: URL локально созданного файла», «кликает по временной ссылке с download для безопасного URL и удаляет её»; `urlUtils.spec.ts` › «для скачивания допускает blob: и data:, но не javascript:» | Частично — нет `rel="noopener noreferrer"` (современные браузеры подразумевают noopener); cross-origin файл откроется, а не скачается; об отказе ничего не сообщается: функция возвращает `void`, а `useChatActions` всё равно эмитит `download-file` |
| IMG-6 | BaseImageZoom | `BaseImageZoom.vue:74-83,105-119`, `useZoomMinimap.ts:76-84`, `useImageZoom.ts:56-82` | Pan только мышью через миникарту; при `showMinimap:false` и scale>1 края не увидеть; touch и pinch нет; clamp и миникарта не учитывают поворот | Предложено: pointer events с `setPointerCapture`, `touch-action:none`, pinch, стрелки для pan, учёт поворота. Проверка — Playwright | Не исправлено — большой объём, нужен браузер |
| IMG-8 | useImageZoom | `useImageZoom.ts:154-157` | `deltaY===0` (горизонтальный свайп тачпада) → `zoomOut`; каждое событие wheel даёт полный шаг 0.25; зум не к курсору | Предложено: игнорировать `deltaY===0`, накапливать дельту, зумить к курсору. Unit `handleWheel({deltaY:0})` | Не исправлено — не входило в объём |
| IMG-9 | BaseImage | `BaseImage.vue:74`, `imageUtils.ts:5` | `src` undefined или null → TypeError в computed; пустая строка (BaseSlider подставляет её, когда нет `item.poster`) → ошибка вместо плейсхолдера | Предложено: `src ?? ''`, при пустом src плейсхолдер без запроса; unit на `src: undefined` | Не исправлено. По коду падение по умолчанию ушло побочно (IMG-2: `isExternalImage` не вызывается, `buildFormatSrc` проверяет `!src`), но теста нет. С `srcWidth` по-прежнему падает (`buildOptimizedSrc` → `src.includes`), пустая строка — как было |
| IMG-10 | useImageZoom | `useImageZoom.ts:163-171,194-197` | `document keydown` и `window resize` навешиваются у каждого BaseImage, включая аватары, даже без зума; Esc при зуме внутри BaseModal закрывает и зум, и модалку | Предложено: слушатели только пока зум открыт, keydown на оверлее, общий стек Escape | Не исправлено — сквозная проблема useEscapeKey (стека нет, useEscapeKey не менялся) |
| IMG-11 | BaseImage | `BaseImage.vue:21-28` | В состоянии ошибки `<picture>` удаляется вместе с `alt`, эмодзи «🖼️» зачитывается | Предложено: `role="img"` и `aria-label` у блока ошибки, эмодзи `aria-hidden`; при `alt=""` блок скрыть | Не исправлено — не входило в объём |
| IMG-12 | imageUtils, useImageState | `imageUtils.ts:9-16,26-31`, `useImageState.ts:78-82` | `replaceExtension` брал точку из домена (`images.unsplash.com/photo` → `images.unsplash.webp`); `buildSrcset` при существующем `?` даёт `img.jpg?v=1?w=400`; `sizes` для строковой ширины — `'100%px'`; `//cdn` и `HTTPS://` считаются локальными | `replaceExtension` исправлен в рамках IMG-2, тесты `imageUtils.spec.ts` — см. IMG-2 | Частично — `buildSrcset`, `sizes` и `isExternalImage` (экспортируется, в компоненте больше не используется) не исправлены |
| AVA-1 | BaseAvatar | `BaseAvatar.vue:2-6`, `BaseAvatar.style.scss:13-31` | Корень — `div @click` без tabindex, роли и Enter/Space → клик с клавиатуры невозможен; hover-`scale(1.1)` есть и у некликабельных | Предложено: при `onClick` рендерить `<button type="button">`, hover — только у интерактивного | Не исправлено — не входило в объём |
| AVA-2 | BaseAvatar | `BaseAvatar.vue:9-27,40-45` | `name` не даёт доступного имени; `alt` по умолчанию `''`; инициалы читаются по буквам; «онлайн» передаётся только цветом | Предложено: `alt`, а при пустом — `name`; инициалы `aria-hidden`, `role="img"` с `aria-label`, скрытый текст «в сети» | Не исправлено — не входило в объём |
| ICON-2 | BaseIcon, useIcon | `useIcon.ts:13-19`, `BaseIcon.types.ts:8` | `getIconNames()` ищет `svg[href]`/`link[href]` → в приложении всегда `[]`; `name: string` без union, опечатка молча даёт пустую иконку | Предложено: генерировать `ICON_NAMES`/`IconName` при сборке, dev-предупреждение, `getIconNames` по списку | Не исправлено — затрагивает сборку и типы |
| SLD-11 (pickers) / IMG-3 (побочное) | BaseSlider (useSwipe) → зум BaseImage | `useSwipe.ts:113-126` (mouseup не гасит следующий click); `BaseSlider.vue:60` | Проявилось после IMG-3 (`isZoomable` заработал): перетаскивание слайда мышью заканчивается click по `<img>` → открывается зум. Была гипотезой (A4), подтверждена тестом | Координатор: `useSwipe.ts` — `onClickCapture` гасит один click после перетаскивания дальше 5 px (признак сбрасывается новым mousedown или после текущей задачи); `useSlider` пробрасывает его, `BaseSlider.vue` вешает `@click.capture` на viewport. Тесты: `useSwipe.spec.ts` › describe «onClickCapture» (6 тестов); `BaseImage.integration.spec.ts` › «перетаскивание слайда мышью не открывает зум: click после drag гасится»; падали без правки: да (временный откат) | Исправлено. Основная запись — pickers (SLD-11, P2) |

### A3. P3

| ID | Компонент | Где (HEAD) | Условие → последствие | Исправление / проверка | Статус |
|---|---|---|---|---|---|
| FU-8 | fileUtils | `fileUtils.ts:96-123` | Висячая запятая в `accept` → пустой токен принимает файл с пустым MIME (`evil.exe`, `type=''`); `.tar.gz` не совпадает; `*/*` отклоняет всё; подсказка `IMAGE/*`; тексты ошибок захардкожены | Предложено: фильтровать пустые токены, сравнивать по суффиксу, `*/*`, тексты в `UI_TEXT`; unit | Не исправлено |
| FU-10 | BaseFileUpload | `BaseFileUpload.vue:53-64,161`, `useFileUploadState.ts:115,137-140`, `fileUtils.ts:19-45,126-137` | `emptyText` и слот `default` не используются; `allowPreview=false` выключает только зум; `revokeObjectURL` вызывается для data:-URL; FileReader после unmount добавляет элемент и запускает `setInterval`; публичный неиспользуемый `getFileIcon` | Предложено: реализовать или удалить; проверять размонтирование после `await`; unit `vi.getTimerCount()===0` | Не исправлено |
| FU-11 | useFileUploadState | `useFileUploadState.ts:54-61` | «Максимум файлов» дублируется при каждой попытке; remove ошибку не снимает | Предложено: ошибки заменять, а не дописывать | Не исправлено. В одиночном режиме ошибки теперь сбрасываются при каждом выборе (побочно FU-3); множественный — как было |
| FU-12 | BaseFileUpload | `BaseFileUpload.vue:64`, `fileUtils.ts:126-137` | Превью — base64 всего файла в реактивном состоянии; `:zoom-config="{…}"` создаёт новый объект на каждый рендер, и тик прогресса раз в 200 мс перерисовывает все превью | Предложено: `URL.createObjectURL` с revoke при remove/замене/unmount; `zoomConfig` в computed | Не исправлено. Влияние на производительность — гипотеза (A4) |
| FU-14 | README | `README.md:919` | Пример `handleFiles(files: FileList)`, а событие отдаёт `File[]` | README исправлен: `handleFiles(files: File[])`, описаны `change` (весь список, в одиночном режиме — замена), `accept`, `max-size` и событие `error`. Проверка: vue-tsc strictTemplates по примерам README: проверка примеров README (REPORT.md §5) (HEAD — TS2322, текущий — без ошибок) | Исправлено (README) |
| IMG-13 | useImageState | `useImageState.ts:25-43` | При `aspectRatio` игнорируются `width/height`; плейсхолдер 16:9 с `min-height:120px` снимается после загрузки — сдвиг вёрстки (CLS) | Предложено: `width` вместе с `aspect-ratio`; одинаковые размеры до и после загрузки | Не исправлено |
| IMG-14 | useImageGallery, BaseImage | `useImageGallery.ts:9-17`, `BaseImage.vue:173-178` | Индекс не ограничивается при сокращении `gallery` (счётчик «3 / 2»); зум показывает исходный `src` вместо fallback; `src` вне галереи открывает первый элемент | Предложено: clamp индекса в `watch`, `currentSrc` в зуме | Не исправлено |
| IMG-15 | BaseImage | `BaseImage.vue:2-14` (корень), props | `$attrs` уходят на корень, а не на `<img>`: `crossorigin`, `fetchpriority`, `referrerpolicy` не задать; нет expose `openZoom/closeZoom` и событий open/close; `zoom` эмитится без изменения масштаба; `variant` не используется | Предложено: атрибуты на `<img>`, `defineExpose`, удалить `variant` | Не исправлено |
| IMG-16 | useImageZoom | `useImageZoom.ts:12,28-30,119-139` | `zoomConfig` не валидируется: `minScale>maxScale`, `zoomStep<=0`, NaN → `scale(NaN)`, «NaN%» | Предложено: нормализация в computed | Не исправлено |
| IMG-17 (новая) | BaseImage (story BaseTable) | `src/components/BaseTable/stories/BaseTable.stories.ts:1173` (story `WithImages`) | Та же ошибка, что в IMG-3: `:has-zoom="true"` уходит атрибутом, зум в демо не включается. Только Storybook, поэтому P3 | Координатор: `:has-zoom="true"` → `:zoom-config="{ hasZoom: true }"` (`BaseTable.stories.ts:1173`, в diff). Других `has-zoom` в `src` нет. Проверка — сборка Storybook | Исправлено (story; проверка — сборка Storybook) |
| AVA-3 | BaseAvatar | `BaseAvatar.vue:62-71` | `n[0]` берёт половину суррогатной пары (`'😀 Smile'` → `'\uD83DS'`); разбиение только по пробелу | Предложено: `trim().split(/\s+/)`, первая графема; unit | Не исправлено |
| ICON-3 | BaseIcon | `BaseIcon.vue:2`, `BaseIcon.style.scss:1-8` | Корень — блочный `div` (flex) внутри `<button>`/`<span>`: нарушает content model и ломает использование иконки в строке текста | Предложено: корень `span` с `inline-flex` или сразу `<svg>` | Не исправлено |
| ICON-4 | BaseIcon, icons | `icons/index.ts:1`, `constants/ui.ts:167`, `build/plugins/sprite.ts:24`, `README.md:31` | Три копии пути к спрайту; публичный `ICON_SOURCE_DIR`; двойная регистрация `createIconPlugin` и реэкспорт из `@composables`; опечатка `@ramses1385`; `BaseIcon.utils.spec.ts` дублирует `iconUtils.spec.ts` | Опечатка `@ramses1385` в README исправлена: раздел «Миграция на 2.0.0» заменён на «Изменения путей импорта (с 1.2.2)», везде `@ramzes1385`. Остальное не менялось: `ICON_SOURCE_DIR` в `icons/index.ts`, три копии пути, дубль spec на месте. Предложено: одна точка пути, убрать `ICON_SOURCE_DIR`, удалить дубль | Частично — исправлена только README-часть (опечатка) |
| ICON-5 | BaseIcon (stories) | `BaseIcon.stories.ts:6-8,190`; `:11-36` | Play `WithCustomClass` вызывал `expect` без импорта (ReferenceError); `AllIcons` показывает 24 иконки из 91 | Добавлен импорт `expect` из `storybook/test` (виден в diff) | Частично. Импорт не проверен: play-функции ничем не запускаются. Список AllIcons не исправлен |

### A4. Гипотезы (не подтверждены)
- **IMG-7 (P2):** клик по фону оверлея зума не закрывает его. Контейнер 100%×100% перекрывает оверлей, у `img` стоит `pointer-events:none`, поэтому целью клика всегда оказывается контейнер, и `@click.self` на оверлее не срабатывает (`BaseImageZoom.vue:6`, `BaseImage.style.scss:177-194`). Тест и story кликают прямо по оверлею и проблему маскируют. Проверка: Playwright, клик в точку фона.
- **FU-9 (P3):** drag&drop.
  - `dragleave` без счётчика вызывает мерцание над дочерними span.
  - Подсветка срабатывает и при перетаскивании текста или ссылок.
  - Папка приходит как файл 0/4096 Б (`useFileUploadState.ts:122-135`).

  Проверка: Playwright с DataTransfer.
- **FU-12 (влияние):** base64-превью и перерисовка раз в 200 мс заметно нагружают страницу. Проверка: профилирование в браузере (память, счётчик рендеров BaseImage).
- **FU-13 / CHAT-11 (браузерная часть):** что браузеры делали с `javascript:` + `download` + `target=_blank` до исправления; открытие cross-origin файла вместо скачивания. Проверка: Chrome, Firefox, Safari.
- **ICON-6 (P3):** `<link rel=preload as=image crossorigin=anonymous>` не совпадает по режиму с запросом `<use>`. Возможны двойная загрузка и предупреждение «preloaded but not used» (`build/plugins/sprite.ts:121-135`; касается только собственного приложения и Storybook). Проверка: DevTools Network.
- **AVA-4 (визуальная часть):** внутренний BaseImage приносит аватару рамку 1px, `border-radius:12px`, а во время загрузки — `min-height:120px` и пропорции 16:9. Проверка: визуальный снимок.
- **IMG-4 (остаток):** `aria-modal="true"` при фокусе, оставшемся на изображении под оверлеем, может запутать виртуальный курсор скринридера. Проверка: NVDA и VoiceOver.
- **FU-1 (побочное):** интерактивный контент в слоте `trigger` оказывается внутри `role="button"` (axe `nested-interactive`). Проверка: axe со слотом-кнопкой.

---

---

## Примечания к перепроверке
1. **Статус IMG-1 и ICON-1.** В отчёте исправлений оба «исправлен», по коду — частично:
   - IMG-1: `<img>` по-прежнему удаляется по таймауту, на медленной сети ошибка остаётся навсегда;
   - ICON-1: дефолтный путь прежний, README не обновлён (позже обновлён — п. 9), на подпуть `./icons.svg` теста нет.
2. **Неотслеживаемые файлы.**
   - `src/utils/urlUtils/` (`isSafeUrl`, `DOWNLOAD_PROTOCOLS`, `urlUtils.spec.ts`) в `git status` помечен `??` и в `git diff HEAD` не виден, а `fileUtils.ts` и `utils/index.ts` его импортируют. Если закоммитить без него, сломаются сборка и тесты.
   - То же с `src/composables/useFocusTrap/` (экспортируется из `composables/index.ts`) и `src/__tests__/packageBoundaries.spec.ts` — это файлы других групп.
3. **IMG-5 закрыт группой overlays** (отчёт overlays, п. 4; тест в `BaseModal.integration.spec.ts`). В отчёт этапа исправлений он не упомянут. Это не ошибка, а уточнение авторства.
4. **Названия тестов.** Отчёт называет тест «не принимает точку в домене/каталоге за расширение файла». В коде это два теста — «…в домене…» и «…в каталоге…», плюс не упомянутый «заменяет расширение в URL с доменом, каталогами с точкой и hash».
5. **FU-13 / CHAT-11.** В ревью это ГИПОТЕЗА. Отсутствие проверки схемы однозначно следует из кода HEAD (`fileUtils.ts:140-148`, безусловный `link.click()`), поэтому в реестре находка стоит как подтверждённая P2, а браузерная часть вынесена в A4. Приоритет не менялся.
6. **IMG-3.** В ревью было три места; при перепроверке найдено четвёртое — `BaseTable.stories.ts:1173`. Оно заведено как IMG-17 (P3, только демо).
7. **IMG-9.** Падение при `src=undefined` по умолчанию по коду больше не воспроизводится — это побочный эффект IMG-2. Отчёт этого не заявлял, теста нет, поэтому статус «Не исправлено».
8. **Не проверено запуском:**
   - исправления stories (play BaseImage, импорт `expect` в BaseIcon) — play-функции ничем не запускаются;
   - цифры прогонов из отчётов (passed/failed) — на этом этапе запуск запрещён.
9. **Обновление статусов (координатор), 26.09.** Изменено 4 статуса:
   - SLD-11 / IMG-3 (побочное): из гипотез (A4) в подтверждённые, P2, «Исправлено». Правка `useSwipe` `onClickCapture` + `@click.capture` на viewport BaseSlider; тесты `useSwipe.spec.ts` › «onClickCapture» (6) и `BaseImage.integration.spec.ts` › «перетаскивание слайда мышью не открывает зум: click после drag гасится». Основная запись — pickers.
   - IMG-17 (P3): «Не исправлено» → «Исправлено (story; проверка — сборка Storybook)». До правки порядка плагинов сборку Storybook ломал сам JSDoc с `<source type="…">` в `BaseImage.types.ts` (добавлен при IMG-2): docgen дописывался к исходнику SFC. Теперь `vue()` в `build/storybook/main.ts` стоит раньше `storybook:vue-docgen-plugin`.
   - FU-14 (P3): «Не исправлено» → «Исправлено (README)». Проверка — vue-tsc strictTemplates по примерам README (`проверка примеров README (REPORT.md §5)`).
   - ICON-4 (P3): «Не исправлено» → «Частично» — исправлена только опечатка `@ramses1385` в README.
   - Без смены статуса: ICON-1 (P0) остаётся «Частично». README-часть закрыта (разделы «Иконки → Спрайт» и «Быстрый старт», примеры проходят vue-tsc), дефолтный путь и тест подпути — нет. IMG-2 ссылается на README только как на условия — не менялся.
   - Docgen: находок про описания props в Docs в группе нет. Пометка матрицы «в argTypes нет `error`» (BaseFileUpload) могла быть следствием сломанного docgen. Перепроверить по сборке Storybook.
