import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { controllerOf, fired, mapData, mountMap, pinned } from '../flowUi'

const node = (name: RegExp) => screen.getByRole('graphics-object', { name })

function scenarioData() {
	return mapData({
		scenarios: [
			{
				id: 's1',
				label: 'Заказ',
				steps: [
					{ id: 'st1', edge: 'e1', label: 'Создать' },
					{ id: 'st2', edge: 'e2', label: 'Оплатить' },
				],
			},
		],
	})
}

describe('BaseFlowMap события элементов', () => {
	it('click по узлу отдаёт цель и исходное событие и выделяет узел', async () => {
		const result = mountMap()
		await fireEvent.click(node(/^Alpha/))
		const [payload] = result.emitted()['node-click'].at(-1) as [{ target: unknown; event: Event }]
		expect(payload.target).toEqual({ entity: 'node', id: 'a' })
		expect(payload.event.type).toBe('click')
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['a']])
	})

	it('Shift, Ctrl и ⌘ переключают выбор вместо замены', async () => {
		const result = mountMap({ selection: ['b'] })
		await fireEvent.click(node(/^Alpha/), { shiftKey: true })
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['b', 'a']])
		await fireEvent.click(node(/^Beta/), { ctrlKey: true })
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['a']])
		await fireEvent.click(node(/^Gamma/), { metaKey: true })
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['a', 'c']])
	})

	it('двойной щелчок и контекстное меню узла идут своими событиями', async () => {
		const result = mountMap()
		await fireEvent.dblClick(node(/^Beta/))
		await fireEvent.contextMenu(node(/^Beta/))
		expect(fired(result, 'node-dblclick')[0][0]).toMatchObject({ target: { entity: 'node', id: 'b' } })
		expect(fired(result, 'node-contextmenu')[0][0]).toMatchObject({ target: { entity: 'node', id: 'b' } })
	})

	it('наведение даёт enter и leave, переход между элементами — leave прежнего и enter нового', async () => {
		const result = mountMap()
		await fireEvent.pointerEnter(node(/^Alpha/))
		await fireEvent.pointerEnter(node(/^Alpha/))
		expect(result.emitted()['node-enter']).toHaveLength(1)
		await fireEvent.pointerEnter(node(/^Beta/))
		expect(result.emitted()['node-leave']).toHaveLength(1)
		expect(fired(result, 'node-leave')[0][0]).toMatchObject({ target: { id: 'a' } })
		expect(result.emitted()['node-enter']).toHaveLength(2)
		await fireEvent.pointerLeave(screen.getByRole('graphics-document'))
		expect(result.emitted()['node-leave']).toHaveLength(2)
		await fireEvent.pointerLeave(screen.getByRole('graphics-document'))
		expect(result.emitted()['node-leave']).toHaveLength(2)
	})

	it('связь: click, dblclick, contextmenu, enter и leave', async () => {
		const result = mountMap()
		const edge = screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })
		await fireEvent.click(edge)
		await fireEvent.dblClick(edge)
		await fireEvent.contextMenu(edge)
		await fireEvent.pointerEnter(edge)
		await fireEvent.pointerLeave(edge)
		for (const name of ['edge-click', 'edge-dblclick', 'edge-contextmenu', 'edge-enter', 'edge-leave']) {
			expect(fired(result, name)[0][0]).toMatchObject({ target: { entity: 'edge', id: 'e1' } })
		}
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['e1']])
	})

	it('группа: click и contextmenu есть, наведения и двойного щелчка нет', async () => {
		const result = mountMap({ data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] }) })
		const group = screen.getByRole('graphics-object', { name: 'Зона' })
		await fireEvent.click(group)
		await fireEvent.contextMenu(group)
		await fireEvent.pointerEnter(group)
		await fireEvent.dblClick(group)
		expect(fired(result, 'group-click')[0][0]).toMatchObject({ target: { entity: 'group', id: 'g' } })
		expect(result.emitted()['group-contextmenu']).toHaveLength(1)
		expect(result.emitted()['group-enter']).toBeUndefined()
		expect(result.emitted()['group-dblclick']).toBeUndefined()
	})

	it('SVG-узел тоже шлёт все события', async () => {
		const result = mountMap({
			data: mapData({ nodes: [{ id: 'n', kind: 'note', label: 'Заметка', ...pinned(0, 0) }], edges: [] }),
		})
		const note = screen.getByRole('graphics-object', { name: /^Заметка/ })
		await fireEvent.click(note)
		await fireEvent.dblClick(note)
		await fireEvent.contextMenu(note)
		await fireEvent.pointerEnter(note)
		await fireEvent.pointerLeave(note)
		for (const name of ['node-click', 'node-dblclick', 'node-contextmenu', 'node-enter', 'node-leave']) {
			expect(result.emitted()[name]).toHaveLength(1)
		}
	})

	it('отключённая карта не выбирает и не шлёт click, но наведение работает', async () => {
		const result = mountMap({ isDisabled: true })
		await fireEvent.click(node(/^Alpha/))
		expect(result.emitted()['node-click']).toBeUndefined()
		expect(result.emitted()['update:selection']).toBeUndefined()
		await fireEvent.pointerEnter(node(/^Alpha/))
		expect(result.emitted()['node-enter']).toHaveLength(1)
	})

	it('selection из родителя меняет выбор без события', async () => {
		const result = mountMap({ selection: ['a'] })
		expect(node(/^Alpha/)).toHaveAttribute('aria-current', 'true')
		await result.rerender({ selection: ['b'] })
		expect(node(/^Alpha/)).not.toHaveAttribute('aria-current')
		expect(node(/^Beta/)).toHaveAttribute('aria-current', 'true')
		await result.rerender({ selection: undefined })
		expect(node(/^Beta/)).not.toHaveAttribute('aria-current')
	})

	it('перемещение узлов шлёт node-move с новыми позициями', async () => {
		const result = mountMap()
		const controller = controllerOf(result as never)
		await controller.move(['a', 'c'], { x: 10, y: 5 })
		const [payload] = result.emitted()['node-move'].at(-1) as [{ ids: string[]; positions: Record<string, { x: number; y: number }> }]
		expect(payload.ids).toEqual(['a', 'c'])
		expect(payload.positions).toEqual({ a: { x: 10, y: 5 }, c: { x: 10, y: 205 } })
		expect(result.emitted()['update:data']).toBeDefined()
	})

	it('смена данных родителем не шлёт update:data обратно', async () => {
		const result = mountMap()
		await result.rerender({ data: mapData({ title: 'Другое' }) })
		await nextTick()
		expect(result.emitted()['update:data']).toBeUndefined()
		expect(screen.getByRole('region', { name: 'Другое' })).toBeInTheDocument()
	})

	it('ready приходит один раз после монтирования с контроллером', () => {
		const result = mountMap()
		expect(result.emitted().ready).toHaveLength(1)
		expect(typeof controllerOf(result as never).fitView).toBe('function')
	})

	it('сценарий: scenario-change при запуске, scenario-step при смене шага', async () => {
		const result = mountMap({ data: scenarioData(), scenario: 's1' })
		const controller = controllerOf(result as never)
		controller.step(1)
		await waitFor(() => expect(result.emitted()['scenario-step']).toBeDefined())
		expect(result.emitted()['scenario-step']?.length).toBeGreaterThan(0)
		const last = fired(result, 'scenario-step').at(-1)?.[0] as { stepIndex: number; scenario: string }
		expect(last.scenario).toBe('s1')
		expect(last.stepIndex).toBeGreaterThanOrEqual(0)
		controller.play('s1')
		await nextTick()
		expect(result.emitted()['scenario-change'].length).toBeGreaterThan(0)
		controller.stop()
		await nextTick()
		expect((fired(result, 'scenario-change').at(-1)?.[0] as { status: string }).status).toBe('idle')
	})
})
