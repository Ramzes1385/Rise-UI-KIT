import '@testing-library/jest-dom/vitest'
import { Mesh, Texture, TextureLoader } from 'three'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import type { MeshStandardMaterial, Scene } from 'three'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createFakeRenderer, DATA_3D, mockWebGL } from './imageMap3d.test-utils'

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" x="100" y="100" width="200" height="100"/></svg>'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', shortTitle: '1', image: 'plan-1.png', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', svg: SVG, width: 800, height: 400 },
		{ id: 'f3', title: 'Этаж 3', width: 800, height: 400, model: { url: 'f3.glb' } },
	],
	objects: [
		{ id: 'shop', type: 'rect', title: 'Магазин', x: 0.1, y: 0.1, width: 0.2, height: 0.2, layer: 'f1' },
		{ id: 'cafe', type: 'ellipse', title: 'Кафе', x: 0.6, y: 0.5, rx: 0.1, ry: 0.1, layer: 'f1' },
		{ id: 'hall', type: 'svg', title: 'Зал', elementId: 'hall', layer: 'f2' },
	],
}

class TestResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

let textureLoad: ReturnType<typeof vi.spyOn>

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 1),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:svg'), revokeObjectURL: vi.fn() }))
	textureLoad = vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture())
	mockWebGL(true)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

async function renderScene(props: Record<string, unknown> = {}) {
	const renderer = createFakeRenderer()
	const result = render(BaseImageMap3D, { props: { data: DATA, rendererFactory: () => renderer, ...props } })
	await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	const frame = vi.mocked(requestAnimationFrame).mock.calls.at(-1)?.[0]
	frame?.(0)
	const scene = renderer.render.mock.calls.at(-1)?.[0] as Scene
	return { ...result, renderer, scene }
}

function materialOf(scene: Scene, name: string): MeshStandardMaterial {
	return (scene.getObjectByName(name) as Mesh<never, MeshStandardMaterial>).material
}

describe('BaseImageMap3D: сцена', () => {
	it('строит этажи и выдавленные объекты; объекты SVG и текстуры пола — после загрузки', async () => {
		const { scene } = await renderScene()
		expect(scene.getObjectByName('rise-map-content')).toBeDefined()
		expect(scene.getObjectByName('shop')).toBeInstanceOf(Mesh)
		expect(scene.getObjectByName('cafe')).toBeInstanceOf(Mesh)
		await waitFor(() => expect(scene.getObjectByName('hall')).toBeInstanceOf(Mesh))
		await waitFor(() => expect(textureLoad).toHaveBeenCalledWith('plan-1.png'))
		expect(textureLoad).toHaveBeenCalledWith('blob:svg')
		const floor = scene.getObjectByName('f1')?.getObjectByName('rise-floor-top') as Mesh<never, MeshStandardMaterial>
		await waitFor(() => expect(floor.material.map).toBeInstanceOf(Texture))
	})

	it('этаж без картинки и SVG остаётся без текстуры; ошибка загрузки текстуры не ломает сцену', async () => {
		textureLoad.mockRejectedValue(new Error('404'))
		const data = { ...DATA, layers: [{ id: 'bare', title: 'Пусто', width: 100, height: 100 }, DATA.layers[0]], objects: [] }
		const { scene } = await renderScene({ data })
		await waitFor(() => expect(textureLoad).toHaveBeenCalled())
		const top = scene.getObjectByName('bare')?.getObjectByName('rise-floor-top') as Mesh<never, MeshStandardMaterial>
		expect(top.material.map).toBeNull()
	})

	it('стопка: неактивные этажи полупрозрачны; переключатель этажей меняет активный и шлёт события', async () => {
		const { scene, emitted } = await renderScene()
		expect(materialOf(scene, 'shop').opacity).toBeCloseTo(0.7)
		expect(screen.getByRole('radiogroup', { name: 'Этажи' })).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		expect(emitted()['update:layer']).toEqual([['f2']])
		expect(emitted()['layer-change']).toEqual([['f2']])
		await waitFor(() => expect(materialOf(scene, 'shop').opacity).toBeCloseTo(0.175))
		await fireEvent.click(screen.getByRole('radio', { name: 'Этаж 2' }))
		expect(emitted()['update:layer']).toHaveLength(1)
	})

	it('single: виден только активный этаж; проп layer задаёт этаж; неизвестный id — первый', async () => {
		const { scene, rerender } = await renderScene({ layerMode: 'single', layer: 'f2' })
		expect(scene.getObjectByName('f1')?.visible).toBe(false)
		expect(scene.getObjectByName('f2')?.visible).toBe(true)
		await rerender({ layer: 'nope' })
		await waitFor(() => expect(scene.getObjectByName('f1')?.visible).toBe(true))
	})

	it('выбранный объект (active) окрашен цветом active', async () => {
		const { scene, rerender } = await renderScene({ active: 'cafe' })
		expect(materialOf(scene, 'cafe').opacity).toBe(1)
		await rerender({ active: null })
		await waitFor(() => expect(materialOf(scene, 'cafe').opacity).toBeCloseTo(0.7))
	})

	it('смена темы пересчитывает цвета', async () => {
		const getComputed = vi.spyOn(window, 'getComputedStyle')
		await renderScene()
		const calls = getComputed.mock.calls.length
		document.documentElement.setAttribute('data-theme', 'dark')
		await waitFor(() => expect(getComputed.mock.calls.length).toBeGreaterThan(calls))
		document.documentElement.removeAttribute('data-theme')
		await new Promise(resolve => setTimeout(resolve, 0))
	})

	it('один этаж — без переключателя; новые данные перестраивают сцену; размонтирование отменяет загрузки', async () => {
		const fetchMock = vi.fn(() => new Promise(() => undefined))
		vi.stubGlobal('fetch', fetchMock)
		const data = { layers: [{ id: 'u', title: 'U', svgUrl: '/u.svg', width: 10, height: 10 }], objects: [] }
		const { scene, rerender, unmount } = await renderScene({ data })
		expect(screen.queryByRole('radiogroup')).toBeNull()
		expect(fetchMock).toHaveBeenCalledWith('/u.svg', expect.objectContaining({ signal: expect.any(AbortSignal) }))
		const signal = (fetchMock.mock.calls[0] as unknown as [string, { signal: AbortSignal }])[1].signal
		await rerender({ data: DATA_3D })
		await waitFor(() => expect(signal.aborted).toBe(true))
		await waitFor(() => expect(scene.getObjectByName('u')).toBeUndefined())
		unmount()
	})

	it('отменённая загрузка не трогает сцену: текстура освобождается', async () => {
		let resolveTexture: (texture: Texture) => void = () => undefined
		const texture = new Texture()
		const dispose = vi.spyOn(texture, 'dispose')
		textureLoad.mockImplementation(() => new Promise(resolve => (resolveTexture = resolve)))
		const { unmount } = await renderScene({ data: { layers: [DATA.layers[0]], objects: [] } })
		await waitFor(() => expect(textureLoad).toHaveBeenCalled())
		unmount()
		resolveTexture(texture)
		await waitFor(() => expect(dispose).toHaveBeenCalled())
	})

	it('отменённая загрузка SVG не добавляет объекты', async () => {
		let resolveFetch: (value: unknown) => void = () => undefined
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise(resolve => (resolveFetch = resolve))),
		)
		const data = {
			layers: [{ id: 'u', title: 'U', svgUrl: '/u.svg', width: 800, height: 400 }],
			objects: [{ ...DATA.objects[2], layer: 'u' }],
		}
		const { scene, unmount } = await renderScene({ data })
		unmount()
		resolveFetch({ ok: true, text: async () => SVG })
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(scene.getObjectByName('hall')).toBeUndefined()
	})

	it('ошибка загрузки SVG слоя: пол без объектов SVG', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('offline'))),
		)
		const data = {
			layers: [{ id: 'u', title: 'U', svgUrl: '/u.svg', width: 800, height: 400 }],
			objects: [{ ...DATA.objects[2], layer: 'u' }],
		}
		const { scene } = await renderScene({ data })
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(scene.getObjectByName('u')).toBeDefined()
		expect(scene.getObjectByName('hall')).toBeUndefined()
	})

	it('в 2D-виде смена темы и этажа сцену не трогает', async () => {
		const renderer = createFakeRenderer()
		const { rerender } = render(BaseImageMap3D, { props: { data: DATA, view: '2d', rendererFactory: () => renderer } })
		document.documentElement.setAttribute('data-theme', 'dark')
		await rerender({ layer: 'f2' })
		await new Promise(resolve => setTimeout(resolve, 0))
		document.documentElement.removeAttribute('data-theme')
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(renderer.render).not.toHaveBeenCalled()
	})

	it('системная тема без matchMedia не ломает сцену', async () => {
		vi.stubGlobal('matchMedia', undefined)
		const { scene } = await renderScene()
		expect(scene.getObjectByName('shop')).toBeDefined()
	})
})
