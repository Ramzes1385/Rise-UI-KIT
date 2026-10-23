/**
 * Демо-модель этажа для историй BaseImageMap3D: детерминированный GLB из тех же размеров, что план этажа
 * IMAGE_MAP_FLOORS (stories BaseImageMap). Меши магазинов, лестницы и лифта названы id объектов карты —
 * BaseImageMap3D находит их по `meshName ?? id`. Запуск: `node scripts/generate-map3d-demo.mjs`.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Scene } from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

const OUTPUT = fileURLToPath(new URL('../src/components/BaseImageMap3D/stories/assets/mall-floor.glb', import.meta.url))

const PLAN = { width: 1000, height: 600, thickness: 6 }
const SHOP = { width: 190, depth: 200, height: 36, gap: 20, left: 60, rows: [40, 360], perRow: 4 }
const WALL = { height: 12, size: 6 }

/** GLTFExporter в Node читает Blob через FileReader, которого в Node нет */
class NodeFileReader {
	result = null
	onload = null
	onloadend = null

	readAsArrayBuffer(blob) {
		void blob.arrayBuffer().then(buffer => {
			this.result = buffer
			this.onload?.({ target: this })
			this.onloadend?.({ target: this })
		})
	}

	readAsDataURL(blob) {
		void blob.arrayBuffer().then(buffer => {
			this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(buffer).toString('base64')}`
			this.onload?.({ target: this })
			this.onloadend?.({ target: this })
		})
	}
}

globalThis.FileReader ??= NodeFileReader

function box(name, size, position, color) {
	const geometry = new BoxGeometry(size[0], size[1], size[2])
	geometry.translate(size[0] / 2, size[1] / 2, size[2] / 2)
	const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.8 }))
	mesh.name = name
	mesh.position.set(position[0], position[1], position[2])
	return mesh
}

function shops() {
	return SHOP.rows.flatMap((top, row) =>
		Array.from({ length: SHOP.perRow }, (_, index) => {
			const id = `f1-shop-${row * SHOP.perRow + index + 1}`
			const x = SHOP.left + index * (SHOP.width + SHOP.gap)
			return box(id, [SHOP.width, SHOP.height, SHOP.depth], [x, 0, top], 0xe8edf5)
		}),
	)
}

function walls() {
	const { width, height } = PLAN
	return [
		box('wall-north', [width, WALL.height, WALL.size], [0, 0, 0], 0xcbd5e1),
		box('wall-south', [width, WALL.height, WALL.size], [0, 0, height - WALL.size], 0xcbd5e1),
		box('wall-west', [WALL.size, WALL.height, height], [0, 0, 0], 0xcbd5e1),
		box('wall-east', [WALL.size, WALL.height, height], [width - WALL.size, 0, 0], 0xcbd5e1),
	]
}

function floorScene() {
	const floor = new Group()
	floor.name = 'mall-floor-1'
	floor.add(
		box('slab', [PLAN.width, PLAN.thickness, PLAN.height], [0, -PLAN.thickness, 0], 0xf8fafc),
		box('corridor', [920, 1, 80], [40, 0, 260], 0xfefce8),
		...walls(),
		...shops(),
		box('f1-stairs', [60, 24, 200], [900, 0, 40], 0xdcfce7),
		box('f1-lift', [60, 48, 200], [900, 0, 360], 0xe0f2fe),
	)
	const scene = new Scene()
	scene.add(floor)
	return scene
}

const glb = await new GLTFExporter().parseAsync(floorScene(), { binary: true })
await writeFile(OUTPUT, Buffer.from(glb))
console.log(`${OUTPUT}: ${glb.byteLength} байт`)
