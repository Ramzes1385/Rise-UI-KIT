import type { Color } from 'three'
import { roadmapColors } from '../roadmap3dPalette'
import { samplePoint } from '../../island/roadMeasure'
import { pinPosition, toWorld } from '../roadmap3dSpace'
import type { IslandPoint, RoadTable } from '../../../types/roadmap3dIsland.types'
import type { Roadmap3DMarkers, Roadmap3DPalette } from '../../../types/internal/roadmap3dInternal.types'
import { BoxGeometry, ConeGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three'

const ROAD_LIFT = 0.36
const HEADING_STEP = 0.004
const PIN = { bob: 0.12, speed: 2.4 }

function mesh(geometry: BoxGeometry | CylinderGeometry | SphereGeometry | ConeGeometry, material: MeshStandardMaterial): Mesh {
	const result = new Mesh(geometry, material)
	result.castShadow = true
	return result
}

function createCar(body: MeshStandardMaterial, glass: MeshStandardMaterial, wheel: MeshStandardMaterial): Group {
	const car = new Group()
	const chassis = mesh(new BoxGeometry(0.56, 0.22, 0.94), body)
	const cabin = mesh(new BoxGeometry(0.44, 0.2, 0.42), glass)
	cabin.position.set(0, 0.2, -0.04)
	car.add(chassis, cabin)
	for (const [x, z] of [
		[-0.3, -0.3],
		[0.3, -0.3],
		[-0.3, 0.3],
		[0.3, 0.3],
	]) {
		const tire = mesh(new CylinderGeometry(0.11, 0.11, 0.1, 14), wheel)
		tire.rotation.z = Math.PI / 2
		tire.position.set(x, -0.1, z)
		car.add(tire)
	}
	car.position.y = ROAD_LIFT
	return car
}

function createPin(material: MeshStandardMaterial, dot: MeshStandardMaterial): Group {
	const pin = new Group()
	const head = mesh(new SphereGeometry(0.34, 20, 16), material)
	head.position.y = 0.5
	const tip = mesh(new ConeGeometry(0.26, 0.5, 20), material)
	tip.rotation.x = Math.PI
	tip.position.y = 0.12
	const center = mesh(new SphereGeometry(0.13, 12, 10), dot)
	center.position.set(0, 0.5, 0.26)
	pin.add(head, tip, center)
	return pin
}

function paintMarkers(materials: Record<'body' | 'glass' | 'wheel' | 'pin' | 'dot', MeshStandardMaterial>, next: Roadmap3DPalette): void {
	const colors = roadmapColors(next)
	const paint = (item: MeshStandardMaterial, color: Color): void => void item.color.copy(color)
	paint(materials.body, next.resolve('var(--rise-chart-2)'))
	paint(materials.glass, colors.snow)
	paint(materials.wheel, colors.road)
	paint(materials.pin, next.resolve('var(--rise-chart-5)'))
	paint(materials.dot, colors.snow)
}

export function buildMarkers(
	input: { road: IslandPoint[]; table: RoadTable; hasCar: boolean },
	source: Roadmap3DPalette,
): Roadmap3DMarkers {
	const { road, table } = input
	const group = new Group()
	const materials = {
		body: new MeshStandardMaterial({ roughness: 0.45 }),
		glass: new MeshStandardMaterial({ roughness: 0.3 }),
		wheel: new MeshStandardMaterial({ roughness: 0.8 }),
		pin: new MeshStandardMaterial({ roughness: 0.4 }),
		dot: new MeshStandardMaterial({ roughness: 0.5 }),
	}
	const car = createCar(materials.body, materials.glass, materials.wheel)
	const pin = createPin(materials.pin, materials.dot)
	car.visible = input.hasCar && road.length > 1
	pin.visible = false
	group.add(car, pin)
	const pinBase = { y: 0 }

	const recolor = (next: Roadmap3DPalette): void => paintMarkers(materials, next)

	function setCar(fraction: number): void {
		if (road.length < 2) return
		const here = samplePoint(road, table, fraction)
		const ahead = samplePoint(road, table, Math.min(1, fraction + HEADING_STEP))
		const behind = samplePoint(road, table, Math.max(0, fraction - HEADING_STEP))
		const place = toWorld(here, ROAD_LIFT)
		car.position.copy(place)
		car.rotation.y = Math.atan2(ahead.x - behind.x, -(ahead.z - behind.z))
	}

	recolor(source)
	return {
		group,
		recolor,
		setCar,
		setPin: point => {
			pin.visible = point !== null
			if (!point) return
			const place = pinPosition(point)
			pin.position.copy(place)
			pinBase.y = place.y
		},
		bob: time => {
			pin.position.y = pinBase.y + Math.sin(time * PIN.speed) * PIN.bob
		},
	}
}
