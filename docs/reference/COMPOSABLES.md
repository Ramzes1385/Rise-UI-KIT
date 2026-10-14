# Composables

Composables кита импортируются из подпути `@ramzes1385/rise-ui-kit/composables` или как namespace `composables` из корня пакета (`import { composables } from '@ramzes1385/rise-ui-kit'`). Именованного экспорта composables из корня нет. Вызывайте их внутри `setup` / `<script setup>`: они подписываются на хуки жизненного цикла компонента. Сервисы всего приложения — `useToast`, `useOverlay`, `useConfirm`, `useLoadingBar`, `useColorMode`, `useLocale` — импортируются из корня пакета по имени (см. [README](../../README.md#публичный-api)).

## useDismissFocus

Перенос фокуса со скрываемого блока (объявление, окно согласия) на следующий элемент страницы, чтобы он не терялся в `body`.

```ts
import { useDismissFocus } from '@ramzes1385/rise-ui-kit/composables'

const rootRef = ref<HTMLElement | null>(null)
const { releaseFocus } = useDismissFocus({ elementRef: rootRef })
watch(isShown, shown => { if (!shown) releaseFocus() })
```

- `releaseFocus()` работает, только если фокус сейчас внутри блока: он переходит на следующий элемент после блока, достижимый по Tab (не скрытый `hidden` и `inert`); если такого нет, фокус снимается и уходит на `document.body`. Фокус вне блока не трогается.
- Вызывать до удаления блока из DOM (watcher с `flush: 'pre'` по умолчанию).

---

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

Компонент с `useClickOutside` становится слоем (см. [«Слои»](../../README.md#слои-окна-панели-и-подсказки) в README): нажатие мыши в слоях, открытых после него (вложенный список, меню в поповере), не считается нажатием снаружи. Реагирует на `mousedown`; `isCapture: true` — в фазе перехвата, раньше обработчиков на элементах.

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

Удерживает фокус внутри модального окна (используется в `BaseModal` и `BaseSlideover`): при активации переводит фокус внутрь (`[autofocus]` → первый фокусируемый элемент → сам контейнер), зацикливает Tab / Shift+Tab, а при деактивации или размонтировании возвращает фокус на элемент, с которого окно открыли. Необязательный `getLinkedElements: () => HTMLElement[]` — элементы вне контейнера, до которых тоже доходит Tab (подсвеченная цель `BaseTour`): обход по кругу — сначала контейнер, затем эти элементы.

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

## useHotkeys

Горячие клавиши на странице: `mod` — ⌘ на macOS и Ctrl на остальных системах, буквы и цифры сравниваются по физической клавише, поэтому `mod+k` работает и в русской раскладке. Слушатель снимается вместе с компонентом; нажатие, уже обработанное другим кодом (`preventDefault()`), и набор через IME пропускаются.

```ts
import { useHotkeys } from '@ramzes1385/rise-ui-kit/composables'

useHotkeys({ 'mod+k': openPalette, 'mod+shift+n': createTask, '?': showHelp }, { isEnabled: () => !isEditing.value })
```

- В полях ввода срабатывают только сочетания с Ctrl, ⌘ или Alt, чтобы одиночные клавиши («?», «/») не мешали печатать; `isAllowedInFields: true` — все.
- `isEnabled` включает и выключает сочетания, `target` — где слушать клавиши (по умолчанию `window`).
- `parseHotkey`, `matchesHotkey` и `isMacPlatform` — для своих обработчиков; сочетание для показа — `BaseKbd`.

---

## useSelect и useSelectKeys

Логика своего списка выбора по образцу APG Select-Only Combobox — на ней BaseSelect и выбор страны в BasePhoneInput. `useSelect` хранит состояние: открыт ли список, активную опцию (для `aria-activedescendant`), выбор, поиск по буквам; `useSelectKeys` — клавиатура элемента `role="combobox"`: Enter и пробел открывают список или выбирают активную опцию, стрелки открывают и двигают, Home/End — первая и последняя опция, Tab закрывает, буквы ищут опцию по началу подписи.

```ts
import { useSelect, useSelectKeys } from '@ramzes1385/rise-ui-kit/composables'

const select = useSelect({ props, emit, onBlur })
const { handleTriggerKeydown } = useSelectKeys({ select, isDisabled: () => Boolean(props.isDisabled) })
// <div role="combobox" :aria-expanded="select.isOpen.value" @keydown="handleTriggerKeydown">…</div>
```

---

## useRemoteSuggestions

Подсказки с сервера для поля с автодополнением: пауза после ввода (`debounce`), минимальная длина запроса (`minChars`), отмена прежнего запроса через `AbortSignal` — ответ устаревшего запроса не попадает в список, ошибка источника очищает список. На нём BaseAddressInput и BaseDadataInput.

```ts
import { useRemoteSuggestions } from '@ramzes1385/rise-ui-kit/composables'

const { suggestions, isLoading, search, cancel } = useRemoteSuggestions({
	source: () => (query, { signal }) => fetch(`/api/cities?q=${query}`, { signal }).then(r => r.json()),
	minChars: () => 2,
	debounce: () => 300,
})
// <BaseAutocomplete is-remote :is-loading="isLoading" :options="…" @search="search" />
```

---

## useStructuredData

SEO-разметка schema.org у компонента: проп `seo` (`SeoComponentProps`) → строка JSON-LD для `<script type="application/ld+json">`. Какие компоненты и как проверить разметку — docs/reference/SEO.md.

- `useStructuredData(component, getSeo, build)`: `component` — имя в предупреждении, `getSeo` — значение пропа `seo`, `build({ url })` — поля schema.org из пропсов (`null` — описывать нечего). Возвращает `{ structuredData }` — пустая строка, когда разметка выключена.
- `seo`: `false` или нет пропа — разметки нет (по умолчанию); `true` — поля из пропсов; `{ data, baseUrl }` — ещё и свои поля поверх собранных (кастомное SEO) и адрес сайта для относительных ссылок. Слияние — `mergeStructuredData` (docs/reference/UTILS.md).
- В разработке (`process.env.NODE_ENV !== 'production'`) нехватка обязательных полей Google и schema.org — одно предупреждение `[rise-ui-kit]` на набор полей, без исключений.
- Разметка одинакова на сервере и в браузере: SSR выводит тег сразу, гидратация его не меняет.

```vue
<template>
	<section>
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />
	</section>
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
useExpandTransition
useFlyoutPosition
useFocusTrap
useHotkeys
useIcon
useImageZoom
useInputMask
useLayer
useLayerIndex
useListNavigation
useLoadingBar
useMotion
usePadding
usePasswordVisibility
usePopup
useReducedMotion
useRemoteSuggestions
useScrollLock
useScrollableRegion
useSelect
useSelectKeys
useSizeScale
useSlider
useSlidingIndicator
useSortable
useStructuredData
useSwipe
useTableData
useTeleportTarget
useToolbarKeyboard
useTriggerAttributes
useTween
useUi
useVariant
useVirtualList
```

---

## useScrollableRegion и useExpandTransition (scroll-expand)

### useScrollableRegion

Признак «область прокручивается» — чтобы дать `tabindex="0"` только прокручиваемой области (WCAG 2.1.1, правило axe `scrollable-region-focusable`). На нём тела BaseModal, BaseSlideover, BaseDrawer, обёртка BaseTable, панели BaseSplitter, BaseHeatmap и список стран BasePhoneInput.

```ts
import { useScrollableRegion } from '@ramzes1385/rise-ui-kit/composables'

const wrapperRef = ref<HTMLElement | null>(null)
const { isScrollable, update } = useScrollableRegion({ elementRef: wrapperRef, orientation: 'both' })
// <div ref="wrapperRef" :tabindex="isScrollable ? 0 : undefined">…</div>
```

- `orientation`: `vertical` (по умолчанию) — содержимое выше области, `horizontal` — шире её, `both` — прокрутка хотя бы по одной оси.
- Признак пересчитывается при появлении элемента, при изменении размера самого элемента и его прямых потомков (ResizeObserver) и при изменении разметки внутри — добавлены или убраны узлы, изменился текст (MutationObserver). Так видно и рост, и уменьшение содержимого при неизменном размере области.
- `update()` — ручной пересчёт для изменений, которых наблюдатели не видят (например, стили глубоко вложенного элемента).

### useExpandTransition

JS-хуки `<Transition :css="false">` для раскрытия по высоте (от 0 до `scrollHeight` и обратно, с прозрачностью). На нём раскрытие строк BaseTable.

```ts
import { useExpandTransition } from '@ramzes1385/rise-ui-kit/composables'

const expand = useExpandTransition({ duration: 200 })
// <Transition :css="false" @before-enter="expand.onBeforeEnter" @enter="expand.onEnter" @after-enter="expand.onAfterEnter"
//   @before-leave="expand.onBeforeLeave" @leave="expand.onLeave" @after-leave="expand.onAfterLeave">
```

- `duration` — мс; по умолчанию — токен `--rise-duration-slow` элемента (300 мс в пресете `standard`, пресет `data-rise-motion` действует). Кривые — `--rise-ease-emphasized` (высота) и `--rise-ease` (прозрачность). `0`, системная настройка «уменьшить движение», пресет `none` и `reducedMotion: 'always'` — без анимации: элемент сразу в конечном состоянии.
- Переход завершается по `transitionend` самого элемента (всплывшие от потомков не считаются) или по таймеру-страховке через `duration` + 50 мс, если событие не пришло. Новый переход того же элемента (свернули во время раскрытия) отменяет ожидание прежнего.

## useLoadingBar

Полоса загрузки вверху страницы при переходах и долгих запросах; показывает её `BaseApp`. Импорт — из корня пакета по имени, как `useToast`.

```ts
import { useLoadingBar } from '@ramzes1385/rise-ui-kit'

const loadingBar = useLoadingBar()
router.beforeEach(() => loadingBar.start())
router.afterEach(() => loadingBar.finish())
router.onError(() => loadingBar.error())
```

| Поле | Что |
|---|---|
| `start()` | начать загрузку: полоса появляется с 10 % и растёт до 90 %; во время загрузки повторный вызов ничего не меняет |
| `finish()` | заполнить полосу и убрать её через 400 мс; без начатой загрузки ничего не делает |
| `error()` | то же в цвете ошибки (`--rise-error`) |
| `status` | `idle`, `loading`, `done`, `error` (`LOADING_BAR_STATUSES`) |
| `progress` | заполнение от 0 до 1 — оценочное |
| `isLoading` | `status === 'loading'`: для `aria-busy` основной области |

- Хранилище одно на страницу и работает до монтирования `BaseApp`: первая навигация роутера идёт раньше монтирования. На сервере (SSR) `start` ничего не делает и не ставит таймеров.
- `createLoadingBarStore()` — отдельное хранилище для тестов и своей полосы (его `BaseApp` не показывает); `reset()` у такого хранилища сбрасывает полосу сразу. Хранилище страницы и тайминги наружу не экспортируются.
- Полоса одна на страницу, и `BaseApp` на странице тоже должен быть один: у второго `BaseApp` полоса нарисуется ещё раз.
- Доступность: `role="progressbar"` без `aria-valuenow` (неопределённый ход) с именем из словаря (`UI_ARIA.LOADING_BAR`) или `loadingBar.label`; шаги не объявляются. При `prefers-reduced-motion` полоса неподвижна и видна во всю ширину.

---

## useSortable (задача new-list)

Перестановка элементов мышью и с клавиатуры — общая основа BaseKanban и BaseList. Composable ведёт захват, шаги, бросок и отмену; порядок и черновик хранит вызывающий код, место (`TPlace`) — любое: индекс списка, `{ columnId, index }` колонки.

```ts
const sortable = useSortable<Item, number>({
	rootRef,
	itemId: item => item.id,
	isDisabled: () => props.isDisabled,
	locate: id => shown.value.findIndex(item => item.id === id),
	isSamePlace: (a, b) => a === b,
	stepPlace: (id, key) => nextIndex(id, key),
	dropPlace: (point, id) => indexUnder(point, id),
	itemElement: id => rowElement(id),
	onStart: () => (draft.value = [...shown.value]),
	onPreview: (id, index) => (draft.value = moveTo(shown.value, id, index)),
	onDrop: (move, done) => commit(move, done),
	onCancel: (id, done) => cancel(id, done),
	onAnnounce: (message, id) => say(message, id),
	focusItem: id => focus(id),
	flip: { source: () => shown.value, items: { selector: '[data-id]', key: 'id' } },
})
```

- Клавиатура (`grab`, `handleGrabbedKeydown`): пробел берёт, стрелки (`moveKeys`) двигают, пробел или Enter кладут, Escape отменяет, Tab отменяет и уводит фокус; `onAnnounce('PICKED' | 'MOVED')` — объявить шаг. Это клавиатурная альтернатива перетаскиванию (WCAG 2.5.7, 2.1.1).
- Мышь и перо (`handlePointerDown`): порог 5px, «призрак» (`drag`, `ghostRef`, `ghostStyle`), посадка на место, Escape отменяет; касание не перехватывается. `consumeClick()` — пропустить клик сразу после перетаскивания.
- `flip` — элементы плавно едут на новое место, контейнеры меняют высоту. Длительность — `flip.duration` или токен `--rise-duration` области, кривая — `--rise-ease-emphasized` (`useMotion` по `rootRef`); пресет `none`, `prefers-reduced-motion` и `reducedMotion: 'always'` — без анимации.

---

## useReducedMotion

Задача small-fixes-7c. Реактивный признак системной настройки «уменьшить движение» (`prefers-reduced-motion: reduce`) — для анимаций в JS, плавной прокрутки и эффектов за указателем. CSS-анимации кита гасит сам (`motion-safe`, токены `--rise-duration*`).

```ts
import { useReducedMotion } from '@ramzes1385/rise-ui-kit/composables'

const isReducedMotion = useReducedMotion()

function scrollToTop(): void {
	window.scrollTo({ top: 0, behavior: isReducedMotion.value ? 'auto' : 'smooth' })
}
```

- Возвращает `Readonly<Ref<boolean>>`. До монтирования и без `matchMedia` (SSR) — `false`; после монтирования — текущее значение, дальше меняется вместе с настройкой. Подписка снимается при размонтировании.
- Вызывается в `setup` компонента. Им пользуются BaseAvatar (персонаж), BaseBackTop, BaseMarquee и окно «Поделиться» BaseMediaPlayer.

---

## useCryptoPro (new-cryptopro)

Адаптер КриптоПро ЭЦП Browser plug-in: диагностика, сертификаты пользователя, присоединённая и отсоединённая подпись CAdES-BES. Без npm-пакетов, только асинхронный API плагина (`cadesplugin.CreateObjectAsync`, `propset_*`, `getLastError`).

Что нужно пользователю: КриптоПро CSP, КриптоПро ЭЦП Browser plug-in и расширение браузера, сертификат с закрытым ключом в личном хранилище. Что нужно приложению: скрипт `cadesplugin_api.js` с сайта КриптоПро — кит его не содержит. Приложение подключает скрипт само или передаёт его адрес в `scriptUrl`: тогда composable загрузит его при первой проверке.

```ts
import { useCryptoPro } from '@ramzes1385/rise-ui-kit/composables'

const { status, isReady, certificates, error, isLoading, isSigning, check, getCertificates, sign } = useCryptoPro({
	scriptUrl: '/vendor/cadesplugin_api.js',
})

await getCertificates() // certificates.value: [{ thumbprint, name, organization, inn, innLe, ogrn, ogrnip, snils, validTo, hasPrivateKey, … }]
const signature = await sign(file, { thumbprint: certificates.value[0].thumbprint, detached: true }) // Base64 без переносов
```

- Настройки: `scriptUrl` (строка, ref или геттер), `timeout` — ожидание скрипта и плагина, мс (30000), `checkOnMount` — диагностика после монтирования (`true`). До `onMounted` composable ничего не трогает — безопасен для SSR.
- `status` (только чтение): `state` — `idle`, `checking`, `ready`, `error`; `steps` — шаги демостраницы КриптоПро по порядку: `extension`, `plugin`, `csp`, `objects`, у каждого `pending`, `checking`, `ok` или `error`; `pluginVersion`, `cspVersion`, `cspName`; `error` — ошибка диагностики. `check()` — повторная диагностика, возвращает `true` или `false`; параллельные вызовы ждут одну проверку.
- `getCertificates()` — личное хранилище текущего пользователя (`CAPICOM_CURRENT_USER_STORE`, `My`). Субъект разбирается по русским, латинским и OID-именам: `ИНН`/`INN`/`1.2.643.3.131.1.1`, `ИНН ЮЛ`/`INNLE`/`1.2.643.100.4`, `ОГРН`, `ОГРНИП`, `СНИЛС`; ФИО — `SN` + `G`, без них `CN`. Пустое хранилище — пустой список и `error` с кодом `noCertificates`.
- `sign(data, { thumbprint, detached })`: `data` — строка (подписываются её байты UTF-8, а не UTF-16, как при `ContentEncoding` по умолчанию), `Blob`/`File`, `ArrayBuffer` или типизированный массив. Данные уходят в плагин Base64 с `CADESCOM_BASE64_TO_BINARY`, подпись — `SignCades(…, CADESCOM_CADES_BES, detached)` с проверкой сертификата (`CheckCertificate`).
- Ошибки — `CryptoProError`: `code` (`noScript`, `scriptFailed`, `noExtension`, `noPlugin`, `noCsp`, `objectsFailed`, `noCertificates`, `certificateNotFound`, `noPrivateKey`, `certificateInvalid`, `cancelled`, `unknown`), `message` — из раздела словаря `cryptopro`, `detail` — текст плагина с кодом вида `(0x8010006E)`. Последняя ошибка сертификатов и подписи — в `error`.
- Эмуляция плагина — внутренняя, в публичный вход пакета не входит (как эмуляция Cast у BaseMediaPlayer): ей пользуются тесты и истории кита по пути `src/composables/crypto/useCryptoPro/emulation`. Сценарии: `ready`, `noExtension`, `noPlugin`, `noCsp`, `noCertificates`, `cancel`; подпись эмуляции фиктивная.
- Как проверить подпись в приложении — только с настоящим плагином: КриптоПро CSP, ЭЦП Browser plug-in и расширение браузера, тестовый сертификат (например, с тестового УЦ КриптоПро) в личном хранилище. Откройте страницу с `useCryptoPro`, дождитесь `status.state === 'ready'`, вызовите `getCertificates()` и `sign()`; подпись проверьте на странице проверки подписи КриптоПро или в КриптоАРМ. В модульных тестах приложения подменяйте `window.cadesplugin` своим объектом с нужными методами или мокайте `useCryptoPro` целиком.
- Код работы с плагином (диагностика, сертификаты, подпись) — отдельный чанк, который загружается динамически при первой проверке: приложение, которое только импортирует вход `composables`, его не скачивает.
- Ограничения: настоящую подпись CI не проверяет (нужны CSP, плагин и ключ); подпись больших файлов, хэш, штамп времени и проверка подписи — компонент BaseCryptoProSign (new-cryptopro-ui).

## useTheme, applyTheme (задача theme-api)

```ts
import { applyTheme, createTheme, useTheme } from '@ramzes1385/rise-ui-kit'

applyTheme(createTheme({ name: 'brand', primary: '#0f766e' }))            // <html data-rise-theme="brand" data-theme="system">
applyTheme(createTheme({ name: 'promo', primary: '#7c3aed' }), { target: promoSection, nonce })

const { theme, themes, css, setTheme, configure } = useTheme()
setTheme('corporate')                // пресет по имени; false — имя неизвестно
setTheme(createTheme({ … }))         // своя тема: регистрируется и выбирается
```

- `applyTheme(theme, { target?, nonce? })`: `<style data-rise-theme-style="имя">` в `<head>` — один на тему, повторный вызов обновляет его; CSP `nonce`. На `target` (по умолчанию `<html>`) — `data-rise-theme`, а если нет `data-theme` — режим ближайшего предка с `data-theme` или `system`. Без `document` (SSR) ничего не делает.
- `useTheme(options?)` — одно общее управление: `theme` (имя текущей темы или `null`, только чтение), `themes` (пресеты и зарегистрированные), `css` (CSS текущей темы — для `<style>` при SSR), `setTheme`, `configure({ themes, nonce })`. `themes` и `nonce` из `options` учитываются при каждом вызове, `target` — при первом. `createThemeController(options)` — отдельное управление (тема части интерфейса, тесты).
- Плагин: `createUiKitPlugin({ theme: 'corporate' | Theme, themes: Theme[], themeNonce })` настраивает то же общее управление и ставит тему при установке.
---

## useMotion (motion-chart)

Настройки движения для анимаций в JS: те же токены `--rise-duration*`, что у CSS. Минимальная версия по решению «Движение» (2.4); пресеты (`preset`) и кривые (`easing(name)`) добавит задача motion-core, не меняя этих полей.
---

## useMotion (motion-core)

Пресет движения и токены длительностей и кривых для JS-анимаций (Web Animations API, твины, таймеры). Решение research-motion: CSS и JS берут длительности из одних токенов, поэтому пресет `data-rise-motion` на области действует и на JS.

```ts
import { useMotion } from '@ramzes1385/rise-ui-kit/composables'

const root = useTemplateRef<HTMLElement>('root')
const motion = useMotion(root)

const ms = motion.duration('xslow') // 500 в пресете standard, 0 — при выключенном движении
```

- `isReduced` (`ComputedRef<boolean>`) — системная настройка «уменьшить движение» или пресет `data-rise-motion="none"` у элемента или предка (пресет читается при монтировании).
- `duration(name)` — миллисекунды из `getComputedStyle` элемента (без элемента — корня документа): `fast` → `--rise-duration-fast`, `base` (по умолчанию) → `--rise-duration`, `slow`, `xslow`. Без токена — значения пресета `standard` (150, 200, 300, 500); меньше 1 мс (`0.01ms` при «уменьшить движение») и при `isReduced` — `0`.
- Вызывается в `setup`; поверх `useReducedMotion`, который остаётся.

---

## useTween (motion-chart)

Плавно ведёт число или массив чисел к новому значению через `requestAnimationFrame`. Для чисел, данных графиков и всего, что CSS не анимирует.

```ts
import { useTween } from '@ramzes1385/rise-ui-kit/composables'

const { value, isRunning, replay, stop } = useTween(() => props.total, { from: 0, duration: 'xslow' })
// value.value — промежуточное число во время перехода
```

- Источник — ref, геттер или значение: `number` или `readonly number[]`. Новое значение во время перехода продолжает путь с текущего промежуточного (без рывка).
- Опции: `from` — начальное значение появления (после монтирования твин идёт от него; до монтирования и на сервере — значение источника), `duration` — имя длительности `useMotion` (`xslow`), `easing` — функция `0…1 → 0…1` (по умолчанию замедление к концу без перелёта), `target` — элемент, чьи токены и пресет учитываются, `enabled` — `false` выключает переходы.
- Сразу конечное значение: «уменьшить движение», пресет `none`, `enabled: false`, нулевая длительность, массивы разной длины. Нечисловые элементы массива (`NaN` — пропуск) сразу принимают конечное значение.
- `replay(from?)` — повторить переход к источнику (от `from` или `options.from`), `stop()` — остановить на текущем значении; кадр отменяется при размонтировании.
- Им пользуется BaseChart (значения, места столбиков и шкала Y).

const root = ref<HTMLElement | null>(null)
const motion = useMotion(root)

function pulse(el: HTMLElement): void {
	if (motion.isReduced.value) return
	el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], {
		duration: motion.duration('slow'),
		easing: motion.easing('spring'),
	})
}
```

- `useMotion(target?)` — `target`: ref, геттер или элемент; без него — `<html>`. Вызывается в `setup`.
- `preset` — пресет ближайшего предка с `data-rise-motion` (или самого элемента): `none`, `subtle`, `standard`, `expressive`; без атрибута — `standard`. Меняется вместе с атрибутом (один MutationObserver на все экземпляры).
- `isReduced` — движение выключено: системное «уменьшить движение», пресет `none` или опция плагина `reducedMotion: 'always'`. Анимацию нужно пропустить и сразу поставить конечное состояние.
- `duration(name = 'base')` — мс из токена: `fast` (`--rise-duration-fast`), `base` (`--rise-duration`), `slow`, `xslow`; при `isReduced` — `0`. `easing(name = 'base')` — значение кривой: `base` (`--rise-ease`), `out`, `in`, `emphasized`, `spring`.
- Без стилей кита (SSR, тесты в jsdom без CSS) — значения пресета из таблицы, совпадающей с `_motion.scss` (это проверяет тест).
- Для кода вне `setup` (хуки `<Transition>`, обработчики): `readMotionPreset(el?)`, `isMotionReduced(el?)`, `readMotionDuration(el?, name?)`, `readMotionEasing(el?, name?)`; атрибуты — константы `MOTION_ATTRIBUTE`, `REDUCED_MOTION_ATTRIBUTE`.
- `useReducedMotion` остаётся: он отвечает только за системную настройку.

---

## useSlidingIndicator (motion-core)

Один скользящий индикатор на контейнер (вкладки, сегменты, нижняя навигация, якоря, пагинация) вместо своего у каждого пункта: индикатор едет к активному пункту через `transform`, размер — ширина и высота абсолютного элемента, раскладку соседей он не трогает.

```ts
import { useSlidingIndicator } from '@ramzes1385/rise-ui-kit/composables'

const list = ref<HTMLElement | null>(null)
const indicator = useSlidingIndicator(list, () => tabs.findIndex(tab => tab.value === active.value))
```

```vue
<div ref="list" class="tabs" :style="indicator.style.value">
	<button v-for="tab in tabs" :key="tab.value" data-indicator-item>{{ tab.label }}</button>
	<span v-if="indicator.isVisible.value" class="tabs__indicator" :class="{ 'tabs__indicator--instant': indicator.isInstant.value }" />
</div>
```

```scss
.tabs {
	position: relative;
}

.tabs__indicator {
	@include sliding-indicator;
}
```

- Аргументы: контейнер (ref, геттер или элемент), индекс активного пункта (`null`, `undefined` или отрицательный — активного нет), `{ itemSelector }` — селектор пунктов, по умолчанию `[data-indicator-item]`.
- Возвращает `rect` (`{ x, y, width, height }` относительно контейнера с учётом прокрутки или `null`), `style` — CSS-переменные `--indicator-x/-y/-w/-h` для контейнера, `isVisible`, `isInstant` и `update()`.
- `isInstant` — первый замер и появление после скрытия: два кадра без перехода, чтобы индикатор не въезжал из угла. Миксин `sliding-indicator` снимает переход по модификатору `&--instant` (свой селектор — аргументом).
- Пересчёт — при смене индекса и контейнера и при изменении размеров контейнера или активного пункта (ResizeObserver); `update()` — для изменений, которых наблюдатель не видит.
- Длительность и кривая — токены `--rise-duration` и `--rise-ease-spring`: в `expressive` индикатор чуть перелетает цель, при «уменьшить движение» встаёт сразу.
## useUi и useInheritedThemeAttrs (theme-core)

### useUi

Классы частей компонента для пропа `ui`: БЭМ-класс кита, затем классы из `defaults.<BaseX>.ui` плагина, затем `props.ui` экземпляра — склейкой, не заменой. Вызывается в `model/` компонента; `props.ui` читается при каждом вызове, классы реактивны.

```ts
import { useUi } from '@composables/base/useUi'
import type { UiProp } from '@composables/base/useUi'

// types/BaseX.types.ts: ui?: UiProp<'header' | 'body'>
const ui = useUi(props, 'base-x')
ui('root') // 'base-x <плагин> <экземпляр>'
ui('body') // 'base-x__body …' — строка подходит и для :class, и для пропов-строк подкомпонентов
```

Имя компонента для плагина выводится из блока: `base-date-picker` → `defaults.BaseDatePicker.ui`. Проп `ui` не кладётся в `kitDefaults`.

### useInheritedThemeAttrs и readThemeAttrs

Тема области якоря для телепортированной панели: `{ 'data-theme'?, 'data-rise-theme'? }` ближайших предков (оба ищутся `closest` независимо), читается при открытии. На панели — `v-bind`. `useInheritedTheme` (только `data-theme`) оставлен для совместимости.

```ts
const themeAttrs = useInheritedThemeAttrs(() => wrapperRef.value, () => props.isOpen)
// <div class="panel" v-bind="themeAttrs">
readThemeAttrs(anchorEl) // { 'data-theme': 'dark', 'data-rise-theme': 'playful' }
```

## useToolbarKeyboard (table-audit)

Клавиатура панели инструментов по APG Toolbar. На нём BaseToolbar и тулбар BaseTable. Корень панели — элемент с `role="toolbar"` и именем.

```ts
import { useToolbarKeyboard } from '@ramzes1385/rise-ui-kit/composables'

const rootRef = ref<HTMLElement | null>(null)
const { handleKeydown, handleFocusin, focusItem } = useToolbarKeyboard({ rootRef })
// <div ref="rootRef" role="toolbar" aria-label="Форматирование" @keydown="handleKeydown" @focusin="handleFocusin">…</div>
```

- Управляющие элементы — кнопки, ссылки, поля, `[role="combobox"]` и всё с `tabindex`; отключённые, скрытые (`hidden`, `aria-hidden`, `inert`, `data-toolbar-skip`) и вложенные в другой элемент (кнопка внутри `combobox`) в обход не входят.
- Одна остановка Tab: текущий элемент получает `tabindex="0"`, остальные — `-1` (и `data-toolbar-item`); текущим становится сфокусированный. Разметка отслеживается MutationObserver (дети, `disabled`, `aria-disabled`, `hidden`, `inert`, `aria-hidden`, `data-toolbar-skip`); панель, появившаяся после монтирования (`v-if`), подхватывается, как только `rootRef` получит элемент.
- ← и → (при `orientation: () => 'vertical'` — ↑ и ↓), Home и End переносят фокус по кругу. В поле ввода стрелка уводит фокус, только когда каретка у края текста в сторону движения; в поле без каретки (`type="number"`, `email`) стрелки остаются за ним; Home и End в поле остаются за ним. События с `Ctrl`, `Alt`, `Meta` и уже обработанные (`defaultPrevented`) пропускаются.
- `focusItem(index)` — фокус на элемент по номеру (`-1` — последний), `sync()` — переставить `tabindex` вручную, `getItems()` — текущий список.
