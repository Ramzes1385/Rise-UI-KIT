# Composables

Composables кита импортируются из подпути `@ramzes1385/rise-ui-kit/composables` или как namespace `composables` из корня пакета (`import { composables } from '@ramzes1385/rise-ui-kit'`). Именованного экспорта composables из корня нет. Вызывайте их внутри `setup` / `<script setup>`: они подписываются на хуки жизненного цикла компонента. Сервисы всего приложения — `useToast`, `useOverlay`, `useConfirm`, `useColorMode`, `useLocale` — импортируются из корня пакета по имени (см. [README](../../README.md#публичный-api)).

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
usePadding
usePasswordVisibility
usePopup
useRemoteSuggestions
useScrollLock
useScrollableRegion
useSelect
useSelectKeys
useSizeScale
useSlider
useStructuredData
useSwipe
useTableData
useTeleportTarget
useTriggerAttributes
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

- `duration` — мс, по умолчанию 300. `0` и системная настройка `prefers-reduced-motion: reduce` — без анимации: элемент сразу в конечном состоянии.
- Переход завершается по `transitionend` самого элемента (всплывшие от потомков не считаются) или по таймеру-страховке через `duration` + 50 мс, если событие не пришло. Новый переход того же элемента (свернули во время раскрытия) отменяет ожидание прежнего.
