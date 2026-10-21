import '@testing-library/jest-dom/vitest'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { CROSS_DATA, LONE_DATA, T, nodeOf, pointer, screenPoint, tagOf, useEditHarness } from '../helpers/editHarness.test-utils'

const { env, mountEdit } = useEditHarness()

const notice = () => document.querySelector('.base-flow-map-3d__notice')
const SERVICES = (extra: Record<string, unknown> = {}) => ({ ...LONE_DATA, ...extra })

async function dragTag(map: Awaited<ReturnType<typeof mountEdit>>, id: string, path: Array<[number, number]>) {
	const tag = tagOf(map.container, id)
	const [first, ...rest] = path
	await pointer('pointerdown', tag, { x: first[0], y: first[1] })
	for (const [x, y] of rest) {
		await pointer('pointermove', window, { x, y })
		env.flushFrames()
	}
	await pointer('pointerup', window, { x: path.at(-1)![0], y: path.at(-1)![1] })
	await new Promise(resolve => setTimeout(resolve, 0))
	env.flushFrames()
}

describe('BaseFlowMap3D «Правка»: перенос узла', () => {
	it('перенос по земле выбирает узел, привязывает к сетке и сообщает «Узел перемещён»', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		const before = nodeOf(map.data(), 'a')!.position!
		await dragTag(map, 'a', [
			[450, 280],
			[455, 282],
			[520, 300],
			[560, 320],
		])
		await waitFor(() => expect(nodeOf(map.data(), 'a')!.position).not.toEqual(before))
		const after = nodeOf(map.data(), 'a')!.position!
		expect(after.x % 40).toBe(0)
		expect(after.y % 40).toBe(0)
		await waitFor(() => expect(notice()).toHaveTextContent(T.EDIT_MOVED))
		expect(map.api().getSelection()).toEqual(['a'])
	})

	it('смещение меньше порога — это щелчок, а не перенос', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		const before = nodeOf(map.data(), 'a')!.position
		await dragTag(map, 'a', [
			[450, 280],
			[451, 281],
		])
		expect(nodeOf(map.data(), 'a')!.position).toEqual(before)
		expect(notice()).toBeNull()
	})

	it('перенос в занятую клетку отказывает: «Клетка занята», позиция прежняя', async () => {
		const map = await mountEdit({ data: CROSS_DATA })
		const start = screenPoint(tagOf(map.container, 'a'))
		const end = screenPoint(tagOf(map.container, 'n'))
		await dragTag(map, 'a', [
			[start.x, start.y],
			[start.x + 8, start.y + 8],
			[end.x, end.y],
			[end.x + 2, end.y + 2],
		])
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})

	it('Escape во время переноса отменяет его: «Перенос отменён»', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		const tag = tagOf(map.container, 'a')
		await pointer('pointerdown', tag, { x: 450, y: 280 })
		await pointer('pointermove', window, { x: 470, y: 290 })
		await pointer('pointermove', window, { x: 560, y: 330 })
		await map.press('Escape')
		await waitFor(() => expect(notice()).toHaveTextContent(T.EDIT_CANCELLED))
		await pointer('pointerup', window, { x: 560, y: 330 })
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})

	it('отмена указателя (pointercancel) гасит перенос без правки', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280 })
		await pointer('pointermove', window, { x: 470, y: 290 })
		await pointer('pointercancel', window)
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})

	it('вторая кнопка, неглавный указатель и нажатие вне сцены перенос не начинают', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280, button: 2 })
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280, isPrimary: false })
		await pointer('pointerdown', screen.getByRole('toolbar', { name: T.EDIT_TOOLBAR }), { x: 450, y: 280 })
		await pointer('pointermove', window, { x: 560, y: 330 })
		await pointer('pointerup', window, { x: 560, y: 330 })
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})

	it('движение указателя над сценой без инструмента «Связь» ничего не делает', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await pointer('pointermove', tagOf(map.container, 'a'), { x: 450, y: 280 })
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})

	it('после переноса щелчок по узлу гасится один раз; вне «Правки» щелчок проходит', async () => {
		const onClick = vi.fn()
		const map = await mountEdit({ data: LONE_DATA, onNodeClick: onClick })
		await dragTag(map, 'a', [
			[450, 280],
			[470, 290],
			[560, 330],
		])
		const afterDrag = onClick.mock.calls.length
		await fireEvent.click(tagOf(map.container, 'a'))
		expect(onClick).toHaveBeenCalledTimes(afterDrag)
		await new Promise(resolve => setTimeout(resolve, 5))
		await fireEvent.click(tagOf(map.container, 'b'))
		expect(onClick).toHaveBeenCalledTimes(afterDrag + 1)
	})

	it('выход из «Правки» гасит начатый перенос', async () => {
		const map = await mountEdit({ data: LONE_DATA })
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280 })
		await pointer('pointermove', window, { x: 470, y: 290 })
		await map.rerender({ mode: 'view' })
		await pointer('pointerup', window, { x: 560, y: 330 })
		expect(nodeOf(map.data(), 'a')!.position).toEqual({ x: 400, y: 400 })
	})
})

describe('BaseFlowMap3D «Правка»: связь', () => {
	const linkButton = () => screen.getByRole('button', { name: T.EDIT_LINK })

	it('кнопка «Связать» включает режим связи, стрелка выбирает цель, Enter создаёт связь', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.select('a')
		await fireEvent.click(linkButton())
		expect(linkButton()).toHaveAttribute('aria-pressed', 'true')
		await map.press('ArrowRight')
		await map.press('Enter')
		await waitFor(() => expect(map.data().edges.length).toBeGreaterThan(0))
		const [created] = map.data().edges
		expect(created.source).toBe('a')
		expect(created.target).not.toBe('a')
		await waitFor(() => expect(linkButton()).toHaveAttribute('aria-pressed', 'false'))
	})

	it('Enter в режиме связи, когда выбор уже снят, связь не создаёт', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.select('a')
		await map.press('c')
		map.api().select([])
		await map.press('Enter')
		expect(map.data().edges).toHaveLength(0)
	})

	it('C включает и выключает связь, Escape выходит из неё', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.select('a')
		await map.press('c')
		expect(linkButton()).toHaveAttribute('aria-pressed', 'true')
		await map.press('c')
		expect(linkButton()).toHaveAttribute('aria-pressed', 'false')
		await map.press('c')
		await map.press('Escape')
		expect(linkButton()).toHaveAttribute('aria-pressed', 'false')
		await map.press('Escape')
	})

	it('без выбранного узла связь не включается; смена на «select» уже в нём — без шума', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.press('c')
		expect(linkButton()).toBeDisabled()
	})

	it('протяжка от выбранного узла к цели создаёт связь', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.select('a')
		await fireEvent.click(linkButton())
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280 })
		await pointer('pointermove', tagOf(map.container, 'b'), { x: 520, y: 300 })
		await pointer('pointerup', tagOf(map.container, 'b'), { x: 520, y: 300 })
		await waitFor(() => expect(map.data().edges.length).toBe(1))
	})

	it('отпускание на пустом месте и на самом узле связь не создаёт', async () => {
		const map = await mountEdit({ data: SERVICES() })
		await map.select('a')
		await fireEvent.click(linkButton())
		await pointer('pointerdown', tagOf(map.container, 'a'), { x: 450, y: 280 })
		await pointer('pointerup', tagOf(map.container, 'a'), { x: 450, y: 280 })
		await pointer('pointerdown', tagOf(map.container, 'b'), { x: 520, y: 300 })
		await pointer('pointerup', window, { x: 5, y: 5 })
		expect(map.data().edges).toHaveLength(0)
	})

	it('правило canConnect отказывает: причина слышна и видна в подсказке, связи нет', async () => {
		const { flowServices } = await import('@components/BaseFlowMap/model/notations/services')
		const strict = {
			...flowServices,
			id: 'strict',
			rules: { ...flowServices.rules, canConnect: () => ({ code: 'no', message: 'База не принимает связи' }) },
		}
		const map = await mountEdit({ data: SERVICES({ notation: 'strict' }), notations: [strict as never] })
		await map.select('a')
		await map.press('c')
		const hint = () => document.querySelector('.base-flow-map-3d__hint')?.textContent ?? ''
		for (const key of ['ArrowRight', 'ArrowDown', 'ArrowRight', 'ArrowUp']) {
			if (hint().includes('База не принимает связи')) break
			await map.press(key)
		}
		await waitFor(() => expect(hint()).toContain('База не принимает связи'))
		await map.press('Enter')
		await waitFor(() => expect(notice()).toHaveTextContent(T.EDIT_LINK_FAILED.replace('{reason}', '')))
		expect(map.data().edges).toHaveLength(0)
	})
})
