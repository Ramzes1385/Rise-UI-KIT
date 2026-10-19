import '@testing-library/jest-dom/vitest'
import { h } from 'vue'
import { fireEvent, within } from '@testing-library/vue'
import { flowServices } from '../../model/notations/services'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { pasteClip } from '../../model/edit/actions/editClipboard'
import { createHarness } from '../core/model/fixtures/modelHarness'
import FlowEditField from '../../ui/edit/inspector/FlowEditField.vue'
import { useEditCommands } from '../../model/edit/actions/editCommands'
import { useFlowEditLayer } from '../../model/edit/layer/useFlowEditLayer'
import { bareNotation, editData, flush, mapData, mountEdit, propsNotation, screen, settle, waitFor, type EditMap } from './editHarness'

const guard = guardConsole()

const ids = (map: EditMap) => map.data().nodes.map(item => item.id)
const node = (map: EditMap, id: string) => map.data().nodes.find(item => item.id === id)!

describe('команды правки напрямую', () => {
	it('перемещение неизвестного узла, раскладка без параметров и проверка связи с неизвестным узлом', async () => {
		const { model } = createHarness(mapData())
		const commands = useEditCommands(model)
		expect((await commands.move(['нет'], { x: 1, y: 1 })).isApplied).toBe(false)
		expect(commands.verify([{ node: 'нет' }, { node: 'a' }])).toBeNull()
		expect(commands.verify([{ node: 'a' }, { node: 'нет' }])).toBeNull()
		expect(commands.verify([{ node: 'a' }, { node: 'b' }])).toBeNull()
	})

	it('вставка выбирает свободный номер, если «n-3» уже занят', () => {
		const data = {
			version: 1 as const,
			nodes: [
				{ id: 'n-3', kind: 'service', label: 'A' },
				{ id: 'a', kind: 'service', label: 'B' },
			],
			edges: [],
		}
		const pasted = pasteClip(
			data,
			{ riseFlow: 1, nodes: [{ id: 'x', kind: 'service', label: 'X' }], edges: [], groups: [] },
			{ x: 0, y: 0 },
		)
		expect(pasted.nodes[0].id).toBe('n-4')
	})
})

describe('добавление узлов', () => {
	it('неизвестный вид со сброса на холст получает размер по умолчанию и подпись-вид', async () => {
		const map = await mountEdit({ data: editData() })
		const store = new Map([['application/x-rise-flow-kind', 'mystery']])
		const drop = new MouseEvent('drop', { bubbles: true, cancelable: true, ...map.at(600, 300) }) as MouseEvent & {
			dataTransfer?: unknown
		}
		drop.dataTransfer = { types: ['application/x-rise-flow-kind'], getData: (type: string) => store.get(type) ?? '' }
		map.root.dispatchEvent(drop)
		await flush()
		await settle()
		expect(guard.warn()).toHaveBeenCalledWith(expect.stringContaining('вид «mystery» не найден'))
		guard.warn().mockClear()
	})

	it('вид без размера и малый вид: следом за узлом и без привязки к сетке', async () => {
		const map = await mountEdit({ data: editData({ notation: 'props-demo' }), notations: [propsNotation() as never] })
		const palette = screen.getByRole('complementary', { name: 'Палитра элементов' })
		map.controller.select(['gw'])
		await settle()
		await fireEvent.click(screen.getByRole('switch', { name: 'Привязка' }))
		await fireEvent.click(within(palette).getByRole('button', { name: 'Добавить: Малый' }))
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		expect(map.data().nodes.at(-1)?.position).toBeDefined()
	})
})

describe('буфер и группы', () => {
	it('копирование группы переносит её участников; вставка создаёт новую группу', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['z1'])
		await settle()
		await map.press('c', { ctrlKey: true })
		await map.press('v', { ctrlKey: true })
		expect(map.data().groups).toHaveLength(2)
		expect(map.data().nodes.length).toBe(7)
	})

	it('G при выделенной группе (без узлов) и выравнивание одного узла среди нескольких элементов ничего не меняют', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['z1'])
		await settle()
		await map.press('g')
		expect(map.data().groups).toHaveLength(1)
		map.controller.select(['gw', 'e1'])
		await settle()
		await fireEvent.click(screen.getByRole('button', { name: 'Выровнять по верху' }))
		await flush()
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('вид новой группы: «zone», если он есть; иначе первый вид нотации; иначе «zone»', async () => {
		const lane = flowServices.groupKinds!.lane
		const first = { ...bareNotation(), groupKinds: { lane } }
		const map = await mountEdit({
			data: editData({ notation: 'bare', groups: undefined, nodes: editData().nodes.map(item => ({ ...item, group: undefined })) }),
			notations: [first as never],
		})
		map.controller.select(['gw'])
		await settle()
		await map.press('g')
		expect(map.data().groups?.[0].kind).toBe('lane')
		const none = await mountEdit({
			data: editData({ notation: 'bare', groups: undefined, nodes: editData().nodes.map(item => ({ ...item, group: undefined })) }),
			notations: [bareNotation() as never],
		})
		none.controller.select(['db'])
		await settle()
		await none.press('g')
		expect(none.data().groups?.[0].kind).toBe('zone')
	})
})

describe('указатель', () => {
	it('инструмент «Группа»: рамка по узлам собирает группу и возвращает «Выделение»', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('g')
		await map.drag(map.root, [
			[-60, -60],
			[900, 100],
		])
		expect(map.data().groups).toHaveLength(2)
		expect(screen.getByRole('button', { name: 'Выделение, V' })).toHaveAttribute('aria-pressed', 'true')
		await map.press('g')
		await map.click(map.root, [-200, 500])
		expect(screen.getByRole('button', { name: 'Выделение, V' })).toHaveAttribute('aria-pressed', 'true')
	})

	it('прерванный жест: pointercancel завершает перетаскивание без сдвига; дрожание меньше порога игнорируется', async () => {
		const map = await mountEdit({ data: editData() })
		map.pointer('pointerdown', map.node('gw'), map.at(10, 10))
		map.pointer('pointermove', window, map.at(11, 11))
		map.pointer('pointermove', window, map.at(60, 60))
		map.pointer('pointercancel', window, map.at(60, 60))
		await settle()
		await flush()
		expect(node(map, 'gw').position).toEqual({ x: 0, y: 0 })
		expect(map.container.querySelectorAll('.base-flow-map__edit-ghost')).toHaveLength(0)
	})

	it('нажатие не левой кнопкой и нажатие по узлу чужим инструментом ничего не делают', async () => {
		const map = await mountEdit({ data: editData() })
		await map.drag(
			map.node('gw'),
			[
				[10, 10],
				[90, 90],
			],
			{ button: 2 },
		)
		expect(node(map, 'gw').position).toEqual({ x: 0, y: 0 })
		await fireEvent.click(screen.getByRole('button', { name: 'Узел, N' }))
		await map.drag(map.node('gw'), [
			[10, 10],
			[90, 90],
		])
		expect(node(map, 'gw').position).toEqual({ x: 0, y: 0 })
		await fireEvent.click(screen.getByRole('button', { name: 'Связь, C' }))
		await map.click(map.root, [-200, 500])
		expect(ids(map)).toHaveLength(5)
	})

	it('соединение из порта с неизвестным id тянется от центра узла', async () => {
		const map = await mountEdit({ data: editData() })
		const stray = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
		stray.setAttribute('data-edit-port', 'gw|нет')
		map.root.appendChild(stray)
		await map.drag(stray, [
			[80, 28],
			[480, 188],
		])
		expect(map.data().edges.at(-1)).toMatchObject({ source: 'gw', target: 's2' })
		stray.remove()
	})

	it('вложенные группы: узел над двумя группами падает в меньшую', async () => {
		const data = editData({
			groups: [
				{ id: 'outer', kind: 'zone', label: 'Внешняя' },
				{ id: 'z1', kind: 'zone', label: 'Ядро', parent: 'outer' },
			],
		})
		const map = await mountEdit({ data })
		await map.drag(map.node('gw'), [
			[10, 10],
			[30, 172],
		])
		expect(node(map, 'gw').group).toBeDefined()
	})

	it('карта без групп: перетаскивание — простой сдвиг', async () => {
		const map = await mountEdit({ data: mapData() })
		await map.drag(map.node('a'), [
			[10, 10],
			[50, 50],
		])
		expect(map.data().nodes[0].position).toEqual({ x: 40, y: 40 })
	})
})

describe('узлы, скрытые свёрнутой группой', () => {
	it('Ctrl+A и перетаскивание при свёрнутой группе двигают видимые узлы и не падают', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.toggleGroup('z1')
		await settle()
		await map.press('a', { ctrlKey: true })
		await map.drag(map.node('gw'), [
			[10, 10],
			[90, 90],
		])
		expect(node(map, 'gw').position).not.toEqual({ x: 0, y: 0 })
	})
})

describe('слой правки и поля напрямую', () => {
	it('слой: порты скрытого узла пусты, подпись призрака — id, потеря холста обнуляет хозяина', async () => {
		const map = await mountEdit({ data: editData() })
		const layer = await map.probe(() => useFlowEditLayer())
		const { context } = await map.probe(scope => scope)
		context.env.state.ghosts.value = [{ id: 'нет', rect: { x: 0, y: 0, width: 10, height: 10 } }]
		expect(layer.ghosts.value[0].label).toBe('нет')
		layer.anchor.value = null
		expect(layer.host.value).toBeNull()
	})

	it('метка расстояния «центр» на направляющей и подсказка порта', async () => {
		const data = editData({
			notation: 'props-demo',
			nodes: [
				{
					id: 'gw',
					kind: 'sized',
					label: 'Малый',
					position: { x: 0, y: 300 },
					isPinned: true,
					ports: [{ id: 'in', side: 'left', label: 'вход' }],
				},
				{ id: 's1', kind: 'service', label: 'Заказы', position: { x: 400, y: 0 }, isPinned: true },
			],
			edges: [],
			groups: [],
		})
		const map = await mountEdit({ data, notations: [propsNotation() as never] })
		map.controller.select(['gw'])
		await settle()
		expect(map.container.querySelector('circle[data-edit-port="gw|in"] title')).toHaveTextContent('вход')
		map.pointer('pointerdown', map.node('gw'), map.at(10, 310))
		map.pointer('pointermove', window, map.at(442, 312))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-guide')).toHaveTextContent('центр')
		map.pointer('pointerup', window, map.at(442, 312))
		await settle()
	})

	it('поля без значений: число, список и переключатель получают пустые значения', async () => {
		const data = editData({
			notation: 'props-demo',
			nodes: [{ id: 'gw', kind: 'widget', label: 'Виджет', position: { x: 0, y: 0 }, isPinned: true }],
			edges: [],
			groups: [],
		})
		const map = await mountEdit({ data, notations: [propsNotation() as never] })
		map.controller.select(['gw'])
		await settle()
		const panel = screen.getByRole('region', { name: 'Свойства и хуки' })
		expect(within(panel).getByRole('spinbutton', { name: 'Размер' })).toBeInTheDocument()
		expect(within(panel).getByRole('combobox', { name: 'Режим 2' })).toBeInTheDocument()
	})

	it('сегмент без значения показывается без выбранного пункта', async () => {
		const map = await mountEdit({ data: editData() })
		const commit = vi.fn()
		const field = {
			id: 'x',
			type: 'segmented' as const,
			label: 'Вид линии',
			value: undefined,
			options: [{ value: 'a', label: 'А' }],
			commit,
		}
		await map.probe(() => h(FlowEditField, { field } as never))
		expect(await screen.findByRole('radiogroup', { name: 'Вид линии' })).toBeInTheDocument()
	})

	it('вкладка «Хуки» без привязок показывает «Обработчиков нет»', async () => {
		await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('tab', { name: 'Хуки' }))
		expect(await screen.findByText('Обработчиков нет')).toBeInTheDocument()
		expect(screen.queryByText(/update:suggestions|flowEditInternal|flowReviewInternal/)).not.toBeInTheDocument()
	})

	it('меню раскладки в нотации без направления показывает «Слева направо»', async () => {
		const map = await mountEdit({ data: editData({ notation: 'bare' }), notations: [bareNotation() as never] })
		const trigger = screen.getByRole('button', { name: 'Раскладка' })
		trigger.focus()
		await fireEvent.keyDown(trigger, { key: 'Enter' })
		const menu = await screen.findByRole('menu')
		expect(within(menu).getByRole('menuitemradio', { name: 'Слева направо' })).toHaveAttribute('aria-checked', 'true')
		void map
	})
})
