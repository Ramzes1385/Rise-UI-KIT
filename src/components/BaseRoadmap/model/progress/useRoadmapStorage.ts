import { onBeforeUnmount, onMounted, watch } from 'vue'
import type { RoadmapProgress } from '../../types/roadmapData.types'
import type { UseRoadmapStorageOptions } from '../../types/internal/roadmapInternal.types'

const SAVE_DELAY = 300

function useDelayedSave({ props, emit, key, progress }: UseRoadmapStorageOptions) {
	let isPending = false
	let timer: ReturnType<typeof setTimeout> | undefined

	async function flush(): Promise<void> {
		clearTimeout(timer)
		const storage = props.storage
		if (!isPending || !storage) return
		isPending = false
		const snapshot = progress.value
		try {
			await storage.save(key.value, snapshot)
			emit('progress-save', snapshot)
		} catch (error) {
			emit('progress-error', error)
		}
	}

	function schedule(): void {
		if (!props.storage) return
		isPending = true
		clearTimeout(timer)
		timer = setTimeout(() => void flush(), SAVE_DELAY)
	}

	return { flush, schedule }
}

export function useRoadmapStorage(options: UseRoadmapStorageOptions): void {
	const { props, emit, key, progress, merge } = options
	const { flush, schedule } = useDelayedSave(options)
	let isMounted = false
	let isUnmounted = false
	let loadToken = 0

	async function fetchStored(): Promise<RoadmapProgress | null> {
		try {
			return (await props.storage?.load(key.value)) ?? null
		} catch (error) {
			emit('progress-error', error)
			return null
		}
	}

	async function load(): Promise<void> {
		const token = ++loadToken
		const stored = await fetchStored()
		if (!stored || token !== loadToken || isUnmounted) return
		const needsSave = await merge(stored)
		emit('progress-load', progress.value)
		if (needsSave) schedule()
	}

	watch(progress, schedule, { flush: 'sync' })
	watch([key, () => props.storage], () => {
		if (isMounted) void load()
	})
	onMounted(() => {
		isMounted = true
		void load()
	})
	onBeforeUnmount(() => {
		isUnmounted = true
		void flush()
	})
}
