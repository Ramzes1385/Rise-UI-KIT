import '@testing-library/jest-dom/vitest'
import { ITEMS, renderManager } from './fixtures'
import userEvent from '@testing-library/user-event'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'

function option(id: string): HTMLElement {
	return screen.getAllByRole('option').find(element => element.getAttribute('data-entry-id') === id) as HTMLElement
}

function button(name: string): HTMLElement {
	return screen.getByRole('button', { name })
}

function editor(name: string): HTMLInputElement {
	return within(screen.getByRole('group', { name })).getByRole('textbox') as HTMLInputElement
}

describe('BaseFileManager: новая папка', () => {
	it('кнопка открывает поле с предложенным именем, Enter сообщает create-folder', async () => {
		const { emitted } = renderManager()
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		const input = editor(UI_FILE_MANAGER.CREATE_LABEL)
		expect(input).toHaveValue(UI_FILE_MANAGER.NEW_FOLDER_NAME)
		await waitFor(() => expect(input).toHaveFocus())
		await userEvent.clear(input)
		await userEvent.type(input, '  Архив {Enter}')
		expect(emitted('create-folder')).toEqual([[null, 'Архив']])
		expect(screen.queryByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL })).not.toBeInTheDocument()
	})

	it('в открытой папке создаёт в ней', async () => {
		const { emitted } = renderManager({ path: 'docs' })
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		await userEvent.type(editor(UI_FILE_MANAGER.CREATE_LABEL), '{Enter}')
		expect(emitted('create-folder')).toEqual([['docs', UI_FILE_MANAGER.NEW_FOLDER_NAME]])
	})

	it('занятое имя, пустое и с косой чертой — ошибка под полем, поле остаётся', async () => {
		const { emitted } = renderManager()
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		const input = editor(UI_FILE_MANAGER.CREATE_LABEL)
		await userEvent.clear(input)
		await userEvent.type(input, 'фото{Enter}')
		expect(screen.getByText(UI_FILE_MANAGER.NAME_EXISTS)).toBeInTheDocument()
		expect(input).toHaveAttribute('aria-invalid', 'true')
		await userEvent.clear(input)
		await userEvent.keyboard('{Enter}')
		expect(screen.getByText(UI_FILE_MANAGER.NAME_EMPTY)).toBeInTheDocument()
		await userEvent.type(input, 'a/b{Enter}')
		expect(screen.getByText(UI_FILE_MANAGER.NAME_FORBIDDEN)).toBeInTheDocument()
		expect(emitted('create-folder')).toBeUndefined()
		await userEvent.type(input, 'x')
		expect(screen.queryByText(UI_FILE_MANAGER.NAME_FORBIDDEN)).not.toBeInTheDocument()
	})

	it('Escape отменяет, фокус возвращается в список', async () => {
		const { emitted } = renderManager()
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		await userEvent.keyboard('{Escape}')
		expect(screen.queryByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL })).not.toBeInTheDocument()
		expect(emitted('create-folder')).toBeUndefined()
		await waitFor(() => expect(option('docs')).toHaveFocus())
	})

	it('уход из поля подтверждает верное имя и отменяет неверное', async () => {
		const { emitted } = renderManager()
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		await userEvent.clear(editor(UI_FILE_MANAGER.CREATE_LABEL))
		await userEvent.type(editor(UI_FILE_MANAGER.CREATE_LABEL), 'Архив')
		await userEvent.click(screen.getByRole('textbox', { name: UI_FILE_MANAGER.SEARCH_LABEL }))
		expect(emitted('create-folder')).toEqual([[null, 'Архив']])
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		await userEvent.clear(editor(UI_FILE_MANAGER.CREATE_LABEL))
		await userEvent.click(screen.getByRole('textbox', { name: UI_FILE_MANAGER.SEARCH_LABEL }))
		expect(emitted('create-folder')).toHaveLength(1)
		expect(screen.queryByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL })).not.toBeInTheDocument()
	})

	it('в пустой папке поле создания рисуется без списка записей', async () => {
		renderManager({ items: [] })
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL })).toBeInTheDocument()
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('создание сбрасывает поиск, чтобы новая папка была видна', async () => {
		const { emitted } = renderManager({ query: 'фот' })
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		expect(emitted('update:query')).toEqual([['']])
	})

	it('название подбирается свободное', async () => {
		renderManager({ items: [{ id: 'n', name: UI_FILE_MANAGER.NEW_FOLDER_NAME, type: 'folder' }] })
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		expect(editor(UI_FILE_MANAGER.CREATE_LABEL)).toHaveValue(`${UI_FILE_MANAGER.NEW_FOLDER_NAME} (2)`)
	})
})

describe('BaseFileManager: переименование', () => {
	it('положение поля имени пересчитывается при изменении размеров строки и списка, наблюдатель снимается', async () => {
		const watchers = new Map<Element, () => void>()
		const disconnect = vi.fn()
		vi.stubGlobal(
			'ResizeObserver',
			class {
				callback: () => void
				constructor(callback: () => void) {
					this.callback = callback
				}
				observe(target: Element) {
					watchers.set(target, this.callback)
				}
				unobserve() {}
				disconnect = disconnect
			},
		)
		const { unmount } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const group = screen.getByRole('group', { name: 'Новое имя для «logo.png»' })
		const row = document.querySelector('[data-entry-id="logo"]') as HTMLElement
		await waitFor(() => expect(watchers.has(row)).toBe(true))
		Object.defineProperty(row, 'offsetWidth', { configurable: true, value: 321 })
		watchers.get(row)?.()
		await waitFor(() => expect(group.style.width).toBe('321px'))
		await userEvent.keyboard('{Escape}')
		expect(disconnect).toHaveBeenCalled()
		unmount()
		vi.unstubAllGlobals()
	})

	it('при смене вида поле имени сразу встаёт на новое место строки', async () => {
		const { rerender } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const group = screen.getByRole('group', { name: 'Новое имя для «logo.png»' })
		const row = document.querySelector('[data-entry-id="logo"]') as HTMLElement
		Object.defineProperty(row, 'offsetLeft', { configurable: true, value: 140 })
		Object.defineProperty(row, 'offsetTop', { configurable: true, value: 90 })
		await rerender({ view: 'grid' })
		await waitFor(() => expect([group.style.left, group.style.top]).toEqual(['140px', '90px']))
	})

	it('кнопка открывает поле с именем; выделено имя без расширения; Enter сообщает rename', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const input = editor('Новое имя для «logo.png»')
		expect(input).toHaveValue('logo.png')
		await waitFor(() => expect(input).toHaveFocus())
		expect([input.selectionStart, input.selectionEnd]).toEqual([0, 4])
		await userEvent.keyboard('brand{Enter}')
		expect(emitted('rename')).toEqual([['logo', 'brand.png']])
		expect(input).not.toBeInTheDocument()
		await waitFor(() => expect(option('logo')).toHaveFocus())
	})

	it('новое имя уходит в rename, прежнее — нет', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await userEvent.clear(editor('Новое имя для «logo.png»'))
		await userEvent.type(editor('Новое имя для «logo.png»'), ' logo.svg {Enter}')
		expect(emitted('rename')).toEqual([['logo', 'logo.svg']])
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await userEvent.keyboard('{Enter}')
		expect(emitted('rename')).toHaveLength(1)
	})

	it('имя соседней записи занято, своё имя в другом регистре — нет', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const input = editor('Новое имя для «logo.png»')
		await userEvent.clear(input)
		await userEvent.type(input, 'readme.md{Enter}')
		expect(screen.getByText(UI_FILE_MANAGER.NAME_EXISTS)).toBeInTheDocument()
		await userEvent.clear(input)
		await userEvent.type(input, 'LOGO.PNG{Enter}')
		expect(emitted('rename')).toEqual([['logo', 'LOGO.PNG']])
	})

	it('у папки выделено всё имя', async () => {
		renderManager({ selected: ['docs'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const input = editor('Новое имя для «Документы»')
		await waitFor(() => expect(input).toHaveFocus())
		expect([input.selectionStart, input.selectionEnd]).toEqual([0, 9])
	})

	it('если запись исчезла из списка, поле закрывается само', async () => {
		const { rerender } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await rerender({ items: ITEMS.filter(item => item.id !== 'logo') })
		expect(screen.queryByRole('group', { name: /Новое имя/ })).not.toBeInTheDocument()
	})

	it('ввод с IME (isComposing) Enter не подтверждает', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await fireEvent.keyDown(editor('Новое имя для «logo.png»'), { key: 'Enter', isComposing: true })
		expect(emitted('rename')).toBeUndefined()
		expect(screen.getByRole('group', { name: /Новое имя/ })).toBeInTheDocument()
		await fireEvent.keyDown(editor('Новое имя для «logo.png»'), { key: 'a' })
		expect(screen.getByRole('group', { name: /Новое имя/ })).toBeInTheDocument()
	})

	it('в режиме просмотра переименование недоступно', async () => {
		renderManager({ isReadonly: true, selected: ['logo'] })
		await fireEvent.keyDown(option('logo'), { key: 'F2' })
		expect(screen.queryByRole('group', { name: /Новое имя/ })).not.toBeInTheDocument()
	})
})

describe('BaseFileManager: удаление', () => {
	it('подтверждение: имя записи в вопросе, Удалить сообщает delete', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.DELETE))
		const dialog = screen.getByRole('alertdialog', { name: 'Удалить «logo.png»?' })
		expect(dialog).toHaveAccessibleDescription(UI_FILE_MANAGER.DELETE_DESCRIPTION)
		await userEvent.click(within(dialog).getByRole('button', { name: UI_FILE_MANAGER.DELETE }))
		expect(emitted('delete')).toEqual([[['logo']]])
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
	})

	it('отмена ничего не удаляет', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.DELETE))
		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		expect(emitted('delete')).toBeUndefined()
	})

	it('отмена возвращает фокус на кнопку, открывшую окно; подтверждение — на запись в списке', async () => {
		renderManager({ selected: ['logo'] })
		const opener = button(UI_FILE_MANAGER.DELETE)
		await userEvent.click(opener)
		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(opener).toHaveFocus())

		await userEvent.click(opener)
		await userEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: UI_FILE_MANAGER.DELETE }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
		expect(opener).not.toHaveFocus()
	})

	it('кнопка не получила фокус при клике (Safari, activeElement = body): после отмены фокус уходит в список, а не в body', async () => {
		renderManager({ selected: ['logo'] })
		;(document.activeElement as HTMLElement | null)?.blur()
		expect(document.activeElement).toBe(document.body)
		await fireEvent.click(button(UI_FILE_MANAGER.DELETE))
		await fireEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.getByRole('listbox')).toContainElement(document.activeElement as HTMLElement))
	})

	it('окно, открытое клавишей Delete из списка, после отмены возвращает фокус на запись', async () => {
		renderManager()
		option('docs').focus()
		await userEvent.keyboard('{Delete}')
		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(option('docs')).toHaveFocus())
	})

	it('несколько записей: число с подписью, у папки — предупреждение о содержимом', async () => {
		const { emitted } = renderManager({ selected: ['docs', 'logo', 'notes'] })
		await userEvent.click(button(UI_FILE_MANAGER.DELETE))
		const dialog = screen.getByRole('alertdialog', { name: 'Удалить 3 элемента?' })
		expect(dialog).toHaveAccessibleDescription(`${UI_FILE_MANAGER.DELETE_DESCRIPTION} ${UI_FILE_MANAGER.DELETE_FOLDER_NOTE}`)
		await userEvent.click(within(dialog).getByRole('button', { name: UI_FILE_MANAGER.DELETE }))
		expect(emitted('delete')).toEqual([[['docs', 'logo', 'notes']]])
	})

	it('без выбора кнопка удаления не показывается; клавиша Delete удаляет запись с фокусом', async () => {
		renderManager()
		expect(screen.queryByRole('button', { name: UI_FILE_MANAGER.DELETE })).not.toBeInTheDocument()
		option('docs').focus()
		await userEvent.keyboard('{Delete}')
		expect(screen.getByRole('alertdialog', { name: 'Удалить «Документы»?' })).toBeInTheDocument()
	})
})

describe('BaseFileManager: перемещение', () => {
	it('«Переместить в…» выбирает папку в дереве и сообщает move', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.MOVE))
		const dialog = screen.getByRole('dialog', { name: UI_FILE_MANAGER.MOVE_TITLE })
		const submit = within(dialog).getByRole('button', { name: UI_FILE_MANAGER.MOVE_SUBMIT })
		expect(submit).toBeDisabled()
		const tree = within(dialog).getByRole('tree', { name: UI_FILE_MANAGER.MOVE_TREE_LABEL })
		expect(within(tree).getByRole('treeitem', { name: UI_FILE_MANAGER.ROOT })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(within(tree).getByRole('treeitem', { name: 'Фото' }))
		expect(submit).toBeEnabled()
		await userEvent.click(submit)
		expect(emitted('move')).toEqual([[['logo'], 'photos']])
	})

	it('папку нельзя переместить в себя и в потомка, в корень — можно', async () => {
		const { emitted } = renderManager({ path: 'docs', selected: ['work'] })
		await userEvent.click(button(UI_FILE_MANAGER.MOVE))
		const tree = within(screen.getByRole('dialog', { name: UI_FILE_MANAGER.MOVE_TITLE })).getByRole('tree')
		expect(within(tree).getByRole('treeitem', { name: 'Документы' })).toHaveAttribute('aria-disabled', 'true')
		expect(within(tree).getByRole('treeitem', { name: 'Работа' })).toHaveAttribute('aria-disabled', 'true')
		await userEvent.click(within(tree).getByRole('treeitem', { name: UI_FILE_MANAGER.ROOT }))
		await userEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.MOVE_SUBMIT }))
		expect(emitted('move')).toEqual([[['work'], null]])
	})

	it('отмена и закрытие окна ничего не двигают', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.MOVE))
		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await userEvent.click(button(UI_FILE_MANAGER.MOVE))
		await userEvent.keyboard('{Escape}')
		expect(emitted('move')).toBeUndefined()
	})

	it('кнопка подтверждения без выбранной папки не двигает запись', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.MOVE))
		await fireEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.MOVE_SUBMIT }))
		expect(emitted('move')).toBeUndefined()
	})
})

describe('BaseFileManager: загрузка', () => {
	it('выбранные файлы уходят в событие upload вместе с текущей папкой', async () => {
		const { emitted } = renderManager({ path: 'docs', accept: 'image/*', maxSize: 5 })
		await userEvent.click(button(UI_FILE_MANAGER.UPLOAD))
		const dialog = screen.getByRole('dialog', { name: UI_FILE_MANAGER.UPLOAD_TITLE })
		const submit = within(dialog).getByRole('button', { name: UI_FILE_MANAGER.UPLOAD_SUBMIT })
		expect(submit).toBeDisabled()
		const file = new File(['x'], 'photo.png', { type: 'image/png' })
		await userEvent.upload(dialog.querySelector('input[type="file"]') as HTMLInputElement, file)
		await waitFor(() => expect(submit).toBeEnabled())
		await userEvent.click(submit)
		expect(emitted('upload')).toEqual([[[file], 'docs']])
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	})

	it('отмена сбрасывает выбранные файлы', async () => {
		const { emitted } = renderManager()
		await userEvent.click(button(UI_FILE_MANAGER.UPLOAD))
		await userEvent.upload(
			document.querySelector('input[type="file"]') as HTMLInputElement,
			new File(['x'], 'a.txt', { type: 'text/plain' }),
		)
		await userEvent.click(screen.getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await waitFor(() => expect(button(UI_FILE_MANAGER.UPLOAD)).toHaveFocus())
		await userEvent.click(button(UI_FILE_MANAGER.UPLOAD))
		const submit = within(screen.getByRole('dialog')).getByRole('button', { name: UI_FILE_MANAGER.UPLOAD_SUBMIT })
		expect(submit).toBeDisabled()
		await fireEvent.click(submit)
		expect(emitted('upload')).toBeUndefined()
	})

	it('в режиме просмотра загрузка недоступна', () => {
		renderManager({ isReadonly: true })
		expect(screen.queryByRole('button', { name: UI_FILE_MANAGER.UPLOAD })).not.toBeInTheDocument()
	})
})

describe('BaseFileManager: поле имени вне listbox', () => {
	it('поле переименования и создания не лежит внутри listbox; строка остаётся в списке скрытой', async () => {
		renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		const group = screen.getByRole('group', { name: 'Новое имя для «logo.png»' })
		expect(group.closest('[role="listbox"]')).toBeNull()
		expect(document.querySelector('[data-entry-id="logo"]')).toHaveClass('base-file-manager__entry--hidden')
		await userEvent.keyboard('{Escape}')
		expect(document.querySelector('[data-entry-id="logo"]')).not.toHaveClass('base-file-manager__entry--hidden')
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL }).closest('[role="listbox"]')).toBeNull()
	})

	it('Escape отменяет правку и возвращает фокус на пункт', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await userEvent.keyboard('x{Escape}')
		expect(emitted('rename')).toBeUndefined()
		await waitFor(() => expect(option('logo')).toHaveFocus())
	})

	it('после переименования и создания папки озвучивается результат', async () => {
		renderManager({ selected: ['logo'] })
		const live = (): string => document.querySelector('[aria-live="polite"]')?.textContent ?? ''
		await userEvent.click(button(UI_FILE_MANAGER.RENAME))
		await userEvent.keyboard('brand{Enter}')
		expect(live()).toBe('Переименовано: «brand.png»')
		await userEvent.click(button(UI_FILE_MANAGER.NEW_FOLDER))
		expect(live()).toBe('')
		await userEvent.keyboard('Архив{Enter}')
		expect(live()).toBe('Создана папка «Архив»')
	})
})
