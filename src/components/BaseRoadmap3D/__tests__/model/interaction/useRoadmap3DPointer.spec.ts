import { PICK_ID_KEY } from '@/scene3d/input/raycast'
import { runInSetup } from '../../fixtures/model.test-utils'
import { ROADMAP_3D_START } from '../../../model/data/roadmap3dTags'
import { useRoadmap3DPointer } from '../../../model/interaction/useRoadmap3DPointer'
import type { Roadmap3DContent } from '../../../types/internal/roadmap3dInternal.types'
import { Group, Mesh, MeshBasicMaterial, OrthographicCamera, BoxGeometry } from 'three'

let frames: FrameRequestCallback[] = []

beforeEach(() => {
	frames = []
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => vi.unstubAllGlobals())

function sceneWithBox() {
	const root = new Group()
	const box = new Mesh(new BoxGeometry(2, 2, 2), new MeshBasicMaterial())
	box.userData[PICK_ID_KEY] = 'basics'
	root.add(box)
	const camera = new OrthographicCamera(-5, 5, 5, -5, 0.1, 50)
	camera.position.set(0, 0, 10)
	camera.updateMatrixWorld(true)
	root.updateMatrixWorld(true)
	return { content: { root } as unknown as Roadmap3DContent, camera }
}

function mountPointer(options: { content?: Roadmap3DContent | null; hasHost?: boolean } = {}) {
	const { content, camera } = sceneWithBox()
	const host = document.createElement('div')
	vi.spyOn(host, 'getBoundingClientRect').mockReturnValue({
		left: 0,
		top: 0,
		width: 100,
		height: 100,
		right: 100,
		bottom: 100,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
	const pick = { input: vi.fn(), hover: vi.fn(), pick: vi.fn(), clear: vi.fn() }
	const pinchZoom = vi.fn()
	const { result: pointer } = runInSetup(() =>
		useRoadmap3DPointer({
			hostRef: { value: options.hasHost === false ? null : host } as never,
			getContent: () => (options.content === undefined ? content : options.content),
			getCamera: () => camera,
			pinchZoom,
			pick,
		}),
	)
	return { pointer, pick, pinchZoom, host }
}

const at = (x: number, y: number, extra: Record<string, unknown> = {}) =>
	({ clientX: x, clientY: y, buttons: 0, pointerType: 'mouse', pointerId: 1, target: null, ...extra }) as never

function tag(id: string): HTMLElement {
	const element = document.createElement('div')
	element.setAttribute('data-label-id', id)
	return element.appendChild(document.createElement('span'))
}

const flushHover = (): void => frames.splice(0).forEach(callback => callback(0))

describe('useRoadmap3DPointer: наведение', () => {
	it('над моделью — её id, мимо — null; считается по кадру', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerMove(at(50, 50))
		expect(pick.hover).not.toHaveBeenCalled()
		flushHover()
		expect(pick.hover).toHaveBeenLastCalledWith('basics')
		pointer.onPointerMove(at(2, 2))
		flushHover()
		expect(pick.hover).toHaveBeenLastCalledWith(null)
	})

	it('над биркой берётся её id; бирка старта и цели не считается', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerMove(at(2, 2, { target: tag('frame') }))
		flushHover()
		expect(pick.hover).toHaveBeenLastCalledWith('frame')
		pointer.onPointerMove(at(50, 50, { target: tag(ROADMAP_3D_START) }))
		flushHover()
		expect(pick.hover).toHaveBeenLastCalledWith('basics')
	})

	it('без сцены или без области попасть нельзя; цель не элемент — как мимо', () => {
		const noContent = mountPointer({ content: null })
		noContent.pointer.onPointerMove(at(50, 50))
		flushHover()
		expect(noContent.pick.hover).toHaveBeenLastCalledWith(null)
		const noHost = mountPointer({ hasHost: false })
		noHost.pointer.onPointerMove(at(50, 50, { target: window }))
		flushHover()
		expect(noHost.pick.hover).toHaveBeenLastCalledWith(null)
	})

	it('уход указателя снимает наведение', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerLeave()
		expect(pick.hover).toHaveBeenCalledWith(null)
	})
})

describe('useRoadmap3DPointer: щелчок', () => {
	it('по модели выбирает её, по бирке — id бирки; любой нажим сообщает о вводе', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerDown(at(50, 50))
		pointer.onClick(at(50, 50))
		expect(pick.input).toHaveBeenCalledOnce()
		expect(pick.pick).toHaveBeenCalledWith('basics')
		expect(pick.clear).not.toHaveBeenCalled()
		pointer.onPointerDown(at(2, 2))
		pointer.onClick(at(2, 2, { target: tag('vue') }))
		expect(pick.pick).toHaveBeenLastCalledWith('vue')
	})

	it('по пустому месту — сброс; после перетаскивания — нет', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerDown(at(2, 2))
		pointer.onClick(at(2, 2))
		expect(pick.clear).toHaveBeenCalledOnce()
		pointer.onPointerDown(at(2, 2))
		pointer.onClick(at(40, 40))
		expect(pick.clear).toHaveBeenCalledOnce()
		pointer.onClick(at(2, 2))
		expect(pick.clear).toHaveBeenCalledTimes(2)
	})

	it('по бирке старта сбрасывает: это не этап', () => {
		const { pointer, pick } = mountPointer()
		pointer.onPointerDown(at(2, 2))
		pointer.onClick(at(2, 2, { target: tag(ROADMAP_3D_START) }))
		expect(pick.clear).toHaveBeenCalledOnce()
	})
})

describe('useRoadmap3DPointer: щипок', () => {
	it('двумя пальцами масштаб меняется по расстоянию между ними', () => {
		const { pointer, pinchZoom } = mountPointer()
		pointer.onPointerDown(at(10, 10, { pointerType: 'touch', pointerId: 1 }))
		pointer.onPointerDown(at(20, 10, { pointerType: 'touch', pointerId: 2 }))
		pointer.onPointerMove(at(30, 10, { pointerType: 'touch', pointerId: 2 }))
		expect(pinchZoom).toHaveBeenCalledWith(2)
		pointer.onPointerUp(at(30, 10, { pointerType: 'touch', pointerId: 2 }))
	})
})
