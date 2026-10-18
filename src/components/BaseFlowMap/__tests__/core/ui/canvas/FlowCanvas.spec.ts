import '@testing-library/jest-dom/vitest'
import { UI_FLOW_MAP } from '@/locales/messages'
import { defineComponent, h, nextTick } from 'vue'
import { fireEvent, screen } from '@testing-library/vue'
import { mapData, mountMap, pinned, sceneOf, stubFrame } from '../flowUi'

describe('BaseFlowMap холст', () => {
	it('отдаёт области имя из заголовка, роль и описание роли', () => {
		mountMap()
		const region = screen.getByRole('region', { name: 'Заказы' })
		expect(region).toHaveAttribute('aria-roledescription', UI_FLOW_MAP.ROLE)
		expect(screen.getByRole('graphics-document', { name: 'Схема: Заказы' })).toBeInTheDocument()
	})

	it('предпочитает ariaLabel заголовку, а без обоих берёт подпись по умолчанию', () => {
		const { unmount } = mountMap({ ariaLabel: 'Моя карта' })
		expect(screen.getByRole('region', { name: 'Моя карта' })).toBeInTheDocument()
		unmount()
		mountMap({ data: mapData({ title: undefined }) })
		expect(screen.getByRole('region', { name: UI_FLOW_MAP.DEFAULT_LABEL })).toBeInTheDocument()
	})

	it('рисует узлы и связи с доступными именами и числом связей', () => {
		mountMap()
		expect(screen.getByRole('graphics-object', { name: /^Alpha, Сервис\. Входящих связей: 0, исходящих: 2/ })).toBeInTheDocument()
		expect(screen.getByRole('graphics-object', { name: /^Beta, Сервис\. Входящих связей: 1, исходящих: 0/ })).toBeInTheDocument()
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })).toBeInTheDocument()
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Gamma/ })).toBeInTheDocument()
	})

	it('подпись связи лежит в холсте, а у связи без подписи её нет', () => {
		const { container } = mountMap()
		const labels = container.querySelectorAll('.base-flow-map__edge-label')
		expect(labels).toHaveLength(1)
		expect(labels[0]).toHaveTextContent('заказ')
	})

	it('рисует группу с видом в описании роли и свой цвет', () => {
		const { container } = mountMap({
			data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Периметр', color: '#123456' }] }),
		})
		const group = screen.getByRole('graphics-object', { name: 'Периметр' })
		expect(group).toHaveAttribute('aria-roledescription', 'Зона')
		expect(group).toHaveAttribute('data-flow-entity', 'group')
		expect(container.querySelector('.base-flow-map__group')).toHaveStyle({ '--flow-group-color': '#123456' })
	})

	it('SVG-узел (заметка) рисуется в svg с подписью внутри', () => {
		const { container } = mountMap({
			data: mapData({ nodes: [{ id: 'n', kind: 'note', label: 'Заметка', ...pinned(0, 0) }], edges: [] }),
		})
		const node = container.querySelector('svg .base-flow-map__node--svg') as SVGElement
		expect(node).toHaveAttribute('data-flow-id', 'n')
		expect(node.querySelector('text')).toHaveTextContent('Заметка')
		expect(node.querySelector('.base-flow-map__shape')).toBeInTheDocument()
	})

	it('цвет узла идёт в обводку, статус — в точку и описание', () => {
		const { container } = mountMap({
			data: mapData({
				nodes: [
					{ id: 'a', kind: 'service', label: 'Alpha', color: '#abcdef', status: 'warning', subtitle: 'v2', ...pinned(0, 0) },
					{ id: 'b', kind: 'service', label: 'Beta', icon: 'plus', appearance: 'compact', isExternal: true, ...pinned(300, 0) },
				],
				edges: [],
			}),
		})
		const alpha = screen.getByRole('graphics-object', { name: /^Alpha, Сервис, / })
		expect(alpha).toHaveAttribute('data-status', 'warning')
		expect(alpha).toHaveStyle({ '--flow-node-stroke': '#abcdef' })
		expect(alpha.querySelector('.base-flow-map__node-status')).toBeInTheDocument()
		expect(alpha).toHaveTextContent('v2')
		const beta = screen.getByRole('graphics-object', { name: /^Beta/ })
		expect(beta).toHaveClass('base-flow-map__node--compact', 'base-flow-map__node--external')
		expect(beta.querySelector('.base-icon')).toBeInTheDocument()
		expect(container.querySelectorAll('.base-flow-map__node-status')).toHaveLength(1)
	})

	it('живые данные меняют статус узла и связи без смены данных', async () => {
		const { rerender } = mountMap({ live: { nodes: { a: { status: 'ok' } }, edges: { e1: { status: 'down' } } } })
		expect(screen.getByRole('graphics-object', { name: /^Alpha, Сервис, / })).toHaveAttribute('data-status', 'ok')
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })).toHaveAttribute('data-status', 'down')
		await rerender({ live: { nodes: { a: { status: 'zzz' } } } })
		expect(screen.getByRole('graphics-object', { name: /Alpha, Сервис.*zzz/ })).toHaveAttribute('data-status', 'zzz')
	})

	it('пользовательские статусы данных переопределяют встроенные', () => {
		mountMap({
			data: mapData({
				statuses: [{ id: 'ok', label: 'Всё хорошо', color: 'red', icon: 'check' }],
				nodes: [{ id: 'a', kind: 'service', label: 'Alpha', status: 'ok', ...pinned(0, 0) }],
				edges: [],
			}),
		})
		expect(screen.getByRole('graphics-object', { name: /Всё хорошо/ })).toBeInTheDocument()
	})

	it('слот node заменяет карточку и получает данные узла', () => {
		mountMap(
			{},
			{
				slots: {
					node: (slot: { node: { label: string }; isSelected: boolean; zoom: number }) =>
						h('b', { 'data-testid': 'slot' }, `${slot.node.label}:${slot.isSelected}:${slot.zoom}`),
				},
			},
		)
		expect(screen.getAllByTestId('slot').map(item => item.textContent)).toEqual(['Alpha:false:1', 'Beta:false:1', 'Gamma:false:1'])
	})

	it('слоты подписи связи и заголовка группы получают свои данные', () => {
		mountMap(
			{ data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] }) },
			{
				slots: {
					'edge-label': (slot: { edge: { id: string } }) => h('i', `метка ${slot.edge.id}`),
					'group-label': (slot: { group: { id: string } }) => h('i', `группа ${slot.group.id}`),
				},
			},
		)
		expect(screen.getByText('метка e1')).toBeInTheDocument()
		expect(screen.getByText('группа g')).toBeInTheDocument()
	})

	it('пустая карта показывает сообщение или слот empty и скрывает легенду и мини-карту', () => {
		const { unmount } = mountMap({ data: mapData({ nodes: [], edges: [] }) })
		expect(screen.getByText(UI_FLOW_MAP.EMPTY)).toBeInTheDocument()
		unmount()
		mountMap({ data: mapData({ nodes: [], edges: [] }) }, { slots: { empty: () => h('p', 'Нет данных') } })
		expect(screen.getByText('Нет данных')).toBeInTheDocument()
		expect(screen.queryByText(UI_FLOW_MAP.EMPTY)).not.toBeInTheDocument()
	})

	it('загрузка показывает статус и скрывает холст, ошибка — результат с текстом', async () => {
		const { rerender } = mountMap({ isLoading: true })
		expect(screen.getByRole('status', { name: UI_FLOW_MAP.LOADING })).toBeInTheDocument()
		expect(screen.getByRole('region', { name: 'Заказы' })).toHaveAttribute('aria-busy', 'true')
		expect(screen.queryByRole('graphics-document')).not.toBeInTheDocument()
		await rerender({ isLoading: false, error: 'Сервер недоступен' })
		expect(screen.getByText(UI_FLOW_MAP.ERROR_TITLE)).toBeInTheDocument()
		expect(screen.getByText('Сервер недоступен')).toBeInTheDocument()
		expect(screen.queryByRole('graphics-document')).not.toBeInTheDocument()
	})

	it('отключённая карта не выбирает узлы и сообщает об этом', async () => {
		const onSelection = vi.fn()
		const { container } = mountMap({ isDisabled: true, 'onUpdate:selection': onSelection } as never)
		expect(container.firstElementChild).toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		expect(onSelection).not.toHaveBeenCalled()
	})

	it('размер сцены покрывает раскладку, а подсказка колеса не висит без жеста', () => {
		const { container } = mountMap()
		const scene = sceneOf(container)
		expect(Number.parseInt(scene.style.width)).toBeGreaterThan(300)
		expect(screen.queryByText(UI_FLOW_MAP.WHEEL_HINT)).not.toBeInTheDocument()
	})

	it('на узком экране узлы становятся плитками, а подписи связей скрываются', async () => {
		stubFrame(400)
		const { container } = mountMap({ compactBreakpoint: 640 })
		await nextTick()
		expect(container.querySelector('.base-flow-map--compact')).toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__node--tile')).toBeInTheDocument()
		expect(container.querySelectorAll('.base-flow-map__edge-label')).toHaveLength(0)
	})

	it('наведение подсвечивает соседей и гасит остальное, уход снимает', async () => {
		const { container } = mountMap({
			data: mapData({
				nodes: [...mapData().nodes, { id: 'd', kind: 'service', label: 'Delta', ...pinned(600, 200) }],
			}),
		})
		const alpha = screen.getByRole('graphics-object', { name: /^Alpha/ })
		await fireEvent.pointerEnter(alpha)
		expect(alpha).toHaveClass('base-flow-map__node--highlighted')
		expect(screen.getByRole('graphics-object', { name: /^Beta/ })).toHaveClass('base-flow-map__node--highlighted')
		expect(screen.getByRole('graphics-object', { name: /^Delta/ })).toHaveClass('base-flow-map__node--dim')
		expect(container.querySelectorAll('.base-flow-map__edge--highlighted')).toHaveLength(2)
		await fireEvent.pointerLeave(alpha)
		expect(container.querySelector('.base-flow-map__node--dim')).not.toBeInTheDocument()
		const edge = screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })
		await fireEvent.pointerEnter(edge)
		expect(edge).toHaveClass('base-flow-map__edge--highlighted')
		expect(screen.getByRole('graphics-object', { name: /^Delta/ })).toHaveClass('base-flow-map__node--dim')
		await fireEvent.pointerLeave(screen.getByRole('graphics-document'))
		expect(edge).not.toHaveClass('base-flow-map__edge--highlighted')
	})

	it('наведение на группу не подсвечивает ничего', async () => {
		const { container } = mountMap({ data: mapData({ groups: [{ id: 'g', kind: 'zone', label: 'Зона' }] }) })
		await fireEvent.click(screen.getByRole('graphics-object', { name: 'Зона' }))
		expect(container.querySelector('.base-flow-map__node--dim')).not.toBeInTheDocument()
	})

	it('выбранный узел и связь помечены, маркеры стрелок объявлены', async () => {
		const { container } = mountMap({ selection: ['a', 'e1'] })
		expect(screen.getByRole('graphics-object', { name: /^Alpha/ })).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('graphics-symbol', { name: /Alpha → Beta/ })).toHaveClass('base-flow-map__edge--selected')
		expect(container.querySelectorAll('marker').length).toBeGreaterThan(0)
	})

	it('если наведённый узел исчез из данных, подсветки нет и ошибки нет', async () => {
		const { rerender, container } = mountMap()
		await fireEvent.pointerEnter(screen.getByRole('graphics-object', { name: /^Alpha/ }))
		await rerender({ data: mapData({ nodes: [{ id: 'b', kind: 'service', label: 'Beta', ...pinned(0, 0) }], edges: [] }) })
		expect(container.querySelector('.base-flow-map__node--dim')).not.toBeInTheDocument()
		expect(container.querySelector('.base-flow-map__node--highlighted')).not.toBeInTheDocument()
	})

	it('подпись связи гаснет вместе с остальным, когда подсвечена другая связь', async () => {
		const { container } = mountMap()
		await fireEvent.pointerEnter(screen.getByRole('graphics-object', { name: /^Gamma/ }))
		expect(container.querySelector('.base-flow-map__edge-label--dim')).toBeInTheDocument()
		await fireEvent.pointerLeave(screen.getByRole('graphics-object', { name: /^Gamma/ }))
		await fireEvent.pointerEnter(screen.getByRole('graphics-object', { name: /^Beta/ }))
		expect(container.querySelector('.base-flow-map__edge-label-text--highlighted')).toBeInTheDocument()
	})

	it('SVG-узлы с подписью под фигурой и без подписи, связь с начальным маркером', () => {
		const svg = (labelPlacement: 'below' | 'none') => ({
			label: () => labelPlacement,
			render: 'svg' as const,
			shape: { shape: 'circle' as const },
			size: { width: 40, height: 40 },
			labelPlacement,
		})
		const notation = {
			id: 'marks',
			label: () => 'Метки',
			nodeKinds: { below: svg('below'), none: svg('none') },
			edgeKinds: { link: { label: () => 'Связь', stroke: 'dotted', startMarker: 'circle', endMarker: 'open-arrow' } },
			defaultNodeKind: 'below',
			defaultEdgeKind: 'link',
		}
		const { container } = mountMap({
			notations: [notation as never],
			data: mapData({
				notation: 'marks',
				nodes: [
					{ id: 'x', kind: 'below', label: 'Под', ...pinned(0, 0) },
					{ id: 'y', kind: 'none', label: 'Скрыто', ...pinned(200, 0) },
				],
				edges: [{ id: 'l', source: 'x', target: 'y' }],
			}),
		})
		const texts = [...container.querySelectorAll('svg .base-flow-map__node--svg text')].map(item => item.textContent?.trim())
		expect(texts).toEqual(['Под', ''])
		expect(container.querySelector('.base-flow-map__edge--dotted .base-flow-map__edge-line')).toHaveAttribute('marker-start')
	})

	it('знаки фигур SVG-узла рисуются текстом и контуром', () => {
		const kind = {
			label: () => 'Функция',
			render: 'svg' as const,
			shape: {
				shape: 'rect' as const,
				markers: () => [
					{ text: '1', placement: 'top-start' as const },
					{ path: 'M0 0h24v24z', placement: 'center' as const, isFilled: true },
					{ path: 'M0 0h24', placement: 'bottom-end' as const },
					{ placement: 'top-end' as const },
				],
			},
			size: { width: 120, height: 60 },
		}
		const notation = { id: 'signs', label: () => 'Знаки', nodeKinds: { fn: kind }, edgeKinds: {}, defaultNodeKind: 'fn' }
		const { container } = mountMap({
			notations: [notation as never],
			data: mapData({ notation: 'signs', nodes: [{ id: 'f', kind: 'fn', label: 'Узел', ...pinned(0, 0) }], edges: [] }),
		})
		expect(container.querySelector('.base-flow-map__shape-text')).toHaveTextContent('1')
		expect(container.querySelectorAll('.base-flow-map__shape-sign')).toHaveLength(2)
		expect(container.querySelectorAll('.base-flow-map__shape-sign--filled')).toHaveLength(1)
	})

	it.each([
		{ particles: false, expected: 'false' },
		{ particles: 12, expected: '12' },
	])('проп particles ($particles) доходит до слоя сценария через холст', ({ particles, expected }) => {
		const layer = defineComponent({
			props: { particles: { type: [Boolean, Number], default: undefined } },
			setup: props => () => h('g', { 'data-testid': 'layer', 'data-particles': String(props.particles) }),
		})
		mountMap({ particles }, { global: { stubs: { FlowScenarioLayer: layer } } })
		expect(screen.getByTestId('layer')).toHaveAttribute('data-particles', expected)
	})

	it('вид ghost и outline даёт свой класс корня', () => {
		const ghost = mountMap({ variant: 'ghost' })
		expect(ghost.container.querySelector('.base-flow-map')).toHaveClass('base-flow-map--ghost')
		ghost.unmount()
		const outline = mountMap({ variant: 'outline' })
		expect(outline.container.querySelector('.base-flow-map')).toHaveClass('base-flow-map--outline')
	})
})
