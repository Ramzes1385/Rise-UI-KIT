import { defineComponent, h, nextTick } from 'vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowMapData } from '../../types/data/flowData.types'
import { act, edge, node } from '../helpers/flowFixtures.test-utils'
import type { FlowScenario } from '../../types/data/flowScenario.types'
import FlowScenarioLayer from '../../ui/scenario/FlowScenarioLayer.vue'
import { particleLimit } from '../../model/scenario/particles/useFlowParticles'
import { installFakeFrames, type FakeFrames } from '../helpers/fakeFrames.test-utils'
import { mountInMap, route, type MapHarness, type MapOptions } from '../helpers/mapHarness.test-utils'

guardConsole()

const e1 = route([
	[0, 0],
	[300, 0],
])
const e2 = route([
	[300, 0],
	[300, 300],
])

const scenario: FlowScenario = {
	id: 's',
	label: 'S',
	steps: [
		act('a', { edge: 'e1', duration: 1000 }),
		act('b', { edge: 'e2', duration: 1000, status: 'error' }),
		act('c', { node: 'n2', duration: 1000 }),
	],
}

function mapOf(extra: Partial<FlowMapData> = {}): FlowMapData {
	return {
		version: 1,
		nodes: [node('n1'), node('n2'), node('n3')],
		edges: [edge('e1', 'n1', 'n2', { traffic: { rate: 1, speed: 100 } }), edge('e2', 'n2', 'n3', { traffic: { rate: 1, speed: 100 } })],
		scenarios: [scenario],
		...extra,
	}
}

let frames: FakeFrames
let harness: MapHarness | undefined

const Framed = defineComponent({
	props: { particles: { type: [Boolean, Number], default: undefined } },
	setup: props => () => h('svg', null, [h(FlowScenarioLayer, props.particles === undefined ? null : { particles: props.particles })]),
})

function mountLayer(options: Partial<MapOptions> & { particles?: boolean | number } = {}): MapHarness {
	const { particles, ...rest } = options
	harness = mountInMap({
		data: mapOf(),
		routes: { e1, e2 },
		rects: { n2: { x: 300, y: 0, width: 160, height: 56 } },
		child: Framed,
		childProps: particles === undefined ? undefined : { particles },
		...rest,
	})
	return harness
}

const root = () => (harness?.wrapper.element as HTMLElement).querySelector('.base-flow-map__scenario-layer') as HTMLElement

beforeEach(() => {
	frames = installFakeFrames()
})

afterEach(() => {
	harness?.wrapper.unmount()
	harness = undefined
	frames.restore()
})

describe('particleLimit', () => {
	it('false — частиц нет, число — целое не меньше нуля, иначе 400', () => {
		expect(particleLimit(false)).toBe(0)
		expect(particleLimit(7.9)).toBe(7)
		expect(particleLimit(-4)).toBe(0)
		expect(particleLimit(undefined)).toBe(400)
		expect(particleLimit(true)).toBe(400)
	})
})

describe('FlowScenarioLayer: слой сценария', () => {
	it('слой скрыт от вспомогательных технологий и несёт состояние сценария', async () => {
		const { driver } = mountLayer()
		expect(root().getAttribute('aria-hidden')).toBe('true')
		expect(root().getAttribute('data-status')).toBe('idle')
		driver.play()
		await nextTick()
		expect(root().getAttribute('data-status')).toBe('playing')
	})

	it('до запуска нет ни следа, ни токена, ни подсветки', () => {
		mountLayer()
		expect(
			root().querySelectorAll('.base-flow-map__scenario-trail, .base-flow-map__scenario-token, .base-flow-map__scenario-pulse'),
		).toHaveLength(0)
	})

	it('в пути: след связи, токен-кружок, ошибка красит токен и след', async () => {
		const { driver } = mountLayer({ particles: false })
		driver.play()
		frames.frame(16)
		frames.frame(100)
		await nextTick()
		const trail = root().querySelector('.base-flow-map__scenario-trail') as SVGPathElement
		expect(trail.getAttribute('d')).toBe(e1.path)
		expect(trail.classList.contains('base-flow-map__scenario-trail--active')).toBe(true)
		expect(Number(trail.getAttribute('stroke-dashoffset'))).toBeCloseTo(0.9, 5)
		expect(root().querySelectorAll('.base-flow-map__scenario-token')).toHaveLength(1)
		driver.seek({ step: 'b' })
		frames.frame(16)
		await nextTick()
		const failed = root().querySelector('.base-flow-map__scenario-token') as SVGGElement
		expect(failed.getAttribute('data-status')).toBe('error')
		expect(root().querySelector('.base-flow-map__scenario-trail--done')).not.toBeNull()
	})

	it('шаг по узлу рисует рамку подсветки узла', async () => {
		const { driver } = mountLayer({ particles: false })
		driver.seek({ step: 'c' })
		await nextTick()
		const pulse = root().querySelector('.base-flow-map__scenario-pulse') as SVGRectElement
		expect(pulse.getAttribute('x')).toBe('300')
		expect(pulse.getAttribute('width')).toBe('160')
	})

	it('reduced motion: токена нет, участок виден целиком, частиц нет и цикл кадров не крутится', async () => {
		const { driver } = mountLayer({ isReducedMotion: true })
		driver.seek(500)
		await nextTick()
		expect(root().querySelectorAll('.base-flow-map__scenario-token')).toHaveLength(0)
		expect(root().querySelector('.base-flow-map__scenario-trail')?.getAttribute('stroke-dashoffset')).toBe('0')
		expect(root().querySelectorAll('.base-flow-map__particle')).toHaveLength(0)
		expect(frames.pending()).toBe(0)
	})
})

describe('FlowScenarioLayer: частицы трафика', () => {
	const circles = () => root().querySelectorAll('.base-flow-map__particle')

	it('число кружков по ставке и длине связей; кружки получают положение на кадре', async () => {
		mountLayer()
		await nextTick()
		expect(circles()).toHaveLength(3 + 3)
		expect(frames.pending()).toBe(1)
		frames.frame(16)
		frames.frame(100)
		expect(circles()[0].getAttribute('transform')).toMatch(/^translate\(\d+\.\d \d+\.\d\)$/)
	})

	it('particles=false — частиц нет; число — предел; по умолчанию — 400', async () => {
		mountLayer({ particles: false })
		await nextTick()
		expect(circles()).toHaveLength(0)
		expect(frames.pending()).toBe(0)
		harness?.wrapper.unmount()
		mountLayer({ particles: 4 })
		await nextTick()
		expect(circles()).toHaveLength(4)
	})

	it('связь без трафика или со ставкой 0 частиц не имеет; трафик вида связи берётся, если у связи свой не задан', async () => {
		mountLayer({
			data: mapOf({ edges: [edge('e1', 'n1', 'n2', { traffic: { rate: 0 } }), edge('e2', 'n2', 'n3')] }),
			edgeKind: () => ({ traffic: { rate: 1, speed: 100 } }),
		})
		await nextTick()
		expect(circles()).toHaveLength(3)
		harness?.wrapper.unmount()
		mountLayer({ data: mapOf({ edges: [edge('e1', 'n1', 'n2'), edge('e2', 'n2', 'n3')] }) })
		await nextTick()
		expect(circles()).toHaveLength(0)
	})

	it('поле трафика связи поверх трафика вида', async () => {
		mountLayer({
			data: mapOf({ edges: [edge('e1', 'n1', 'n2', { traffic: { speed: 300 } })] }),
			edgeKind: () => ({ traffic: { rate: 1, speed: 100 } }),
		})
		await nextTick()
		expect(circles()).toHaveLength(1)
	})

	it('связи вне видимой области не получают частиц и не двигаются; вернулись в вид — снова есть', async () => {
		const { refs } = mountLayer({ viewport: { x: -5000, y: -5000, zoom: 1 } })
		await nextTick()
		expect(circles()).toHaveLength(0)
		expect(frames.pending()).toBe(0)
		refs.viewport.value = { x: 0, y: 0, zoom: 1 }
		await nextTick()
		await nextTick()
		expect(circles()).toHaveLength(6)
		expect(frames.pending()).toBe(1)
	})

	it('масштаб меняет видимую область: при сильном удалении видно всё', async () => {
		const { refs } = mountLayer({ viewport: { x: 0, y: 0, zoom: 1 }, frame: { width: 100, height: 100 } })
		await nextTick()
		const near = circles().length
		refs.viewport.value = { x: 0, y: 0, zoom: 0.1 }
		await nextTick()
		expect(circles().length).toBeGreaterThanOrEqual(near)
	})

	it('подсвеченные связи занимают предел первыми', async () => {
		mountLayer({ particles: 3, highlighted: ['e2'] })
		await nextTick()
		expect(circles()).toHaveLength(3)
	})

	it('вкладка скрыта или карта не видна — цикл кадров останавливается; вернулась — запускается снова', async () => {
		const { refs } = mountLayer()
		await nextTick()
		expect(frames.pending()).toBe(1)
		refs.isVisible.value = false
		await nextTick()
		await nextTick()
		expect(frames.pending()).toBe(0)
		refs.isVisible.value = true
		await nextTick()
		await nextTick()
		expect(frames.pending()).toBe(1)
	})

	it('reduced motion включили на лету — частицы исчезают и цикл останавливается', async () => {
		const { refs } = mountLayer()
		await nextTick()
		refs.isReduced.value = true
		await nextTick()
		await nextTick()
		expect(circles()).toHaveLength(0)
		expect(frames.pending()).toBe(0)
	})

	it('в режиме правки частицы приглушены', async () => {
		const { refs } = mountLayer()
		const group = () => root().querySelector('.base-flow-map__particles') as HTMLElement
		expect(group().classList.contains('base-flow-map__particles--muted')).toBe(false)
		refs.mode.value = 'edit'
		await nextTick()
		expect(group().classList.contains('base-flow-map__particles--muted')).toBe(true)
	})

	it('300 частиц на 150 связях укладываются в предел 400', async () => {
		const edges = Array.from({ length: 150 }, (_, index) => edge(`x${index}`, 'n1', 'n2', { traffic: { rate: 5, speed: 20 } }))
		const routes = Object.fromEntries(edges.map(item => [item.id, e1]))
		mountLayer({ data: mapOf({ edges }), routes })
		await nextTick()
		expect(circles().length).toBeLessThanOrEqual(400)
		expect(circles().length).toBeGreaterThanOrEqual(150)
	})

	it('размонтирование останавливает цикл кадров', async () => {
		mountLayer()
		await nextTick()
		harness?.wrapper.unmount()
		harness = undefined
		expect(frames.pending()).toBe(0)
	})
})
