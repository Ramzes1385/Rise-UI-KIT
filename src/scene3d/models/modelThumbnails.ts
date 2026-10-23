/** Composable: миниатюры моделей для палитры «Заменить модель» и библиотеки — один холст под сеткой ячеек HTML, отрисовка по ножницам */

import type { Model3DThumb, Model3DThumbRun } from '../types/internal/model3dRuntime.types'
import { Box3, DirectionalLight, Group, HemisphereLight, OrthographicCamera, Scene, Vector3, WebGLRenderer } from 'three'
import type { Model3DThumbnailRenderer, Model3DThumbnails, Model3DThumbnailsOptions } from '../types/internal/model3dInternal.types'

const ISO_DIRECTION = new Vector3(1, 0.82, 1).normalize()
const FRAME_MARGIN = 1.2
const DEFAULT_DURATION = 900

function measure(holder: Group): { center: Vector3; radius: number } {
	const box = new Box3().setFromObject(holder)
	const size = box.getSize(new Vector3())
	return { center: box.getCenter(new Vector3()), radius: Math.max(size.length() / 2, 0.1) }
}

function aim(camera: OrthographicCamera, thumb: Model3DThumb, aspect: number): void {
	const half = thumb.radius * FRAME_MARGIN
	Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half, near: 0.01, far: thumb.radius * 20 })
	camera.position.copy(thumb.center).addScaledVector(ISO_DIRECTION, thumb.radius * 8)
	camera.lookAt(thumb.center)
	camera.updateProjectionMatrix()
}

function createScene(): Scene {
	const scene = new Scene()
	const key = new DirectionalLight('#ffffff', 1.4)
	key.position.set(-0.45, 1, 0.7)
	scene.add(key, new HemisphereLight('#ffffff', '#c9d1dc', 0.9))
	return scene
}

function defaultRenderer(canvas: HTMLCanvasElement): Model3DThumbnailRenderer {
	return new WebGLRenderer({ canvas, alpha: true, antialias: true }) as unknown as Model3DThumbnailRenderer
}

function isOutside(rect: DOMRect, area: DOMRect): boolean {
	return rect.bottom < area.top || rect.top > area.bottom || !rect.width || !rect.height
}

function createPainter(options: Model3DThumbnailsOptions, thumbs: Map<string, Model3DThumb>) {
	const renderer = (options.createRenderer ?? defaultRenderer)(options.canvas)
	const scene = createScene()
	const camera = new OrthographicCamera()
	return {
		renderer,
		scene,
		draw: (): void => {
			const area = options.canvas.getBoundingClientRect()
			renderer.setSize(area.width, area.height, false)
			renderer.setScissorTest(true)
			thumbs.forEach(thumb => {
				const rect = thumb.cell.getBoundingClientRect()
				if (isOutside(rect, area)) return
				const view = [rect.left - area.left, area.bottom - rect.bottom, rect.width, rect.height] as const
				renderer.setViewport(...view)
				renderer.setScissor(...view)
				aim(camera, thumb, rect.width / rect.height)
				thumbs.forEach(other => (other.holder.visible = other === thumb))
				renderer.render(scene, camera)
			})
		},
	}
}

/** Миниатюры: `add` ставит модель в ячейку, `setActive` играет анимацию только у ячейки под указателем или в фокусе; кадры — по требованию */
export function createModelThumbnails(options: Model3DThumbnailsOptions): Model3DThumbnails {
	const thumbs = new Map<string, Model3DThumb>()
	const painter = createPainter(options, thumbs)
	let frame = 0
	let run: Model3DThumbRun | null = null

	function schedule(): void {
		if (!frame) frame = requestAnimationFrame(tick)
	}

	function tick(now: number): void {
		frame = 0
		const step = run && thumbs.get(run.id)?.instance.animations?.[run.animation]
		if (run && step) {
			run.started ||= now
			step(((now - run.started) / (options.getDuration?.() ?? DEFAULT_DURATION)) % 1)
		}
		painter.draw()
		if (step) schedule()
	}

	function add(id: string, cell: HTMLElement, instance: Model3DThumb['instance']): void {
		thumbs.get(id)?.holder.removeFromParent()
		const holder = new Group()
		holder.add(instance.object)
		painter.scene.add(holder)
		thumbs.set(id, { cell, instance, holder, ...measure(holder) })
		schedule()
	}

	function remove(id: string): void {
		thumbs.get(id)?.holder.removeFromParent()
		thumbs.delete(id)
		schedule()
	}

	function setActive(id: string | null, animation = 'pulse'): void {
		run = id && !options.isReducedMotion?.() ? { id, animation, started: 0 } : null
		schedule()
	}

	function dispose(): void {
		cancelAnimationFrame(frame)
		frame = 0
		thumbs.forEach(thumb => thumb.holder.removeFromParent())
		thumbs.clear()
		painter.renderer.dispose()
		painter.renderer.forceContextLoss()
	}

	return { add, remove, setActive, invalidate: schedule, dispose }
}
