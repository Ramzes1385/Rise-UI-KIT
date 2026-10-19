import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { fireEvent, within } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, flush, mountEdit, propsNotation, screen, settle, waitFor, type EditMap } from './editHarness'

guardConsole()

const node = (map: EditMap, id: string) => map.data().nodes.find(item => item.id === id)!
const panel = () => screen.getByRole('region', { name: 'Свойства и хуки' })

async function pick(map: EditMap, ...ids: string[]) {
	map.controller.select(ids)
	await settle()
}

async function choose(label: string, option: string | RegExp) {
	await fireEvent.click(screen.getByRole('combobox', { name: label }))
	await fireEvent.click(await screen.findByRole('option', { name: option }))
}

async function openTab(name: string) {
	await fireEvent.click(within(panel()).getByRole('tab', { name }))
}

describe('панель свойств: карта', () => {
	it('без выделения — свойства карты: название, нотация, направление, счётчики', async () => {
		const map = await mountEdit({ data: editData() })
		const tabs = within(panel()).getAllByRole('tab')
		expect(tabs.map(tab => tab.textContent)).toEqual(['Свойства', 'Хуки'])
		const title = within(panel()).getByRole('textbox', { name: 'Название' })
		expect(title).toHaveValue('Заказы')
		expect(within(panel()).getByRole('textbox', { name: 'Нотация' })).toBeDisabled()
		await fireEvent.update(title, 'Заказы 2')
		await fireEvent.keyDown(title, { key: 'Enter' })
		await waitFor(() => expect(map.data().title).toBe('Заказы 2'))
		await fireEvent.update(title, '')
		await fireEvent.blur(title)
		await waitFor(() => expect(map.data().title).toBeUndefined())
		await fireEvent.click(within(panel()).getByRole('radio', { name: 'Слева направо' }))
		await waitFor(() => expect(map.data().layout?.direction).toBe('LR'))
		for (const text of ['Узлов: 5', 'Связей: 2', 'Групп: 1', 'Сценариев: 0'])
			expect(within(panel()).getByText(text)).toBeInTheDocument()
		expect(map.controller.getHistory().undoLabel).toContain('Свойства карты')
	})

	it('значение поля, не изменившееся при потере фокуса, ничего не пишет', async () => {
		const map = await mountEdit({ data: editData() })
		const title = within(panel()).getByRole('textbox', { name: 'Название' })
		await fireEvent.blur(title)
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('панели нет в просмотре и на узком экране — там нижний ящик со свойствами', async () => {
		await mountEdit({ data: editData(), mode: 'view' })
		expect(screen.queryByRole('region', { name: 'Свойства и хуки' })).toBeNull()
	})
})

describe('панель свойств: узел', () => {
	it('вкладки «Свойства · Стиль · Данные · Хуки»; поля узла записываются в данные', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 'gw')
		expect(
			within(panel())
				.getAllByRole('tab')
				.map(tab => tab.textContent),
		).toEqual(['Свойства', 'Стиль', 'Данные', 'Хуки'])
		const name = within(panel()).getByRole('textbox', { name: 'Имя' })
		expect(name).toHaveValue('Шлюз')
		await fireEvent.update(name, 'Периметр')
		await fireEvent.blur(name)
		await waitFor(() => expect(node(map, 'gw').label).toBe('Периметр'))
		await choose('Вид', 'Балансировщик')
		await waitFor(() => expect(node(map, 'gw').kind).toBe('balancer'))
		await choose('Дорожка', 'Ядро')
		await waitFor(() => expect(node(map, 'gw').group).toBe('z1'))
		await choose('Дорожка', 'Без дорожки')
		await waitFor(() => expect(node(map, 'gw').group).toBeUndefined())
		await choose('Статус', 'Задержки')
		await waitFor(() => expect(node(map, 'gw').status).toBe('warning'))
		await choose('Статус', 'Не задан')
		await waitFor(() => expect(node(map, 'gw').status).toBeUndefined())
		const description = within(panel()).getByRole('textbox', { name: 'Описание' })
		await fireEvent.update(description, 'Входной шлюз')
		await fireEvent.blur(description)
		await waitFor(() => expect(node(map, 'gw').description).toBe('Входной шлюз'))
		await fireEvent.update(description, '')
		await fireEvent.blur(description)
		await waitFor(() => expect(node(map, 'gw').description).toBeUndefined())
	})

	it('поля props вида по типам: число, переключатель, список, текст, цвет', async () => {
		const map = await mountEdit({
			data: editData({
				notation: 'props-demo',
				nodes: [
					{
						id: 'w',
						kind: 'widget',
						label: 'Виджет',
						position: { x: 0, y: 0 },
						isPinned: true,
						props: { count: 5, caption: 'Привет' },
					},
				],
				edges: [],
				groups: [],
			}),
			notations: [propsNotation() as never],
		})
		await pick(map, 'w')
		const count = within(panel()).getByRole('spinbutton', { name: 'Число' })
		expect(count).toHaveDisplayValue('5')
		await fireEvent.update(count, '9')
		await fireEvent.blur(count)
		await waitFor(() => expect(node(map, 'w').props?.count).toBe(9))
		await fireEvent.click(within(panel()).getByRole('switch', { name: 'Флаг' }))
		await waitFor(() => expect(node(map, 'w').props?.flag).toBe(true))
		await choose('Режим', 'Вариант Б')
		await waitFor(() => expect(node(map, 'w').props?.mode).toBe('b'))
		const caption = within(panel()).getByRole('textbox', { name: 'Заголовок' })
		expect(caption).toHaveValue('Привет')
		await fireEvent.update(caption, 'Пока')
		await fireEvent.blur(caption)
		await waitFor(() => expect(node(map, 'w').props?.caption).toBe('Пока'))
		expect(within(panel()).getByRole('textbox', { name: 'Оттенок' })).toHaveValue('')
		expect(node(map, 'w').props?.count).toBe(9)
	})

	it('внешнее изменение подписи обновляет поле', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 'gw')
		await map.controller.updateNode('gw', { label: 'Новый' })
		await waitFor(() => expect(within(panel()).getByRole('textbox', { name: 'Имя' })).toHaveValue('Новый'))
	})
})

describe('панель свойств: связь, группа, несколько элементов', () => {
	it('связь: линия, вид, подпись, условие, «по умолчанию»', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 'e1')
		expect(
			within(panel())
				.getAllByRole('tab')
				.map(tab => tab.textContent),
		).toEqual(['Свойства', 'Хуки'])
		await fireEvent.click(within(panel()).getByRole('radio', { name: 'Ломаная' }))
		await waitFor(() => expect(map.data().edges[0].routing).toBe('orthogonal'))
		await choose('Вид', 'Событие')
		await waitFor(() => expect(map.data().edges[0].kind).toBe('event'))
		const label = within(panel()).getByRole('textbox', { name: 'Подпись' })
		await fireEvent.update(label, 'заказ')
		await fireEvent.blur(label)
		await waitFor(() => expect(map.data().edges[0].label).toBe('заказ'))
		await fireEvent.update(label, '')
		await fireEvent.blur(label)
		await waitFor(() => expect(map.data().edges[0].label).toBeFalsy())
		const condition = within(panel()).getByRole('textbox', { name: 'Условие' })
		await fireEvent.update(condition, 'сумма > 0')
		await fireEvent.blur(condition)
		await waitFor(() => expect(map.data().edges[0].condition).toBe('сумма > 0'))
		await fireEvent.update(condition, '')
		await fireEvent.blur(condition)
		await waitFor(() => expect(map.data().edges[0].condition).toBeUndefined())
		await fireEvent.click(within(panel()).getByRole('switch', { name: 'По умолчанию' }))
		await waitFor(() => expect(map.data().edges[0].isDefault).toBe(true))
	})

	it('группа: имя, вид, описание', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 'z1')
		const name = within(panel()).getByRole('textbox', { name: 'Имя' })
		await fireEvent.update(name, 'Ядро 2')
		await fireEvent.blur(name)
		await waitFor(() => expect(map.data().groups?.[0].label).toBe('Ядро 2'))
		await choose('Вид', 'Слой')
		await waitFor(() => expect(map.data().groups?.[0].kind).toBe('layer'))
		const description = within(panel()).getByRole('textbox', { name: 'Описание' })
		await fireEvent.update(description, 'Основное')
		await fireEvent.blur(description)
		await waitFor(() => expect(map.data().groups?.[0].description).toBe('Основное'))
		await fireEvent.update(description, '')
		await fireEvent.blur(description)
		await waitFor(() => expect(map.data().groups?.[0].description).toBeUndefined())
	})

	it('несколько узлов: «Общие свойства», дорожка и статус всем одним шагом, кнопки выравнивания и группы', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 'gw', 'db', 'nt')
		expect(within(panel()).getByRole('heading', { name: 'Общие свойства' })).toBeInTheDocument()
		expect(within(panel()).getByText('Выбрано элементов: 3')).toBeInTheDocument()
		await choose('Статус', 'Ошибки')
		await waitFor(() => expect(['gw', 'db', 'nt'].every(id => node(map, id).status === 'error')).toBe(true))
		await waitFor(() => expect(map.controller.getHistory().undoLabel).toBe('Общие свойства'))
		await choose('Статус', 'Не задан')
		await waitFor(() => expect(node(map, 'gw').status).toBeUndefined())
		await choose('Дорожка', 'Ядро')
		await waitFor(() => expect(node(map, 'db').group).toBe('z1'))
		await choose('Дорожка', 'Без дорожки')
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Выровнять по верху' }))
		await waitFor(() => expect(node(map, 'nt').position?.y).toBe(0))
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Распределить' }))
		await flush()
		await fireEvent.click(within(panel()).getByRole('button', { name: 'В группу' }))
		await waitFor(() => expect(map.data().groups).toHaveLength(2))
	})

	it('слот inspector-end получает выбранный элемент и контроллер, но не показывается без выбора', async () => {
		const seen: unknown[] = []
		const slot = (props: { target: unknown; controller: unknown }) => {
			seen.push(props)
			return h('p', 'Свои действия')
		}
		const map = await mountEdit({ data: editData() }, { slots: { 'inspector-end': slot } })
		expect(screen.queryByText('Свои действия')).toBeNull()
		await pick(map, 'gw')
		expect(await screen.findByText('Свои действия')).toBeInTheDocument()
		expect(seen.at(-1)).toMatchObject({ target: { entity: 'node', id: 'gw' } })
		expect((seen.at(-1) as { controller: { select: unknown } }).controller.select).toBeTypeOf('function')
	})
})

describe('вкладка «Стиль»', () => {
	it('цвет акцента, вид карточки и значок записываются в узел', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 's1')
		await openTab('Стиль')
		const blue = within(panel()).getByRole('button', { name: 'Синий' })
		expect(within(panel()).getByRole('button', { name: 'Без цвета' })).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.click(blue)
		await waitFor(() => expect(node(map, 's1').color).toBe('var(--rise-info)'))
		expect(within(panel()).getByRole('button', { name: 'Синий' })).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Без цвета' }))
		await waitFor(() => expect(node(map, 's1').color).toBeUndefined())
		await fireEvent.click(within(panel()).getByRole('radio', { name: 'Компакт' }))
		await waitFor(() => expect(node(map, 's1').appearance).toBe('compact'))
		await fireEvent.click(within(panel()).getByRole('button', { name: 'database' }))
		await waitFor(() => expect(node(map, 's1').icon).toBe('database'))
		expect(within(panel()).getByRole('button', { name: 'database' })).toHaveAttribute('aria-pressed', 'true')
	})

	it('модель 3D: выбор из видов нотации и «Авто»', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 's1')
		await openTab('Стиль')
		expect(within(panel()).queryByRole('textbox', { name: 'Адрес файла GLB' })).toBeNull()
		await choose('Модель 3D', 'gateway')
		await waitFor(() => expect(node(map, 's1').model3d).toEqual({ model: 'gateway', url: undefined }))
		await choose('Модель 3D', 'Авто')
		await waitFor(() => expect(node(map, 's1').model3d).toBeUndefined())
	})

	it('«Свой GLB»: у узла с адресом поле видно, правка адреса пишется, очистка возвращает «Авто»', async () => {
		const data = editData()
		data.nodes[1] = { ...data.nodes[1], model3d: { url: '/models/a.glb' } }
		const map = await mountEdit({ data })
		await pick(map, 's1')
		await openTab('Стиль')
		const url = await within(panel()).findByRole('textbox', { name: 'Адрес файла GLB' })
		expect(url).toHaveValue('/models/a.glb')
		await fireEvent.update(url, '/models/b.glb')
		await waitFor(() => expect(node(map, 's1').model3d?.url).toBe('/models/b.glb'))
		await fireEvent.update(url, '')
		await waitFor(() => expect(node(map, 's1').model3d?.url).toBeUndefined())
	})

	it('выбор «Свой GLB» записывает модель узла (адрес пока пустой)', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 's1')
		await openTab('Стиль')
		await choose('Модель 3D', 'Свой GLB')
		await waitFor(() => expect(map.controller.getHistory().canUndo).toBe(true))
		await choose('Модель 3D', 'gateway')
		await choose('Модель 3D', 'Свой GLB')
		await waitFor(() => expect(node(map, 's1').model3d).toBeDefined())
	})
})

describe('вкладка «Данные»', () => {
	it('метрики узла, добавление и удаление своих полей', async () => {
		const withMetrics = editData()
		withMetrics.nodes[1] = { ...withMetrics.nodes[1], metrics: [{ id: 'rps', label: 'Запросов', value: 120, unit: 'в с' }] }
		const map = await mountEdit({ data: withMetrics })
		await pick(map, 's1')
		await openTab('Данные')
		expect(within(panel()).getByText('Запросов')).toBeInTheDocument()
		expect(within(panel()).getByText('120 в с')).toBeInTheDocument()
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Добавить поле' }))
		expect(node(map, 's1').fields).toBeUndefined()
		await fireEvent.update(within(panel()).getByRole('textbox', { name: 'Название поля' }), 'Владелец')
		await fireEvent.update(within(panel()).getByRole('textbox', { name: 'Значение' }), 'Команда А')
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Добавить поле' }))
		await waitFor(() => expect(node(map, 's1').fields).toHaveLength(1))
		expect(await within(panel()).findByText('Владелец: Команда А')).toBeInTheDocument()
		expect(within(panel()).getByRole('textbox', { name: 'Название поля' })).toHaveValue('')
		await fireEvent.click(within(panel()).getByRole('button', { name: 'Убрать поле «Владелец»' }))
		await waitFor(() => expect(node(map, 's1').fields).toEqual([]))
	})

	it('без метрик и полей — «Данных пока нет»', async () => {
		const map = await mountEdit({ data: editData() })
		await pick(map, 's2')
		await openTab('Данные')
		expect(within(panel()).getByText('Данных пока нет')).toBeInTheDocument()
	})
})

describe('вкладка «Хуки»', () => {
	it('показывает привязки приложения; выключатель отключает обработчик, вызовы считаются', async () => {
		function guardConnect() {
			return true
		}
		const map = await mountEdit({ data: editData(), beforeConnect: guardConnect })
		await openTab('Хуки')
		const hooks = within(panel())
		expect(hooks.getByText('Привязки событий и отменяемых хуков приложения.')).toBeInTheDocument()
		const toggle = hooks.getByRole('switch', { name: /Включить обработчик «guardConnect»/ })
		expect(toggle).toBeChecked()
		expect(hooks.getAllByText('отменяемый').length).toBeGreaterThan(0)
		expect(hooks.getByText(/guardConnect · вызван 0/)).toBeInTheDocument()
		await fireEvent.click(toggle)
		await waitFor(() => expect(hooks.getByRole('switch', { name: /guardConnect/ })).not.toBeChecked())
		map.controller.select(['gw'])
		await settle()
	})

	it('вызовы и последний итог появляются после срабатывания хука', async () => {
		const map = await mountEdit({ data: editData(), beforeDelete: () => false })
		await openTab('Хуки')
		await pick(map, 'gw')
		await map.press('Delete')
		await waitFor(() => expect(within(panel()).getAllByText(/beforeDelete|анонимная функция/).length).toBeGreaterThan(0))
		await waitFor(() => expect(within(panel()).getAllByText(/вызван 1/).length).toBeGreaterThan(0))
		expect(within(panel()).getAllByText(/Последний итог:/).length).toBeGreaterThan(0)
	})

	it('анонимный обработчик показывается как «анонимная функция»', async () => {
		await mountEdit({ data: editData(), beforeConnect: (() => true) as never })
		await openTab('Хуки')
		expect(within(panel()).getAllByText(/анонимная функция/).length).toBeGreaterThan(0)
	})
})

describe('узкий экран', () => {
	it('свойства выделенного элемента — в нижнем ящике; закрытие снимает выделение', async () => {
		const map = await mountEdit({ data: editData() }, { width: 400 })
		expect(screen.queryByRole('region', { name: 'Свойства и хуки' })).toBeNull()
		expect(screen.queryByRole('dialog')).toBeNull()
		await pick(map, 'gw')
		const drawer = await screen.findByRole('dialog', { name: 'Свойства и хуки' })
		expect(drawer).toHaveTextContent('Правка схемы — на планшете и десктопе')
		expect(within(drawer).getByRole('textbox', { name: 'Имя' })).toHaveValue('Шлюз')
		await fireEvent.keyDown(drawer, { key: 'Escape' })
		await waitFor(() => expect(map.controller.getSelection()).toEqual([]))
	})

	it('на узком экране жесты правки не работают', async () => {
		const map = await mountEdit({ data: editData() }, { width: 400 })
		await map.drag(map.node('gw'), [
			[10, 10],
			[90, 90],
		])
		expect(node(map, 'gw').position).toEqual({ x: 0, y: 0 })
		await map.press('a', { ctrlKey: true })
		expect(map.controller.getSelection()).toEqual([])
		await fireEvent.contextMenu(map.node('gw'))
		await fireEvent.dblClick(map.node('gw'))
		expect(screen.queryByRole('menu')).toBeNull()
		expect(screen.queryByRole('textbox', { name: 'Подпись элемента' })).toBeNull()
	})
})
