import type { ComputedRef } from 'vue'
import { useUi } from '@composables/base/useUi'
import type { UiClassFn } from '@composables/base/useUi'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useOwnThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'
import { DEFAULT_VARIANT, useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type {
	AutoCloseTimer,
	BaseNotificationPart,
	BaseNotificationEmits,
	BaseNotificationProps,
	NotificationAction,
	NotificationId,
	NotificationItem,
} from '../types/BaseNotification.types'

export const DEFAULT_DURATION = 3000
const MAX_TIMEOUT = 2_147_483_647
const ACTION_SCALE_RATIO = 0.875
const TYPE_ICONS: Record<string, string> = {
	success: 'check-circle',
	error: 'x-circle',
	warning: 'alert-triangle',
	info: 'info',
}
const NOTIFICATION_ELEMENTS = ['root', 'notification', 'icon', 'content', 'title', 'description', 'actions', 'close', 'progress']

const PART_CLASSES: Partial<Record<BaseNotificationPart, string>> = {
	root: 'base-notification',
	list: 'base-notification-list',
	item: 'base-notification-item',
}

function useNotificationUi(props: BaseNotificationProps): UiClassFn<BaseNotificationPart> {
	const ui = useUi(props, 'base-notification')
	return part => [PART_CLASSES[part] ?? `base-notification-item__${part}`, ...ui(part).split(' ').slice(1)].join(' ')
}

function useNotificationLook(props: BaseNotificationProps, list: ComputedRef<NotificationItem[]>) {
	return {
		ui: useNotificationUi(props),
		animationClass: computed(() => `base-notification-item--animation-${props.animation ?? 'scale'}`),
		themeAttrs: useOwnThemeAttrs(() => list.value.length > 0),
	}
}

function resolveDuration(duration: number | undefined): number {
	if (duration !== undefined && Number.isFinite(duration) && duration > 0) return Math.min(duration, MAX_TIMEOUT)
	return DEFAULT_DURATION
}

function useNotificationView(props: BaseNotificationProps) {
	const getDuration = (notification: NotificationItem): number => resolveDuration(notification.duration ?? props.duration)
	return {
		getDuration,
		getTimerKey: (notification: NotificationItem): string =>
			`${notification.id}:${notification.isPersistent ? 'persistent' : getDuration(notification)}`,
		getVariantClass(notification: NotificationItem): string | undefined {
			const variant = notification.variant ?? props.variant
			if (!variant || variant === DEFAULT_VARIANT) return undefined
			return `base-notification-item--${variant}`
		},
	}
}

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

function useAutoClose(
	list: ComputedRef<NotificationItem[]>,
	view: ReturnType<typeof useNotificationView>,
	onExpire: (id: NotificationId) => void,
) {
	const clock = createTimers(onExpire)
	const isHovered = ref(false)
	const isFocusWithin = ref(false)
	const isPaused = computed(() => isHovered.value || isFocusWithin.value)

	const startTimer = (notification: NotificationItem, key: string): void => {
		const timer: AutoCloseTimer = { key, remaining: view.getDuration(notification), startedAt: 0, timeout: null }
		clock.timers.set(notification.id, timer)
		if (!isPaused.value) clock.schedule(notification.id, timer)
	}
	const syncTimers = (): void => {
		const visible = new Set(list.value.map(notification => notification.id))
		for (const notification of list.value) {
			const key = view.getTimerKey(notification)
			if (clock.timers.get(notification.id)?.key === key) continue
			clock.clearTimer(notification.id)
			if (!notification.isPersistent) startTimer(notification, key)
		}
		for (const id of [...clock.timers.keys()]) {
			if (!visible.has(id)) clock.clearTimer(id)
		}
		if (list.value.length === 0) {
			isHovered.value = false
			isFocusWithin.value = false
		}
	}

	watch(() => list.value.map(view.getTimerKey).join('|'), syncTimers, { immediate: true })
	watch(isPaused, clock.setPaused)
	onBeforeUnmount(clock.clearAll)

	return { isHovered, isFocusWithin, isPaused, syncTimers, clearTimer: clock.clearTimer }
}

function useNotificationList(props: BaseNotificationProps, emit: BaseNotificationEmits) {
	const internalItems = ref<NotificationItem[]>([])
	let nextId = 0
	return {
		list: computed(() => props.items ?? internalItems.value),
		push(notification: BaseNotificationProps): NotificationId {
			const id = nextId++
			internalItems.value.unshift({ ...notification, items: undefined, id } as NotificationItem)
			return id
		},
		drop(id: NotificationId): void {
			if (props.items) return
			internalItems.value = internalItems.value.filter(notification => notification.id !== id)
			if (internalItems.value.length === 0) emit('close')
		},
	}
}

export function useBaseNotification(props: BaseNotificationProps, emit: BaseNotificationEmits) {
	const teleportTarget = useTeleportTarget()
	const standard = useStandardBaseComponent('base-notification-item', props, NOTIFICATION_ELEMENTS)
	const { list, push, drop } = useNotificationList(props, emit)
	const view = useNotificationView(props)
	const containerRef = ref<HTMLElement | null>(null)
	const autoClose = useAutoClose(list, view, id => remove(id))
	const { isFocusWithin } = autoClose

	const remove = (id: NotificationId): void => {
		autoClose.clearTimer(id)
		emit('remove', id)
		drop(id)
		nextTick(() => {
			if (isFocusWithin.value && !containerRef.value?.contains(document.activeElement)) isFocusWithin.value = false
		})
	}
	const add = (notification: BaseNotificationProps): NotificationId => {
		const id = push(notification)
		autoClose.syncTimers()
		return id
	}

	onMounted(() => {
		if (props.title && !props.items)
			add({ ...props, variant: undefined, title: props.title, type: props.type, position: props.position, duration: props.duration })
	})

	return {
		...standard,
		teleportTarget,
		containerRef,
		list,
		actionScaleRatio: ACTION_SCALE_RATIO,
		typeIconMap: TYPE_ICONS,
		...view,
		isHovered: autoClose.isHovered,
		isFocusWithin,
		isPaused: autoClose.isPaused,
		handleFocusOut(event: FocusEvent): void {
			const container = event.currentTarget as HTMLElement
			if (!container.contains(event.relatedTarget as Node | null)) isFocusWithin.value = false
		},
		remove,
		runAction(id: NotificationId, action: NotificationAction): void {
			action.onClick?.()
			remove(id)
		},
		exposed: { add, remove },
		...useNotificationLook(props, list),
	}
}
