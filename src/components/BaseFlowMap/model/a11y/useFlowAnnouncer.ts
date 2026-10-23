import type { Ref } from 'vue'
import { onBeforeUnmount, ref } from 'vue'

export function useFlowAnnouncer(): { announcement: Ref<string>; announce: (text: string) => void } {
	const announcement = ref('')
	let timer: ReturnType<typeof setTimeout> | undefined

	function announce(text: string): void {
		announcement.value = ''
		clearTimeout(timer)
		timer = setTimeout(() => (announcement.value = text), 50)
	}

	onBeforeUnmount(() => clearTimeout(timer))
	return { announcement, announce }
}
