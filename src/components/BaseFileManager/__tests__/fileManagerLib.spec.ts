import { ITEMS } from './fixtures'
import type { FileManagerItem } from '../types/BaseFileManager.types'
import { entryIcon, filterEntries, formatEntrySize, formatModified, sortEntries } from '../model/lib/fileManagerEntries'
import {
	buildIndex,
	canMoveTo,
	descendantIds,
	folderChain,
	folderToNodeId,
	folderTree,
	nameError,
	nodeIdToFolder,
	parentOf,
	resolveFolderId,
	ROOT_NODE_ID,
	uniqueName,
} from '../model/lib/fileManagerIndex'

const index = buildIndex(ITEMS)

describe('fileManagerIndex', () => {
	it('раскладывает записи по родителям и пропускает повторные id', () => {
		const twice = buildIndex([...ITEMS, { id: 'docs', name: 'Копия', type: 'folder' }])
		expect(twice.byId.get('docs')?.name).toBe('Документы')
		expect(index.children.get(null)?.map(item => item.id)).toEqual(['docs', 'photos', 'readme', 'logo', 'notes'])
		expect(index.children.get('docs')?.map(item => item.id)).toEqual(['work', 'report'])
	})

	it('цепочка папок от корня; файл, неизвестный id и цикл — null', () => {
		expect(folderChain(index, null)).toEqual([])
		expect(folderChain(index, 'work')?.map(item => item.id)).toEqual(['docs', 'work'])
		expect(folderChain(index, 'report')).toBeNull()
		expect(folderChain(index, 'missing')).toBeNull()
		const loop = buildIndex([
			{ id: 'a', parentId: 'b', name: 'a', type: 'folder' },
			{ id: 'b', parentId: 'a', name: 'b', type: 'folder' },
		])
		expect(folderChain(loop, 'a')).toBeNull()
	})

	it('resolveFolderId оставляет только существующую папку', () => {
		expect(resolveFolderId(index, 'docs')).toBe('docs')
		expect(resolveFolderId(index, 'report')).toBeNull()
		expect(resolveFolderId(index, null)).toBeNull()
	})

	it('потомки папки не зацикливаются на замкнутых родителях', () => {
		const loop = buildIndex([
			{ id: 'a', parentId: 'b', name: 'A', type: 'folder' },
			{ id: 'b', parentId: 'a', name: 'B', type: 'folder' },
		])
		expect(Array.from(descendantIds(loop, 'a')).sort()).toEqual(['a', 'b'])
	})

	it('потомки папки и родитель записи', () => {
		expect([...descendantIds(index, 'docs')].sort()).toEqual(['report', 'work'])
		expect(descendantIds(index, 'photos').size).toBe(0)
		expect(parentOf(index, 'work')).toBe('docs')
		expect(parentOf(index, 'docs')).toBeNull()
		expect(parentOf(index, 'missing')).toBeNull()
	})

	it('переместить можно в другую папку, но не в себя, потомка или текущего родителя', () => {
		expect(canMoveTo(index, ['report'], 'photos')).toBe(true)
		expect(canMoveTo(index, ['report'], null)).toBe(true)
		expect(canMoveTo(index, ['docs'], 'docs')).toBe(false)
		expect(canMoveTo(index, ['docs'], 'work')).toBe(false)
		expect(canMoveTo(index, ['report'], 'docs')).toBe(false)
		expect(canMoveTo(index, [], 'photos')).toBe(false)
		expect(canMoveTo(index, ['missing'], 'photos')).toBe(false)
		expect(canMoveTo(index, ['report'], 'readme')).toBe(false)
		expect(canMoveTo(index, ['docs', 'readme'], 'photos')).toBe(true)
	})

	it('проверка имени: пусто, запрещённые символы, занято без учёта регистра', () => {
		expect(nameError(index, { parentId: null }, '   ')).toBe('empty')
		expect(nameError(index, { parentId: null }, 'a/b')).toBe('forbidden')
		expect(nameError(index, { parentId: null }, 'a\\b')).toBe('forbidden')
		expect(nameError(index, { parentId: null }, '..')).toBe('forbidden')
		expect(nameError(index, { parentId: null }, ' фото ')).toBe('exists')
		expect(nameError(index, { parentId: 'docs' }, 'фото')).toBeNull()
		expect(nameError(index, { parentId: null, exceptId: 'photos' }, 'Фото')).toBeNull()
	})

	it('свободное имя для новой папки', () => {
		expect(uniqueName(index, 'docs', 'Новая папка')).toBe('Новая папка')
		const busy = buildIndex([
			{ id: '1', name: 'Новая папка', type: 'folder' },
			{ id: '2', name: 'Новая папка (2)', type: 'folder' },
		])
		expect(uniqueName(busy, null, 'Новая папка')).toBe('Новая папка (3)')
		const names = ['Новая папка', ...Array.from({ length: 998 }, (_, position) => `Новая папка (${position + 2})`)]
		const full = buildIndex(names.map((name, position) => ({ id: String(position), name, type: 'folder' as const })))
		expect(uniqueName(full, null, 'Новая папка')).toBe('Новая папка')
	})

	it('узлы дерева: корень и папки по алфавиту, блокировка', () => {
		const [root] = folderTree(index, 'Файлы')
		expect(root.id).toBe(ROOT_NODE_ID)
		expect(root.label).toBe('Файлы')
		expect(root.children?.map(node => node.id)).toEqual(['docs', 'photos'])
		expect(root.children?.[0].children?.map(node => node.id)).toEqual(['work'])
		expect(root.children?.[1].children).toBeUndefined()
		const [blocked] = folderTree(index, 'Файлы', id => id === 'photos' || id === null)
		expect(blocked.isDisabled).toBe(true)
		expect(blocked.children?.[1].isDisabled).toBe(true)
		expect(blocked.children?.[0].isDisabled).toBeUndefined()
		const [flat] = folderTree(buildIndex([]), 'Файлы')
		expect(flat.children).toBeUndefined()
	})

	it('перевод между id папки и узла дерева', () => {
		expect(folderToNodeId(null)).toBe(ROOT_NODE_ID)
		expect(folderToNodeId('docs')).toBe('docs')
		expect(nodeIdToFolder(ROOT_NODE_ID)).toBeNull()
		expect(nodeIdToFolder('docs')).toBe('docs')
	})
})

describe('fileManagerEntries', () => {
	const entries = ITEMS.filter(item => item.parentId === undefined)

	it('сортировка по имени: папки первыми, числа по значению', () => {
		const sorted = sortEntries([...entries, { id: 'f2', name: 'file2', type: 'file' }, { id: 'f10', name: 'file10', type: 'file' }], {
			key: 'name',
			direction: 'asc',
		})
		expect(sorted.map(item => item.id)).toEqual(['docs', 'photos', 'f2', 'f10', 'logo', 'notes', 'readme'])
		const desc = sortEntries(entries, { key: 'name', direction: 'desc' })
		expect(desc.map(item => item.id)).toEqual(['photos', 'docs', 'readme', 'notes', 'logo'])
	})

	it('сортировка по размеру и дате; без значения — в начало по возрастанию', () => {
		const bySize = sortEntries(entries, { key: 'size', direction: 'desc' })
		expect(bySize.filter(item => item.type === 'file').map(item => item.id)).toEqual(['logo', 'readme', 'notes'])
		const byDate = sortEntries(entries, { key: 'modifiedAt', direction: 'asc' })
		expect(byDate.filter(item => item.type === 'file').map(item => item.id)).toEqual(['notes', 'readme', 'logo'])
		const broken: FileManagerItem[] = [
			{ id: 'a', name: 'a', type: 'file', modifiedAt: 'не дата' },
			{ id: 'b', name: 'b', type: 'file', modifiedAt: 5 },
		]
		expect(sortEntries(broken, { key: 'modifiedAt', direction: 'asc' }).map(item => item.id)).toEqual(['a', 'b'])
	})

	it('поиск по имени без учёта регистра', () => {
		expect(filterEntries(entries, '  ФОТО ').map(item => item.id)).toEqual(['photos'])
		expect(filterEntries(entries, '').length).toBe(entries.length)
		expect(filterEntries(entries, 'нет такого')).toEqual([])
	})

	it('размер и дата показываются только когда заданы', () => {
		expect(formatEntrySize({ id: 'a', name: 'a', type: 'folder' })).toBe('')
		expect(formatEntrySize({ id: 'a', name: 'a', type: 'file' })).toBe('')
		expect(formatEntrySize({ id: 'a', name: 'a', type: 'file', size: 1_200 })).toMatch(/КБ/)
		expect(formatModified(undefined)).toBe('')
		expect(formatModified('не дата')).toBe('')
		expect(formatModified(new Date(2026, 2, 4, 9, 30))).toMatch(/2026/)
		expect(formatModified(Date.UTC(2026, 2, 4))).toMatch(/2026/)
	})

	it('иконка по типу, MIME и расширению', () => {
		expect(entryIcon({ id: 'a', name: 'a', type: 'folder' })).toBe('folder')
		expect(entryIcon({ id: 'a', name: 'снимок', type: 'file', mime: 'image/webp' })).toBe('file-img')
		expect(entryIcon({ id: 'a', name: 'app.vue', type: 'file' })).toBe('file-vue')
		expect(entryIcon({ id: 'a', name: 'README', type: 'file' })).toBe('file')
	})
})
