/** Composable: позиционирование выпадающей панели с переворотом и сдвигом у края окна */
import { getFixedOrigin } from '@utils/dom/domUtils'
import type { DropdownPosition } from '@components/BaseDropdown/types/BaseDropdown.types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type Ref, watch } from 'vue'
import type { Align, Edge, Geometry, Side, Size, UseDropdownPositionOptions } from './types/useDropdownPosition.types'

/** Отступ панели от края окна при сдвиге, px */
export const VIEWPORT_MARGIN = 8

/** Ближе к углу панели стрелка не подходит: иначе она вылезает за скругление, px */
export const ARROW_EDGE_OFFSET = 12

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

/** Точка, из которой панель вырастает при появлении: угол или край у триггера */
const TRANSFORM_ORIGIN: Record<DropdownPosition, string> = {
	'bottom-start': 'top left',
	'bottom-end': 'top right',
	bottom: 'top center',
	'top-start': 'bottom left',
	'top-end': 'bottom right',
	top: 'bottom center',
	'left-start': 'top right',
	'left-end': 'bottom right',
	left: 'center right',
	'right-start': 'top left',
	'right-end': 'bottom left',
	right: 'center left',
}

function parsePosition(position: DropdownPosition): { side: Side; align: Align } {
	const [side, align] = position.split('-') as [Side, 'start' | 'end' | undefined]
	return { side, align: align ?? 'center' }
}

function toPosition(side: Side, align: Align): DropdownPosition {
	return (align === 'center' ? side : `${side}-${align}`) as DropdownPosition
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(value, max))
}

/** Размер окна без полос прокрутки; в среде без раскладки (jsdom) clientWidth равен 0 — берётся innerWidth */
function getViewport(): Size {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function horizontalEdge(rect: DOMRect): Edge {
	return { start: rect.left, end: rect.right, middle: rect.left + rect.width / 2 }
}

function verticalEdge(rect: DOMRect): Edge {
	return { start: rect.top, end: rect.bottom, middle: rect.top + rect.height / 2 }
}

/** Начало панели вдоль края: у начала края, у конца или по центру */
function alignAlong(align: Align, edge: Edge, size: number): number {
	if (align === 'start') return edge.start
	if (align === 'end') return edge.end - size
	return edge.middle - size / 2
}

/** Левый верхний угол панели для стороны и выравнивания относительно триггера */
function place(geometry: Geometry, side: Side, align: Align): { top: number; left: number } {
	const { rect, size, gap } = geometry
	if (side === 'top' || side === 'bottom') {
		const top = side === 'bottom' ? rect.bottom + gap : rect.top - gap - size.height
		return { top, left: alignAlong(align, horizontalEdge(rect), size.width) }
	}
	const left = side === 'right' ? rect.right + gap : rect.left - gap - size.width
	return { top: alignAlong(align, verticalEdge(rect), size.height), left }
}

function fits(geometry: Geometry, side: Side): boolean {
	const { rect, size, gap, viewport } = geometry
	switch (side) {
		case 'bottom':
			return viewport.height - rect.bottom - gap >= size.height + VIEWPORT_MARGIN
		case 'top':
			return rect.top - gap >= size.height + VIEWPORT_MARGIN
		case 'right':
			return viewport.width - rect.right - gap >= size.width + VIEWPORT_MARGIN
		case 'left':
			return rect.left - gap >= size.width + VIEWPORT_MARGIN
	}
}

/**
 * Сторона и угол панели. Размер панели известен — у края окна она переворачивается на противоположную сторону,
 * если там хватает места, и сдвигается вдоль края окна, чтобы не выйти за него
 */
function layoutPanel(geometry: Geometry, position: DropdownPosition): { side: Side; align: Align; top: number; left: number } {
	const { size, viewport } = geometry
	const { align } = parsePosition(position)
	let { side } = parsePosition(position)
	const isMeasured = size.width > 0 && size.height > 0
	if (isMeasured && !fits(geometry, side) && fits(geometry, OPPOSITE[side])) side = OPPOSITE[side]

	let { top, left } = place(geometry, side, align)
	if (isMeasured) {
		if (side === 'top' || side === 'bottom') left = clamp(left, VIEWPORT_MARGIN, viewport.width - size.width - VIEWPORT_MARGIN)
		else top = clamp(top, VIEWPORT_MARGIN, viewport.height - size.height - VIEWPORT_MARGIN)
	}
	return { side, align, top, left }
}

/**
 * Где стрелка на краю панели, обращённом к триггеру: расстояние от начала края до середины триггера.
 * Панель сдвинули у края окна — стрелка остаётся напротив триггера, но не заходит на скругление угла
 */
function arrowOffsetFor(geometry: Geometry, side: Side, point: { top: number; left: number }): number {
	const { rect, size, border } = geometry
	const isVertical = side === 'top' || side === 'bottom'
	const length = isVertical ? size.width : size.height
	const target = isVertical ? rect.left + rect.width / 2 - point.left : rect.top + rect.height / 2 - point.top
	const inset = isVertical ? border.left : border.top
	if (length < ARROW_EDGE_OFFSET * 2) return length / 2 - inset
	return clamp(target, ARROW_EDGE_OFFSET, length - ARROW_EDGE_OFFSET) - inset
}

/**
 * Угол панели в её системе отсчёта. Обычно это окно, но панель внутри предка с transform
 * (Storybook Docs, анимированное окно) отсчитывается от этого предка
 */
function toPanelSpace(point: { top: number; left: number }, panel: HTMLElement | null): { top: number; left: number } {
	const origin = getFixedOrigin(panel?.parentElement)
	return { top: point.top - origin.y, left: point.left - origin.x }
}

/** Размер панели и ширина её рамки; до отрисовки — нули */
function measurePanel(panel: HTMLElement | null): Pick<Geometry, 'size' | 'border'> {
	if (!panel) return { size: { width: 0, height: 0 }, border: { left: 0, top: 0 } }
	return { size: { width: panel.offsetWidth, height: panel.offsetHeight }, border: { left: panel.clientLeft, top: panel.clientTop } }
}

/** Стрелка панели: сторона панели, обращённая к триггеру, и расстояние от начала этой стороны до середины триггера */
function useArrowState(initialSide: Side) {
	const arrow = ref<{ side: Side; offset: number }>({ side: initialSide, offset: 0 })
	return {
		arrow,
		arrowStyle: computed((): Record<string, string> => ({ '--dd-arrow-offset': `${arrow.value.offset}px` })),
		/** Та же стрелка — без нового объекта, чтобы панель не перерисовывалась */
		updateArrow(next: { side: Side; offset: number }): void {
			if (arrow.value.side !== next.side || arrow.value.offset !== next.offset) arrow.value = next
		},
	}
}

/** Rect триггера (первый дочерний элемент обёртки), без триггера — самой обёртки */
function getTriggerRect(wrapper: HTMLElement | null): DOMRect | null {
	if (!wrapper) return null
	const trigger = wrapper.firstElementChild
	if (trigger) return trigger.getBoundingClientRect()
	return wrapper.getBoundingClientRect()
}

/**
 * Стили панели: координаты левого верхнего угла, предел высоты, ширина (`width: null` — без неё) и точка роста
 * анимации появления — сторона триггера, с которой панель показана
 */
function buildPanelStyle(
	point: { top: number; left: number },
	placement: DropdownPosition,
	size: { maxHeight: string; width: number | null },
): Record<string, string> {
	const style: Record<string, string> = {
		maxHeight: size.maxHeight,
		top: `${point.top}px`,
		left: `${point.left}px`,
		transformOrigin: TRANSFORM_ORIGIN[placement],
	}
	if (size.width !== null) style.width = `${size.width}px`
	return style
}

/**
 * Слушатели пересчёта открытой панели: прокрутка (в любом контейнере), размер окна и размер самой панели
 * (подгрузились пункты). `listen` повторно наблюдатель размера не создаёт
 */
function useRepositionListeners(update: () => void, dropdownRef: Ref<HTMLElement | null>): { listen: () => void; unlisten: () => void } {
	let resizeObserver: ResizeObserver | null = null
	return {
		listen: () => {
			window.addEventListener('scroll', update, true)
			window.addEventListener('resize', update)
			nextTick(() => {
				if (!dropdownRef.value || resizeObserver) return
				resizeObserver = new ResizeObserver(() => update())
				resizeObserver.observe(dropdownRef.value)
			})
		},
		unlisten: () => {
			window.removeEventListener('scroll', update, true)
			window.removeEventListener('resize', update)
			resizeObserver?.disconnect()
			resizeObserver = null
		},
	}
}

/**
 * Позиция выпадающей панели (`position: fixed`) у триггера. Если на выбранной стороне не хватает места,
 * а на противоположной хватает, панель переворачивается; вдоль края окна она сдвигается, чтобы не выйти за него.
 * Пересчёт — при открытии, прокрутке, изменении окна и размера панели; слушатели есть только у открытой панели.
 *
 * @example
 * ```ts
 * const { panelStyle, placement } = useDropdownPosition({
 *   wrapperRef,
 *   dropdownRef,
 *   position: () => props.position,
 *   gap: () => props.gap,
 *   matchWidth: () => props.matchWidth,
 *   maxHeight: () => props.maxHeight,
 *   isOpen: () => props.isOpen,
 * })
 * ```
 */
function useDropdownPosition(options: UseDropdownPositionOptions) {
	const { wrapperRef, dropdownRef, position, gap, matchWidth, maxHeight, isOpen } = options

	const coords = ref({ top: 0, left: 0 })
	const triggerWidth = ref(0)
	/** Сторона, с которой панель показана сейчас: после переворота отличается от `position` */
	const placement = ref<DropdownPosition>(position())
	const { arrow, arrowStyle, updateArrow } = useArrowState(OPPOSITE[parsePosition(position()).side])

	/** Вычислить позицию панели. До первой отрисовки размер панели неизвестен — второй проход в nextTick уточняет его */
	function updatePosition(): void {
		if (!isOpen()) return

		const rect = getTriggerRect(wrapperRef.value)
		if (!rect) return

		triggerWidth.value = rect.width
		const panel = dropdownRef.value
		const geometry: Geometry = { rect, ...measurePanel(panel), viewport: getViewport(), gap: gap() }
		const { side, align, top, left } = layoutPanel(geometry, position())

		placement.value = toPosition(side, align)
		updateArrow({ side: OPPOSITE[side], offset: arrowOffsetFor(geometry, side, { top, left }) })
		const next = toPanelSpace({ top, left }, panel)
		// Тот же угол — без нового объекта: иначе каждая прокрутка и отчёт ResizeObserver перерисовывали бы панель
		// и её содержимое (например, сбрасывали бы набираемое в поле панели значение)
		if (coords.value.top !== next.top || coords.value.left !== next.left) coords.value = next
	}

	/** Стили панели (см. `buildPanelStyle`): ширина триггера — только при matchWidth */
	const panelStyle = computed(() =>
		buildPanelStyle(coords.value, placement.value, { maxHeight: maxHeight(), width: matchWidth() ? triggerWidth.value : null }),
	)

	const { listen, unlisten } = useRepositionListeners(updatePosition, dropdownRef)

	/** Пересчитать сейчас и после отрисовки, когда известен размер панели */
	function refresh(): void {
		updatePosition()
		nextTick(updatePosition)
	}

	watch(isOpen, (open: boolean) => {
		if (!open) {
			unlisten()
			return
		}
		refresh()
		listen()
	})

	watch([gap, position, matchWidth], refresh)

	onMounted(() => {
		if (!isOpen()) return
		refresh()
		listen()
	})

	onBeforeUnmount(unlisten)

	return { coords, triggerWidth, placement, arrow, arrowStyle, panelStyle, updatePosition }
}

export { useDropdownPosition }
