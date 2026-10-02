import { transitionType } from './routeGraph'
import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_ROUTES } from '@/locales/messages'
import type { ImageMapLayer } from '../../types/imageMapData.types'
import type {
	ImageMapRouteNode as RouteNode,
	ImageMapRouteStep,
	ImageMapRouteTransition,
	LinkRun,
	RouteLink,
	RoutePath,
	StepsInput,
} from '../../types/ImageMapRoutes.types'

const TYPE_KEYS = { stairs: 'STAIRS', elevator: 'ELEVATOR', escalator: 'ESCALATOR', ramp: 'RAMP' } as const

function typeText(prefix: 'TO' | 'VIA', transition: ImageMapRouteTransition): string {
	return UI_IMAGE_MAP_ROUTES[`${prefix}_${TYPE_KEYS[transitionType(transition)]}`]
}

function toMeters(cost: number, metersPerWidth: number | undefined): number | undefined {
	return metersPerWidth ? Math.max(1, Math.round(cost * metersPerWidth)) : undefined
}

function layerTitle(layers: ImageMapLayer[], id: string): string {
	return layers.find(layer => layer.id === id)?.title ?? id
}

function walkStep(transition: ImageMapRouteTransition, layer: string, meters: number | undefined): ImageMapRouteStep {
	const target = typeText('TO', transition)
	const text = transition.title
		? formatMessage(UI_IMAGE_MAP_ROUTES.WALK_NAMED, { target, name: transition.title })
		: formatMessage(UI_IMAGE_MAP_ROUTES.WALK, { target })
	return { kind: 'walk', text, layer, meters }
}

function transitionStep(input: StepsInput, links: RouteLink[], fromId: string): ImageMapRouteStep {
	const transition = links[0]?.transition as ImageMapRouteTransition
	const lastId = links[links.length - 1]?.to as string
	const isUp = transition.nodes.indexOf(lastId) > transition.nodes.indexOf(fromId)
	const layer = input.graph.layerOf(input.graph.nodes.get(lastId) as RouteNode)
	const template = isUp ? UI_IMAGE_MAP_ROUTES.UP : UI_IMAGE_MAP_ROUTES.DOWN
	return {
		kind: 'transition',
		text: formatMessage(template, { via: typeText('VIA', transition), layer: layerTitle(input.layers, layer) }),
		layer,
	}
}

function startStep(input: StepsInput): ImageMapRouteStep {
	const layer = input.graph.layerOf(input.path.nodes[0] as RouteNode)
	const text = formatMessage(UI_IMAGE_MAP_ROUTES.START, { name: input.from.title, layer: layerTitle(input.layers, layer) })
	return { kind: 'start', text, layer }
}

function linkRuns(links: RouteLink[]): LinkRun[] {
	return links.reduce<LinkRun[]>((runs, link, index) => {
		const last = runs[runs.length - 1]
		if (last && last.transition === link.transition) last.links.push(link)
		else runs.push({ transition: link.transition, links: [link], start: index })
		return runs
	}, [])
}

function sumCost(links: RouteLink[]): number {
	return links.reduce((sum, link) => sum + link.cost, 0)
}

export function routeSteps(input: StepsInput): ImageMapRouteStep[] {
	const { nodes } = input.path
	const nodeLayer = (index: number): string => input.graph.layerOf(nodes[index] as RouteNode)
	const steps = [startStep(input)]
	let walked = 0
	for (const run of linkRuns(input.path.links)) {
		if (!run.transition) {
			walked += sumCost(run.links)
			continue
		}
		steps.push(walkStep(run.transition, nodeLayer(run.start), toMeters(walked, input.metersPerWidth)))
		steps.push(transitionStep(input, run.links, (nodes[run.start] as RouteNode).id))
		walked = 0
	}
	const arrive = formatMessage(UI_IMAGE_MAP_ROUTES.ARRIVE, { name: input.to.title })
	steps.push({ kind: 'arrive', text: arrive, layer: nodeLayer(nodes.length - 1), meters: toMeters(walked, input.metersPerWidth) })
	return steps
}

export function walkedMeters(path: RoutePath, metersPerWidth: number | undefined): number | undefined {
	return toMeters(sumCost(path.links.filter(link => !link.transition)), metersPerWidth)
}
