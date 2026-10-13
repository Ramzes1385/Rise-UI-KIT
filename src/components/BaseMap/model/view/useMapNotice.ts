import { onBeforeUnmount, ref } from 'vue'

const NOTICE_MS = 4000

export function useMapNotice() {
	const notice = ref('')
	let timer: ReturnType<typeof setTimeout> | undefined

	function show(text: string): void {
		clearTimeout(timer)
		notice.value = text
		timer = setTimeout(() => {
			notice.value = ''
		}, NOTICE_MS)
	}

	onBeforeUnmount(() => clearTimeout(timer))

	return { notice, show }
}
