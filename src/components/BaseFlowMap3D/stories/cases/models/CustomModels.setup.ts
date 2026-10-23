import { defineModel3D } from '@/flow3d'
import { ConeGeometry, Mesh } from 'three'
import kioskUrl from '../../assets/kiosk.glb?url'
import type { Model3DContext, Model3DNode } from '@/flow3d'

export function setup() {
	const models = {
		kiosk: defineModel3D({
			title: 'Киоск',
			url: kioskUrl,
			words: ['kiosk', 'киоск'],
			kind: 'service',
			animation: 'gate',
			parts: { body: 'Body', screen: 'Screen', accent: 'Lamp' },
			clips: { gate: 'Open' },
		}),
		beacon: defineModel3D({
			title: 'Маяк очереди',
			kind: 'service',
			create: (_node: Model3DNode, context: Model3DContext) => {
				const object = new Mesh(
					context.geometry('beacon', () => new ConeGeometry(0.45, 1.1, 4)),
					context.material('accent'),
				)
				object.position.y = 0.55
				return {
					object,
					parts: { accent: [object] },
					animations: { pulse: (progress: number) => object.scale.setScalar(1 + 0.25 * Math.sin(progress * Math.PI)) },
				}
			},
		}),
		'gold-bank': defineModel3D({ preset: 'bank', title: 'Банк (золото)', tint: '#b8860b', scale: 1.1 }),
	}

	return { models }
}
