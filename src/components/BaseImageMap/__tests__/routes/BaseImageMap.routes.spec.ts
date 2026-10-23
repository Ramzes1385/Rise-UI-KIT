import { MALL_ROUTES } from '../../stories/routesFixtures'
import { routeLines, routeMarkers } from '../../model/routes/routeView'
import { routeSteps, walkedMeters } from '../../model/routes/routeSteps'
import type { ImageMapRoutes, RouteGraph } from '../../types/ImageMapRoutes.types'
import type { ImageMapLayer, ImageMapObject } from '../../types/imageMapData.types'
import { buildRouteGraph, findRoutePath, isStepFree, objectNodes, transitionType } from '../../model/routes/routeGraph'

const LAYERS: ImageMapLayer[] = [1, 2, 3].map(level => ({ id: `floor-${level}`, title: `${level} этаж`, width: 1000, height: 600 }))

const shop = (id: string, title = id): ImageMapObject => ({ id, type: 'svg', elementId: id, title })

function mall(isStepFree = false): RouteGraph {
	return buildRouteGraph({ routes: MALL_ROUTES, layers: LAYERS, isStepFree })
}

function route(fromId: string, toId: string, graph = mall()) {
	const from = shop(fromId)
	const to = shop(toId)
	const path = findRoutePath(graph, objectNodes(graph, from, ''), objectNodes(graph, to, ''))
	return { graph, path, from, to }
}

describe('routeGraph', () => {
	it('коридоры — в обе стороны, длина в долях ширины с учётом пропорций слоя', () => {
		const graph = buildRouteGraph({
			routes: {
				nodes: [
					{ id: 'a', x: 0, y: 0 },
					{ id: 'b', x: 0, y: 0.5 },
				],
				edges: [['a', 'b']],
			},
			layers: [{ id: 'l', title: 'L', width: 1000, height: 600 }],
			isStepFree: false,
		})
		expect(graph.links.get('a')).toEqual([{ to: 'b', cost: 0.3 }])
		expect(graph.links.get('b')).toEqual([{ to: 'a', cost: 0.3 }])
	})

	it('без слоёв пропорции 1:1, узел без слоя — на первом слое, коридор между слоями и к неизвестному узлу пропускается', () => {
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', x: 0, y: 0 },
				{ id: 'b', x: 0, y: 1 },
				{ id: 'c', layer: 'other', x: 0, y: 0 },
			],
			edges: [
				['a', 'b'],
				['a', 'c'],
				['a', 'missing'],
			],
		}
		const empty = buildRouteGraph({ routes, layers: [], isStepFree: false })
		expect(empty.layerOf({ id: 'x', x: 0, y: 0 })).toBe('')
		expect(empty.links.get('a')).toEqual([{ to: 'b', cost: 1 }])
		const withLayers = buildRouteGraph({ routes, layers: [{ id: 'first', title: 'F', width: 10, height: 10 }], isStepFree: false })
		expect(withLayers.layerOf({ id: 'x', x: 0, y: 0 })).toBe('first')
		expect(withLayers.links.get('c')).toBeUndefined()
	})

	it('виды переходов: умолчания вида, цены и «без ступеней»', () => {
		expect(transitionType({ id: 's', nodes: [] })).toBe('stairs')
		expect(isStepFree({ id: 's', nodes: [] })).toBe(false)
		expect(isStepFree({ id: 'e', type: 'elevator', nodes: [] })).toBe(true)
		expect(isStepFree({ id: 'r', type: 'ramp', nodes: [] })).toBe(true)
		expect(isStepFree({ id: 'x', type: 'escalator', nodes: [] })).toBe(false)
		expect(isStepFree({ id: 'x', type: 'stairs', nodes: [], isStepFree: true })).toBe(true)
		const graph = mall()
		expect(graph.links.get('f1-stairs')?.find(link => link.to === 'f2-stairs')?.cost).toBe(0.2)
		expect(graph.links.get('f1-lift')?.find(link => link.to === 'f2-lift')?.cost).toBe(0.3)
	})

	it('переход соединяет соседние узлы списка, свою цену и неизвестные узлы учитывает', () => {
		const graph = buildRouteGraph({
			routes: {
				nodes: [
					{ id: 'a', x: 0, y: 0 },
					{ id: 'b', layer: 'up', x: 0, y: 0 },
				],
				edges: [],
				transitions: [{ id: 'ramp', type: 'ramp', nodes: ['a', 'ghost', 'b'], cost: 2 }],
			},
			layers: LAYERS,
			isStepFree: false,
		})
		expect(graph.links.get('a')?.[0]).toMatchObject({ to: 'b', cost: 2 })
		expect(graph.links.get('b')?.[0]).toMatchObject({ to: 'a', cost: 2 })
	})

	it('односторонний переход — только в порядке nodes, обратной связи нет', () => {
		const graph = mall()
		expect(graph.links.get('f1-c0')?.some(link => link.to === 'f2-c0')).toBe(true)
		expect(graph.links.get('f2-c0')?.some(link => link.to === 'f1-c0')).toBe(false)
	})

	it('«без ступеней» убирает лестницы и эскалаторы', () => {
		const graph = mall(true)
		expect(graph.links.get('f1-stairs')?.some(link => link.transition)).toBe(false)
		expect(graph.links.get('f1-lift')?.some(link => link.transition)).toBe(true)
	})

	it('вход объекта — узлы с его `object`; без них — ближайший узел своего слоя', () => {
		const graph = mall()
		expect(objectNodes(graph, shop('f1-shop-1'), 'floor-1')).toEqual(['f1-door-1'])
		const point: ImageMapObject = { id: 'kiosk', type: 'point', title: 'Киоск', x: 0.37, y: 0.52 }
		expect(objectNodes(graph, point, 'floor-2')).toEqual(['f2-c2'])
		const rect: ImageMapObject = { id: 'zone', type: 'rect', title: 'Зона', x: 0.5, y: 0.45, width: 0.2, height: 0.1 }
		expect(objectNodes(graph, rect, 'floor-1')).toEqual(['f1-c3'])
	})

	it('ближайший узел объекта без входа — с пропорциями слоя, как длина коридора', () => {
		const graph = buildRouteGraph({
			routes: {
				nodes: [
					{ id: 'side', x: 0.2, y: 0.5 },
					{ id: 'below', x: 0, y: 0.8 },
				],
				edges: [],
			},
			layers: [{ id: 'wide', title: 'W', width: 1000, height: 600 }],
			isStepFree: false,
		})
		const point: ImageMapObject = { id: 'p', type: 'point', title: 'P', x: 0, y: 0.5 }
		expect(objectNodes(graph, point, 'wide')).toEqual(['below'])
	})

	it('без входа объект `svg` и объект на слое без узлов к графу не привязаны', () => {
		const graph = mall()
		expect(objectNodes(graph, shop('nowhere'), 'floor-1')).toEqual([])
		const point: ImageMapObject = { id: 'p', type: 'point', title: 'P', x: 0.5, y: 0.5 }
		expect(objectNodes(graph, point, 'roof')).toEqual([])
	})

	it('кратчайший путь на одном этаже идёт по коридору', () => {
		const { path } = route('f1-shop-1', 'f1-shop-2')
		expect(path?.nodes.map(node => node.id)).toEqual(['f1-door-1', 'f1-c1', 'f1-c2', 'f1-c3', 'f1-door-2'])
	})

	it('между этажами выбирает дешёвый переход: слева — эскалаторы вверх и вниз, справа — лестница', () => {
		const up = route('f1-shop-1', 'f2-shop-1').path
		expect(up?.links.find(link => link.transition)?.transition?.id).toBe('escalator-up')
		const down = route('f2-shop-1', 'f1-shop-1').path
		expect(down?.links.find(link => link.transition)?.transition?.id).toBe('escalator-down')
		const right = route('f2-shop-4', 'f1-shop-4').path
		expect(right?.links.find(link => link.transition)?.transition?.id).toBe('stairs')
	})

	it('без ступеней — лифт', () => {
		const { path } = route('f1-shop-1', 'f3-shop-1', mall(true))
		expect(path?.links.filter(link => link.transition).map(link => link.transition?.id)).toEqual(['lift', 'lift'])
	})

	it('недостижимый объект — путь не найден', () => {
		expect(route('f1-shop-1', 'f3-shop-4').path).toBeNull()
		expect(route('nowhere', 'f1-shop-1').path).toBeNull()
	})

	it('узел без коридоров — путь не найден', () => {
		const graph = buildRouteGraph({
			routes: {
				nodes: [
					{ id: 'a', x: 0, y: 0 },
					{ id: 'b', x: 1, y: 1 },
				],
				edges: [],
			},
			layers: LAYERS,
			isStepFree: false,
		})
		expect(findRoutePath(graph, ['a'], ['b'])).toBeNull()
	})

	it('общий узел начала и конца — путь из одного узла', () => {
		const graph = mall()
		const path = findRoutePath(graph, ['f1-c1'], ['f1-c1'])
		expect(path).toEqual({ nodes: [graph.nodes.get('f1-c1')], links: [], cost: 0 })
	})
})

describe('routeSteps', () => {
	it('шаги: начало, путь к переходу с метрами, подъём, приход', () => {
		const { graph, path, from, to } = route('f1-shop-1', 'f3-shop-1')
		const steps = routeSteps({
			graph,
			path: path!,
			from: { ...from, title: 'Кофейня' },
			to: { ...to, title: 'Кино' },
			layers: LAYERS,
			metersPerWidth: 120,
		})
		expect(steps.map(step => step.kind)).toEqual(['start', 'walk', 'transition', 'arrive'])
		expect(steps[0]).toEqual({ kind: 'start', text: 'Начните у «Кофейня» (1 этаж)', layer: 'floor-1' })
		expect(steps[1]?.text).toBe('Идите к лестнице «Лестница у входа»')
		expect(steps[1]?.meters).toBeGreaterThan(0)
		expect(steps[2]).toEqual({ kind: 'transition', text: 'Поднимитесь по лестнице: 3 этаж', layer: 'floor-3' })
		expect(steps[3]).toMatchObject({ kind: 'arrive', text: 'Идите к «Кино»', layer: 'floor-3' })
		expect(walkedMeters(path!, 120)).toBe(
			Math.max(1, Math.round(path!.links.filter(link => !link.transition).reduce((sum, link) => sum + link.cost, 0) * 120)),
		)
	})

	it('спуск, переход без названия и без метров; два разных перехода подряд — два шага', () => {
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'floor-3', x: 0, y: 0, object: 'from' },
				{ id: 'b', layer: 'floor-2', x: 0, y: 0 },
				{ id: 'c', layer: 'floor-1', x: 0, y: 0, object: 'to' },
			],
			edges: [],
			transitions: [
				{ id: 'ramp', type: 'ramp', nodes: ['b', 'a'] },
				{ id: 'esc', type: 'escalator', nodes: ['c', 'b'] },
			],
		}
		const graph = buildRouteGraph({ routes, layers: LAYERS, isStepFree: false })
		const path = findRoutePath(graph, ['a'], ['c'])!
		const steps = routeSteps({ graph, path, from: shop('from', 'Откуда'), to: shop('to', 'Куда'), layers: LAYERS })
		expect(steps.map(step => step.text)).toEqual([
			'Начните у «Откуда» (3 этаж)',
			'Идите к пандусу',
			'Спуститесь по пандусу: 2 этаж',
			'Идите к эскалатору',
			'Спуститесь на эскалаторе: 1 этаж',
			'Идите к «Куда»',
		])
		expect(steps.every(step => step.meters === undefined)).toBe(true)
		expect(walkedMeters(path, undefined)).toBeUndefined()
	})

	it('слой без названия в данных — id слоя; лифт в шагах', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'x', x: 0, y: 0 },
				{ id: 'b', layer: 'y', x: 0, y: 0 },
			],
			edges: [],
			transitions: [{ id: 'lift', type: 'elevator', title: 'Лифт', nodes: ['a', 'b'] }],
		}
		const graph = buildRouteGraph({ routes, layers: LAYERS, isStepFree: false })
		const path = findRoutePath(graph, ['a'], ['b'])!
		const steps = routeSteps({ graph, path, from: shop('a', 'А'), to: shop('b', 'Б'), layers: LAYERS })
		expect(steps.map(step => step.text)).toEqual([
			'Начните у «А» (x)',
			'Идите к лифту «Лифт»',
			'Поднимитесь на лифте: y',
			'Идите к «Б»',
		])
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('которого нет в data.layers'))
	})

	it('вверх и вниз — по порядку слоёв: эскалатор вниз с узлами сверху вниз и isOneWay', () => {
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'floor-2', x: 0, y: 0 },
				{ id: 'b', layer: 'floor-1', x: 0, y: 0 },
			],
			edges: [],
			transitions: [{ id: 'down', type: 'escalator', nodes: ['a', 'b'], isOneWay: true }],
		}
		const graph = buildRouteGraph({ routes, layers: LAYERS, isStepFree: false })
		expect(findRoutePath(graph, ['b'], ['a'])).toBeNull()
		const path = findRoutePath(graph, ['a'], ['b'])!
		const steps = routeSteps({ graph, path, from: shop('a', 'А'), to: shop('b', 'Б'), layers: LAYERS })
		expect(steps.map(step => step.text)).toEqual([
			'Начните у «А» (2 этаж)',
			'Идите к эскалатору',
			'Спуститесь на эскалаторе: 1 этаж',
			'Идите к «Б»',
		])
	})

	it('узел на слое не из data.layers: предупреждение и направление по порядку узлов перехода', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'floor-2', x: 0, y: 0 },
				{ id: 'b', layer: 'roof', x: 0, y: 0 },
			],
			edges: [],
			transitions: [{ id: 'lift', type: 'elevator', nodes: ['b', 'a'] }],
		}
		const layers = [...LAYERS]
		const graph = buildRouteGraph({ routes, layers, isStepFree: false })
		const up = routeSteps({
			graph,
			path: findRoutePath(graph, ['b'], ['a'])!,
			from: shop('b', 'Б'),
			to: shop('a', 'А'),
			layers,
		})
		expect(up[2]?.text).toBe('Поднимитесь на лифте: 2 этаж')
		const down = routeSteps({
			graph,
			path: findRoutePath(graph, ['a'], ['b'])!,
			from: shop('a', 'А'),
			to: shop('b', 'Б'),
			layers,
		})
		expect(down[2]?.text).toBe('Спуститесь на лифте: roof')
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('узел маршрута «b» стоит на слое «roof»'))
		warnSpy.mockRestore()
	})

	it('предупреждение о слое — один раз на узел для тех же data.layers, для новых — снова', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'floor-2', x: 0, y: 0 },
				{ id: 'b', layer: 'roof', x: 0, y: 0 },
			],
			edges: [],
			transitions: [{ id: 'lift', type: 'elevator', nodes: ['b', 'a'] }],
		}
		const steps = (layers: typeof LAYERS): void => {
			const graph = buildRouteGraph({ routes, layers, isStepFree: false })
			routeSteps({ graph, path: findRoutePath(graph, ['b'], ['a'])!, from: shop('b', 'Б'), to: shop('a', 'А'), layers })
		}
		const layers = [...LAYERS]
		steps(layers)
		steps(layers)
		const roofWarnings = (): number => warnSpy.mock.calls.filter(([text]) => String(text).includes('«roof»')).length
		expect(roofWarnings()).toBe(1)
		steps([...LAYERS])
		expect(roofWarnings()).toBe(2)
		warnSpy.mockRestore()
	})

	it('короткий отрезок — не меньше 1 м', () => {
		const graph = mall()
		const path = findRoutePath(graph, ['f1-c5'], ['f1-stairs'])!
		expect(walkedMeters(path, 1)).toBe(1)
	})
})

describe('routeView', () => {
	it('линии — подряд идущие узлы текущего слоя в единицах картинки; переход разрывает линию', () => {
		const { graph, path } = route('f1-shop-1', 'f2-shop-1')
		const layer = LAYERS[0] as ImageMapLayer
		const lines = routeLines(graph, path!, layer)
		expect(lines).toHaveLength(1)
		expect(lines[0]?.points.startsWith('155,240')).toBe(true)
		expect(routeLines(graph, path!, LAYERS[2] as ImageMapLayer)).toEqual([])
	})

	it('метки: начало, конец и площадки переходов своего слоя', () => {
		const { graph, path } = route('f1-shop-1', 'f2-shop-1')
		expect(routeMarkers(graph, path!, 'floor-1').map(marker => marker.kind)).toEqual(['start', 'transition'])
		expect(routeMarkers(graph, path!, 'floor-2').map(marker => marker.kind)).toEqual(['transition', 'end'])
		expect(routeMarkers(graph, path!, 'floor-1')[0]?.style).toEqual({ left: '15.5%', top: '40%' })
	})

	it('путь, который возвращается на слой, даёт отдельные линии', () => {
		const routes: ImageMapRoutes = {
			nodes: [
				{ id: 'a', layer: 'floor-1', x: 0, y: 0 },
				{ id: 'b', layer: 'floor-1', x: 0.5, y: 0 },
				{ id: 'c', layer: 'floor-2', x: 0.5, y: 0 },
				{ id: 'd', layer: 'floor-2', x: 0.6, y: 0 },
				{ id: 'e', layer: 'floor-1', x: 0.6, y: 0 },
				{ id: 'f', layer: 'floor-1', x: 1, y: 0 },
			],
			edges: [
				['a', 'b'],
				['c', 'd'],
				['e', 'f'],
			],
			transitions: [
				{ id: 't1', nodes: ['b', 'c'] },
				{ id: 't2', nodes: ['e', 'd'] },
			],
		}
		const graph = buildRouteGraph({ routes, layers: LAYERS, isStepFree: false })
		const path = findRoutePath(graph, ['a'], ['f'])!
		expect(routeLines(graph, path, LAYERS[0] as ImageMapLayer).map(line => line.id)).toEqual(['a-b', 'e-f'])
	})
})
