import { Group, Mesh } from 'three'
import { toWorld } from '../roadmap3dSpace'
import { roadmapColors } from '../roadmap3dPalette'
import { createRoadMaterial } from './roadMaterial'
import type { IslandPoint } from '../../../types/roadmap3dIsland.types'
import type { Roadmap3DPalette, Roadmap3DRoad } from '../../../types/internal/roadmap3dInternal.types'
import { createRibbonGeometry, createRibbonMaterial, setRibbonLength } from '@/scene3d/geometry/ribbon'

const WIDTH = { curb: 1.34, road: 1.04, done: 1.04, dash: 0.09 }
const LIFT = { curb: 0.16, road: 0.175, done: 0.19, dash: 0.205 }
const DASH = { dash: 0.34, gap: 0.3 }

export function buildRoad(road: readonly IslandPoint[], source: Roadmap3DPalette): Roadmap3DRoad {
	const group = new Group()
	const colors = roadmapColors(source)
	const at = (lift: number) => road.map(point => toWorld(point, lift))
	const curbGeometry = createRibbonGeometry(at(LIFT.curb))
	const roadGeometry = createRibbonGeometry(at(LIFT.road))
	const doneGeometry = createRibbonGeometry(at(LIFT.done))
	const dashGeometry = createRibbonGeometry(at(LIFT.dash))
	const curb = createRoadMaterial(colors.curb, colors.curb, WIDTH.curb)
	const base = createRoadMaterial(colors.road, colors.road, WIDTH.road)
	const done = createRoadMaterial(colors.doneFrom, colors.doneTo, WIDTH.done)
	const dash = createRibbonMaterial({ color: colors.dash, width: WIDTH.dash, dash: DASH })
	const parts = [
		{ geometry: curbGeometry, material: curb },
		{ geometry: roadGeometry, material: base },
		{ geometry: doneGeometry, material: done },
		{ geometry: dashGeometry, material: dash },
	]
	parts.forEach(({ geometry, material }, index) => {
		setRibbonLength(material, geometry)
		const mesh = new Mesh(geometry, material)
		mesh.renderOrder = index + 1
		mesh.receiveShadow = false
		group.add(mesh)
	})

	function recolor(next: Roadmap3DPalette): void {
		const palette = roadmapColors(next)
		curb.uniforms.uFrom.value.copy(palette.curb)
		curb.uniforms.uTo.value.copy(palette.curb)
		base.uniforms.uFrom.value.copy(palette.road)
		base.uniforms.uTo.value.copy(palette.road)
		done.uniforms.uFrom.value.copy(palette.doneFrom)
		done.uniforms.uTo.value.copy(palette.doneTo)
		dash.uniforms.uColor.value.copy(palette.dash)
	}

	return {
		group,
		recolor,
		setProgress: fraction => {
			done.uniforms.uProgress.value = Math.min(1, Math.max(0, fraction))
		},
	}
}
