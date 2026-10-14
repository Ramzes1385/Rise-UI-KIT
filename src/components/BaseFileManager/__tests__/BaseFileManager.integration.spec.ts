import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { renderManager } from './fixtures'
import userEvent from '@testing-library/user-event'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { createEvent, fireEvent, screen, waitFor, within } from '@testing-library/vue'

function option(id: string): HTMLElement {
	return screen.getAllByRole('option').find(element => element.getAttribute('data-entry-id') === id) as HTMLElement
}

function lastSelection(emitted: (name: string) => unknown[] | undefined): unknown {
	return emitted('update:selected')?.at(-1)
}

function dataTransfer(): { setData: ReturnType<typeof vi.fn> } {
	return { setData: vi.fn() }
}

function dispatchDrag(element: HTMLElement, type: 'dragStart' | 'dragOver' | 'drop', init: Record<string, unknown> = {}): DragEvent {
	const event = createEvent[type](element, init) as DragEvent
	fireEvent(element, event)
	return event
}

describe('BaseFileManager: клавиатура', () => {
	it('стрелки двигают фокус и выбор, Home и End — к краям', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await userEvent.keyboard('{ArrowDown}')
		expect(option('photos')).toHaveFocus()
		expect(lastSelection(emitted)).toEqual([['photos']])
		await userEvent.keyboard('{End}')
		expect(option('readme')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		expect(option('readme')).toHaveFocus()
		await userEvent.keyboard('{Home}')
		expect(option('docs')).toHaveFocus()
		await userEvent.keyboard('{ArrowUp}{ArrowLeft}{ArrowRight}')
		expect(option('docs')).toHaveFocus()
	})

	it('Shift+стрелка расширяет выбор от опорной записи', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await userEvent.keyboard('{Shift>}{ArrowDown}{ArrowDown}{/Shift}')
		expect(lastSelection(emitted)).toEqual([['docs', 'photos', 'logo']])
	})

	it('Ctrl+стрелка двигает только фокус, Пробел переключает выбор', async () => {
		const { emitted } = renderManager({ selected: ['docs'] })
		option('docs').focus()
		await userEvent.keyboard('{Control>}{ArrowDown}{/Control}')
		expect(option('photos')).toHaveFocus()
		expect(emitted('update:selected')).toBeUndefined()
		await userEvent.keyboard(' ')
		expect(lastSelection(emitted)).toEqual([['docs', 'photos']])
	})

	it('Shift+Пробел выбирает диапазон от опорной записи', async () => {
		const { emitted } = renderManager()
		await fireEvent.click(option('docs'))
		option('docs').focus()
		await userEvent.keyboard('{Control>}{ArrowDown}{ArrowDown}{/Control}')
		await userEvent.keyboard('{Shift>} {/Shift}')
		expect(lastSelection(emitted)).toEqual([['docs', 'photos', 'logo']])
	})

	it('Пробел без записей и без фокуса ничего не делает', async () => {
		renderManager({ items: [] })
		const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
		document.body.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('Ctrl+A выбирает всё, Escape снимает выбор', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await userEvent.keyboard('{Control>}a{/Control}')
		expect(lastSelection(emitted)).toEqual([['docs', 'photos', 'logo', 'notes', 'readme']])
		await userEvent.keyboard('{Escape}')
		expect(lastSelection(emitted)).toEqual([[]])
	})

	it('Ctrl+A работает на русской раскладке (key «ф», code KeyA), а не только по коду клавиши', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await fireEvent.keyDown(option('docs'), { key: 'ф', code: 'KeyA', ctrlKey: true })
		expect(lastSelection(emitted)).toEqual([['docs', 'photos', 'logo', 'notes', 'readme']])
	})

	it('Ctrl+A на Dvorak: клавиша с кодом KeyA, на которой напечатана другая буква, выбор не меняет', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await fireEvent.keyDown(option('docs'), { key: 'o', code: 'KeyA', ctrlKey: true })
		expect(emitted('update:selected')).toBeUndefined()
	})

	it('Escape без выбора не перехватывается', async () => {
		renderManager()
		option('docs').focus()
		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		option('docs').dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('Enter открывает папку и переносит фокус в её первую запись; на файле сообщает open', async () => {
		const { emitted } = renderManager()
		option('docs').focus()
		await userEvent.keyboard('{Enter}')
		expect(emitted('update:path')).toEqual([['docs']])
		await waitFor(() => expect(option('work')).toHaveFocus())
		await userEvent.keyboard('{End}{Enter}')
		expect(emitted('open')?.at(-1)).toMatchObject([{ id: 'report' }])
	})

	it('Backspace поднимается на уровень выше', async () => {
		const { emitted } = renderManager({ path: 'docs' })
		option('work').focus()
		await userEvent.keyboard('{Backspace}')
		expect(emitted('update:path')).toEqual([[null]])
	})

	it('F2 переименовывает запись с фокусом, Delete спрашивает подтверждение', async () => {
		renderManager()
		option('logo').focus()
		await userEvent.keyboard('{F2}')
		const input = within(screen.getByRole('group', { name: 'Новое имя для «logo.png»' })).getByRole('textbox')
		await waitFor(() => expect(input).toHaveFocus())
		await userEvent.keyboard('{Delete}{Backspace}{ArrowDown}')
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(option('logo')).toHaveFocus())
		await userEvent.keyboard('{Delete}')
		expect(screen.getByRole('alertdialog', { name: 'Удалить «logo.png»?' })).toBeInTheDocument()
	})

	it('набор букв ведёт к записи с таким началом имени', async () => {
		vi.useFakeTimers({ shouldAdvanceTime: true })
		try {
			renderManager()
			option('docs').focus()
			await userEvent.keyboard('l')
			expect(option('logo')).toHaveFocus()
			await userEvent.keyboard('o')
			expect(option('logo')).toHaveFocus()
			await userEvent.keyboard('я')
			expect(option('logo')).toHaveFocus()
			vi.advanceTimersByTime(600)
			await userEvent.keyboard('r')
			expect(option('readme')).toHaveFocus()
			await userEvent.keyboard('{Control>}c{/Control}')
			expect(option('readme')).toHaveFocus()
		} finally {
			vi.useRealTimers()
		}
	})

	it('в плитках стрелки вправо и влево идут по записи, вверх и вниз — по ряду', async () => {
		renderManager({ view: 'grid' })
		const options = screen.getAllByRole('option')
		options.forEach((element, position) => {
			Object.defineProperty(element, 'offsetTop', { configurable: true, value: Math.floor(position / 2) * 100 })
		})
		option('docs').focus()
		await userEvent.keyboard('{ArrowRight}')
		expect(option('photos')).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		expect(option('notes')).toHaveFocus()
		await userEvent.keyboard('{ArrowLeft}{ArrowUp}')
		expect(option('docs')).toHaveFocus()
	})

	it('пустой список клавиши не обрабатывает', async () => {
		renderManager({ items: [] })
		const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		document.body.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(false)
	})

	it('клавиши Tab проходит по панели и попадает в список одной остановкой', async () => {
		renderManager()
		let guard = 0
		while (!document.activeElement?.matches('[role="option"]') && guard++ < 40) await userEvent.tab()
		expect(document.activeElement).toBe(option('docs'))
		await userEvent.tab()
		expect(document.activeElement?.getAttribute('role')).not.toBe('option')
	})
})

describe('BaseFileManager: контекстное меню', () => {
	it('правый клик по записи выбирает её и показывает действия', async () => {
		const { emitted } = renderManager()
		await fireEvent.contextMenu(option('logo'))
		expect(lastSelection(emitted)).toEqual([['logo']])
		const menu = await screen.findByRole('menu')
		const names = within(menu)
			.getAllByRole('menuitem')
			.map(item => item.textContent?.replace(/\s+/g, ' ').trim())
		expect(names).toEqual([
			expect.stringContaining(UI_FILE_MANAGER.OPEN),
			expect.stringContaining(UI_FILE_MANAGER.RENAME),
			expect.stringContaining(UI_FILE_MANAGER.MOVE),
			expect.stringContaining(UI_FILE_MANAGER.DELETE),
		])
	})

	it('пункт «Удалить» открывает подтверждение, «Переименовать» — поле', async () => {
		renderManager()
		await fireEvent.contextMenu(option('logo'))
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.DELETE) }))
		expect(await screen.findByRole('alertdialog', { name: 'Удалить «logo.png»?' })).toBeInTheDocument()
	})

	it('пункты «Открыть», «Переименовать» и «Переместить в…» работают', async () => {
		const { emitted } = renderManager()
		await fireEvent.contextMenu(option('docs'))
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.OPEN) }))
		expect(emitted('update:path')).toEqual([['docs']])
		await fireEvent.contextMenu(option('work'))
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.RENAME) }))
		expect(screen.getByRole('group', { name: 'Новое имя для «Работа»' })).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await fireEvent.contextMenu(option('work'))
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.MOVE) }))
		expect(await screen.findByRole('dialog', { name: UI_FILE_MANAGER.MOVE_TITLE })).toBeInTheDocument()
	})

	it('правый клик по выбранной группе сохраняет выбор, меню без «Открыть» и «Переименовать»', async () => {
		const { emitted } = renderManager({ selected: ['logo', 'notes'] })
		await fireEvent.contextMenu(option('notes'))
		expect(emitted('update:selected')).toBeUndefined()
		const menu = await screen.findByRole('menu')
		expect(within(menu).queryByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.OPEN) })).not.toBeInTheDocument()
		expect(within(menu).getAllByRole('menuitem')).toHaveLength(2)
	})

	it('правый клик по пустому месту снимает выбор и предлагает создать или загрузить', async () => {
		const { emitted } = renderManager()
		await fireEvent.click(option('logo'))
		await fireEvent.contextMenu(screen.getByRole('listbox'))
		expect(lastSelection(emitted)).toEqual([[]])
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.NEW_FOLDER) }))
		expect(screen.getByRole('group', { name: UI_FILE_MANAGER.CREATE_LABEL })).toBeInTheDocument()
	})

	it('пункт «Загрузить» открывает окно загрузки', async () => {
		renderManager()
		await fireEvent.contextMenu(screen.getByRole('listbox'))
		await userEvent.click(await screen.findByRole('menuitem', { name: new RegExp(UI_FILE_MANAGER.UPLOAD) }))
		expect(await screen.findByRole('dialog', { name: UI_FILE_MANAGER.UPLOAD_TITLE })).toBeInTheDocument()
	})

	it('в режиме просмотра меню записи — только «Открыть», на пустом месте меню нет', async () => {
		renderManager({ isReadonly: true })
		await fireEvent.contextMenu(option('logo'))
		const menu = await screen.findByRole('menu')
		expect(within(menu).getAllByRole('menuitem')).toHaveLength(1)
	})

	it('в режиме просмотра на пустом месте и при нескольких записях меню не открывается', async () => {
		const { rerender } = renderManager({ isReadonly: true })
		await fireEvent.contextMenu(screen.getByRole('listbox'))
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
		await rerender({ selected: ['logo', 'notes'] })
		await fireEvent.contextMenu(option('notes'))
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('отключённый менеджер: меню своё не показывает', async () => {
		renderManager({ isDisabled: true })
		await fireEvent.contextMenu(option('logo'))
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})
})

describe('BaseFileManager: перетаскивание', () => {
	it('запись, брошенная на папку, сообщает move', async () => {
		const { emitted } = renderManager()
		const transfer = dataTransfer()
		const start = dispatchDrag(option('logo'), 'dragStart', { dataTransfer: transfer })
		expect(start.defaultPrevented).toBe(false)
		await waitFor(() => expect(option('logo')).toHaveClass('base-file-manager__entry--dragging'))
		expect(lastSelection(emitted)).toEqual([['logo']])
		const over = dispatchDrag(option('photos'), 'dragOver', { dataTransfer: dataTransfer() })
		expect(over.defaultPrevented).toBe(true)
		await waitFor(() => expect(option('photos')).toHaveClass('base-file-manager__entry--drop'))
		await fireEvent.dragLeave(option('photos'))
		expect(option('photos')).not.toHaveClass('base-file-manager__entry--drop')
		dispatchDrag(option('photos'), 'drop', { dataTransfer: dataTransfer() })
		expect(emitted('move')).toEqual([[['logo'], 'photos']])
		await waitFor(() => expect(option('logo')).not.toHaveClass('base-file-manager__entry--dragging'))
	})

	it('перетаскивание выбранной записи уносит всю выбранную группу', async () => {
		const { emitted } = renderManager({ selected: ['logo', 'notes'] })
		dispatchDrag(option('notes'), 'dragStart', { dataTransfer: dataTransfer() })
		dispatchDrag(option('docs'), 'drop', { dataTransfer: dataTransfer() })
		expect(emitted('move')).toEqual([[['logo', 'notes'], 'docs']])
	})

	it('на файл и на себя бросить нельзя', async () => {
		const { emitted } = renderManager()
		dispatchDrag(option('docs'), 'dragStart', { dataTransfer: dataTransfer() })
		expect(dispatchDrag(option('logo'), 'dragOver').defaultPrevented).toBe(false)
		expect(dispatchDrag(option('docs'), 'dragOver').defaultPrevented).toBe(false)
		dispatchDrag(option('logo'), 'drop')
		dispatchDrag(option('docs'), 'drop')
		expect(emitted('move')).toBeUndefined()
		await fireEvent.dragEnd(option('docs'))
		expect(option('docs')).not.toHaveClass('base-file-manager__entry--dragging')
	})

	it('без dataTransfer перетаскивание тоже работает', async () => {
		const { emitted } = renderManager()
		dispatchDrag(option('logo'), 'dragStart')
		dispatchDrag(option('photos'), 'dragOver')
		dispatchDrag(option('photos'), 'drop')
		expect(emitted('move')).toEqual([[['logo'], 'photos']])
	})

	it('дерево папок принимает записи: папка и корень', async () => {
		const { emitted } = renderManager({ path: 'docs' })
		const tree = screen.getByRole('tree')
		const target = (name: string): HTMLElement => within(tree).getByText(name)
		dispatchDrag(option('report'), 'dragStart', { dataTransfer: dataTransfer() })
		expect(dispatchDrag(target('Фото'), 'dragOver').defaultPrevented).toBe(true)
		await waitFor(() => expect(target('Фото')).toHaveClass('base-file-manager__drop--active'))
		await fireEvent.dragLeave(target('Фото'))
		expect(target('Фото')).not.toHaveClass('base-file-manager__drop--active')
		dispatchDrag(target('Фото'), 'drop')
		expect(emitted('move')).toEqual([[['report'], 'photos']])
		dispatchDrag(option('report'), 'dragStart', { dataTransfer: dataTransfer() })
		dispatchDrag(target(UI_FILE_MANAGER.ROOT), 'dragOver')
		dispatchDrag(target(UI_FILE_MANAGER.ROOT), 'drop')
		expect(emitted('move')?.at(-1)).toEqual([['report'], null])
	})

	it('событие мимо узлов дерева игнорируется', async () => {
		const { emitted } = renderManager({ path: 'docs' })
		dispatchDrag(option('report'), 'dragStart', { dataTransfer: dataTransfer() })
		const sidebar = document.querySelector('.base-file-manager__sidebar') as HTMLElement
		expect(dispatchDrag(sidebar, 'dragOver').defaultPrevented).toBe(false)
		await fireEvent.dragLeave(sidebar)
		dispatchDrag(sidebar, 'drop')
		expect(emitted('move')).toBeUndefined()
	})

	it('в режиме просмотра перетаскивание запрещено', async () => {
		const { emitted } = renderManager({ isReadonly: true })
		expect(dispatchDrag(option('logo'), 'dragStart', { dataTransfer: dataTransfer() }).defaultPrevented).toBe(true)
		dispatchDrag(option('photos'), 'drop')
		expect(emitted('move')).toBeUndefined()
	})
})
