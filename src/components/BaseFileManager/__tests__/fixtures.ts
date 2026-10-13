import { render } from '@testing-library/vue'
import BaseFileManager from '../ui/BaseFileManager.vue'
import type { FileManagerItem } from '../types/BaseFileManager.types'

export const ITEMS: FileManagerItem[] = [
	{ id: 'docs', name: 'Документы', type: 'folder', modifiedAt: '2026-03-02T10:00:00Z' },
	{ id: 'photos', name: 'Фото', type: 'folder' },
	{ id: 'work', parentId: 'docs', name: 'Работа', type: 'folder' },
	{
		id: 'report',
		parentId: 'docs',
		name: 'Отчёт.pdf',
		type: 'file',
		size: 2_400_000,
		mime: 'application/pdf',
		modifiedAt: '2026-03-04T09:30:00Z',
	},
	{ id: 'readme', name: 'README.md', type: 'file', size: 1_200, modifiedAt: '2026-03-01T08:00:00Z' },
	{ id: 'logo', name: 'logo.png', type: 'file', size: 48_000, mime: 'image/png', modifiedAt: '2026-03-03T12:00:00Z' },
	{ id: 'notes', name: 'notes', type: 'file', size: 10 },
]

export function renderManager(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
	return render(BaseFileManager, { props: { items: ITEMS, ...props }, ...options })
}
