import { nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import type { BaseQrCodeEmits, BaseQrCodeProps } from '../types/BaseQrCode.types'

export function useQrReveal(props: BaseQrCodeProps, emit: BaseQrCodeEmits) {
	const isHidden = ref(Boolean(props.isConcealed))
	const boxRef = useTemplateRef<HTMLElement>('boxRef')
	let timer: ReturnType<typeof setTimeout> | undefined
	const stopTimer = (): void => {
		clearTimeout(timer)
		timer = undefined
	}
	function conceal(): void {
		stopTimer()
		if (isHidden.value) return
		isHidden.value = true
		emit('conceal')
	}
	function reveal(): void {
		stopTimer()
		const wasHidden = isHidden.value
		isHidden.value = false
		const delay = props.revealTimeout ?? 0
		if (props.isConcealed && delay > 0) timer = setTimeout(conceal, delay)
		if (wasHidden) emit('reveal')
	}
	async function revealByButton(): Promise<void> {
		reveal()
		await nextTick()
		boxRef.value?.focus()
	}
	watch(
		() => props.isConcealed,
		value => {
			stopTimer()
			isHidden.value = Boolean(value)
		},
	)
	onBeforeUnmount(stopTimer)
	return { isHidden, reveal, conceal, revealByButton }
}
