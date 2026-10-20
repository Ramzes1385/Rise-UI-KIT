import { Group } from 'three'
import { buildNodes } from './buildNodes'
import { buildGround } from './buildGround'
import { buildLabels } from './buildLabels'
import { shadowModeOf } from '../sceneQuality'
import { buildLayout } from './layout/buildLayout'
import { sceneFrame } from '../../camera/flowMap3dFrame'
import { createSceneLights } from '@/scene3d/scene/lights'
import { disposeObject } from '@/scene3d/scene/disposeObject'
import { createParticles } from '../../motion/particles/useParticles'
import { createScenarioLayer } from '../../motion/scenario/scenarioToken'
import type {
	FlowMap3DBuildOptions,
	FlowMap3DContent,
	FlowMap3DFrame,
	FlowMap3DNodes,
} from '../../../types/internal/flowMap3dInternal.types'

function markShadows(nodes: FlowMap3DNodes, isOn: boolean): void {
	nodes.group.traverse(object => {
		object.castShadow = isOn
	})
}

const CROWDED_NODES = 150
const CROWDED_PARTICLES = 150

function buildParts(options: FlowMap3DBuildOptions, frame: FlowMap3DFrame) {
	const { snapshot, palette } = options
	const shadows = shadowModeOf(options.quality, snapshot.nodes.length)
	const isShadowed = shadows === 'map'
	const hasSlabs = options.hasLayers || snapshot.isLayered
	const lights = createSceneLights(palette.palette.isDark)
	lights.key.castShadow = isShadowed
	lights.fitShadow(frame.bounds)
	return {
		isShadowed,
		hasSlabs,
		layout: buildLayout(snapshot, palette, { hasSlabs, hasBlobs: shadows === 'blob' }),
		lights,
		ground: buildGround({ radius: frame.radius, palette, hasShadow: isShadowed }),
		labels: buildLabels({ groups: snapshot.groups, edges: snapshot.edges, isLayered: snapshot.isLayered }, palette),
		particles: createParticles(
			snapshot.edges,
			Math.min(options.particles, snapshot.nodes.length > CROWDED_NODES ? CROWDED_PARTICLES : options.particles),
			palette,
		),
		scenario: createScenarioLayer(snapshot.edges, palette),
	}
}

export function buildContent(options: FlowMap3DBuildOptions): FlowMap3DContent {
	const { snapshot } = options
	let palette = options.palette
	const frame = sceneFrame(snapshot)
	const { isShadowed, hasSlabs, layout, lights, ground, labels, particles, scenario } = buildParts(options, frame)
	const { groups, edges, arrows, layers, blobs } = layout
	const root = new Group()
	root.add(ground.group, groups.group, edges.group, lights.group, scenario.group)
	for (const object of [hasSlabs ? layers.group : null, blobs?.group, labels.mesh, particles.group]) if (object) root.add(object)
	const nodes = buildNodes(snapshot.nodes, { ...options, cell: snapshot.cell, getPalette: () => palette })
	markShadows(nodes, isShadowed)
	const themed = [ground, groups, edges, arrows, labels, particles, layers, scenario, ...(blobs ? [blobs] : [])]

	return {
		root,
		nodes,
		particles,
		scenario,
		layout,
		lights,
		labels,
		bounds: frame.bounds,
		setHighlight: ids => {
			edges.setHighlight(ids)
			arrows.setOpacity(ids !== null)
		},
		recolor: next => {
			palette = next
			themed.forEach(part => part.recolor(next))
			lights.setDark(next.palette.isDark)
			nodes.registry.refreshTheme()
		},
		dispose: () => {
			;[particles, scenario, labels, arrows].forEach(part => part.dispose())
			disposeObject(root)
			nodes.registry.dispose()
			lights.dispose()
		},
	}
}
