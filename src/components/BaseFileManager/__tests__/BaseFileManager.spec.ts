import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import { ITEMS, renderManager } from './fixtures'
import userEvent from '@testing-library/user-event'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { fireEvent, screen, within } from '@testing-library/vue'

function optionNames(): string[] {
	return screen.getAllByRole('option').map(option => option.getAttribute('data-entry-id') as string)
}

function option(id: string): HTMLElement {
	return screen.getAllByRole('option').find(element => element.getAttribute('data-entry-id') === id) as HTMLElement
}

describe('BaseFileManager: содержимое', () => {
	it('показывает записи корня: папки перед файлами, по имени', () => {
		renderManager()
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.LABEL })).toBeInTheDocument()
		expect(optionNames()).toEqual(['docs', 'photos', 'logo', 'notes', 'readme'])
		expect(screen.getByRole('listbox', { name: 'Содержимое папки «Файлы»' })).toHaveAttribute('aria-multiselectable', 'true')
		expect(within(option('docs')).getByText(/Папка/)).toBeInTheDocument()
	})

	it('размер и дата записи по языку кита', () => {
		renderManager()
		expect(option('report') ?? option('readme')).toHaveTextContent(/КБ/)
		expect(option('readme')).toHaveTextContent(/2026/)
		expect(option('notes')).toHaveTextContent(/10 Б/)
	})

	it('свой aria-label и имя корня', () => {
		renderManager({ ariaLabel: 'Проект', rootLabel: 'Проект' })
		expect(screen.getByRole('navigation', { name: 'Путь: Проект' })).toBeInTheDocument()
		expect(screen.getByRole('group', { name: 'Проект' })).toBeInTheDocument()
		expect(screen.getAllByText('Проект').length).toBeGreaterThan(0)
	})

	it('путь: показывает содержимое папки и «хлебные крошки»', () => {
		renderManager({ path: 'docs' })
		expect(optionNames()).toEqual(['work', 'report'])
		const nav = screen.getByRole('navigation')
		expect(within(nav).getByText('Документы')).toBeInTheDocument()
	})

	it('неизвестный путь и файл вместо папки показывают корень', () => {
		const { unmount } = renderManager({ path: 'missing' })
		expect(optionNames()).toContain('docs')
		unmount()
		renderManager({ path: 'logo' })
		expect(optionNames()).toContain('docs')
	})

	it('запись с неизвестным родителем не показывается', () => {
		renderManager({ items: [...ITEMS, { id: 'lost', parentId: 'gone', name: 'lost.txt', type: 'file' }] })
		expect(optionNames()).not.toContain('lost')
	})

	it('строка состояния: число записей и выбранных', async () => {
		const { rerender } = renderManager()
		expect(screen.getByRole('status')).toHaveTextContent('5 элементов')
		await rerender({ selected: ['logo', 'notes'] })
		expect(screen.getByRole('status')).toHaveTextContent('5 элементов · выбрано 2')
	})
})

describe('BaseFileManager: навигация', () => {
	it('двойной клик по папке открывает её и сообщает open и update:path', async () => {
		const { emitted } = renderManager()
		await fireEvent.dblClick(option('docs'))
		expect(emitted('update:path')).toEqual([['docs']])
		expect(emitted('open')).toEqual([[ITEMS[0]]])
	})

	it('двойной клик по файлу только сообщает open', async () => {
		const { emitted } = renderManager()
		await fireEvent.dblClick(option('logo'))
		expect(emitted('open')).toEqual([[ITEMS[5]]])
		expect(emitted('update:path')).toBeUndefined()
	})

	it('без пропа path папку держит сам менеджер', async () => {
		renderManager()
		await fireEvent.dblClick(option('docs'))
		expect(optionNames()).toEqual(['work', 'report'])
	})

	it('кнопка «Вверх» и крошки ведут выше; в корне «Вверх» недоступна', async () => {
		const { emitted, rerender } = renderManager({ path: 'work' })
		await userEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.UP }))
		expect(emitted('update:path')).toEqual([['docs']])
		await rerender({ path: 'docs' })
		await userEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: UI_FILE_MANAGER.ROOT }))
		expect(emitted('update:path')?.[1]).toEqual([null])
		await rerender({ path: null })
		expect(screen.getByRole('button', { name: UI_FILE_MANAGER.UP })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.UP }))
		expect(emitted('update:path')).toHaveLength(2)
	})

	it('дерево папок: узел ведёт в папку, текущая папка выбрана', async () => {
		const { emitted } = renderManager({ path: 'docs' })
		const tree = screen.getByRole('tree', { name: UI_FILE_MANAGER.TREE_LABEL })
		expect(within(tree).getByRole('treeitem', { name: 'Документы' })).toHaveAttribute('aria-selected', 'true')
		await userEvent.click(within(tree).getByRole('treeitem', { name: 'Фото' }))
		expect(emitted('update:path')).toEqual([['photos']])
	})

	it('дерево папок сворачивается и раскрывается стрелками', async () => {
		renderManager({ path: 'docs' })
		const tree = screen.getByRole('tree', { name: UI_FILE_MANAGER.TREE_LABEL })
		expect(within(tree).getByRole('treeitem', { name: 'Работа' })).toBeInTheDocument()
		within(tree).getByRole('treeitem', { name: 'Документы' }).focus()
		await userEvent.keyboard('{ArrowLeft}')
		expect(within(tree).queryByRole('treeitem', { name: 'Работа' })).not.toBeInTheDocument()
		await userEvent.keyboard('{ArrowRight}')
		expect(within(tree).getByRole('treeitem', { name: 'Работа' })).toBeInTheDocument()
	})

	it('hasTree=false скрывает дерево', () => {
		renderManager({ hasTree: false })
		expect(screen.queryByRole('tree')).not.toBeInTheDocument()
	})

	it('отключённый менеджер не ходит по папкам', async () => {
		const { emitted } = renderManager({ isDisabled: true })
		await fireEvent.dblClick(option('docs'))
		expect(emitted('open')).toBeUndefined()
		expect(screen.getByRole('textbox', { name: UI_FILE_MANAGER.SEARCH_LABEL })).toBeDisabled()
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.LABEL })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('listbox')).toHaveAttribute('aria-disabled', 'true')
		expect(option('docs')).toHaveAttribute('aria-disabled', 'true')
	})

	it('при смене папки поиск сбрасывается', async () => {
		const { emitted } = renderManager({ query: 'о' })
		await fireEvent.dblClick(option('docs'))
		expect(emitted('update:query')).toEqual([['']])
	})
})

describe('BaseFileManager: поиск, сортировка, вид', () => {
	it('поиск по имени в текущей папке', async () => {
		const { emitted, rerender } = renderManager()
		await userEvent.type(screen.getByRole('textbox', { name: UI_FILE_MANAGER.SEARCH_LABEL }), 'фот')
		expect(emitted('update:query')?.at(-1)).toEqual(['фот'])
		await rerender({ query: 'фот' })
		expect(optionNames()).toEqual(['photos'])
	})

	it('ничего не найдено: сообщение с запросом', async () => {
		renderManager({ query: 'zzz' })
		expect(screen.getByText(UI_FILE_MANAGER.SEARCH_EMPTY_TITLE)).toBeInTheDocument()
		expect(screen.getByText(/zzz/)).toBeInTheDocument()
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('пустая папка: предложение создать или загрузить; в режиме просмотра — без него', async () => {
		const { rerender } = renderManager({ items: [] })
		expect(screen.getByText(UI_FILE_MANAGER.EMPTY_TITLE)).toBeInTheDocument()
		expect(screen.getByText(UI_FILE_MANAGER.EMPTY_TEXT)).toBeInTheDocument()
		await rerender({ isReadonly: true })
		expect(screen.queryByText(UI_FILE_MANAGER.EMPTY_TEXT)).not.toBeInTheDocument()
	})

	it('кнопки сортировки: имя по возрастанию — активна, повтор меняет порядок', async () => {
		const { emitted, rerender } = renderManager()
		const byName = screen.getByRole('button', { name: /Сортировать: Имя, по возрастанию/ })
		expect(byName).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(byName)
		expect(emitted('update:sort')).toEqual([[{ key: 'name', direction: 'desc' }]])
		await rerender({ sort: { key: 'name', direction: 'desc' } })
		expect(optionNames()).toEqual(['photos', 'docs', 'readme', 'notes', 'logo'])
	})

	it('сортировка по размеру начинается с больших, по дате — с новых', async () => {
		const { emitted, rerender } = renderManager()
		await userEvent.click(screen.getByRole('button', { name: /Сортировать: Размер/ }))
		expect(emitted('update:sort')?.[0]).toEqual([{ key: 'size', direction: 'desc' }])
		await rerender({ sort: { key: 'size', direction: 'desc' } })
		expect(optionNames().slice(2)).toEqual(['logo', 'readme', 'notes'])
		await userEvent.click(screen.getByRole('button', { name: /Сортировать: Изменён/ }))
		expect(emitted('update:sort')?.[1]).toEqual([{ key: 'modifiedAt', direction: 'desc' }])
	})

	it('вид: переключатель сообщает update:view, плитки меняют класс', async () => {
		const { emitted, rerender, container } = renderManager()
		await userEvent.click(screen.getByRole('radio', { name: UI_FILE_MANAGER.VIEW_GRID }))
		expect(emitted('update:view')).toEqual([['grid']])
		await rerender({ view: 'grid' })
		expect(container.querySelector('.base-file-manager--grid')).toBeInTheDocument()
		expect(screen.getByRole('listbox')).toHaveClass('base-file-manager__list--grid')
	})

	it('значения без пропов хранит сам менеджер', async () => {
		const { container } = renderManager()
		await userEvent.click(screen.getByRole('radio', { name: UI_FILE_MANAGER.VIEW_GRID }))
		expect(container.querySelector('.base-file-manager--grid')).toBeInTheDocument()
		await userEvent.click(screen.getByRole('button', { name: /Сортировать: Имя/ }))
		expect(optionNames()).toEqual(['photos', 'docs', 'readme', 'notes', 'logo'])
	})
})

describe('BaseFileManager: выбор', () => {
	it('клик выбирает одну запись, Ctrl+клик добавляет, Shift+клик берёт диапазон', async () => {
		const { emitted } = renderManager()
		await fireEvent.click(option('photos'))
		expect(emitted('update:selected')?.at(-1)).toEqual([['photos']])
		await fireEvent.click(option('logo'), { shiftKey: true })
		expect(emitted('update:selected')?.at(-1)).toEqual([['photos', 'logo']])
		await fireEvent.click(option('notes'), { ctrlKey: true })
		expect(emitted('update:selected')?.at(-1)).toEqual([['photos', 'logo', 'notes']])
		await fireEvent.click(option('notes'), { metaKey: true })
		expect(emitted('update:selected')?.at(-1)).toEqual([['photos', 'logo']])
		expect(option('photos')).toHaveAttribute('aria-selected', 'true')
		expect(option('docs')).toHaveAttribute('aria-selected', 'false')
	})

	it('Shift+клик без опорной записи берёт саму запись', async () => {
		const { emitted } = renderManager({ items: [{ id: 'a', name: 'a', type: 'file' }] })
		await fireEvent.click(option('a'), { shiftKey: true })
		expect(emitted('update:selected')?.at(-1)).toEqual([['a']])
	})

	it('клик по пустому месту списка снимает выбор, по кнопке сортировки — нет', async () => {
		const { emitted, container } = renderManager({ selected: ['logo'] })
		await userEvent.click(screen.getByRole('button', { name: /Сортировать: Имя/ }))
		expect(emitted('update:selected')).toBeUndefined()
		await fireEvent.click(screen.getByRole('listbox'))
		expect(emitted('update:selected')?.at(-1)).toEqual([[]])
		emitted('update:selected')!.length = 0
		await fireEvent.click(container.querySelector('.base-file-manager__area') as HTMLElement)
		expect(emitted('update:selected')?.at(-1)).toEqual([[]])
	})

	it('выбор записей, которых нет в списке, снимается; пока идёт загрузка — сохраняется', async () => {
		const { emitted, rerender } = renderManager({ selected: ['logo', 'notes'], isLoading: true })
		await rerender({ items: [] })
		expect(emitted('update:selected')).toBeUndefined()
		await rerender({ items: ITEMS.filter(item => item.id !== 'logo'), isLoading: false })
		expect(emitted('update:selected')?.at(-1)).toEqual([['notes']])
	})

	it('при смене папки выбор очищается', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await fireEvent.dblClick(option('docs'))
		expect(emitted('update:selected')?.at(-1)).toEqual([[]])
	})

	it('запись с фокусом одна в порядке Tab (roving tabindex)', () => {
		renderManager({ selected: ['notes'] })
		const tabbable = screen.getAllByRole('option').filter(element => element.getAttribute('tabindex') === '0')
		expect(tabbable.map(element => element.getAttribute('data-entry-id'))).toEqual(['notes'])
	})
})

describe('BaseFileManager: состояния', () => {
	it('загрузка: заготовки вместо списка, aria-busy и объявление', () => {
		renderManager({ isLoading: true })
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.LABEL })).toHaveAttribute('aria-busy', 'true')
		expect(screen.getByText(UI_FILE_MANAGER.LOADING)).toBeInTheDocument()
	})

	it('ошибка: сообщение и «Повторить» сообщает retry', async () => {
		const { emitted } = renderManager({ error: 'Сервер недоступен' })
		expect(screen.getByRole('alert')).toHaveTextContent('Сервер недоступен')
		expect(screen.getByText(UI_FILE_MANAGER.ERROR_TITLE)).toBeInTheDocument()
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
		await userEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.RETRY }))
		expect(emitted('retry')).toHaveLength(1)
	})

	it('только просмотр: операций в панели нет, навигация и выбор работают', async () => {
		const { emitted } = renderManager({ isReadonly: true, selected: ['logo'] })
		for (const name of [UI_FILE_MANAGER.NEW_FOLDER, UI_FILE_MANAGER.UPLOAD, UI_FILE_MANAGER.RENAME, UI_FILE_MANAGER.DELETE]) {
			expect(screen.queryByRole('button', { name })).not.toBeInTheDocument()
		}
		expect(screen.getByRole('button', { name: UI_FILE_MANAGER.OPEN })).toBeInTheDocument()
		expect(option('logo')).toHaveAttribute('draggable', 'false')
		await fireEvent.dblClick(option('docs'))
		expect(emitted('open')).toHaveLength(1)
	})

	it('слот icon заменяет иконку записи', () => {
		renderManager({}, { slots: { icon: ({ item }: { item: { id: string } }) => h('i', { class: 'custom-icon' }, item.id) } })
		expect(within(option('docs')).getByText('docs')).toHaveClass('custom-icon')
	})

	it('слот empty заменяет пустое состояние и знает, что это поиск', () => {
		renderManager(
			{ items: [], query: 'x' },
			{ slots: { empty: ({ isSearch, query }: { isSearch: boolean; query: string }) => h('p', `${isSearch}:${query}`) } },
		)
		expect(screen.getByText('true:x')).toBeInTheDocument()
		expect(screen.queryByText(UI_FILE_MANAGER.SEARCH_EMPTY_TITLE)).not.toBeInTheDocument()
	})
})

describe('BaseFileManager: оформление и настройки', () => {
	it('вариант, масштаб, высота, свои классы и ui', () => {
		const { container } = renderManager({
			variant: 'soft',
			sizeScale: 125,
			height: 300,
			customClass: { root: 'my-root', toolbar: 'my-toolbar' },
			ui: { root: 'ui-root', entry: 'ui-entry' },
		})
		const root = container.querySelector('.base-file-manager') as HTMLElement
		expect(root).toHaveClass('base-file-manager--soft', 'my-root', 'ui-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(root.style.height).toBe('300px')
		expect(container.querySelector('.base-file-manager__toolbar')).toHaveClass('my-toolbar')
		expect(screen.getAllByRole('option')[0]).toHaveClass('ui-entry')
	})

	it('высота строкой передаётся как есть', () => {
		const { container } = renderManager({ height: '50vh' })
		expect((container.querySelector('.base-file-manager') as HTMLElement).style.height).toBe('50vh')
	})

	it('отключённый менеджер получает класс отключения', () => {
		const { container } = renderManager({ isDisabled: true })
		expect(container.querySelector('.base-file-manager')).toHaveClass('base-file-manager--disabled')
	})

	it('умолчания из плагина: defaults.BaseFileManager', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseFileManager: { hasTree: false, view: undefined } } })
		renderManager({}, { global: { plugins: [plugin] } })
		expect(screen.queryByRole('tree')).not.toBeInTheDocument()
	})

	it('язык кита: подписи на английском', async () => {
		const { setLocale } = await import('@/locales/state')
		setLocale('en')
		renderManager()
		expect(screen.getByRole('group', { name: 'File manager' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Up' })).toBeInTheDocument()
		setLocale('ru')
	})
})
