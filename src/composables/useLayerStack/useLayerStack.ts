/**
 * Composable: стек открытых слоёв — Escape и нажатие вне получает верхний слой, вложенные не закрывают родителя,
 * слой, открытый позже, отрисовывается выше
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ComputedRef } from 'vue'
import type { LayerEntry, LayerOptions } from './useLayerStack.types'

/** Зарегистрированные слои всех компонентов страницы */
const layers = new Set<LayerEntry>()
let nextOrder = 0

function openLayers(): LayerEntry[] {
	return [...layers].filter(layer => layer.isActive()).sort((a, b) => a.order - b.order)
}

/** Нажатие внутри слоя: путь события (`composedPath`) проходит через элемент слоя — и в Shadow DOM, и после удаления цели */
function contains(layer: LayerEntry, path: EventTarget[]): boolean {
	return layer.elements?.().some(element => element != null && path.includes(element)) ?? false
}

/**
 * Escape получает только верхний открытый слой с обработчиком: из окна с открытым списком
 * первое нажатие закрывает список, второе — окно. Событие, уже обработанное элементом
 * (`preventDefault`), и Escape, отменяющий ввод через IME (`isComposing`), слои не трогают.
 */
function handleKeydown(event: KeyboardEvent): void {
	if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return
	const top = openLayers()
		.reverse()
		.find(layer => layer.onEscape)
	top?.onEscape?.()
}

/**
 * Нажатие вне слоя: внутри считаются элементы самого слоя и всех слоёв, открытых после него.
 * Так список, открытый из поповера или окна, не закрывает их при выборе пункта.
 */
function handlePointerDown(event: MouseEvent, isCapture: boolean): void {
	const path = event.composedPath()
	const open = openLayers()
	open.forEach((layer, index) => {
		if (!layer.onPointerDownOutside || Boolean(layer.isCapture) !== isCapture) return
		const isInside = open.slice(index).some(candidate => contains(candidate, path))
		if (!isInside) layer.onPointerDownOutside(event)
	})
}

const handleCapture = (event: MouseEvent): void => handlePointerDown(event, true)
const handleBubble = (event: MouseEvent): void => handlePointerDown(event, false)

function attach(): void {
	document.addEventListener('keydown', handleKeydown)
	document.addEventListener('mousedown', handleCapture, true)
	document.addEventListener('mousedown', handleBubble)
}

function detach(): void {
	document.removeEventListener('keydown', handleKeydown)
	document.removeEventListener('mousedown', handleCapture, true)
	document.removeEventListener('mousedown', handleBubble)
}

/**
 * Регистрирует слой на время жизни компонента. Порядок слоёв — порядок открытия: `isActive`
 * отслеживается, и слой, ставший открытым позже, оказывается выше.
 *
 * @example
 * useLayer({
 *   isActive: () => props.isOpen,
 *   elements: () => [triggerRef.value, panelRef.value],
 *   onEscape: close,
 *   onPointerDownOutside: close,
 * })
 */
export function useLayer(options: LayerOptions): void {
	const entry: LayerEntry = { ...options, order: nextOrder++ }

	watch(options.isActive, isActive => {
		if (isActive) entry.order = nextOrder++
	})

	onMounted(() => {
		if (layers.size === 0) attach()
		layers.add(entry)
	})

	onBeforeUnmount(() => {
		layers.delete(entry)
		if (layers.size === 0) detach()
	})
}

/** Слои с z-index по порядку открытия */
const orderedLayers = new Set<LayerEntry>()
/** Счётчик изменений: место слоя пересчитывается, когда другой слой открылся, закрылся или размонтирован */
const orderVersion = ref(0)

/**
 * Место слоя среди открытых для z-index: `--rise-layer-index` = 1 + число открытых слоёв, открытых раньше.
 * Стили слоя: `z-index: calc(var(--rise-z-overlay) + var(--rise-layer-index, 0))`. Так окно, открытое из поповера,
 * оказывается над ним, а список в окне — над окном, независимо от порядка компонентов в DOM.
 *
 * @example
 * const layerStyle = useLayerIndex(() => props.isOpen)
 * // <div class="panel" :style="[panelStyle, layerStyle]">
 */
export function useLayerIndex(isActive: () => boolean): ComputedRef<Record<string, string>> {
	const entry: LayerEntry = { isActive, order: nextOrder++ }

	watch(isActive, active => {
		if (active) entry.order = nextOrder++
		orderVersion.value++
	})

	onMounted(() => {
		orderedLayers.add(entry)
		orderVersion.value++
	})

	onBeforeUnmount(() => {
		orderedLayers.delete(entry)
		orderVersion.value++
	})

	// Прежний объект, если место не изменилось: открытие и закрытие других слоёв не перерисовывают этот
	return computed<Record<string, string>>(previous => {
		// Зависимость от счётчика: состав и порядок слоёв хранятся вне реактивности
		void orderVersion.value
		const below = [...orderedLayers].filter(layer => layer !== entry && layer.isActive() && layer.order < entry.order).length
		const index = String(below + 1)
		return previous?.['--rise-layer-index'] === index ? previous : { '--rise-layer-index': index }
	})
}

/** Открытые слои снизу вверх — для отладки и тестов */
export function getOpenLayers(): readonly LayerEntry[] {
	return openLayers()
}
