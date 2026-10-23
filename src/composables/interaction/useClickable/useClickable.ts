/** Composable: элемент без кнопки (span, div) работает как кнопка, если у компонента есть слушатель клика */
import { camelize, computed, toHandlerKey } from 'vue'
import { useExplicitPropDetection } from '@composables/base/useExplicitPropDetection'
import type { ClickableAttributes, UseClickableOptions, UseClickableReturn } from './types/useClickable.types'

const ACTIVATION_KEYS = new Set(['Enter', ' '])

/**
 * Кликабельный элемент — `role="button"`, `tabindex="0"`, Enter и Space, `aria-disabled` у выключенного;
 * некликабельный — без роли и фокуса. Кликабельность определяется слушателем на компоненте (`@click`,
 * `@click-badge`) при создании компонента. Клавиши вызывают `element.click()`, поэтому обработчик клика
 * один и получает `MouseEvent`, как от мыши.
 *
 * @example
 * const { clickableAttributes, handleKeydown } = useClickable({ event: 'click', isDisabled: () => props.isDisabled })
 * const handleClick = (event: MouseEvent) => !props.isDisabled && emit('click', event)
 */
export function useClickable(options: UseClickableOptions): UseClickableReturn {
	const { wasPropPassed } = useExplicitPropDetection()
	const isClickable = computed(() => wasPropPassed(toHandlerKey(camelize(options.event))) || wasPropPassed(toHandlerKey(options.event)))
	const isDisabled = (): boolean => Boolean(options.isDisabled?.())
	const canActivate = (): boolean => isClickable.value && !isDisabled()

	const clickableAttributes = computed((): ClickableAttributes => ({
		role: isClickable.value ? 'button' : undefined,
		tabindex: canActivate() ? '0' : undefined,
		'aria-disabled': isClickable.value && isDisabled() ? 'true' : undefined,
	}))

	function handleKeydown(event: KeyboardEvent): void {
		if (!isClickable.value || event.target !== event.currentTarget || !ACTIVATION_KEYS.has(event.key)) return
		event.preventDefault()
		if (canActivate() && !event.repeat) (event.currentTarget as HTMLElement).click()
	}

	return { isClickable, clickableAttributes, handleKeydown }
}
