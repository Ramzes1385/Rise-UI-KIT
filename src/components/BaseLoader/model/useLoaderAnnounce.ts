import { onBeforeUnmount, onMounted, ref } from 'vue'

export const LOADER_ANNOUNCE_DELAY = 100

export function useLoaderAnnounce() {
	const isAnnounced = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined

	onMounted(() => {
		timer = setTimeout(() => {
			isAnnounced.value = true
		}, LOADER_ANNOUNCE_DELAY)
	})
	onBeforeUnmount(() => clearTimeout(timer))

	return { isAnnounced }
}
