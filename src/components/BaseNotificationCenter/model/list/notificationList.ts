import type { NotificationCenterItem, NotificationFilter } from '../../types/BaseNotificationCenter.types'

export const unreadCount = (items: readonly NotificationCenterItem[]): number => items.filter(item => !item.isRead).length

export const visibleItems = (items: readonly NotificationCenterItem[], filter: NotificationFilter): NotificationCenterItem[] =>
	filter === 'unread' ? items.filter(item => !item.isRead) : [...items]

export function changedIds(items: readonly NotificationCenterItem[], ids: readonly string[], isRead: boolean): string[] {
	const wanted = new Set(ids)
	return items.filter(item => wanted.has(item.id) && Boolean(item.isRead) !== isRead).map(item => item.id)
}

export function withRead(items: readonly NotificationCenterItem[], ids: readonly string[], isRead: boolean): NotificationCenterItem[] {
	const changed = new Set(ids)
	return items.map(item => (changed.has(item.id) ? { ...item, isRead } : item))
}
