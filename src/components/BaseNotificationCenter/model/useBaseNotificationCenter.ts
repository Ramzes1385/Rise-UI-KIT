import { useUi } from '@composables/base/useUi'
import { computed, ref, useId, watch } from 'vue'
import { getLocale, pluralize } from '@/locales/state'
import { calcDerivedScale } from '@utils/media/iconUtils'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { UI_NOTIFICATION_CENTER } from '@/locales/messages'
import { changedIds, unreadCount, visibleItems, withRead } from './list/notificationList'
import { SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type {
	NotificationCenterItem,
	NotificationFilter,
	NotificationCenterProps,
	BaseNotificationCenterEmits,
} from '../types/BaseNotificationCenter.types'

const COMPACT_SCALE_RATIO = 0.875

function useNotificationFilter(props: NotificationCenterProps, emit: BaseNotificationCenterEmits) {
	const filter = ref<NotificationFilter>(props.filter ?? 'all')
	watch(
		() => props.filter,
		value => {
			if (value) filter.value = value
		},
	)
	return {
		filter,
		setFilter(value: string | number): void {
			filter.value = value as NotificationFilter
			emit('update:filter', filter.value)
		},
	}
}

export function useBaseNotificationCenter(props: NotificationCenterProps, emit: BaseNotificationCenterEmits) {
	const unread = computed(() => unreadCount(props.items))
	const { filter, setFilter } = useNotificationFilter(props, emit)
	const setRead = (ids: readonly string[], isRead: boolean): void => {
		const changed = changedIds(props.items, ids, isRead)
		if (!changed.length) return
		emit('update:items', withRead(props.items, changed, isRead))
		if (isRead) emit('read', changed)
		else emit('unread', changed)
	}
	return {
		...useStandardBaseComponent('base-notification-center', props, ['root', 'header', 'list', 'item']),
		ui: useUi(props, 'base-notification-center'),
		compactScale: computed(() => calcDerivedScale(props.sizeScale ?? SIZE_SCALE_DEFAULT, COMPACT_SCALE_RATIO)),
		titleId: `${useId()}-title`,
		filter,
		setFilter,
		unread,
		unreadText: computed(() => (unread.value ? pluralize(getLocale().plural.NOTIFICATIONS_UNREAD, unread.value) : '')),
		visible: computed(() => visibleItems(props.items, filter.value)),
		filterOptions: computed(() => [
			{ value: 'all', label: UI_NOTIFICATION_CENTER.ALL },
			{ value: 'unread', label: unread.value ? `${UI_NOTIFICATION_CENTER.UNREAD} · ${unread.value}` : UI_NOTIFICATION_CENTER.UNREAD },
		]),
		timeOf: (item: NotificationCenterItem): string => formatRelativeTime(item.date, { now: props.now }),
		isoOf: (item: NotificationCenterItem): string => new Date(item.date).toISOString(),
		select(item: NotificationCenterItem): void {
			setRead([item.id], true)
			emit('select', item)
		},
		toggle(item: NotificationCenterItem): void {
			setRead([item.id], !item.isRead)
		},
		readAll(): void {
			setRead(
				props.items.map(item => item.id),
				true,
			)
		},
	}
}
