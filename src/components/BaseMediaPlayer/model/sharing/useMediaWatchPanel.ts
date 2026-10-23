import { onMounted, ref } from 'vue'
import { usePlayerContext } from '../player/usePlayerContext'

export function useMediaWatchPanel() {
	const { watchLink, watchMembers, copyWatchLink, inviteToWatch } = usePlayerContext()
	const panelRef = ref<HTMLElement | null>(null)
	const email = ref('')
	const isInvalid = ref(false)
	onMounted(() => panelRef.value?.querySelector<HTMLElement>('button')?.focus())

	return {
		panelRef,
		watchLink,
		watchMembers,
		copyWatchLink,
		email,
		isInvalid,
		invite(): void {
			const isSent = inviteToWatch(email.value)
			isInvalid.value = !isSent
			if (isSent) email.value = ''
		},
		selectLink(event: FocusEvent): void {
			;(event.target as HTMLInputElement).select()
		},
	}
}
