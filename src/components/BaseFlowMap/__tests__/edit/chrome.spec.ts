import '@testing-library/jest-dom/vitest'
import { fireEvent, within } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, flush, mountEdit, screen, settle, waitFor, type EditMap } from './editHarness'

guardConsole()

const ids = (map: EditMap) => map.data().nodes.map(node => node.id)
const status = () => screen.getByRole('status', { name: 'Состояние правки' })

async function select(map: EditMap, ...list: string[]) {
	map.controller.select(list)
	await settle()
}

async function openMenu(map: EditMap, id: string) {
	await fireEvent.contextMenu(map.node(id), { clientX: 120, clientY: 90 })
	return screen.findByRole('menu', { name: 'Действия с элементом' })
}

describe('контекстное меню', () => {
	it('правый щелчок выделяет узел и открывает меню; «Переименовать» открывает подпись', async () => {
		const map = await mountEdit({ data: editData() })
		const menu = await openMenu(map, 's1')
		expect(map.controller.getSelection()).toEqual(['s1'])
		for (const name of ['Переименовать', 'Соединить с…', 'В группу', 'Копировать', 'Вырезать', 'Вставить', 'Дублировать', 'Удалить']) {
			expect(within(menu).getByRole('menuitem', { name: new RegExp(name) })).toBeInTheDocument()
		}
		await fireEvent.click(within(menu).getByRole('menuitem', { name: /Переименовать/ }))
		expect(await screen.findByRole('textbox', { name: 'Подпись элемента' })).toHaveValue('Заказы')
	})

	it('«Соединить с…» открывает список целей', async () => {
		const map = await mountEdit({ data: editData() })
		const menu = await openMenu(map, 'gw')
		await fireEvent.click(within(menu).getByRole('menuitem', { name: /Соединить с…/ }))
		await screen.findByRole('combobox', { name: 'Соединить с…' })
	})

	it.each([
		{
			title: 'Копировать, затем Вставить',
			target: 'gw',
			names: ['Копировать', 'Вставить'],
			check: (map: EditMap) => expect(ids(map)).toHaveLength(6),
		},
		{ title: 'Дублировать', target: 'gw', names: ['Дублировать'], check: (map: EditMap) => expect(ids(map)).toHaveLength(6) },
		{ title: 'Вырезать', target: 'nt', names: ['Вырезать'], check: (map: EditMap) => expect(ids(map)).not.toContain('nt') },
		{ title: 'В группу', target: 'db', names: ['В группу'], check: (map: EditMap) => expect(map.data().groups).toHaveLength(2) },
		{ title: 'Удалить', target: 's2', names: ['Удалить'], check: (map: EditMap) => expect(ids(map)).not.toContain('s2') },
	])('пункт «$title» действует на узел под курсором', async ({ target, names, check }) => {
		const map = await mountEdit({ data: editData() })
		for (const name of names) {
			const menu = await openMenu(map, target)
			await fireEvent.click(within(menu).getByRole('menuitem', { name: new RegExp(name) }))
			await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
		}
		await waitFor(() => check(map))
	})

	it('Shift+F10 на узле в фокусе: браузер шлёт contextmenu с клавиатуры — меню открывается над узлом', async () => {
		const map = await mountEdit({ data: editData() })
		const target = map.node('db')
		target.focus()
		await settle()
		await fireEvent.contextMenu(target, { button: 0, clientX: 0, clientY: 0 })
		const menu = await screen.findByRole('menu', { name: 'Действия с элементом' })
		expect(map.controller.getSelection()).toEqual(['db'])
		expect(within(menu).getByRole('menuitem', { name: /Удалить/ })).toBeInTheDocument()
	})

	it('на пустом месте «Переименовать» и «Соединить» недоступны; на выделенном остаётся выделение', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw', 'db')
		await fireEvent.contextMenu(map.node('gw'), { clientX: 1, clientY: 1 })
		expect(map.controller.getSelection()).toEqual(['gw', 'db'])
		await fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
		await select(map)
		await fireEvent.contextMenu(map.root, { clientX: 5, clientY: 5 })
		const menu = await screen.findByRole('menu', { name: 'Действия с элементом' })
		expect(within(menu).getByRole('menuitem', { name: /Переименовать/ })).toHaveAttribute('aria-disabled', 'true')
		expect(within(menu).getByRole('menuitem', { name: /Соединить с…/ })).toHaveAttribute('aria-disabled', 'true')
	})

	it('вне режима «Правка» собственное меню не открывается', async () => {
		const map = await mountEdit({ data: editData(), mode: 'view' })
		await fireEvent.contextMenu(map.node('gw'), { clientX: 5, clientY: 5 })
		expect(screen.queryByRole('menu', { name: 'Действия с элементом' })).toBeNull()
	})
})

describe('панель инструментов', () => {
	it('«Отменить» и «Повторить» неактивны без истории и оживают после правки', async () => {
		const map = await mountEdit({ data: editData() })
		const undo = screen.getByRole('button', { name: 'Отменить, Ctrl+Z' })
		const redo = screen.getByRole('button', { name: 'Повторить, Ctrl+Shift+Z' })
		expect(undo).toHaveAttribute('aria-disabled', 'true')
		await select(map, 'gw')
		await map.press('ArrowRight', { shiftKey: true })
		expect(undo).not.toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(undo)
		expect(redo).not.toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(redo)
		expect(map.data().nodes[0].position?.x).toBe(8)
	})

	it('«История изменений» показывает шаги, отменённые — с пометкой', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.press('ArrowRight', { shiftKey: true })
		await map.press('Delete')
		await map.press('z', { ctrlKey: true })
		await fireEvent.click(screen.getByRole('button', { name: 'История изменений' }))
		const list = await screen.findByRole('list', { name: 'История изменений' })
		const items = within(list).getAllByRole('listitem')
		expect(items).toHaveLength(2)
		expect(items[0]).toHaveTextContent(/Удаление.*отменено/)
		expect(items[1]).not.toHaveTextContent('отменено')
	})

	it('пустая история — подсказка', async () => {
		await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'История изменений' }))
		expect(await screen.findByText('Изменений пока нет')).toBeInTheDocument()
	})

	it('«Сетка» и «Привязка» — переключатели; сетка убирает точки с холста', async () => {
		const map = await mountEdit({ data: editData() })
		const stage = map.container.querySelector('.base-flow-map__stage') as HTMLElement
		expect(stage).toHaveClass('base-flow-map__stage--edit')
		expect(stage).not.toHaveClass('base-flow-map__stage--no-grid')
		await fireEvent.click(screen.getByRole('switch', { name: 'Сетка' }))
		expect(stage).toHaveClass('base-flow-map__stage--no-grid')
		await fireEvent.click(screen.getByRole('switch', { name: 'Сетка' }))
		expect(stage).not.toHaveClass('base-flow-map__stage--no-grid')
		expect(screen.getByRole('switch', { name: 'Привязка' })).toBeChecked()
	})

	it('масштаб: кнопки − и +, процент; «Готово» просит режим просмотра', async () => {
		const map = await mountEdit({ data: editData() })
		const zoom = screen.getAllByRole('button', { name: 'Масштаб' })
		expect(zoom).toHaveLength(2)
		const text = () => map.container.querySelector('.base-flow-map__zoom')?.textContent
		expect(text()).toBe('100%')
		await fireEvent.click(zoom[1])
		await waitFor(() => expect(Number.parseInt(text() ?? '0')).toBeGreaterThan(100), { timeout: 3000 })
		await fireEvent.click(zoom[0])
		await fireEvent.click(screen.getByRole('button', { name: 'Готово' }))
		expect(map.emitted()['update:mode'].at(-1)).toEqual(['view'])
	})

	it('справка по клавишам открывается кнопкой и клавишей «?», показывает сочетания', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'Справка по клавишам' }))
		expect(await screen.findByText('Выбор, рука, связь, узел, заметка, группа')).toBeInTheDocument()
		expect(screen.getByText('Сдвиг на шаг сетки, с Alt — на 1 px')).toBeInTheDocument()
		await map.press('?', { shiftKey: true })
		await waitFor(() => expect(screen.queryByText('Выбор, рука, связь, узел, заметка, группа')).toBeNull())
	})
})

describe('строка состояния', () => {
	it('выделено, изменений, узлов и связей, время сохранения черновика', async () => {
		const savedAt = new Date(Date.now() + 60_000)
		const map = await mountEdit({ data: editData(), savedAt })
		expect(status()).toHaveTextContent('Выделено: 0')
		expect(status()).toHaveTextContent('Изменений: 0')
		expect(status()).toHaveTextContent('Узлов: 5 · связей: 2')
		expect(status()).toHaveTextContent(/Черновик сохранён/)
		await select(map, 'gw', 'db')
		expect(status()).toHaveTextContent('Выделено: 2')
	})

	it('без savedAt — «Черновик не сохранён», изменения считаются от начала', async () => {
		const map = await mountEdit({ data: editData() })
		expect(status()).toHaveTextContent('Черновик не сохранён')
		await select(map, 'gw')
		await map.press('ArrowRight', { shiftKey: true })
		await map.press('Delete')
		expect(status()).toHaveTextContent('Изменений: 2')
		await map.press('z', { ctrlKey: true })
		expect(status()).toHaveTextContent('Изменений: 1')
	})

	it('замечания нотации: счётчик, список с «Показать», правила нотации', async () => {
		const bad = editData({ edges: [{ id: 'bad', source: 'db', target: 'gw' }] })
		const map = await mountEdit({ data: bad })
		const toggle = within(status()).getByRole('button', { name: /Проверка нотации: замечаний 1/ })
		expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await fireEvent.click(toggle)
		const panel = screen.getByRole('dialog', { name: 'Замечания проверки' })
		expect(panel).toHaveTextContent(/Замечания проверки нотации «.+»/)
		expect(panel).toHaveTextContent(/Правила: /)
		await fireEvent.click(within(panel).getByRole('button', { name: 'Показать' }))
		await flush()
		await select(map)
	})

	it('без замечаний — «в порядке» и «Правила нотации соблюдены»', async () => {
		await mountEdit({ data: editData() })
		const toggle = within(status()).getByRole('button', { name: /в порядке/ })
		await fireEvent.click(toggle)
		expect(screen.getByRole('dialog', { name: 'Замечания проверки' })).toHaveTextContent('Правила нотации соблюдены')
	})
})
