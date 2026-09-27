/** Composable: позиционирование выпадающей панели с переворотом и сдвигом у края окна */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { UseDropdownPositionOptions } from './useDropdownPosition.types'
import type { DropdownPosition } from '@components/BaseDropdown/model/BaseDropdown.types'

/** Отступ панели от края окна при сдвиге, px */
export const VIEWPORT_MARGIN = 8

type Side = 'top' | 'bottom' | 'left' | 'right'
type Align = 'start' | 'end' | 'center'

interface Size {
	width: number
	height: number
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

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

/** Левый верхний угол панели для стороны и выравнивания относительно триггера */
function place(rect: DOMRect, side: Side, align: Align, size: Size, gap: number): { top: number; left: number } {
	if (side === 'top' || side === 'bottom') {
		const top = side === 'bottom' ? rect.bottom + gap : rect.top - gap - size.height
		const left = align === 'start' ? rect.left : align === 'end' ? rect.right - size.width : rect.left + rect.width / 2 - size.width / 2
		return { top, left }
	}
	const left = side === 'right' ? rect.right + gap : rect.left - gap - size.width
	const top = align === 'start' ? rect.top : align === 'end' ? rect.bottom - size.height : rect.top + rect.height / 2 - size.height / 2
	return { top, left }
}

/** Помещается ли панель со стороны триггера */
function fits(side: Side, rect: DOMRect, size: Size, gap: number, viewport: Size): boolean {
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

	/** Rect триггера (первый дочерний элемент обёртки) */
	function getTriggerRect(): DOMRect | null {
		if (!wrapperRef.value) return null
		const trigger = wrapperRef.value.firstElementChild
		if (trigger) return trigger.getBoundingClientRect()
		return wrapperRef.value.getBoundingClientRect()
	}

	/** Вычислить позицию панели. До первой отрисовки размер панели неизвестен — второй проход в nextTick уточняет его */
	function updatePosition(): void {
		if (!isOpen()) return

		const rect = getTriggerRect()
		if (!rect) return

		const gapValue = gap()
		triggerWidth.value = rect.width
		const panel = dropdownRef.value
		const size: Size = { width: panel?.offsetWidth ?? 0, height: panel?.offsetHeight ?? 0 }
		const viewport = getViewport()
		const { align } = parsePosition(position())
		let { side } = parsePosition(position())

		const isMeasured = size.width > 0 && size.height > 0
		if (isMeasured && !fits(side, rect, size, gapValue, viewport) && fits(OPPOSITE[side], rect, size, gapValue, viewport)) {
			side = OPPOSITE[side]
		}

		let { top, left } = place(rect, side, align, size, gapValue)
		if (isMeasured) {
			if (side === 'top' || side === 'bottom') left = clamp(left, VIEWPORT_MARGIN, viewport.width - size.width - VIEWPORT_MARGIN)
			else top = clamp(top, VIEWPORT_MARGIN, viewport.height - size.height - VIEWPORT_MARGIN)
		}

		placement.value = toPosition(side, align)
		// Тот же угол — без нового объекта: иначе каждая прокрутка и отчёт ResizeObserver перерисовывали бы панель
		// и её содержимое (например, сбрасывали бы набираемое в поле панели значение)
		if (coords.value.top !== top || coords.value.left !== left) coords.value = { top, left }
	}

	/** Стили панели: координаты левого верхнего угла, предел высоты и ширина триггера при matchWidth */
	const panelStyle = computed((): Record<string, string> => {
		const style: Record<string, string> = {
			maxHeight: maxHeight(),
			top: `${coords.value.top}px`,
			left: `${coords.value.left}px`,
		}
		if (matchWidth()) style.width = `${triggerWidth.value}px`
		return style
	})

	/** Размер панели меняется (подгрузились пункты) — позиция пересчитывается */
	let resizeObserver: ResizeObserver | null = null

	function handleScrollOrResize(): void {
		updatePosition()
	}

	function listen(): void {
		window.addEventListener('scroll', handleScrollOrResize, true)
		window.addEventListener('resize', handleScrollOrResize)
		nextTick(() => {
			if (!dropdownRef.value || resizeObserver) return
			resizeObserver = new ResizeObserver(() => updatePosition())
			resizeObserver.observe(dropdownRef.value)
		})
	}

	function unlisten(): void {
		window.removeEventListener('scroll', handleScrollOrResize, true)
		window.removeEventListener('resize', handleScrollOrResize)
		resizeObserver?.disconnect()
		resizeObserver = null
	}

	watch(isOpen, (open: boolean) => {
		if (!open) {
			unlisten()
			return
		}
		updatePosition()
		nextTick(updatePosition)
		listen()
	})

	/** Пересчёт при изменении gap, position, matchWidth */
	watch([gap, position, matchWidth], () => {
		updatePosition()
		nextTick(updatePosition)
	})

	onMounted(() => {
		/** Панель, открытая при монтировании */
		if (isOpen()) {
			updatePosition()
			nextTick(updatePosition)
			listen()
		}
	})

	onBeforeUnmount(unlisten)

	return {
		coords,
		triggerWidth,
		placement,
		panelStyle,
		updatePosition,
	}
}

export { useDropdownPosition }
