import { computed, ref } from 'vue'
import type {
	BaseNotificationEmits,
	BaseNotificationProps,
	NotificationGroup,
	NotificationId,
	NotificationItem,
	NotificationPosition,
} from '../types/BaseNotification.types'

const DEFAULT_POSITION: NotificationPosition = 'top-right'

function resolveLimit(maxVisible: number | undefined): number {
	if (maxVisible === undefined || !Number.isFinite(maxVisible) || maxVisible < 1) return Infinity
	return Math.floor(maxVisible)
}

function useNotificationStore(props: BaseNotificationProps, emit: BaseNotificationEmits) {
	const internalItems = ref<NotificationItem[]>([])
	const revisions = new Map<NotificationId, number>()
	let nextId = 0

	const replaceAt = (index: number, notification: BaseNotificationProps): NotificationId => {
		const { id } = internalItems.value[index]
		internalItems.value.splice(index, 1, { ...notification, items: undefined, id } as NotificationItem)
		revisions.set(id, (revisions.get(id) ?? 0) + 1)
		return id
	}

	return {
		list: computed(() => props.items ?? internalItems.value),
		getRevision: (id: NotificationId): number => revisions.get(id) ?? 0,
		push(notification: BaseNotificationProps): NotificationId {
			const key = notification.notificationKey
			const index = key === undefined ? -1 : internalItems.value.findIndex(item => item.notificationKey === key)
			if (index !== -1) return replaceAt(index, notification)
			const id = nextId++
			internalItems.value.unshift({ ...notification, items: undefined, id } as NotificationItem)
			return id
		},
		update(id: NotificationId, notification: BaseNotificationProps): boolean {
			const index = internalItems.value.findIndex(item => item.id === id)
			if (index === -1) return false
			replaceAt(index, notification)
			return true
		},
		drop(id: NotificationId): void {
			if (props.items) return
			revisions.delete(id)
			internalItems.value = internalItems.value.filter(notification => notification.id !== id)
			if (internalItems.value.length === 0) emit('close')
		},
	}
}

export function useNotificationList(props: BaseNotificationProps, emit: BaseNotificationEmits) {
	const store = useNotificationStore(props, emit)
	const getPosition = (notification: NotificationItem): NotificationPosition =>
		notification.position ?? props.position ?? DEFAULT_POSITION

	const visible = computed<NotificationItem[]>(() => {
		const limit = resolveLimit(props.maxVisible)
		if (limit === Infinity) return store.list.value
		const shownByPosition = new Map<NotificationPosition, number>()
		const allowed = new Set<NotificationId>()
		for (const notification of [...store.list.value].reverse()) {
			const position = getPosition(notification)
			const shown = shownByPosition.get(position) ?? 0
			if (shown >= limit) continue
			shownByPosition.set(position, shown + 1)
			allowed.add(notification.id)
		}
		return store.list.value.filter(notification => allowed.has(notification.id))
	})

	const groups = computed<NotificationGroup[]>(() => {
		const byPosition = new Map<NotificationPosition, NotificationItem[]>()
		for (const notification of visible.value) {
			const position = getPosition(notification)
			byPosition.set(position, [...(byPosition.get(position) ?? []), notification])
		}
		if (byPosition.size === 0) byPosition.set(props.position ?? DEFAULT_POSITION, [])
		return [...byPosition].map(([position, items]) => ({ position, items }))
	})

	return {
		...store,
		visible,
		groups,
	}
}
