import { hoursState } from './hoursFormat'
import { parseHours } from './hoursSchedule'
import type { ImageMapProps } from '../../types/BaseImageMap.types'
import type { ImageMapHoursState } from '../../types/ImageMapHours.types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import type { ParsedHours } from '../../types/internal/imageMapInternal.types'

const MINUTE_MS = 60_000

function useMinuteClock(isNeeded: () => boolean) {
	const now = shallowRef(new Date())
	let timer: ReturnType<typeof setTimeout> | undefined
	let isMounted = false

	function stop(): void {
		clearTimeout(timer)
		timer = undefined
	}

	function schedule(): void {
		stop()
		now.value = new Date()
		if (!isMounted || !isNeeded()) return
		timer = setTimeout(schedule, MINUTE_MS - (Date.now() % MINUTE_MS))
	}

	onMounted(() => {
		isMounted = true
		schedule()
	})
	onBeforeUnmount(() => {
		isMounted = false
		stop()
	})
	watch(isNeeded, schedule)
	return now
}

export function useImageMapHours(props: ImageMapProps) {
	const parsed = computed(
		() =>
			new Map<string, ParsedHours>(
				props.data.objects.flatMap(object =>
					object.hours ? [[object.id, parseHours(object.id, object.hours, props.data.timeZone)] as const] : [],
				),
			),
	)
	const clock = useMinuteClock(() => props.now === undefined && parsed.value.size > 0)
	const states = computed(() => {
		const now = props.now === undefined ? clock.value : new Date(props.now)
		return new Map<string, ImageMapHoursState>([...parsed.value].map(([id, hours]) => [id, hoursState(hours, now)]))
	})

	return {
		hoursOf: (id: string): ImageMapHoursState | undefined => states.value.get(id),
		isOpenNow: (id: string): boolean => Boolean(states.value.get(id)?.isOpen),
	}
}
