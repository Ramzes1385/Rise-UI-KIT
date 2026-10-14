import { formatMessage } from '@/locales'
import type { ComputedRef, Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useUi } from '@composables/base/useUi'
import { useAutoClose } from './useNotificationTimers'
import type { UiClassFn } from '@composables/base/useUi'
import { calcDerivedScale } from '@utils/media/iconUtils'
import { useNotificationList } from './useNotificationList'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useSizeScale'
import { resolveCustomClass } from '@composables/base/useCustomClass'
import { buildCustomColorStyle } from '@composables/base/useCustomColor'
import { useOwnThemeAttrs, useTeleportTarget } from '@composables/app/useTeleportTarget'
import { DEFAULT_VARIANT, useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type {
	BaseNotificationPart,
	BaseNotificationEmits,
	BaseNotificationProps,
	NotificationAction,
	NotificationId,
	NotificationItem,
	NotificationPosition,
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

const AREA_POSITION_NAMES = {
	'top-left': () => UI_ARIA.NOTIFICATIONS_TOP_LEFT,
	'top-right': () => UI_ARIA.NOTIFICATIONS_TOP_RIGHT,
	'top-center': () => UI_ARIA.NOTIFICATIONS_TOP_CENTER,
	'bottom-left': () => UI_ARIA.NOTIFICATIONS_BOTTOM_LEFT,
	'bottom-right': () => UI_ARIA.NOTIFICATIONS_BOTTOM_RIGHT,
	'bottom-center': () => UI_ARIA.NOTIFICATIONS_BOTTOM_CENTER,
} satisfies Record<NotificationPosition, () => string>

function resolveAreaLabel(props: BaseNotificationProps, areaCount: number, position: NotificationPosition): string {
	const label = props.ariaLabel ?? UI_ARIA.NOTIFICATIONS
	if (areaCount < 2) return label
	return formatMessage(UI_ARIA.NOTIFICATIONS_AREA, { label, position: AREA_POSITION_NAMES[position]() })
}

function resolveDuration(duration: number | undefined): number {
	if (duration !== undefined && Number.isFinite(duration) && duration > 0) return Math.min(duration, MAX_TIMEOUT)
	return DEFAULT_DURATION
}

function useNotificationView(props: BaseNotificationProps, getRevision: (id: NotificationId) => number) {
	const getDuration = (notification: NotificationItem): number => resolveDuration(notification.duration ?? props.duration)
	return {
		getDuration,
		getTimerKey: (notification: NotificationItem): string =>
			`${notification.id}:${getRevision(notification.id)}:${notification.isPersistent ? 'persistent' : getDuration(notification)}`,
		getVariantClass(notification: NotificationItem): string | undefined {
			const variant = notification.variant ?? props.variant
			if (!variant || variant === DEFAULT_VARIANT) return undefined
			return `base-notification-item--${variant}`
		},
	}
}

function useNotificationItemView(
	props: BaseNotificationProps,
	shared: { classes: ComputedRef<Record<string, string | undefined>>; customColorStyle: ComputedRef<Record<string, string> | undefined> },
) {
	const getScale = (notification: NotificationItem): number => notification.sizeScale ?? props.sizeScale ?? SIZE_SCALE_DEFAULT
	return {
		getScale,
		getActionScale: (notification: NotificationItem): number => calcDerivedScale(getScale(notification), ACTION_SCALE_RATIO),
		getItemStyle(notification: NotificationItem): Record<string, string> | undefined {
			const color = notification.color ? buildCustomColorStyle(notification.color) : shared.customColorStyle.value
			if (notification.sizeScale === undefined) return color
			return { ...color, '--size-scale': String(notification.sizeScale / SIZE_SCALE_DEFAULT) }
		},
		getItemClasses(notification: NotificationItem): Record<string, string | undefined> {
			const own = resolveCustomClass(notification.customClass, NOTIFICATION_ELEMENTS)
			const result: Record<string, string | undefined> = {}
			for (const key of NOTIFICATION_ELEMENTS)
				result[key] = [shared.classes.value[key], own[key]].filter(Boolean).join(' ') || undefined
			return result
		},
		getItemClass(notification: NotificationItem): unknown[] {
			const own = resolveCustomClass(notification.customClass, NOTIFICATION_ELEMENTS)
			return [shared.classes.value.notification, own.notification, own.root]
		},
	}
}

function useDeclaredNotification(
	props: BaseNotificationProps,
	add: (notification: BaseNotificationProps) => NotificationId,
	update: (id: NotificationId, notification: BaseNotificationProps) => boolean,
) {
	let declaredId: NotificationId | null = null
	const toNotification = (): BaseNotificationProps => ({
		title: props.title,
		description: props.description,
		type: props.type,
		duration: props.duration,
		isPersistent: props.isPersistent,
		actions: props.actions,
		notificationKey: props.notificationKey,
	})
	const show = (): void => {
		declaredId = add(toNotification())
	}

	onMounted(() => {
		if (props.title && !props.items) show()
	})
	watch(
		() => [props.notificationKey, props.title, props.description, props.type],
		([key], [previousKey]) => {
			if (!props.title || props.items) return
			if (key !== previousKey || declaredId === null || !update(declaredId, toNotification())) show()
		},
	)
}

function useNotificationActions(
	emit: BaseNotificationEmits,
	store: ReturnType<typeof useNotificationList>,
	view: ReturnType<typeof useNotificationView>,
) {
	const containerRef: Ref<HTMLElement[]> = ref([])
	const autoClose = useAutoClose(store.visible, view, id => remove(id))
	const { isFocusWithin } = autoClose

	const remove = (id: NotificationId): void => {
		autoClose.clearTimer(id)
		emit('remove', id)
		store.drop(id)
		nextTick(() => {
			const active = document.activeElement
			if (isFocusWithin.value && !containerRef.value.some(container => container.contains(active))) isFocusWithin.value = false
		})
	}
	const restartTimer = (id: NotificationId): void => {
		autoClose.clearTimer(id)
		autoClose.syncTimers()
	}
	const add = (notification: BaseNotificationProps): NotificationId => {
		const id = store.push(notification)
		restartTimer(id)
		return id
	}
	const update = (id: NotificationId, notification: BaseNotificationProps): boolean => {
		const isUpdated = store.update(id, notification)
		restartTimer(id)
		return isUpdated
	}

	return { autoClose, containerRef, remove, add, update }
}

export function useBaseNotification(props: BaseNotificationProps, emit: BaseNotificationEmits) {
	const standard = useStandardBaseComponent('base-notification-item', props, NOTIFICATION_ELEMENTS)
	const store = useNotificationList(props, emit)
	const view = useNotificationView(props, store.getRevision)
	const { autoClose, containerRef, remove, add, update } = useNotificationActions(emit, store, view)
	const { isFocusWithin } = autoClose

	useDeclaredNotification(props, add, update)
	watch(store.groups, groups => autoClose.retainAreas(new Set(groups.map(group => group.position))))

	return {
		...standard,
		teleportTarget: useTeleportTarget(),
		containerRef,
		groups: store.groups,
		typeIconMap: TYPE_ICONS,
		...view,
		...useNotificationItemView(props, standard),
		isHovered: autoClose.isHovered,
		setHovered: autoClose.setHovered,
		getAreaLabel: (position: NotificationPosition): string => resolveAreaLabel(props, store.groups.value.length, position),
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
		...useNotificationLook(props, store.list),
	}
}
