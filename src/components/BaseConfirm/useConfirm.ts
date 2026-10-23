import BaseConfirm from './ui/BaseConfirm.vue'
import { useOverlay } from '@composables/overlay/useOverlay'
import type { ConfirmOptions } from './types/BaseConfirm.types'

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
	const overlay = useOverlay()
	return async options => (await overlay.create<boolean>(BaseConfirm, { props: { ...options } }).open()) === true
}
