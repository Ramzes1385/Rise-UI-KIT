import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { fireEvent, screen } from '@testing-library/vue'
import { controllerOf, mapData, mountMap, pinned, stubFrame } from '../flowUi'

const node = (name: RegExp) => screen.getByRole('graphics-object', { name })
const board = () => screen.getByRole('graphics-document')

function grid() {
	return mapData({
		nodes: [
			{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) },
			{ id: 'b', kind: 'service', label: 'Beta', ...pinned(300, 0) },
			{ id: 'c', kind: 'service', label: 'Gamma', ...pinned(0, 200) },
			{ id: 'd', kind: 'service', label: 'Delta', ...pinned(300, 200) },
		],
		edges: [
			{ id: 'e1', source: 'a', target: 'b' },
			{ id: 'e2', source: 'b', target: 'd' },
			{ id: 'e3', source: 'a', target: 'c' },
		],
	})
}

async function key(target: HTMLElement, name: string, init: KeyboardEventInit = {}) {
	await fireEvent.keyDown(target, { key: name, ...init })
	await nextTick()
	await nextTick()
}

describe('BaseFlowMap доступность: клавиатура', () => {
	beforeEach(() => stubFrame(800, 400))

	it('в Tab-последовательности один узел: первый, остальные — tabindex -1', () => {
		mountMap({ data: grid() })
		const tabbable = screen.getAllByRole('graphics-object').filter(item => item.getAttribute('tabindex') === '0')
		expect(tabbable).toHaveLength(1)
		expect(tabbable[0]).toHaveTextContent('Alpha')
		expect(node(/^Beta/)).toHaveAttribute('tabindex', '-1')
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })).toHaveAttribute('tabindex', '-1')
	})

	it('стрелки переходят к ближайшему узлу в направлении и переносят фокус', async () => {
		mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await key(node(/^Alpha/), 'ArrowRight')
		expect(node(/^Beta/)).toHaveFocus()
		expect(node(/^Beta/)).toHaveAttribute('tabindex', '0')
		expect(node(/^Alpha/)).toHaveAttribute('tabindex', '-1')
		await key(node(/^Beta/), 'ArrowDown')
		expect(node(/^Delta/)).toHaveFocus()
		await key(node(/^Delta/), 'ArrowLeft')
		expect(node(/^Gamma/)).toHaveFocus()
		await key(node(/^Gamma/), 'ArrowUp')
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('стрелка в пустое направление оставляет фокус на месте', async () => {
		mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await key(node(/^Alpha/), 'ArrowLeft')
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('без фокуса стрелка выбирает первый узел', async () => {
		mountMap({ data: grid() })
		await key(board(), 'ArrowDown')
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('стрелка на карте без узлов ничего не ломает', async () => {
		mountMap({ data: mapData({ nodes: [], edges: [] }) })
		await key(board(), 'ArrowRight')
		await key(board(), 'Home')
		await key(board(), 'End')
		expect(board()).toBeInTheDocument()
	})

	it('] и [ идут по связям: от узла к связи и дальше к цели, назад — к источнику; у узла без связей остаются на месте', async () => {
		mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await key(node(/^Alpha/), ']')
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })).toHaveFocus()
		await key(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ }), ']')
		expect(node(/^Beta/)).toHaveFocus()
		node(/^Delta/).focus()
		await key(node(/^Delta/), ']')
		expect(node(/^Delta/)).toHaveFocus()
		await key(node(/^Delta/), '[')
		expect(screen.getByRole('graphics-symbol', { name: /Beta → Delta/ })).toHaveFocus()
		await key(screen.getByRole('graphics-symbol', { name: /Beta → Delta/ }), '[')
		expect(node(/^Beta/)).toHaveFocus()
	})

	it('] и [ без фокуса ничего не делают', async () => {
		mountMap({ data: grid() })
		await key(board(), ']')
		await key(board(), '[')
		expect(document.body).toHaveFocus()
	})

	it('] и [ на связи переходят к её цели и источнику', async () => {
		mountMap({ data: grid() })
		const edge = screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })
		edge.focus()
		await fireEvent.focusIn(edge)
		await key(edge, ']')
		expect(node(/^Beta/)).toHaveFocus()
		edge.focus()
		await fireEvent.focusIn(edge)
		await key(edge, '[')
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('Home и End переходят к первому и последнему узлу', async () => {
		mountMap({ data: grid() })
		node(/^Beta/).focus()
		await key(node(/^Beta/), 'End')
		expect(node(/^Delta/)).toHaveFocus()
		await key(node(/^Delta/), 'Home')
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('набор букв ведёт к узлу по началу подписи и сбрасывается через 0,7 секунды', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		mountMap({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) },
					{ id: 'b', kind: 'service', label: 'Almond', ...pinned(300, 0) },
					{ id: 'c', kind: 'service', label: 'Gamma', ...pinned(0, 200) },
				],
				edges: [],
			}),
		})
		node(/^Gamma/).focus()
		await key(node(/^Gamma/), 'a')
		expect(node(/^Alpha/)).toHaveFocus()
		await key(node(/^Alpha/), 'l')
		await key(node(/^Alpha/), 'm')
		expect(node(/^Almond/)).toHaveFocus()
		vi.advanceTimersByTime(800)
		await key(node(/^Almond/), 'g')
		expect(node(/^Gamma/)).toHaveFocus()
		vi.advanceTimersByTime(800)
		await key(node(/^Gamma/), 'a')
		expect(node(/^Alpha/)).toHaveFocus()
		await key(node(/^Alpha/), 'z')
		expect(node(/^Alpha/)).toHaveFocus()
		vi.useRealTimers()
	})

	it('служебные сочетания и пробел не считаются набором', async () => {
		mountMap({ data: grid() })
		node(/^Alpha/).focus()
		const board_ = board()
		for (const init of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }]) {
			await fireEvent.keyDown(board_, { key: 'g', ...init })
		}
		await fireEvent.keyDown(board_, { key: ' ' })
		await fireEvent.keyDown(board_, { key: 'Tab' })
		await nextTick()
		expect(node(/^Alpha/)).toHaveFocus()
	})

	it('клавиши, которыми карта управляет, не прокручивают страницу, а Tab остаётся браузеру', async () => {
		mountMap({ data: grid() })
		const handled = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
		board().dispatchEvent(handled)
		expect(handled.defaultPrevented).toBe(true)
		const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
		board().dispatchEvent(tab)
		expect(tab.defaultPrevented).toBe(false)
	})

	it('Enter выбирает узел и связь, Escape снимает выбор и сообщает об этом', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const result = mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await key(node(/^Alpha/), 'Enter')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['a']])
		vi.advanceTimersByTime(60)
		await nextTick()
		expect(screen.getAllByRole('status').some(item => item.textContent === 'Выбрано: Alpha')).toBe(true)
		const edge = screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })
		edge.focus()
		await fireEvent.focusIn(edge)
		await key(edge, 'Enter')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['e1']])
		await key(edge, 'Escape')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([[]])
		vi.advanceTimersByTime(60)
		await nextTick()
		expect(screen.getAllByRole('status').some(item => item.textContent === UI_FLOW_MAP.ANNOUNCE_CLEARED)).toBe(true)
		vi.useRealTimers()
	})

	it('Enter на группе выбирает группу, без фокуса — ничего', async () => {
		const result = mountMap({ data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] }) })
		await key(board(), 'Enter')
		expect(result.emitted()['update:selection']).toBeUndefined()
		const group = screen.getByRole('graphics-object', { name: 'Зона' })
		group.focus()
		await fireEvent.focusIn(group)
		await key(group, 'Enter')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['g']])
	})

	it('Enter на неизвестном фокусе считает его узлом', async () => {
		const result = mountMap({ data: grid() })
		const controller = controllerOf(result as never)
		node(/^Alpha/).focus()
		await fireEvent.focusIn(node(/^Alpha/))
		controller.focus('b')
		await nextTick()
		await key(board(), 'Enter')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['b']])
	})

	it('фокус сообщается событием focus-change, выход из карты — null', async () => {
		const result = mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await fireEvent.focusIn(node(/^Alpha/))
		await key(node(/^Alpha/), 'ArrowRight')
		expect(result.emitted()['focus-change'].at(-1)).toEqual([{ entity: 'node', id: 'b' }])
		await fireEvent.focusOut(node(/^Beta/), { relatedTarget: document.body })
		expect(result.emitted()['focus-change'].at(-1)).toEqual([null])
		const before = result.emitted()['focus-change'].length
		await fireEvent.focusOut(node(/^Beta/), { relatedTarget: node(/^Alpha/) })
		expect(result.emitted()['focus-change']).toHaveLength(before)
	})

	it('фокус на связи сообщается как edge, а щелчок мышью по узлу делает его текущим', async () => {
		const result = mountMap({ data: grid() })
		const edge = screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })
		edge.focus()
		await fireEvent.focusIn(edge)
		await nextTick()
		expect(result.emitted()['focus-change'].at(-1)).toEqual([{ entity: 'edge', id: 'e1' }])
		await fireEvent.focusIn(node(/^Gamma/))
		await fireEvent.focusIn(node(/^Gamma/))
		expect(node(/^Gamma/)).toHaveAttribute('tabindex', '0')
	})

	it('фокус вне элементов карты (подсказка) текущим ничего не делает', async () => {
		const result = mountMap({ data: grid() })
		const hint = screen.getByText(UI_FLOW_MAP.KEYBOARD_HINT)
		await fireEvent.focusIn(hint)
		expect(result.emitted()['focus-change']).toBeUndefined()
	})

	it('если фокусированный id пропал из данных, в Tab-последовательности снова первый узел', async () => {
		const result = mountMap({ data: grid() })
		const controller = controllerOf(result as never)
		controller.focus('b')
		await nextTick()
		expect(node(/^Beta/)).toHaveAttribute('tabindex', '0')
		await result.rerender({ data: mapData({ nodes: [{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) }], edges: [] }) })
		expect(node(/^Alpha/)).toHaveAttribute('tabindex', '0')
	})

	it('идентификатор с кавычкой находится при переносе фокуса', async () => {
		const result = mountMap({
			data: mapData({ nodes: [{ id: 'a"b', kind: 'service', label: 'Quote', ...pinned(0, 0) }], edges: [] }),
		})
		controllerOf(result as never).focus('a"b')
		await nextTick()
		await nextTick()
		expect(node(/^Quote/)).toHaveFocus()
	})

	it('переход на узел за краем области двигает вид, чтобы узел был виден', async () => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout', 'clearTimeout'] })
		const result = mountMap({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', ...pinned(0, 0) },
					{ id: 'b', kind: 'service', label: 'Beta', ...pinned(3000, 0) },
				],
				edges: [],
			}),
		})
		const controller = controllerOf(result as never)
		await nextTick()
		await nextTick()
		controller.setViewport({ x: 0, y: 0, zoom: 1 })
		node(/^Alpha/).focus()
		await key(node(/^Alpha/), 'ArrowRight')
		await vi.advanceTimersByTimeAsync(400)
		expect(node(/^Beta/)).toHaveFocus()
		const view = controller.getViewport()
		expect(view.x).toBeLessThan(-2000)
		await key(node(/^Beta/), 'Home')
		await vi.advanceTimersByTimeAsync(400)
		expect(controller.getViewport().x).toBeGreaterThan(-100)
		vi.useRealTimers()
	})

	it('элемент с неизвестным id получает фокус без события и считается узлом при Enter', async () => {
		const result = mountMap({ data: grid() })
		const stray = document.createElement('button')
		stray.dataset.flowId = 'ghost'
		board().appendChild(stray)
		stray.focus()
		await fireEvent.focusIn(stray)
		await nextTick()
		expect(result.emitted()['focus-change']).toBeUndefined()
		await key(stray, 'Enter')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['ghost']])
	})

	it('пропажа всех узлов и Home сбрасывают текущий без ошибки', async () => {
		const result = mountMap({ data: grid() })
		node(/^Alpha/).focus()
		await fireEvent.focusIn(node(/^Alpha/))
		await nextTick()
		await result.rerender({ data: mapData({ nodes: [], edges: [] }) })
		await key(board(), 'Home')
		expect(board()).toBeInTheDocument()
	})
})
