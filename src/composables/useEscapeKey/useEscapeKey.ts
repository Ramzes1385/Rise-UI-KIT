/** Composable: закрытие по клавише Escape */
import { useLayer } from '@composables/useLayerStack'
import type { UseEscapeKeyOptions } from './types/useEscapeKey.types'

/**
 * Composable для закрытия по клавише Escape. Компонент становится слоем (`useLayer`):
 * Escape получает только верхний открытый слой — из окна с открытым списком первое нажатие
 * закрывает список, второе — окно.
 *
 * @example
 * ```ts
 * useEscapeKey({
 *   isActive: () => props.isOpen,
 *   callback: () => emit('close'),
 * })
 * ```
 */
function useEscapeKey(options: UseEscapeKeyOptions): void {
	useLayer({ isActive: options.isActive, onEscape: options.callback })
}

export { useEscapeKey }
