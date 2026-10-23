import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { controllerOf, mapData, mountMap, stubFrame } from '../flowUi'
import { guardConsole } from '../../../helpers/consoleGuard.test-utils'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'

guardConsole()

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

async function openDetails(name: RegExp) {
	await fireEvent.click(node(name))
	await nextTick()
}

describe('слот tooltip', () => {
	it('без слота подсказки нет, даже при наведении', async () => {
		mountMap()
		await fireEvent.pointerEnter(node(/^Alpha/))
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})

	it('наведение на узел показывает подсказку под узлом; слот получает цель и узел', async () => {
		const tooltip = vi.fn((props: { target: { entity: string; id: string }; node?: { label: string } }) =>
			h('b', `${props.target.entity}:${props.target.id}:${props.node?.label}`),
		)
		mountMap({}, { slots: { tooltip } })
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
		await fireEvent.pointerEnter(node(/^Beta/))
		const bubble = screen.getByRole('tooltip')
		expect(bubble).toHaveTextContent('node:b:Beta')
		expect(bubble.style.left).not.toBe('')
		expect(bubble.style.top).not.toBe('')
		await fireEvent.pointerLeave(node(/^Beta/))
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})

	it('наведение на связь с подписью показывает подсказку у подписи; слот получает связь', async () => {
		const tooltip = vi.fn((props: { target: { entity: string; id: string }; edge?: { id: string } }) =>
			h('b', `${props.target.entity}:${props.edge?.id}`),
		)
		const { container } = mountMap({}, { slots: { tooltip } })
		const edges = container.querySelectorAll('.base-flow-map__edge')
		expect(edges.length).toBeGreaterThan(0)
		await fireEvent.pointerEnter(edges[0] as Element)
		expect(screen.getByRole('tooltip')).toHaveTextContent('edge:e1')
	})

	it('связь без подписи точки не даёт: подсказка не показывается', async () => {
		const tooltip = vi.fn(() => h('b', 'подсказка'))
		const { container } = mountMap({}, { slots: { tooltip } })
		const edges = container.querySelectorAll('.base-flow-map__edge')
		await fireEvent.pointerEnter(edges[1] as Element)
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})

	it('фокус с клавиатуры тоже показывает подсказку', async () => {
		const tooltip = vi.fn((props: { node?: { label: string } }) => h('b', props.node?.label))
		mountMap({}, { slots: { tooltip } })
		await fireEvent.focusIn(node(/^Gamma/))
		expect(screen.getByRole('tooltip')).toHaveTextContent('Gamma')
	})

	it('на узком экране подсказки нет', async () => {
		stubFrame(400, 500)
		mountMap({}, { slots: { tooltip: () => h('b', 'подсказка') } })
		await nextTick()
		await nextTick()
		await fireEvent.pointerEnter(node(/^Alpha/))
		expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
	})
})

describe('слот details', () => {
	it('заменяет содержимое боковой панели и получает цель, узел и close', async () => {
		const details = vi.fn((props: { target: { id: string }; node?: { label: string }; close: () => void }) =>
			h('button', { type: 'button', onClick: props.close }, `свои:${props.target.id}:${props.node?.label}`),
		)
		mountMap({}, { slots: { details } })
		await openDetails(/^Alpha/)
		const custom = await screen.findByRole('button', { name: 'свои:a:Alpha' })
		expect(screen.queryByRole('button', { name: /закрыть/i })).not.toBeInTheDocument()
		await fireEvent.click(custom)
		expect(screen.queryByRole('button', { name: 'свои:a:Alpha' })).not.toBeInTheDocument()
	})

	it('пока цель не выбрана, слот не вызывается', async () => {
		const details = vi.fn(() => h('i', 'свои'))
		mountMap({}, { slots: { details } })
		await flushPromises()
		expect(details).not.toHaveBeenCalled()
		await openDetails(/^Alpha/)
		await waitFor(() => expect(details).toHaveBeenCalled())
	})

	it('для связи слот получает edge, а не node', async () => {
		const details = vi.fn((props: { edge?: { id: string }; node?: unknown }) => h('i', `edge=${props.edge?.id};node=${props.node}`))
		const { container } = mountMap({}, { slots: { details } })
		await fireEvent.click(container.querySelectorAll('.base-flow-map__edge')[0] as Element)
		await nextTick()
		expect(await screen.findByText('edge=e1;node=undefined')).toBeInTheDocument()
	})

	it('на узком экране слот показывается в листе', async () => {
		stubFrame(400, 500)
		mountMap({}, { slots: { details: (props: { target: { id: string } }) => h('i', `лист:${props.target.id}`) } })
		await nextTick()
		await nextTick()
		await openDetails(/^Alpha/)
		expect(within(await screen.findByRole('dialog')).getByText('лист:a')).toBeInTheDocument()
	})
})

describe('слот inspector-end', () => {
	const inspector = (props: { target: { id: string }; controller: unknown }) =>
		h('i', { 'data-testid': 'inspector' }, `правка:${props.target.id}:${typeof props.controller}`)

	it('в режиме «Правка» стоит под содержимым панели и получает цель и контроллер', async () => {
		mountMap({ mode: 'edit' }, { slots: { 'inspector-end': inspector } })
		await openDetails(/^Beta/)
		expect(await screen.findByTestId('inspector')).toHaveTextContent('правка:b:object')
	})

	it('в режиме «Правка» слот details не рисуется, а inspector-end остаётся в инспекторе', async () => {
		mountMap({ mode: 'edit' }, { slots: { 'inspector-end': inspector, details: () => h('u', 'своё') } })
		await openDetails(/^Beta/)
		expect(await screen.findByTestId('inspector')).toBeInTheDocument()
		expect(screen.queryByText('своё')).not.toBeInTheDocument()
	})

	it('в режиме просмотра не показывается', async () => {
		mountMap({}, { slots: { 'inspector-end': inspector } })
		await openDetails(/^Beta/)
		await flushPromises()
		expect(screen.queryByTestId('inspector')).not.toBeInTheDocument()
	})

	it('на узком экране в режиме «Правка» стоит в листе', async () => {
		stubFrame(400, 500)
		mountMap({ mode: 'edit' }, { slots: { 'inspector-end': inspector } })
		await nextTick()
		await nextTick()
		await openDetails(/^Beta/)
		expect(within(await screen.findByRole('dialog')).getByTestId('inspector')).toHaveTextContent('правка:b')
	})
})

describe('слот legend', () => {
	it('получает список образцов и заменяет стандартный список', () => {
		const legend = vi.fn((props: { items: Array<{ id: string; label: string }> }) =>
			h('p', { 'data-testid': 'legend' }, props.items.map(item => item.label).join('|')),
		)
		const { container } = mountMap({ panels: ['legend'] }, { slots: { legend } })
		const received = legend.mock.calls[0][0].items
		expect(received.length).toBeGreaterThan(0)
		expect(received[0]).toMatchObject({ id: expect.any(String), label: expect.any(String), sample: expect.anything() })
		expect(screen.getByTestId('legend')).toHaveTextContent(received.map(item => item.label).join('|'))
		expect(container.querySelector('.base-flow-map__legend-list')).toBeNull()
	})

	it('без слота остаётся стандартный список', () => {
		const { container } = mountMap({ panels: ['legend'] })
		expect(container.querySelector('.base-flow-map__legend-list')).not.toBeNull()
		expect(container.querySelector('.base-flow-map__legend-custom')).toBeNull()
	})
})

describe('слот scenario-step', () => {
	const step = (props: { step: { id: string }; index: number; isActive: boolean; isDone: boolean }) =>
		h('span', { 'data-testid': 'step' }, `${props.index}:${props.step.id}:${props.isActive}:${props.isDone}`)

	it('заменяет кнопку шага в панели сценария; индекс и состояние шага — в свойствах', async () => {
		const result = mountMap({ data: scenarioData(), panels: ['scenario'] }, { slots: { 'scenario-step': step } })
		const steps = await screen.findAllByTestId('step')
		expect(steps.map(item => item.textContent?.split(':').slice(0, 2).join(':'))).toEqual(['0:st1', '1:st2'])
		expect(screen.queryByRole('button', { name: /Создать/ })).not.toBeInTheDocument()
		controllerOf(result).seek({ step: 'st2' })
		await waitFor(() =>
			expect(screen.getAllByTestId('step').map(item => item.textContent)).toEqual(['0:st1:false:true', '1:st2:true:false']),
		)
	})

	it('на узком экране плеер без списка шагов: слот не вызывается', async () => {
		stubFrame(400, 500)
		const spy = vi.fn(step)
		const { container } = mountMap({ data: scenarioData(), panels: ['scenario'] }, { slots: { 'scenario-step': spy } })
		await waitFor(() => expect(container.querySelector('.base-flow-map__scenario-panel--compact')).not.toBeNull())
		expect(screen.queryByTestId('step')).not.toBeInTheDocument()
		expect(spy).not.toHaveBeenCalled()
	})
})

describe('кнопка скорости сценария', () => {
	it('имя содержит видимый текст: «Скорость: 1×», затем «Скорость: 2×»', async () => {
		mountMap({ data: scenarioData(), panels: ['scenario'] })
		const speed = await screen.findByRole('button', { name: 'Скорость: 1×' })
		expect(speed).toHaveTextContent('1×')
		await fireEvent.click(speed)
		expect(screen.getByRole('button', { name: 'Скорость: 2×' })).toHaveTextContent('2×')
	})
})

describe('запись истории листа подробностей', () => {
	it('лист, открытый до загрузки подробностей (первые 200 мс), добавляет запись истории', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		stubFrame(400, 500)
		mountMap()
		await openDetails(/^Alpha/)
		await screen.findByRole('dialog')
		await waitFor(() => expect(push).toHaveBeenCalledWith({ riseFlowDetails: true }, ''))
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	async function mountSheet() {
		stubFrame(400, 500)
		const result = mountMap()
		await new Promise(resolve => setTimeout(resolve, 600))
		return result
	}

	it('открытый лист добавляет запись истории, а размонтирование карты снимает её', async () => {
		const push = vi.spyOn(window.history, 'pushState')
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const result = await mountSheet()
		await openDetails(/^Alpha/)
		await screen.findByRole('dialog')
		await waitFor(() => expect(push).toHaveBeenCalledWith({ riseFlowDetails: true }, ''))
		expect(back).not.toHaveBeenCalled()
		result.unmount()
		expect(back).toHaveBeenCalledTimes(1)
	})

	it('закрытый лист при размонтировании историю не трогает', async () => {
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const result = await mountSheet()
		await openDetails(/^Alpha/)
		await fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape' })
		await nextTick()
		back.mockClear()
		result.unmount()
		expect(back).not.toHaveBeenCalled()
	})

	it('если запись истории уже не наша, «назад» не вызывается', async () => {
		const back = vi.spyOn(window.history, 'back').mockImplementation(() => undefined)
		const result = await mountSheet()
		await openDetails(/^Alpha/)
		await screen.findByRole('dialog')
		window.history.replaceState(null, '')
		result.unmount()
		expect(back).not.toHaveBeenCalled()
	})
})
