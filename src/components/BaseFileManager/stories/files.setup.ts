import { ref } from 'vue'
import type { FileManagerItem } from '@components/BaseFileManager'

const FILES: FileManagerItem[] = [
	{ id: 'archive', name: 'Архив', type: 'folder', modifiedAt: new Date(2025, 0, 20, 12, 0) },
	{ id: 'docs', name: 'Документы', type: 'folder', modifiedAt: new Date(2025, 4, 14, 9, 30) },
	{ id: 'projects', name: 'Проекты', type: 'folder', modifiedAt: new Date(2025, 4, 12, 18, 5) },
	{ id: 'photos', name: 'Фото', type: 'folder', modifiedAt: new Date(2025, 3, 28, 20, 15) },
	{ id: 'readme', name: 'README.md', type: 'file', size: 1200, mime: 'text/markdown', modifiedAt: new Date(2025, 4, 1, 8, 0) },
	{ id: 'todo', name: 'Список дел.txt', type: 'file', size: 2048, mime: 'text/plain', modifiedAt: new Date(2025, 4, 15, 9, 10) },
	{
		id: 'budget',
		name: 'Бюджет 2025.xlsx',
		type: 'file',
		size: 184320,
		mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		modifiedAt: new Date(2025, 4, 10, 14, 45),
	},
	{
		id: 'backup',
		parentId: 'archive',
		name: 'backup-2024.zip',
		type: 'file',
		size: 52428800,
		mime: 'application/zip',
		modifiedAt: new Date(2025, 0, 20, 12, 0),
	},
	{
		id: 'meeting',
		parentId: 'archive',
		name: 'Запись встречи.mp3',
		type: 'file',
		size: 9437184,
		mime: 'audio/mpeg',
		modifiedAt: new Date(2024, 11, 5, 16, 20),
	},
	{ id: 'contracts', parentId: 'docs', name: 'Договоры', type: 'folder', modifiedAt: new Date(2025, 4, 2, 11, 0) },
	{ id: 'reports', parentId: 'docs', name: 'Отчёты', type: 'folder', modifiedAt: new Date(2025, 4, 6, 15, 30) },
	{
		id: 'lease',
		parentId: 'docs',
		name: 'Договор аренды.pdf',
		type: 'file',
		size: 2411724,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 4, 14, 9, 30),
	},
	{
		id: 'protocol',
		parentId: 'docs',
		name: 'Протокол собрания.docx',
		type: 'file',
		size: 96256,
		mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		modifiedAt: new Date(2025, 4, 9, 13, 0),
	},
	{
		id: 'contract',
		parentId: 'contracts',
		name: 'Договор подряда.pdf',
		type: 'file',
		size: 1153434,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 4, 2, 11, 0),
	},
	{
		id: 'act',
		parentId: 'contracts',
		name: 'Акт выполненных работ.pdf',
		type: 'file',
		size: 482304,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 4, 3, 10, 15),
	},
	{
		id: 'quarter',
		parentId: 'reports',
		name: 'Отчёт за квартал.pdf',
		type: 'file',
		size: 3250585,
		mime: 'application/pdf',
		modifiedAt: new Date(2025, 4, 6, 15, 30),
	},
	{
		id: 'sales',
		parentId: 'reports',
		name: 'Продажи.xlsx',
		type: 'file',
		size: 245760,
		mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		modifiedAt: new Date(2025, 4, 5, 17, 40),
	},
	{ id: 'rise', parentId: 'projects', name: 'Rise UI Kit', type: 'folder', modifiedAt: new Date(2025, 4, 12, 18, 5) },
	{
		id: 'pitch',
		parentId: 'projects',
		name: 'Презентация.pptx',
		type: 'file',
		size: 7340032,
		mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		modifiedAt: new Date(2025, 4, 8, 12, 10),
	},
	{
		id: 'logo',
		parentId: 'rise',
		name: 'logo.svg',
		type: 'file',
		size: 3584,
		mime: 'image/svg+xml',
		modifiedAt: new Date(2025, 4, 12, 18, 5),
	},
	{
		id: 'mockup',
		parentId: 'rise',
		name: 'Макет главной.png',
		type: 'file',
		size: 868352,
		mime: 'image/png',
		modifiedAt: new Date(2025, 4, 11, 19, 25),
	},
	{ id: 'vacation', parentId: 'photos', name: 'Отпуск', type: 'folder', modifiedAt: new Date(2025, 3, 28, 20, 15) },
	{
		id: 'portrait',
		parentId: 'photos',
		name: 'Портрет.jpg',
		type: 'file',
		size: 2097152,
		mime: 'image/jpeg',
		modifiedAt: new Date(2025, 3, 20, 10, 50),
	},
	{
		id: 'beach',
		parentId: 'vacation',
		name: 'Пляж.jpg',
		type: 'file',
		size: 3145728,
		mime: 'image/jpeg',
		modifiedAt: new Date(2025, 3, 28, 20, 15),
	},
	{
		id: 'sunset',
		parentId: 'vacation',
		name: 'Закат.jpg',
		type: 'file',
		size: 2621440,
		mime: 'image/jpeg',
		modifiedAt: new Date(2025, 3, 27, 21, 5),
	},
	{
		id: 'sea',
		parentId: 'vacation',
		name: 'Видео с моря.mp4',
		type: 'file',
		size: 94371840,
		mime: 'video/mp4',
		modifiedAt: new Date(2025, 3, 26, 14, 0),
	},
]

const UPLOADED_AT = new Date(2025, 4, 15, 10, 30)

function collectIds(items: FileManagerItem[], ids: string[]): Set<string> {
	const result = new Set(ids)
	let size = 0
	while (size !== result.size) {
		size = result.size
		items.forEach(item => {
			if (item.parentId && result.has(item.parentId)) result.add(item.id)
		})
	}
	return result
}

export function setup() {
	const items = ref<FileManagerItem[]>(structuredClone(FILES))
	let created = 0

	function createFolder(parentId: string | null, name: string): void {
		created++
		items.value = [...items.value, { id: `folder-${created}`, parentId, name, type: 'folder', modifiedAt: UPLOADED_AT }]
	}

	function rename(id: string, name: string): void {
		items.value = items.value.map(item => (item.id === id ? { ...item, name } : item))
	}

	function remove(ids: string[]): void {
		const removed = collectIds(items.value, ids)
		items.value = items.value.filter(item => !removed.has(item.id))
	}

	function move(ids: string[], targetId: string | null): void {
		items.value = items.value.map(item => (ids.includes(item.id) ? { ...item, parentId: targetId } : item))
	}

	function upload(files: File[], parentId: string | null): void {
		const added = files.map((file): FileManagerItem => {
			created++
			return {
				id: `file-${created}`,
				parentId,
				name: file.name,
				type: 'file',
				size: file.size,
				mime: file.type,
				modifiedAt: UPLOADED_AT,
			}
		})
		items.value = [...items.value, ...added]
	}

	return { items, createFolder, rename, remove, move, upload }
}
