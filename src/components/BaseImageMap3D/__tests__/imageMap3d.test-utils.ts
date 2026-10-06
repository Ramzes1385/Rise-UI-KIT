import { Vector3 } from 'three'
import type { VNode } from 'vue'
import type { Camera, Scene } from 'three'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import type { BaseImageMap3DExpose, ImageMap3DRenderer } from '../types/BaseImageMap3D.types'

export const DATA_3D: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', image: 'plan-1.png', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', image: 'plan-2.png', width: 800, height: 400, elevation: 200 },
	],
	objects: [
		{ id: 'shop', type: 'point', title: 'Магазин', x: 0.25, y: 0.5, layer: 'f1', height3d: 20 },
		{ id: 'cafe', type: 'point', title: 'Кафе', x: 0.75, y: 0.5, layer: 'f1' },
	],
}

export function createFakeRenderer() {
	return {
		domElement: document.createElement('canvas'),
		setPixelRatio: vi.fn(),
		setSize: vi.fn(),
		render: vi.fn(),
		dispose: vi.fn(),
		forceContextLoss: vi.fn(),
	} satisfies ImageMap3DRenderer
}

export function mockWebGL(isSupported: boolean): { loseContext: ReturnType<typeof vi.fn> } {
	const loseContext = vi.fn()
	const context = { getExtension: () => ({ loseContext }) }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) =>
		isSupported && type === 'webgl2' ? context : null) as never)
	return { loseContext }
}

export class TestResizeObserver {
	static instances: TestResizeObserver[] = []
	callback: ConstructorParameters<typeof ResizeObserver>[0]
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
	constructor(callback: ConstructorParameters<typeof ResizeObserver>[0]) {
		this.callback = callback
		TestResizeObserver.instances.push(this)
	}
}

interface MapEnvironment {
	size: { width: number; height: number }
	flushFrames: () => void
}

type FrameCallback = Parameters<typeof requestAnimationFrame>[0]

function stubLayout(size: MapEnvironment['size']): void {
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => size.width)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => size.height)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
		() =>
			({
				left: 0,
				top: 0,
				right: size.width,
				bottom: size.height,
				width: size.width,
				height: size.height,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect,
	)
}

async function renderMap3D(env: MapEnvironment, props: Record<string, unknown>, slots: Record<string, () => VNode>) {
	const renderer = createFakeRenderer()
	const exposed = ref<BaseImageMap3DExpose | null>(null)
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseImageMap3D, { data: DATA_3D, rendererFactory: () => renderer, ...attrs, ref: exposed }, slots),
	})
	const result = render(Host, { attrs: props })
	if (props.view !== '2d') await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	await nextTick()
	env.flushFrames()
	const camera = (): Camera => renderer.render.mock.calls.at(-1)?.[1] as Camera
	const scene = (): Scene => renderer.render.mock.calls.at(-1)?.[0] as Scene
	const screenOf = (world: Vector3) => {
		const ndc = world.clone().project(camera())
		return { clientX: ((ndc.x + 1) / 2) * env.size.width, clientY: ((1 - ndc.y) / 2) * env.size.height }
	}
	const region = () => screen.getByRole('group', { name: /Этаж/ })
	return { ...result, renderer, exposed, camera, scene, screenOf, region }
}

export function useMapEnvironment() {
	let frames: FrameCallback[] = []
	const size = { width: 800, height: 400 }
	const env: MapEnvironment = {
		size,
		flushFrames(): void {
			const queue = frames
			frames = []
			queue.forEach(callback => callback(0))
		},
	}

	beforeEach(() => {
		frames = []
		size.width = 800
		size.height = 400
		TestResizeObserver.instances = []
		vi.stubGlobal('ResizeObserver', TestResizeObserver)
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: FrameCallback) => frames.push(callback)),
		)
		vi.stubGlobal('cancelAnimationFrame', vi.fn())
		stubLayout(size)
		document.documentElement.setAttribute('data-rise-motion', 'none')
		mockWebGL(true)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		window.history.replaceState(null, '', '/')
	})

	return {
		size,
		flushFrames: env.flushFrames,
		renderMap: (props: Record<string, unknown> = {}, slots: Record<string, () => VNode> = {}) => renderMap3D(env, props, slots),
	}
}
