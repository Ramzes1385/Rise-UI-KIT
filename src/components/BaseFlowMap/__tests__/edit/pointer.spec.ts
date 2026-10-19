import '@testing-library/jest-dom/vitest'
import { fireEvent } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, flush, liveText, mountEdit, screen, settle } from './editHarness'

guardConsole()

const at = (map: Awaited<ReturnType<typeof mountEdit>>, id: string) => map.data().nodes.find(node => node.id === id)?.position
const ghosts = (map: { container: Element }) => map.container.querySelectorAll('.base-flow-map__edit-ghost')

describe('выделение', () => {
	it('щелчок выделяет узел и озвучивается в строке состояния; щелчок по пустому месту снимает', async () => {
		const map = await mountEdit({ data: editData() })
		await map.click(map.node('gw'), [10, 10])
		expect(map.controller.getSelection()).toEqual(['gw'])
		expect(screen.getByRole('status', { name: 'Состояние правки' })).toHaveTextContent('Выделено: 1')
		await map.click(map.node('s1'), [410, 10])
		expect(map.controller.getSelection()).toEqual(['s1'])
		await map.click(map.root, [-200, 500])
		expect(map.controller.getSelection()).toEqual([])
	})

	it('Shift, Ctrl и ⌘ + щелчок по выделенному узлу снимают его с выделения', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['gw', 's1', 'db', 'nt'])
		await settle()
		await map.click(map.node('s1'), [410, 10], { shiftKey: true })
		expect(map.controller.getSelection()).toEqual(['gw', 'db', 'nt'])
		await map.click(map.node('db'), [810, 10], { ctrlKey: true })
		await map.click(map.node('nt'), [810, 310], { metaKey: true })
		expect(map.controller.getSelection()).toEqual(['gw'])
	})

	it('Shift, Ctrl и ⌘ + щелчок по невыделенному узлу добавляют его к выделению', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['gw'])
		await settle()
		await map.click(map.node('s1'), [410, 10], { shiftKey: true })
		expect(map.controller.getSelection()).toEqual(['gw', 's1'])
		await map.click(map.node('db'), [810, 10], { ctrlKey: true })
		await map.click(map.node('nt'), [810, 310], { metaKey: true })
		expect(map.controller.getSelection()).toEqual(['gw', 's1', 'db', 'nt'])
	})

	it('рамка по пустому месту выделяет узлы под ней; с Shift — добавляет к выделенному', async () => {
		const map = await mountEdit({ data: editData() })
		await map.drag(map.root, [
			[-60, -60],
			[100, 20],
		])
		expect(map.controller.getSelection()).toEqual(['gw'])
		expect(map.container.querySelector('.base-flow-map__edit-marquee')).toBeNull()
		await map.drag(
			map.root,
			[
				[700, -60],
				[900, 40],
			],
			{ shiftKey: true },
		)
		expect(map.controller.getSelection()).toEqual(['gw', 'db'])
	})

	it('рамка видна, пока идёт перетаскивание', async () => {
		const map = await mountEdit({ data: editData() })
		map.pointer('pointerdown', map.root, map.at(-60, -60))
		map.pointer('pointermove', window, map.at(100, 20))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-marquee')).not.toBeNull()
		map.pointer('pointerup', window, map.at(100, 20))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-marquee')).toBeNull()
	})

	it('Ctrl+A выделяет все узлы и озвучивает; Escape снимает выделение', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('a', { ctrlKey: true })
		expect(map.controller.getSelection()).toHaveLength(5)
		expect(await liveText(map)).toBe('Выделено всё: 5')
		await map.press('Escape')
		expect(map.controller.getSelection()).toEqual([])
	})

	it('пробел на узле в фокусе переключает выделение; пробел вне узла включает руку, отпускание выключает', async () => {
		const map = await mountEdit({ data: editData() })
		const gw = map.node('gw')
		gw.focus()
		await settle()
		await map.press(' ', {}, gw)
		expect(map.controller.getSelection()).toEqual(['gw'])
		await map.press(' ', {}, gw)
		expect(map.controller.getSelection()).toEqual([])
		await map.press(' ', {}, map.root)
		const before = map.controller.getViewport()
		await map.drag(map.root, [
			[100, 100],
			[160, 130],
		])
		expect(map.controller.getViewport().x).toBeCloseTo(before.x + 60)
		map.root.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }))
		map.root.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }))
		await settle()
		const after = map.controller.getViewport()
		await map.drag(map.root, [
			[100, 100],
			[160, 130],
		])
		expect(map.controller.getViewport().x).toBeCloseTo(after.x)
	})

	it('рука и средняя кнопка двигают область; после этого щелчок не выделяет', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('h')
		const start = map.controller.getViewport()
		await map.drag(map.node('gw'), [
			[10, 10],
			[50, 70],
		])
		expect(map.controller.getViewport()).toMatchObject({ x: start.x + 40, y: start.y + 60 })
		expect(at(map, 'gw')).toEqual({ x: 0, y: 0 })
		const click = map.pointer('click', map.node('gw'), map.at(10, 10))
		expect(click.defaultPrevented).toBe(true)
		await map.press('v')
		const mid = map.controller.getViewport()
		await map.drag(
			map.root,
			[
				[0, 0],
				[30, 0],
			],
			{ button: 1 },
		)
		expect(map.controller.getViewport().x).toBeCloseTo(mid.x + 30)
	})
})

describe('перемещение узлов', () => {
	it('перетаскивание сдвигает узел с привязкой к сетке: один шаг истории, Ctrl+Z возвращает', async () => {
		const map = await mountEdit({ data: editData() })
		await map.drag(map.node('gw'), [
			[10, 10],
			[-100, -100],
		])
		expect(at(map, 'gw')).toEqual({ x: -112, y: -112 })
		expect(map.controller.getHistory().undoLabel).toBe('Перемещение: 1')
		await map.press('z', { ctrlKey: true })
		expect(at(map, 'gw')).toEqual({ x: 0, y: 0 })
		expect(map.controller.getHistory().canRedo).toBe(true)
	})

	it('во время перетаскивания видны призрак и направляющая с расстоянием; потом исчезают', async () => {
		const map = await mountEdit({ data: editData() })
		map.pointer('pointerdown', map.node('gw'), map.at(10, 10))
		map.pointer('pointermove', window, map.at(14, 14))
		await settle()
		expect(ghosts(map)).toHaveLength(1)
		expect(ghosts(map)[0]).toHaveTextContent('Шлюз')
		const guides = map.container.querySelectorAll('.base-flow-map__edit-guide')
		expect(guides.length).toBeGreaterThan(0)
		map.pointer('pointerup', window, map.at(14, 14))
		await settle()
		await flush()
		expect(ghosts(map)).toHaveLength(0)
		expect(map.container.querySelectorAll('.base-flow-map__edit-guide')).toHaveLength(0)
		expect(at(map, 'gw')).toEqual({ x: 8, y: 0 })
	})

	it('Alt отключает привязку; выключенная «Привязка» тоже', async () => {
		const map = await mountEdit({ data: editData() })
		await map.drag(
			map.node('gw'),
			[
				[10, 10],
				[15, 14],
			],
			{ altKey: true },
		)
		expect(at(map, 'gw')).toEqual({ x: 5, y: 4 })
		await fireEvent.click(screen.getByRole('switch', { name: 'Привязка' }))
		await map.drag(map.node('gw'), [
			[10, 10],
			[17, 14],
		])
		expect(at(map, 'gw')).toEqual({ x: 12, y: 8 })
	})

	it('выделенные узлы едут вместе; узел вне выделения заменяет его; с Shift — добавляется', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['gw', 'db'])
		await settle()
		await map.drag(map.node('gw'), [
			[10, 10],
			[10, -70],
		])
		expect(at(map, 'gw')).toEqual({ x: 0, y: -80 })
		expect(at(map, 'db')).toEqual({ x: 800, y: -80 })
		expect(map.controller.getHistory().undoLabel).toBe('Перемещение: 2')
		await map.drag(map.node('nt'), [
			[810, 310],
			[810, 350],
		])
		expect(map.controller.getSelection()).toEqual(['nt'])
		await map.drag(
			map.node('s1'),
			[
				[410, 10],
				[410, 50],
			],
			{ shiftKey: true },
		)
		expect(map.controller.getSelection()).toEqual(['nt', 's1'])
		expect(at(map, 's1')).toEqual({ x: 400, y: 40 })
	})

	it('после перетаскивания следующий click гасится один раз', async () => {
		const map = await mountEdit({ data: editData() })
		await map.drag(map.node('gw'), [
			[10, 10],
			[60, 10],
		])
		const first = map.pointer('click', map.node('gw'), map.at(60, 10))
		const second = map.pointer('click', map.node('gw'), map.at(60, 10))
		expect(first.defaultPrevented).toBe(true)
		expect(second.defaultPrevented).toBe(false)
	})

	it('перенос в зону меняет group одним шагом; вынос из зоны снимает group', async () => {
		const map = await mountEdit({ data: editData() })
		map.pointer('pointerdown', map.node('gw'), map.at(10, 10))
		map.pointer('pointermove', window, map.at(30, 172))
		await settle()
		expect(map.container.querySelector('.base-flow-map__edit-drop')).not.toBeNull()
		map.pointer('pointerup', window, map.at(30, 172))
		await settle()
		await flush()
		await settle()
		expect(map.data().nodes.find(node => node.id === 'gw')?.group).toBe('z1')
		expect(map.controller.getHistory().undoLabel).toBe('Перенос в группу (1)')
		await map.press('z', { ctrlKey: true })
		expect(map.data().nodes.find(node => node.id === 'gw')?.group).toBeUndefined()
		await map.drag(map.node('s2'), [
			[410, 170],
			[410, 500],
		])
		expect(map.data().nodes.find(node => node.id === 's2')?.group).toBeUndefined()
	})

	it('правило canContain запрещает перенос: уведомление «Нельзя», данные не меняются', async () => {
		const { flowServices } = await import('../../model/notations/services')
		const strict = {
			...flowServices,
			id: 'strict',
			rules: {
				...flowServices.rules,
				canContain: (_: unknown, node: { kind: string }) =>
					node.kind === 'database' ? { code: 'no-db', message: 'База не живёт в зоне' } : true,
			},
		}
		const map = await mountEdit({ data: editData({ notation: 'strict' }), notations: [strict as never] })
		await map.drag(map.node('db'), [
			[810, 10],
			[30, 172],
		])
		expect(map.data().nodes.find(node => node.id === 'db')?.group).toBeUndefined()
		expect(screen.getByRole('status', { name: 'Уведомления правки' })).toHaveTextContent('Нельзя: База не живёт в зоне')
		await map.drag(map.node('gw'), [
			[10, 10],
			[30, 172],
		])
		expect(map.data().nodes.find(node => node.id === 'gw')?.group).toBe('z1')
	})

	it('вне режима «Правка» перетаскивание ничего не меняет', async () => {
		const map = await mountEdit({ data: editData(), mode: 'view' })
		await map.drag(map.node('gw'), [
			[10, 10],
			[90, 90],
		])
		expect(at(map, 'gw')).toEqual({ x: 0, y: 0 })
		expect(screen.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull()
	})
})
