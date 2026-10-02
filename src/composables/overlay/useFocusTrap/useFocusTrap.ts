/** Composable: удержание фокуса внутри модального окна */
import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { UseFocusTrapOptions } from './types/useFocusTrap.types'

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'button:not([disabled])',
	'input:not([disabled]):not([type="hidden"])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'iframe',
	'audio[controls]',
	'video[controls]',
	'summary',
	'[contenteditable]:not([contenteditable="false"])',
	'[tabindex]',
].join(',')

/** Элементы контейнера, достижимые по Tab, в порядке документа */
export function getTabbableElements(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		element => element.tabIndex >= 0 && !element.closest('[hidden], [inert]'),
	)
}

/**
 * Перевести фокус внутрь контейнера: [autofocus], иначе первый фокусируемый, иначе сам контейнер.
 * Без прокрутки: панель ещё въезжает из-за края (transform), и браузер прокрутил бы к ней ближайший
 * контейнер с `overflow: hidden` — содержимое под панелью дёргалось бы в сторону и обратно
 */
function focusInitial(container: HTMLElement): void {
	const target = container.querySelector<HTMLElement>('[autofocus]') ?? getTabbableElements(container)[0]
	if (target) {
		target.focus({ preventScroll: true })
		return
	}

	// Нет фокусируемых элементов — фокусируем сам диалог, чтобы клавиатура и скринридер оказались внутри.
	// tabindex, заданный потребителем, не перезаписываем
	if (!container.hasAttribute('tabindex')) container.setAttribute('tabindex', '-1')
	container.focus({ preventScroll: true })
}

/**
 * Куда перевести фокус по Tab / Shift+Tab: на противоположный край контейнера, если фокус на крайнем элементе
 * или снаружи; `null` — внутри контейнера браузер переводит фокус сам
 */
function getWrapTarget(event: KeyboardEvent, container: HTMLElement, edges: [HTMLElement, HTMLElement]): HTMLElement | null {
	const [first, last] = edges
	const active = document.activeElement
	const isOutside = !container.contains(active)
	// active === container: фокус на самом диалоге (клик по его фону) — Shift+Tab не должен уходить наружу
	if (event.shiftKey) return isOutside || active === first || active === container ? last : null
	return isOutside || active === last ? first : null
}

/** Обработать Tab / Shift+Tab: удержать фокус внутри контейнера, переходя с края на край */
function cycleTabFocus(event: KeyboardEvent, container: HTMLElement): void {
	const active = document.activeElement
	// Фокус во вложенном телепортированном слое (панель селекта, поповер) — это его навигация
	if (!container.contains(active) && active !== null && active !== document.body) return

	const tabbable = getTabbableElements(container)
	const first = tabbable[0]
	const last = tabbable[tabbable.length - 1]
	if (!first || !last) {
		event.preventDefault()
		container.focus()
		return
	}

	const target = getWrapTarget(event, container, [first, last])
	if (!target) return
	event.preventDefault()
	target.focus()
}

/**
 * Composable для модальных окон: удерживает фокус клавиатуры внутри контейнера.
 * При активации запоминает элемент с фокусом (обычно триггер) и переводит фокус внутрь:
 * на элемент с [autofocus], иначе на первый фокусируемый, иначе на сам контейнер (tabindex="-1").
 * Если фокус уже внутри (дочерний компонент сфокусировал поле при монтировании), он не перебивается.
 * Tab и Shift+Tab циклически обходят элементы контейнера, не уходя на страницу под оверлеем.
 * При деактивации или размонтировании возвращает фокус на запомненный элемент, если он ещё в DOM.
 * Работает только в браузере: до монтирования (и при SSR) к document не обращается.
 *
 * @example
 * ```ts
 * const dialogRef = ref<HTMLElement | null>(null)
 *
 * useFocusTrap({
 *   containerRef: dialogRef,
 *   isActive: () => props.isOpen,
 * })
 * ```
 */
function useFocusTrap(options: UseFocusTrapOptions): void {
	const { containerRef, isActive } = options

	/** Элемент, с которого открыли окно: на него вернётся фокус после закрытия */
	let returnFocusTarget: HTMLElement | null = null

	/** Циклический обход Tab / Shift+Tab внутри контейнера */
	function handleKeydown(event: KeyboardEvent): void {
		const container = containerRef.value
		// Контейнер не отрендерен (например, не найдена цель Teleport) — удерживать фокус негде
		if (event.key === 'Tab' && container) cycleTabFocus(event, container)
	}

	/** Включить ловушку. Вызывается только при переходе в активное состояние, дважды подряд не срабатывает */
	function activate(): void {
		document.addEventListener('keydown', handleKeydown)

		const container = containerRef.value
		const active = document.activeElement
		// Фокус уже внутри (дочерний компонент сфокусировал поле при монтировании) — не перебиваем
		if (container?.contains(active)) return

		returnFocusTarget = active instanceof HTMLElement && active !== document.body ? active : null
		// Без контейнера (не отрендерен) фокус не трогаем
		if (container) focusInitial(container)
	}

	/**
	 * Выключить ловушку и вернуть фокус на запомненный элемент.
	 * Идемпотентна: для неактивной ловушки (окно закрыто при монтировании или уже закрыто перед размонтированием)
	 * снимать нечего, а запомненного элемента нет
	 */
	function deactivate(): void {
		document.removeEventListener('keydown', handleKeydown)

		const target = returnFocusTarget
		returnFocusTarget = null
		// Триггер мог быть удалён из DOM, пока окно было открыто
		if (target?.isConnected) target.focus()
	}

	// Единственная точка включения/выключения. watch создаётся после монтирования: DOM контейнера уже есть,
	// а при SSR ловушка не запускается. immediate обрабатывает окно, открытое сразу; flush: 'post' — смены
	// isActive после обновления DOM (содержимое окна отрендерено, ref контейнера выставлен).
	// Созданный в хуке watch привязан к экземпляру компонента и останавливается при размонтировании
	onMounted(() => {
		watch(
			isActive,
			active => {
				if (active) {
					activate()
				} else {
					deactivate()
				}
			},
			{ immediate: true, flush: 'post' },
		)
	})

	onBeforeUnmount(deactivate)
}

export { useFocusTrap }
