import { PEDESTAL } from '../roadmap3dSpace'
import { roadmapColors } from '../roadmap3dPalette'
import { PICK_ID_KEY, PICK_INSTANCE_IDS_KEY } from '@/scene3d/input/raycast'
import { Group, InstancedMesh, Matrix4, MeshStandardMaterial, OctahedronGeometry, Vector3 } from 'three'
import { createPedestalGeometry, createPedestalStage, GEM, gemPoints, ringArc, topicColor } from './pedestalParts'
import type {
	Roadmap3DGem,
	Roadmap3DPalette,
	Roadmap3DPedestalStage,
	Roadmap3DPedestals,
	Roadmap3DStageItem,
	Roadmap3DStates,
} from '../../../types/internal/roadmap3dInternal.types'

const HOVER_LIFT = 0.06
const MIX = 0.45

function paintStages(
	stages: Roadmap3DPedestalStage[],
	view: { items: readonly Roadmap3DStageItem[]; palette: Roadmap3DPalette; states: Roadmap3DStates },
) {
	const { items, palette, states } = view
	const colors = roadmapColors(palette)
	items.forEach((item, index) => {
		const stage = stages[index]
		const tone = item.status === 'locked' ? colors.locked : palette.resolve(item.tint).clone()
		stage.base.material.color.copy(colors.rim)
		stage.tier.material.color.copy(tone)
		stage.cap.material.color.copy(tone).lerp(colors.snow, MIX)
		stage.track.material.color.copy(colors.neutral)
		stage.arc.material.color.copy(item.status === 'current' ? colors.primary : colors.success)
		stage.group.position.y = states.focus === item.id || states.hover === item.id ? HOVER_LIFT : 0
		stage.arc.visible = item.percent > 0
		if (stage.percent === item.percent) return
		stage.percent = item.percent
		stage.arc.geometry.dispose()
		stage.arc.geometry = ringArc(item.percent / 100)
	})
}

function paintGems(
	target: { mesh: InstancedMesh; gems: readonly Roadmap3DGem[] },
	view: { items: readonly Roadmap3DStageItem[]; palette: Roadmap3DPalette },
) {
	const { mesh, gems } = target
	const { items, palette } = view
	const colors = roadmapColors(palette)
	const topics = new Map(items.flatMap(item => item.topics.map(topic => [topic.id, topic] as const)))
	const matrix = new Matrix4()
	gems.forEach((gem, index) => {
		const topic = topics.get(gem.id)
		matrix.makeTranslation(gem.position.x, gem.position.y, gem.position.z)
		mesh.setMatrixAt(index, matrix)
		mesh.setColorAt(index, topic ? topicColor(topic.status, topic.isAlternative, colors) : colors.neutral)
	})
	mesh.instanceMatrix.needsUpdate = true
	if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

function createGemMesh(gems: readonly Roadmap3DGem[]): InstancedMesh {
	const material = new MeshStandardMaterial({ roughness: 0.4, flatShading: true })
	const mesh = new InstancedMesh(new OctahedronGeometry(GEM.radius), material, Math.max(gems.length, 1))
	mesh.count = gems.length
	mesh.castShadow = true
	mesh.userData[PICK_INSTANCE_IDS_KEY] = gems.map(gem => gem.id)
	return mesh
}

export function buildPedestals(initial: readonly Roadmap3DStageItem[], source: Roadmap3DPalette): Roadmap3DPedestals {
	const group = new Group()
	const geometry = createPedestalGeometry()
	const stages = initial.map(item => createPedestalStage(item, geometry))
	stages.forEach((stage, index) => {
		stage.group.userData[PICK_ID_KEY] = initial[index].id
		group.add(stage.group)
	})
	const gems = gemPoints(initial)
	const gemMesh = createGemMesh(gems)
	group.add(gemMesh)
	const anchors = new Map<string, Vector3>(initial.map(item => [item.id, new Vector3(item.position.x, PEDESTAL + 1.45, item.position.z)]))
	gems.forEach(gem => anchors.set(gem.id, gem.position.clone().setY(GEM.lift + 0.25)))
	const state = {
		palette: source,
		items: initial,
		states: { hover: null, focus: null, selected: null, currentId: null } as Roadmap3DStates,
	}
	const paint = (): void => {
		paintStages(stages, state)
		paintGems({ mesh: gemMesh, gems }, state)
	}
	paint()
	const apply = (patch: Partial<typeof state>): void => {
		Object.assign(state, patch)
		paint()
	}
	return {
		group,
		anchors,
		recolor: palette => apply({ palette }),
		update: items => apply({ items }),
		setStates: states => apply({ states }),
	}
}
