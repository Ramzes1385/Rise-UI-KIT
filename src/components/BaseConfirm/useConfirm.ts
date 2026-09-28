import BaseConfirm from './ui/BaseConfirm.vue'
/** Composable: подтверждение действия из кода — окно BaseConfirm через BaseApp */
import { useOverlay } from '@composables/useOverlay'
import type { ConfirmOptions } from './types/BaseConfirm.types'

/**
 * Спрашивает подтверждение и возвращает ответ: true — подтвердили, false — отменили.
 * Окно показывает ближайший `<BaseApp>`; фокус после закрытия возвращается на прежний элемент.
 *
 * @example
 * const confirm = useConfirm()
 * if (await confirm({ title: 'Удалить проект?', description: 'Файлы удалятся без возможности восстановления.', confirmLabel: 'Удалить', isDanger: true })) {
 *   await removeProject()
 * }
 */
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
	const overlay = useOverlay()
	return async options => (await overlay.create<boolean>(BaseConfirm, { props: { ...options } }).open()) === true
}
