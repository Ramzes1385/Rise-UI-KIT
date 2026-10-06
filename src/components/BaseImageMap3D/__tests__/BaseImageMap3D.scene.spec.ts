import '@testing-library/jest-dom/vitest'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import type { MeshStandardMaterial, Scene } from 'three'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { createFakeRenderer, DATA_3D, mockWebGL } from './imageMap3d.test-utils'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial, Texture, TextureLoader } from 'three'

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
	const configureLoader = (loader: { loadAsync: unknown }) => {
		loader.loadAsync = async () => ({ scene: new Group() })
	}
	const result = render(BaseImageMap3D, { props: { data: DATA, rendererFactory: () => renderer, configureLoader, ...props } })
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

	it('смена темы пересчитывает цвета материалов', async () => {
		const original = window.getComputedStyle.bind(window)
		const themed = () => (document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgb(10, 20, 30)' : 'rgb(200, 100, 50)')
		vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
			const style = original(element, pseudo)
			if (!(element instanceof HTMLSpanElement && element.hidden)) return style
			return new Proxy(style, {
				get: (target, key) => {
					if (key === 'color') return themed()
					const value = Reflect.get(target, key)
					return typeof value === 'function' ? value.bind(target) : value
				},
			})
		})
		const { scene } = await renderScene()
		expect(materialOf(scene, 'shop').color.getHexString()).toBe('c86432')
		document.documentElement.setAttribute('data-theme', 'dark')
		await waitFor(() => expect(materialOf(scene, 'shop').color.getHexString()).toBe('0a141e'))
		document.documentElement.removeAttribute('data-theme')
		await waitFor(() => expect(materialOf(scene, 'shop').color.getHexString()).toBe('c86432'))
	})

	it('новые данные освобождают геометрии, материалы и текстуры прежнего содержимого', async () => {
		const texture = new Texture()
		textureLoad.mockResolvedValue(texture)
		const { scene, rerender } = await renderScene()
		await waitFor(() => expect(textureLoad).toHaveBeenCalled())
		await new Promise(resolve => setTimeout(resolve, 0))
		const shop = scene.getObjectByName('shop') as Mesh<BoxGeometry, MeshStandardMaterial>
		const geometry = vi.spyOn(shop.geometry, 'dispose')
		const material = vi.spyOn(shop.material, 'dispose')
		const textureDispose = vi.spyOn(texture, 'dispose')
		await rerender({ data: DATA_3D })
		await waitFor(() => expect(scene.getObjectByName('shop')).toBeUndefined())
		expect(geometry).toHaveBeenCalled()
		expect(material).toHaveBeenCalled()
		expect(textureDispose).toHaveBeenCalled()
	})

	it('один этаж — без переключателя; новые данные отменяют загрузки прежних и перестраивают сцену', async () => {
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

	it('модель этажа: configureLoader, меши по id, предупреждения о ненайденных и занятых узлах', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const model = new Group()
		const node = new Mesh(new BoxGeometry(), new MeshBasicMaterial())
		node.name = 'm-shop'
		model.add(node)
		const configureLoader = vi.fn(loader => {
			loader.loadAsync = vi.fn(async () => ({ scene: model }))
		})
		const data = {
			layers: [{ id: 'm', title: 'M', width: 100, height: 100, model: { url: 'm.glb' } }],
			objects: [
				{ id: 'm-shop', type: 'svg', title: 'Shop', elementId: 'm-shop' },
				{ id: 'm-box', type: 'rect', title: 'Box', x: 0, y: 0, width: 0.5, height: 0.5 },
				{ id: 'm-twin', type: 'rect', title: 'Twin', x: 0.5, y: 0.5, width: 0.2, height: 0.2, meshName: 'm-shop' },
			],
		}
		const { scene } = await renderScene({ data, configureLoader })
		await waitFor(() => expect(scene.getObjectByName('m-shop')).toBe(node))
		expect(configureLoader).toHaveBeenCalledOnce()
		expect(node.userData.objectId).toBe('m-shop')
		expect(scene.getObjectByName('m-box')).toBeInstanceOf(Mesh)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('нет узла «m-box»'))
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('меши узла «m-shop» в модели этажа «m» уже заняты другим объектом — объект «m-twin»'),
		)
		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('нет узла «m-shop»'))
		expect(scene.getObjectByName('m-twin')).toBeInstanceOf(Mesh)
	})

	it('модель не загрузилась — 2D и событие fallback(error); после размонтирования — без события', async () => {
		const onFallback = vi.fn()
		const data = { layers: [{ id: 'm', title: 'M', width: 100, height: 100, model: { url: 'm.glb' } }], objects: [] }
		const configureLoader = vi.fn(loader => {
			loader.loadAsync = vi.fn(async () => Promise.reject(new Error('404')))
		})
		await renderScene({ data, configureLoader, onFallback })
		await waitFor(() => expect(onFallback).toHaveBeenCalledWith('error'))
		let reject: (error: Error) => void = () => undefined
		const late = vi.fn(loader => {
			loader.loadAsync = vi.fn(() => new Promise((_, fail) => (reject = fail)))
		})
		const second = await renderScene({ data, configureLoader: late, onFallback })
		second.unmount()
		reject(new Error('late'))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(onFallback).toHaveBeenCalledOnce()
	})

	it('ошибка модели: предупреждение в dev; новые данные — новая попытка 3D', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const onFallback = vi.fn()
		const data = { layers: [{ id: 'm', title: 'M', width: 100, height: 100, model: { url: 'm.glb' } }], objects: [] }
		const configureLoader = vi.fn(loader => {
			loader.loadAsync = vi.fn(async () => Promise.reject(new Error('404')))
		})
		const { container, rerender } = await renderScene({ data, configureLoader, onFallback })
		await waitFor(() => expect(onFallback).toHaveBeenCalledWith('error'))
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('модель этажа «m» (m.glb) не загрузилась'))
		expect(container.querySelector('canvas')).toBeNull()
		await rerender({ data: DATA_3D })
		await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull())
		expect(screen.getByRole('status')).toHaveTextContent('')
	})

	it('модель, загруженная после размонтирования, освобождается', async () => {
		let resolveModel: (value: unknown) => void = () => undefined
		const model = new Group()
		const geometry = new BoxGeometry()
		model.add(new Mesh(geometry, new MeshBasicMaterial()))
		const dispose = vi.spyOn(geometry, 'dispose')
		const configureLoader = vi.fn(loader => {
			loader.loadAsync = vi.fn(() => new Promise(resolve => (resolveModel = resolve)))
		})
		const data = { layers: [{ id: 'm', title: 'M', width: 100, height: 100, model: { url: 'm.glb' } }], objects: [] }
		const { unmount } = await renderScene({ data, configureLoader })
		unmount()
		resolveModel({ scene: model })
		await waitFor(() => expect(dispose).toHaveBeenCalled())
	})

	it('системная тема без matchMedia не ломает сцену', async () => {
		vi.stubGlobal('matchMedia', undefined)
		const { scene } = await renderScene()
		expect(scene.getObjectByName('shop')).toBeDefined()
	})
})
