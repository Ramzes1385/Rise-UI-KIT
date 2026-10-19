import '@testing-library/jest-dom/vitest'
import { fireEvent, within } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, liveText, mountEdit, screen, settle, waitFor, type EditMap } from './editHarness'

guardConsole()

const pos = (map: EditMap, id: string) => map.data().nodes.find(node => node.id === id)?.position
const ids = (map: EditMap) => map.data().nodes.map(node => node.id)
const notices = () => screen.getByRole('status', { name: 'Уведомления правки' })

async function select(map: EditMap, ...list: string[]) {
	map.controller.select(list)
	await settle()
}

describe('буфер обмена', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('Ctrl+C, Ctrl+V: копии с новыми id, связи внутри копии, сдвиг 24 px, один шаг «Вставка», озвучка', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw', 's1', 'db')
		await map.press('c', { ctrlKey: true })
		await map.press('v', { ctrlKey: true })
		const added = map.data().nodes.slice(5)
		expect(added.map(node => node.label)).toEqual(['Шлюз', 'Заказы', 'База'])
		expect(added.every(node => !['gw', 's1', 'db'].includes(node.id))).toBe(true)
		expect(added[0].position).toEqual({ x: 24, y: 24 })
		expect(map.data().edges).toHaveLength(4)
		expect(map.controller.getSelection().sort()).toEqual(added.map(node => node.id).sort())
		expect(map.controller.getHistory().undoLabel).toBe('Вставка')
		expect(await liveText(map)).toBe('Вставлено элементов: 3')
		await map.press('z', { ctrlKey: true })
		expect(ids(map)).toHaveLength(5)
	})

	it('Ctrl+X вырезает, Ctrl+V возвращает; Ctrl+D дублирует без буфера', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'nt')
		await map.press('x', { ctrlKey: true })
		expect(ids(map)).not.toContain('nt')
		await map.press('v', { ctrlKey: true })
		expect(map.data().nodes.at(-1)?.label).toBe('Заметка')
		await select(map, 'gw')
		await map.press('d', { ctrlKey: true })
		expect(map.data().nodes.filter(node => node.label === 'Шлюз')).toHaveLength(2)
	})

	it('с пустым выделением копирование, дублирование и пустой буфер ничего не делают', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('c', { ctrlKey: true })
		await map.press('d', { ctrlKey: true })
		await map.press('v', { ctrlKey: true })
		expect(ids(map)).toHaveLength(5)
	})

	it('системный буфер: пишем JSON, читаем чужой JSON; ошибки буфера не ломают память', async () => {
		const writeText = vi.fn().mockResolvedValue(undefined)
		const readText = vi
			.fn()
			.mockResolvedValue(
				JSON.stringify({ riseFlow: 1, nodes: [{ id: 'x', kind: 'service', label: 'Чужой', position: { x: 0, y: 0 } }], edges: [] }),
			)
		vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText, readText } })
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.press('c', { ctrlKey: true })
		expect(JSON.parse(writeText.mock.calls[0][0])).toMatchObject({ riseFlow: 1, nodes: [{ id: 'gw' }] })
		await map.press('v', { ctrlKey: true })
		expect(map.data().nodes.at(-1)?.label).toBe('Чужой')
		readText.mockRejectedValue(new Error('нет доступа'))
		writeText.mockRejectedValue(new Error('нет доступа'))
		await select(map, 'db')
		await map.press('c', { ctrlKey: true })
		await map.press('v', { ctrlKey: true })
		expect(map.data().nodes.at(-1)?.label).toBe('База')
		readText.mockResolvedValue('просто текст')
		await map.press('v', { ctrlKey: true })
		expect(map.data().nodes.filter(node => node.label === 'База')).toHaveLength(3)
	})
})

describe('удаление', () => {
	it('Delete и Backspace удаляют выделенное вместе со связями; Ctrl+Z возвращает', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 's1')
		await map.press('Delete')
		expect(ids(map)).not.toContain('s1')
		expect(map.data().edges).toHaveLength(0)
		expect(map.controller.getSelection()).toEqual([])
		await map.press('z', { ctrlKey: true })
		expect(ids(map)).toContain('s1')
		expect(map.data().edges).toHaveLength(2)
		await select(map, 'nt')
		await map.press('Backspace')
		expect(ids(map)).not.toContain('nt')
		await map.press('Delete')
		expect(ids(map)).toHaveLength(4)
	})

	it('beforeDelete отказывает — узел остаётся, пользователь видит причину', async () => {
		const map = await mountEdit({ data: editData(), beforeDelete: () => false })
		await select(map, 'gw')
		await map.press('Delete')
		expect(ids(map)).toContain('gw')
		expect(map.controller.getSelection()).toEqual(['gw'])
		expect(notices().textContent).toMatch(/^Нельзя: /)
	})

	describe('пул', () => {
		const pool = () => ({
			version: 1 as const,
			notation: 'bpmn',
			nodes: [
				{ id: 't1', kind: 'task', label: 'Задача', group: 'p1', position: { x: 0, y: 0 }, isPinned: true },
				{ id: 't2', kind: 'task', label: 'Вторая', group: 'p1', position: { x: 300, y: 0 }, isPinned: true },
			],
			edges: [{ id: 'q1', source: 't1', target: 't2', kind: 'sequence' }],
			groups: [{ id: 'p1', kind: 'pool', label: 'Клиент' }],
		})

		it('удаление пула спрашивает подтверждение; «Отмена» оставляет всё', async () => {
			const { flowBpmn } = await import('../../model/notations/bpmn')
			const map = await mountEdit({ data: pool(), notations: [flowBpmn] }, { withApp: true })
			map.controller.select(['p1'])
			await settle()
			await map.press('Delete')
			const dialog = await screen.findByRole('alertdialog', { name: 'Удалить пул?' })
			expect(dialog).toHaveAccessibleDescription(/Вместе с пулом удалится всё/)
			await fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
			await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
			expect(map.data().groups).toHaveLength(1)
			expect(map.data().nodes).toHaveLength(2)
		})

		it('подтверждение удаляет пул с содержимым и связями', async () => {
			const { flowBpmn } = await import('../../model/notations/bpmn')
			const map = await mountEdit({ data: pool(), notations: [flowBpmn] }, { withApp: true })
			map.controller.select(['p1'])
			await settle()
			await map.press('Delete')
			const dialog = await screen.findByRole('alertdialog', { name: 'Удалить пул?' })
			await fireEvent.click(within(dialog).getByRole('button', { name: /Удалить|Да|Подтвердить/ }))
			await waitFor(() => expect(map.data().groups ?? []).toHaveLength(0))
			expect(map.data().nodes).toHaveLength(0)
			expect(map.data().edges).toHaveLength(0)
		})
	})
})

describe('сдвиг стрелками, группа, выравнивание', () => {
	it('Shift+стрелки двигают на шаг сетки, Shift+Alt — на 1 px; подряд идущие сдвиги — один шаг истории', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.press('ArrowRight', { shiftKey: true })
		await map.press('ArrowRight', { shiftKey: true })
		await map.press('ArrowDown', { shiftKey: true })
		expect(pos(map, 'gw')).toEqual({ x: 16, y: 8 })
		await map.press('ArrowLeft', { shiftKey: true, altKey: true })
		await map.press('ArrowUp', { shiftKey: true, altKey: true })
		expect(pos(map, 'gw')).toEqual({ x: 15, y: 7 })
		await map.press('z', { ctrlKey: true })
		expect(pos(map, 'gw')).toEqual({ x: 0, y: 0 })
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('стрелки без выделения узлов ничего не двигают', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('ArrowRight', { shiftKey: true })
		expect(pos(map, 'gw')).toEqual({ x: 0, y: 0 })
		expect(map.controller.getHistory().canUndo).toBe(false)
	})

	it('G при выделении собирает группу вокруг выделенных узлов; Ctrl+Z убирает', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw', 'db')
		await map.press('g')
		const group = map.data().groups?.find(item => item.label === 'Новая группа')
		expect(group).toBeDefined()
		expect(
			map
				.data()
				.nodes.filter(node => node.group === group?.id)
				.map(node => node.id),
		).toEqual(['gw', 'db'])
		expect(map.controller.getSelection()).toEqual([group?.id])
		expect(map.controller.getHistory().undoLabel).toBe('Объединение в группу')
		await map.press('z', { ctrlKey: true })
		expect(map.data().groups).toHaveLength(1)
	})

	it('кнопки выравнивания и распределения на панели; «Распределить» только при трёх узлах', async () => {
		const map = await mountEdit({ data: editData() })
		expect(screen.queryByRole('group', { name: 'Выравнивание' })).toBeNull()
		await select(map, 'gw', 's2')
		expect(screen.queryByRole('button', { name: 'Распределить по горизонтали' })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'По левому краю' }))
		await waitFor(() => expect(pos(map, 's2')?.x).toBe(0))
		await fireEvent.click(screen.getByRole('button', { name: 'По центру' }))
		await fireEvent.click(screen.getByRole('button', { name: 'По верхнему краю' }))
		await waitFor(() => expect(pos(map, 's2')?.y).toBe(0))
		await select(map, 'gw', 's1', 'db')
		await fireEvent.click(screen.getByRole('button', { name: 'Распределить по горизонтали' }))
		await waitFor(() => expect(pos(map, 's1')?.x).toBeCloseTo(400))
	})

	it('отмена и повтор показывают уведомления «Отменено» и «Повторено»', async () => {
		const map = await mountEdit({ data: editData() })
		await select(map, 'gw')
		await map.press('ArrowRight', { shiftKey: true })
		await map.press('z', { ctrlKey: true })
		expect(notices()).toHaveTextContent('Отменено: Перемещение: 1 · Ctrl Z')
		await map.press('z', { ctrlKey: true, shiftKey: true })
		expect(notices()).toHaveTextContent('Повторено: Перемещение: 1')
		expect(pos(map, 'gw')?.x).toBe(8)
		await map.press('z', { ctrlKey: true })
		await map.press('y', { ctrlKey: true })
		expect(pos(map, 'gw')?.x).toBe(8)
		await map.press('y', { ctrlKey: true })
		await map.press('z', { ctrlKey: true })
		await map.press('z', { ctrlKey: true })
	})

	it('уведомление можно закрыть и оно само исчезает через 5 секунд', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		try {
			const map = await mountEdit({ data: editData(), beforeDelete: () => false })
			await select(map, 'gw')
			map.key(map.root, 'Delete')
			await vi.advanceTimersByTimeAsync(10)
			await settle()
			const close = within(notices()).getByRole('button')
			await fireEvent.click(close)
			expect(notices().textContent).toBe('')
			await select(map, 'gw')
			map.key(map.root, 'Delete')
			await vi.advanceTimersByTimeAsync(10)
			await settle()
			expect(notices().textContent).toMatch(/Нельзя/)
			await vi.advanceTimersByTimeAsync(5100)
			await settle()
			expect(notices().textContent).toBe('')
		} finally {
			vi.useRealTimers()
		}
	})
})

describe('клавиши в полях и вне режима', () => {
	it('в поле ввода обычные клавиши не срабатывают, сочетания с Ctrl — срабатывают', async () => {
		const map = await mountEdit({ data: editData() })
		const field = document.createElement('input')
		map.root.appendChild(field)
		await map.press('h', {}, field)
		expect(screen.getByRole('button', { name: 'Рука, H' })).toHaveAttribute('aria-pressed', 'false')
		await map.press('a', { ctrlKey: true }, field)
		expect(map.controller.getSelection()).toHaveLength(5)
		field.remove()
	})

	it('в просмотре, с изобразительной композицией IME и при отменённом событии клавиши игнорируются', async () => {
		const view = await mountEdit({ data: editData(), mode: 'view' })
		await view.press('a', { ctrlKey: true })
		expect(view.controller.getSelection()).toEqual([])
		const map = await mountEdit({ data: editData() })
		map.root.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', ctrlKey: true, isComposing: true, bubbles: true, cancelable: true }),
		)
		expect(map.controller.getSelection()).toEqual([])
		const early = new KeyboardEvent('keydown', { key: 'a', code: 'KeyA', ctrlKey: true, bubbles: true, cancelable: true })
		map.container.addEventListener('keydown', event => event.preventDefault(), true)
		map.node('gw').dispatchEvent(early)
		expect(map.controller.getSelection()).toEqual([])
	})

	it('+ − 0 меняют масштаб и вписывают карту; ? открывает справку клавиш', async () => {
		const map = await mountEdit({ data: editData() })
		const before = map.controller.getViewport().zoom
		await map.press('+', { shiftKey: true })
		await map.press('=', {})
		await map.press('-')
		await map.press('0')
		await map.press('?', { shiftKey: true })
		expect(before).toBeGreaterThan(0)
	})
})

describe('режим «Правки»: действия идут в черновик', () => {
	it('перетаскивание и удаление не меняют данные, а копятся в предложении к отправке', async () => {
		const map = await mountEdit({ data: editData(), mode: 'review', currentUser: { name: 'Роман' } })
		expect(screen.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull()
		await map.drag(map.node('gw'), [
			[10, 10],
			[90, 90],
		])
		expect(pos(map, 'gw')).toEqual({ x: 0, y: 0 })
		await select(map, 'nt')
		await map.press('Delete')
		expect(ids(map)).toContain('nt')
		expect(screen.getByRole('button', { name: /Отправить/ })).toBeInTheDocument()
	})

	it('выход из edit сбрасывает инструмент, подпись и меню', async () => {
		const map = await mountEdit({ data: editData() })
		await map.press('h')
		await map.rerender({ mode: 'view' })
		await settle()
		await map.rerender({ mode: 'edit' })
		await settle()
		expect(screen.getByRole('button', { name: 'Выделение, V' })).toHaveAttribute('aria-pressed', 'true')
	})
})
