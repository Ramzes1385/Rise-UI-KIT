import '@testing-library/jest-dom/vitest'
import { h, nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { UI_FLOW_MAP, UI_FLOW_PANELS } from '@/locales/messages'
import { controllerOf, mapData, mountMap, stubFrame } from '../flowUi'

describe('BaseFlowMap шапка и режимы', () => {
	it('показывает заголовок как h2, без заголовка и режимов шапки нет', () => {
		const { container, unmount } = mountMap()
		expect(screen.getByRole('heading', { level: 2, name: 'Заказы' })).toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__modes')).not.toBeInTheDocument()
		unmount()
		const bare = mountMap({ data: mapData({ title: undefined }) })
		expect(bare.container.querySelector('.base-flow-map__header')).not.toBeInTheDocument()
	})

	it('переключатель режимов отмечает активный и шлёт update:mode', async () => {
		const result = mountMap({ modes: ['view', 'edit', 'review'], mode: 'edit' })
		const group = screen.getByRole('group', { name: UI_FLOW_MAP.MODES })
		expect(group).toBeInTheDocument()
		expect(screen.getByRole('button', { name: UI_FLOW_MAP.MODE_EDIT })).toHaveAttribute('aria-pressed', 'true')
		expect(screen.getByRole('button', { name: UI_FLOW_MAP.MODE_VIEW })).toHaveAttribute('aria-pressed', 'false')
		await fireEvent.click(screen.getByRole('button', { name: UI_FLOW_MAP.MODE_REVIEW }))
		expect(result.emitted()['update:mode'].at(-1)).toEqual(['review'])
		await result.rerender({ mode: 'review' })
		expect(screen.getByRole('button', { name: UI_FLOW_MAP.MODE_REVIEW })).toHaveAttribute('aria-pressed', 'true')
	})

	it('шапка с одним режимом без заголовка всё равно есть', () => {
		mountMap({ data: mapData({ title: undefined }), modes: ['view'] })
		expect(screen.getByRole('group', { name: UI_FLOW_MAP.MODES })).toBeInTheDocument()
	})
})

describe('BaseFlowMap панель инструментов', () => {
	it('масштаб показывается в процентах с подписью, кнопки подписаны', () => {
		mountMap()
		expect(screen.getByRole('toolbar', { name: UI_FLOW_MAP.TOOLBAR })).toBeInTheDocument()
		expect(screen.getByLabelText('Масштаб 100 %')).toHaveTextContent('100%')
		for (const name of [UI_FLOW_MAP.ZOOM_IN, UI_FLOW_MAP.ZOOM_OUT, UI_FLOW_MAP.FIT]) {
			expect(screen.getByRole('button', { name })).toBeInTheDocument()
		}
	})

	it('слот toolbar получает контроллер', async () => {
		const seen = vi.fn()
		mountMap(
			{},
			{
				slots: {
					toolbar: (slot: { controller: { fitView: () => void } }) =>
						h('button', { type: 'button', onClick: () => seen(slot.controller) }, 'Своя'),
				},
			},
		)
		await fireEvent.click(screen.getByRole('button', { name: 'Своя' }))
		expect(typeof seen.mock.calls[0][0].fitView).toBe('function')
	})

	it('в списке панелей без toolbar панели инструментов нет', () => {
		mountMap({ panels: ['legend'] })
		expect(screen.queryByRole('toolbar')).not.toBeInTheDocument()
	})

	it('панель горизонтальная и на узком, и на широком экране', async () => {
		stubFrame(300)
		const narrow = mountMap()
		await nextTick()
		expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal')
		narrow.unmount()
		vi.restoreAllMocks()
		stubFrame(900)
		mountMap()
		await nextTick()
		expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'horizontal')
	})

	it('порядок кнопок: уменьшить, масштаб, увеличить, вписать', () => {
		mountMap()
		const toolbar = screen.getByRole('toolbar')
		const names = [...toolbar.querySelectorAll('button')].map(item => item.getAttribute('aria-label'))
		expect(names).toEqual([UI_FLOW_MAP.ZOOM_OUT, UI_FLOW_MAP.ZOOM_IN, UI_FLOW_MAP.FIT])
	})
})

describe('BaseFlowMap высота, размер и подпись', () => {
	it('высота по умолчанию 560px, свою можно задать', () => {
		const first = mountMap()
		expect((first.container.firstElementChild as HTMLElement).style.height).toBe('560px')
		first.unmount()
		const second = mountMap({ height: '320px' })
		expect((second.container.firstElementChild as HTMLElement).style.height).toBe('320px')
	})

	it('ui и customClass добавляют классы частям', () => {
		const { container } = mountMap({ ui: { header: 'my-header', node: 'my-node', viewport: 'my-view' } })
		expect(container.querySelector('.base-flow-map__header')).toHaveClass('my-header')
		expect(container.querySelector('.base-flow-map__node')).toHaveClass('my-node')
		expect(container.querySelector('.base-flow-map__viewport')).toHaveClass('my-view')
	})
})

describe('BaseFlowMap поиск узла', () => {
	it('панели search нет по умолчанию, при загрузке и ошибке она скрыта', async () => {
		const { rerender } = mountMap()
		expect(screen.queryByPlaceholderText(UI_FLOW_MAP.SEARCH)).not.toBeInTheDocument()
		await rerender({ panels: ['search'] })
		expect(screen.getByPlaceholderText(UI_FLOW_MAP.SEARCH)).toBeInTheDocument()
		await rerender({ isLoading: true })
		expect(screen.queryByPlaceholderText(UI_FLOW_MAP.SEARCH)).not.toBeInTheDocument()
		await rerender({ isLoading: false, error: 'сбой' })
		expect(screen.queryByPlaceholderText(UI_FLOW_MAP.SEARCH)).not.toBeInTheDocument()
	})

	it('ввод ищет по подписи без учёта регистра, выбор центрирует, выделяет и открывает подробности', async () => {
		stubFrame(800, 400)
		const result = mountMap({ panels: ['search', 'details'] })
		await nextTick()
		const controller = controllerOf(result as never)
		controller.setViewport({ x: 0, y: 0, zoom: 0.5 })
		const input = screen.getByPlaceholderText(UI_FLOW_MAP.SEARCH)
		await fireEvent.focus(input)
		await fireEvent.update(input, 'ALPH')
		const option = await screen.findByRole('option', { name: /Alpha/ })
		expect(screen.queryByRole('option', { name: /Beta/ })).not.toBeInTheDocument()
		await fireEvent.mouseDown(option)
		expect(result.emitted()['update:selection'].at(-1)).toEqual([['a']])
		expect(controller.getViewport().zoom).toBeGreaterThanOrEqual(0.5)
		expect(await screen.findByRole('region', { name: UI_FLOW_PANELS.DETAILS_NODE })).toBeInTheDocument()
	})

	it('пустой запрос и отсутствие совпадений результатов не дают', async () => {
		mountMap({ panels: ['search'] })
		const input = screen.getByPlaceholderText(UI_FLOW_MAP.SEARCH)
		await fireEvent.focus(input)
		await fireEvent.update(input, 'gam')
		expect(await screen.findByRole('option', { name: /Gamma/ })).toBeInTheDocument()
		await fireEvent.update(input, '   ')
		await nextTick()
		expect(screen.queryByRole('option')).not.toBeInTheDocument()
		await fireEvent.update(input, 'ничего-такого')
		await nextTick()
		expect(screen.queryByRole('option')).not.toBeInTheDocument()
	})
})
