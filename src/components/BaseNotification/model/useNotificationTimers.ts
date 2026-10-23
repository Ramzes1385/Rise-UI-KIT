import type { ComputedRef } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type {
	AutoCloseTimer,
	NotificationId,
	NotificationItem,
	NotificationPosition,
	NotificationTimerView,
} from '../types/BaseNotification.types'

function createTimers(onExpire: (id: NotificationId) => void) {
	const timers = new Map<NotificationId, AutoCloseTimer>()
	const schedule = (id: NotificationId, timer: AutoCloseTimer): void => {
		timer.startedAt = Date.now()
		timer.timeout = setTimeout(() => onExpire(id), timer.remaining)
	}
	const clearTimer = (id: NotificationId): void => {
		const timer = timers.get(id)
		if (timer?.timeout) clearTimeout(timer.timeout)
		timers.delete(id)
	}

	return {
		timers,
		schedule,
		clearTimer,
		clearAll(): void {
			for (const id of [...timers.keys()]) clearTimer(id)
		},
		setPaused(paused: boolean): void {
			const now = Date.now()
			for (const [id, timer] of timers) {
				if (paused && timer.timeout) {
					clearTimeout(timer.timeout)
					timer.timeout = null
					timer.remaining = Math.max(0, timer.remaining - (now - timer.startedAt))
				} else if (!paused && !timer.timeout) {
					schedule(id, timer)
				}
			}
		},
	}
}

export function useAutoClose(
	visible: ComputedRef<NotificationItem[]>,
	view: NotificationTimerView,
	onExpire: (id: NotificationId) => void,
) {
	const clock = createTimers(onExpire)
	const hoveredAreas = ref<ReadonlySet<NotificationPosition>>(new Set())
	const isHovered = computed(() => hoveredAreas.value.size > 0)
	const isFocusWithin = ref(false)
	const isPaused = computed(() => isHovered.value || isFocusWithin.value)

	const setHovered = (position: NotificationPosition, isHoveredNow: boolean): void => {
		const next = new Set(hoveredAreas.value)
		if (isHoveredNow) next.add(position)
		else next.delete(position)
		hoveredAreas.value = next
	}
	const retainAreas = (positions: ReadonlySet<NotificationPosition>): void => {
		const next = new Set([...hoveredAreas.value].filter(position => positions.has(position)))
		if (next.size !== hoveredAreas.value.size) hoveredAreas.value = next
	}

	const startTimer = (notification: NotificationItem, key: string): void => {
		const timer: AutoCloseTimer = { key, remaining: view.getDuration(notification), startedAt: 0, timeout: null }
		clock.timers.set(notification.id, timer)
		if (!isPaused.value) clock.schedule(notification.id, timer)
	}
	const syncTimers = (): void => {
		const shown = new Set(visible.value.map(notification => notification.id))
		for (const notification of visible.value) {
			const key = view.getTimerKey(notification)
			if (clock.timers.get(notification.id)?.key === key) continue
			clock.clearTimer(notification.id)
			if (!notification.isPersistent) startTimer(notification, key)
		}
		for (const id of [...clock.timers.keys()]) {
			if (!shown.has(id)) clock.clearTimer(id)
		}
		if (visible.value.length === 0) {
			hoveredAreas.value = new Set()
			isFocusWithin.value = false
		}
	}

	watch(() => visible.value.map(view.getTimerKey).join('|'), syncTimers, { immediate: true })
	watch(isPaused, clock.setPaused)
	onBeforeUnmount(clock.clearAll)

	return { isHovered, setHovered, retainAreas, isFocusWithin, isPaused, syncTimers, clearTimer: clock.clearTimer }
}
