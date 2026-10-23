import { ref } from 'vue'
import type { Model3DHandle, Scene3DContext } from '@/flow3d'
import type { FlowElementEvent } from '@components/BaseFlowMap'
import { Mesh, MeshBasicMaterial, SphereGeometry } from 'three'

export function setup() {
	const log = ref<string[]>([])
	const note = (text: string) => (log.value = [text, ...log.value].slice(0, 6))

	const onSceneReady = (context: Scene3DContext) => {
		const marker = new Mesh(new SphereGeometry(0.25), new MeshBasicMaterial({ color: '#ff8a00' }))
		marker.position.y = 2.2
		context.getModel('orders')?.object.add(marker)
		let angle = 0
		const stop = context.animate((delta: number) => {
			angle += delta
			marker.position.x = Math.sin(angle) * 0.6
			return angle < 4
		})
		note('Сцена собрана, маркер добавлен')
		return () => {
			stop()
			marker.removeFromParent()
			marker.geometry.dispose()
			marker.material.dispose()
			note('Маркер убран, сцена очищена')
		}
	}
	const onBeforeRender = (_context: Scene3DContext, frame: { delta: number; time: number }) => {
		if (frame.time === 0) note('Первый кадр')
	}
	const onModelReady = (model: Model3DHandle) => {
		if (model.id === 'orders') note(`Модель готова: ${model.id}`)
	}
	const onNodeClick = (event: FlowElementEvent) => note(`Клик: ${event.target.id}`)

	return { log, onSceneReady, onBeforeRender, onModelReady, onNodeClick }
}
