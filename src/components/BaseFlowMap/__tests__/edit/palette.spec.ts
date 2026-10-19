import '@testing-library/jest-dom/vitest'
import { fireEvent, within } from '@testing-library/vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { editData, flush, mountEdit, propsNotation, screen, settle, waitFor, type EditMap } from './editHarness'

guardConsole()

const palette = () => screen.getByRole('complementary', { name: 'Палитра элементов' })
const ids = (map: EditMap) => map.data().nodes.map(node => node.id)

function transfer(initial: Record<string, string> = {}) {
	const store = new Map(Object.entries(initial))
	return {
		types: [...store.keys()],
		setData: (type: string, value: string) => store.set(type, value),
		getData: (type: string) => store.get(type) ?? '',
		store,
	}
}

describe('палитра', () => {
	it('виды нотации по группам: заголовки, кнопки «Добавить: …», подсказка', async () => {
		await mountEdit({ data: editData() })
		const panel = palette()
		for (const title of ['Клиенты', 'Периметр', 'Сервисы', 'Данные', 'Заметки']) {
			expect(within(panel).getByRole('heading', { name: title })).toBeInTheDocument()
		}
		expect(within(panel).getByRole('button', { name: 'Добавить: Шлюз' })).toBeInTheDocument()
		expect(within(panel).getByText('Перетащите элемент на холст или нажмите Enter')).toBeInTheDocument()
	})

	it('поиск оставляет подходящие виды; если ничего нет — «Ничего не найдено»', async () => {
		await mountEdit({ data: editData() })
		const search = within(palette()).getByRole('searchbox', { name: 'Найти элемент' })
		const all = within(palette()).getAllByRole('button').length
		await fireEvent.update(search, 'шлю')
		const found = within(palette()).getAllByRole('button')
		expect(found.length).toBeLessThan(all)
		expect(within(palette()).getByRole('button', { name: 'Добавить: Шлюз' })).toBeInTheDocument()
		await fireEvent.update(search, 'такого нет')
		expect(within(palette()).queryAllByRole('button', { name: /^Добавить:/ })).toHaveLength(0)
		expect(within(palette()).getByText('Ничего не найдено')).toBeInTheDocument()
	})

	it('палитры нет в просмотре и на узком экране', async () => {
		await mountEdit({ data: editData(), mode: 'view' })
		expect(screen.queryByRole('complementary', { name: 'Палитра элементов' })).toBeNull()
	})

	it('на узком экране правка свёрнута: нет ни панели инструментов, ни палитры', async () => {
		await mountEdit({ data: editData() }, { width: 400 })
		expect(screen.queryByRole('complementary', { name: 'Палитра элементов' })).toBeNull()
		expect(screen.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull()
	})

	it('кнопка добавляет вид следом за выделенным узлом, соединяет связью по умолчанию и открывает подпись', async () => {
		const map = await mountEdit({ data: editData() })
		map.controller.select(['gw'])
		await settle()
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: База данных' }))
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		const added = map.data().nodes.at(-1)!
		expect(added.kind).toBe('database')
		expect(added.position).toEqual({ x: 0, y: 112 })
		await waitFor(() => expect(map.data().edges.at(-1)).toMatchObject({ source: 'gw', target: added.id }))
		await waitFor(() => expect(map.controller.getSelection()).toEqual([added.id]))
		expect(await screen.findByRole('textbox', { name: 'Подпись элемента' })).toBeInTheDocument()
		expect(map.controller.getHistory().undoLabel).toBeTruthy()
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
		await map.press('z', { ctrlKey: true })
		expect(ids(map)).toHaveLength(5)
		expect(map.data().edges).toHaveLength(2)
	})

	it('при раскладке слева направо узел встаёт справа от выделенного', async () => {
		const map = await mountEdit({ data: editData({ layout: { direction: 'LR' } }) })
		map.controller.select(['gw'])
		await settle()
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: Шлюз' }))
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		const added = map.data().nodes.at(-1)!
		expect(added.position).toEqual({ x: 216, y: 0 })
	})

	it('без узла в фокусе и без выделения — в центр вида; двойной щелчок тоже кладёт в центр', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: Шлюз' }))
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		const first = map.data().nodes.at(-1)!
		expect(first.position).toEqual({ x: 320, y: 176 })
		expect(map.data().edges).toHaveLength(2)
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
		await fireEvent.dblClick(within(palette()).getByRole('button', { name: 'Добавить: Кеш' }))
		await waitFor(() => expect(ids(map)).toHaveLength(7))
		expect(map.data().nodes.at(-1)?.kind).toBe('cache')
	})

	it('перетаскивание на холст кладёт вид в точку отпускания; dragover разрешает сброс только для палитры', async () => {
		const map = await mountEdit({ data: editData() })
		const item = within(palette()).getByRole('button', { name: 'Добавить: Очередь' })
		const out = transfer()
		await fireEvent.dragStart(item, { dataTransfer: out })
		expect(out.store.get('application/x-rise-flow-kind')).toBe('queue')
		expect(out.store.get('text/plain')).toBe('queue')
		const over = new Event('dragover', { bubbles: true, cancelable: true }) as Event & { dataTransfer?: unknown }
		over.dataTransfer = transfer({ 'application/x-rise-flow-kind': 'queue' })
		map.root.dispatchEvent(over)
		expect(over.defaultPrevented).toBe(true)
		const foreign = new Event('dragover', { bubbles: true, cancelable: true }) as Event & { dataTransfer?: unknown }
		foreign.dataTransfer = transfer({ 'text/plain': 'x' })
		map.root.dispatchEvent(foreign)
		expect(foreign.defaultPrevented).toBe(false)
		const drop = new MouseEvent('drop', { bubbles: true, cancelable: true, ...map.at(600, 300) }) as MouseEvent & {
			dataTransfer?: unknown
		}
		drop.dataTransfer = out
		map.root.dispatchEvent(drop)
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		const added = map.data().nodes.at(-1)!
		expect(added.kind).toBe('queue')
		expect(added.position).toEqual({ x: 520, y: 272 })
		const empty = new MouseEvent('drop', { bubbles: true, cancelable: true }) as MouseEvent & { dataTransfer?: unknown }
		empty.dataTransfer = transfer()
		map.root.dispatchEvent(empty)
		await flush()
		expect(ids(map)).toHaveLength(6)
	})

	it('заметка: кнопка палитры, инструмент T и клик по холсту; инструмент «Узел» ставит узел по умолчанию', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'Узел, N' }))
		await map.click(map.root, [600, 400])
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		expect(map.data().nodes.at(-1)).toMatchObject({ kind: 'service', position: { x: 520, y: 376 } })
		expect(screen.getByRole('button', { name: 'Выделение, V' })).toHaveAttribute('aria-pressed', 'true')
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
		await fireEvent.click(screen.getByRole('button', { name: 'Заметка, T' }))
		await map.click(map.root, [200, 400])
		await waitFor(() => expect(ids(map)).toHaveLength(7))
		expect(map.data().nodes.at(-1)?.kind).toBe('note')
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
		await map.press('n')
		await waitFor(() => expect(ids(map)).toHaveLength(8))
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
		await map.press('n', {})
		await fireEvent.keyDown(await screen.findByRole('textbox', { name: 'Подпись элемента' }), { key: 'Escape' })
	})

	it('Enter при инструменте «Узел» добавляет узел следом за выделенным', async () => {
		const map = await mountEdit({ data: editData() })
		await fireEvent.click(screen.getByRole('button', { name: 'Узел, N' }))
		map.controller.select(['s1'])
		await settle()
		await map.press('Enter')
		await waitFor(() => expect(ids(map)).toHaveLength(6))
		expect(map.data().edges.at(-1)).toMatchObject({ source: 's1' })
	})

	it('неизвестная группа палитры подписана своим id; свой вид с props добавляется', async () => {
		const map = await mountEdit({ data: editData({ notation: 'props-demo' }), notations: [propsNotation() as never] })
		expect(within(palette()).getByRole('heading', { name: 'my-group' })).toBeInTheDocument()
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: Виджет' }))
		await waitFor(() => expect(ids(map)).toHaveLength(6))
	})

	it('отказ beforeCreate не добавляет узел и не ломает палитру', async () => {
		const map = await mountEdit({ data: editData(), beforeCreate: () => false })
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: Шлюз' }))
		await flush()
		await settle()
		expect(ids(map)).toHaveLength(5)
		expect(screen.queryByRole('textbox', { name: 'Подпись элемента' })).toBeNull()
		map.controller.select(['gw'])
		await settle()
		await fireEvent.click(within(palette()).getByRole('button', { name: 'Добавить: Шлюз' }))
		await flush()
		expect(ids(map)).toHaveLength(5)
		const drop = new MouseEvent('drop', { bubbles: true, cancelable: true, ...map.at(600, 300) }) as MouseEvent & {
			dataTransfer?: unknown
		}
		drop.dataTransfer = transfer({ 'application/x-rise-flow-kind': 'queue' })
		map.root.dispatchEvent(drop)
		await flush()
		expect(ids(map)).toHaveLength(5)
	})
})
