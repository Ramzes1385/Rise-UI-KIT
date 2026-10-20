/**
 * Демо-модель киоска для историй BaseFlowMap3D (`CustomModels`): детерминированный GLB — корпус, экран, лампа и створка
 * с клипом `Open` (поворот створки). Узлы названы под роли окраски: `Body`, `Screen`, `Lamp`, `Flap`.
 * Запуск: `node scripts/generate-flow3d-demo.mjs`.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
	AnimationClip,
	BoxGeometry,
	CylinderGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	Quaternion,
	QuaternionKeyframeTrack,
	Scene,
	Vector3,
} from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'

const OUTPUT = fileURLToPath(new URL('../src/components/BaseFlowMap3D/stories/assets/kiosk.glb', import.meta.url))

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

function part(name, geometry, color, position) {
	const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: 0.6, name: `${name}-material` }))
	mesh.name = name
	mesh.position.set(...position)
	return mesh
}

function kiosk() {
	const root = new Group()
	root.name = 'kiosk'
	const flap = part('Flap', new BoxGeometry(0.5, 0.04, 0.3), 0x94a3b8, [0, 0.62, 0.38])
	root.add(
		part('Body', new BoxGeometry(0.9, 1.1, 0.7), 0xe2e8f0, [0, 0.55, 0]),
		part('Screen', new BoxGeometry(0.6, 0.35, 0.04), 0x3b82f6, [0, 0.8, 0.37]),
		part('Lamp', new CylinderGeometry(0.06, 0.06, 0.1, 16), 0x22c55e, [0, 1.15, 0]),
		flap,
	)
	return root
}

function openClip() {
	const closed = new Quaternion()
	const open = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 3)
	const track = new QuaternionKeyframeTrack('Flap.quaternion', [0, 0.5, 1], [...closed, ...open, ...closed])
	return new AnimationClip('Open', 1, [track])
}

const scene = new Scene()
scene.add(kiosk())
const glb = await new GLTFExporter().parseAsync(scene, { binary: true, animations: [openClip()] })
await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, Buffer.from(glb))
console.log(`${OUTPUT}: ${glb.byteLength} байт`)
