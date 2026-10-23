import { currentLocale } from '@/locales/state'
import { foldSearchText } from '@utils/data/textUtils'
import { formatDateText } from '@utils/data/dateFormatUtils'
import { formatFileSize, getExtension, getFileIconName } from '@utils/media/fileUtils'
import type { FileManagerItem, FileManagerSort, FileManagerSortKey } from '../../types/BaseFileManager.types'

function toTime(value: FileManagerItem['modifiedAt']): number {
	if (value === undefined) return 0
	const time = new Date(value).getTime()
	return Number.isNaN(time) ? 0 : time
}

function comparatorFor(key: FileManagerSortKey, collator: Intl.Collator): (a: FileManagerItem, b: FileManagerItem) => number {
	if (key === 'size') return (a, b) => (a.size ?? 0) - (b.size ?? 0)
	if (key === 'modifiedAt') return (a, b) => toTime(a.modifiedAt) - toTime(b.modifiedAt)
	return (a, b) => collator.compare(a.name, b.name)
}

export function sortEntries(entries: readonly FileManagerItem[], sort: FileManagerSort): FileManagerItem[] {
	const collator = new Intl.Collator(currentLocale.value.intl, { numeric: true, sensitivity: 'base' })
	const sign = sort.direction === 'desc' ? -1 : 1
	const compare = comparatorFor(sort.key, collator)
	return [...entries].sort((a, b) => {
		if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
		return compare(a, b) * sign || collator.compare(a.name, b.name)
	})
}

export function filterEntries(entries: readonly FileManagerItem[], query: string): FileManagerItem[] {
	const needle = foldSearchText(query.trim())
	if (!needle) return [...entries]
	return entries.filter(item => foldSearchText(item.name).includes(needle))
}

export function formatEntrySize(item: FileManagerItem): string {
	return item.type === 'file' && item.size !== undefined ? formatFileSize(item.size) : ''
}

export function formatModified(value: FileManagerItem['modifiedAt']): string {
	if (value === undefined || Number.isNaN(new Date(value).getTime())) return ''
	return formatDateText(new Date(value), { dateStyle: 'medium', timeStyle: 'short' }, currentLocale.value.intl)
}

export function entryIcon(item: FileManagerItem): string {
	if (item.type === 'folder') return 'folder'
	if (item.mime?.startsWith('image/')) return 'file-img'
	return getExtension(item.name) ? getFileIconName(item.name) : 'file'
}
