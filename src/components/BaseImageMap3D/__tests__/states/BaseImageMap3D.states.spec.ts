import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { Texture, TextureLoader } from 'three'
import BaseImageMap3D from '../../ui/BaseImageMap3D.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { createFakeRenderer, mockWebGL } from '../imageMap3d.test-utils'

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" x="100" y="100" width="200" height="100"/></svg>'

const hall = { id: 'hall', type: 'svg', title: 'Зал', elementId: 'hall', layer: 'u' } as const
const remote = (id: string, title: string) => ({ id, title, svgUrl: `/${id}.svg`, width: 800, height: 400 })

class TestResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

let textureLoad: ReturnType<typeof vi.spyOn>
let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => {
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 1),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:svg'), revokeObjectURL: vi.fn() }))
	textureLoad = vi.spyOn(TextureLoader.prototype, 'loadAsync').mockResolvedValue(new Texture())
	warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	mockWebGL(true)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

function respond(markup: string): { ok: boolean; text: () => Promise<string> } {
	return { ok: true, text: async () => markup }
}

async function renderStates(data: ImageMap3DData, props: Record<string, unknown> = {}) {
	const renderer = createFakeRenderer()
	const result = render(BaseImageMap3D, { props: { data, rendererFactory: () => renderer, ...props } })
	await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	await nextTick()
	const region = (): HTMLElement =>
		screen.getByRole('group', { name: (_, element) => element.getAttribute('aria-roledescription') === '3D-карта' })
	const status = (): HTMLElement => screen.getByRole('status')
	const overlay = (): HTMLElement | null => region().querySelector(':scope > [aria-hidden="true"]:not(canvas)')
	return { ...result, renderer, region, status, overlay }
}

describe('BaseImageMap3D: загрузка плана этажа', () => {
	it('пока план грузится: aria-busy и подпись на карте; скринридеру подпись не объявляется; после загрузки — всё снято', async () => {
		let resolveFetch: (value: unknown) => void = () => undefined
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise(resolve => (resolveFetch = resolve))),
		)
		const { region, status, overlay } = await renderStates({ layers: [remote('u', 'U')], objects: [hall] })
		expect(region()).toHaveAttribute('aria-busy', 'true')
		expect(overlay()).toHaveTextContent('Загрузка карты…')
		expect(overlay()).toHaveClass('base-image-map-3d__state--loading')
		expect(overlay()).toHaveAttribute('aria-hidden', 'true')
		expect(status()).toHaveTextContent('')
		resolveFetch(respond(SVG))
		await waitFor(() => expect(region()).toHaveAttribute('aria-busy', 'false'))
		expect(overlay()).toBeNull()
	})

	it('этаж без загрузок (нет ни SVG, ни картинки) не показывает ни загрузку, ни ошибку', async () => {
		const { region, overlay, status } = await renderStates({
			layers: [{ id: 'bare', title: 'Пусто', width: 100, height: 100 }],
			objects: [],
		})
		await waitFor(() => expect(region()).toHaveAttribute('aria-busy', 'false'))
		expect(overlay()).toBeNull()
		expect(status()).toHaveTextContent('')
	})
})

describe('BaseImageMap3D: ошибка плана этажа', () => {
	it('SVG не загрузился: сообщение на карте и в status; предупреждение в dev', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('offline'))),
		)
		const { overlay, status, region } = await renderStates({ layers: [remote('u', 'Этаж U')], objects: [hall] })
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: Этаж U'))
		expect(overlay()).toHaveClass('base-image-map-3d__state--error')
		expect(overlay()).toHaveTextContent('Не удалось загрузить план этажа: Этаж U')
		expect(region()).toHaveAttribute('aria-busy', 'false')
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('план этажа «u» не загрузился'))
		expect(screen.getAllByRole('status')).toHaveLength(1)
		expect(screen.queryByText('Не удалось загрузить план этажа: Этаж U', { ignore: '[aria-hidden="true"] *' })).toBe(status())
		expect(status()).toHaveClass('base-image-map-3d__status--hidden')
	})

	it('ответ с ошибкой HTTP и SVG, не прошедший очистку, — тоже ошибка', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: false, text: async () => '' })),
		)
		const { status, rerender } = await renderStates({ layers: [remote('u', 'U')], objects: [] })
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: U'))
		await rerender({ data: { layers: [{ id: 'w', title: 'W', svg: '<div>не svg</div>', width: 100, height: 100 }], objects: [] } })
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: W'))
	})

	it('картинка или текстура пола не загрузились — ошибка этажа; объекты SVG при этом уже добавлены', async () => {
		textureLoad.mockRejectedValue(new Error('404'))
		const data = { layers: [{ id: 'u', title: 'U', svg: SVG, width: 800, height: 400 }], objects: [hall] }
		const { status, renderer } = await renderStates(data)
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: U'))
		const frame = vi.mocked(requestAnimationFrame).mock.calls.at(-1)?.[0]
		frame?.(0)
		const scene = renderer.render.mock.calls.at(-1)?.[0]
		expect(scene.getObjectByName('hall')).toBeDefined()
	})

	it('несколько этажей: в сообщении только те, что не загрузились, через запятую', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async (url: string) => (url === '/c.svg' ? respond(SVG) : Promise.reject(new Error('offline')))),
		)
		const layers = [remote('a', 'Первый'), remote('b', 'Второй'), remote('c', 'Третий')]
		const { status } = await renderStates({ layers, objects: [] })
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: Первый, Второй'))
		expect(status()).not.toHaveTextContent('Третий')
	})

	it('новые данные сбрасывают ошибку; отменённая загрузка прежних данных ошибку не возвращает', async () => {
		let rejectFetch: (error: Error) => void = () => undefined
		vi.stubGlobal(
			'fetch',
			vi.fn(() => new Promise((_, reject) => (rejectFetch = reject))),
		)
		const { status, rerender, region } = await renderStates({ layers: [remote('u', 'U')], objects: [] })
		await rerender({ data: { layers: [{ id: 'bare', title: 'Пусто', width: 100, height: 100 }], objects: [] } })
		await waitFor(() => expect(region()).toHaveAttribute('aria-busy', 'false'))
		rejectFetch(new Error('late'))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(status()).toHaveTextContent('')
		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('не загрузился'))
	})

	it('ошибка пропадает при новых данных, загрузившихся успешно', async () => {
		const fetchMock = vi.fn(() => Promise.reject(new Error('offline')))
		vi.stubGlobal('fetch', fetchMock)
		const { status, rerender } = await renderStates({ layers: [remote('u', 'U')], objects: [] })
		await waitFor(() => expect(status()).toHaveTextContent('Не удалось загрузить план этажа: U'))
		fetchMock.mockImplementation(async () => respond(SVG) as never)
		await rerender({ data: { layers: [remote('v', 'V')], objects: [] } })
		await waitFor(() => expect(status()).toHaveTextContent(''))
	})
})

describe('BaseImageMap3D: пустые данные', () => {
	it('без этажей: подпись на карте и в status, у области есть высота', async () => {
		const { overlay, status, region } = await renderStates({ layers: [], objects: [] })
		expect(overlay()).toHaveTextContent('Нет слоёв карты')
		expect(overlay()).toHaveClass('base-image-map-3d__state--empty')
		expect(status()).toHaveTextContent('Нет слоёв карты')
		expect(status()).toHaveClass('base-image-map-3d__status--hidden')
		expect(region()).toHaveClass('base-image-map-3d__viewport--empty')
	})

	it('появились этажи — подпись снимается', async () => {
		const { overlay, status, region, rerender } = await renderStates({ layers: [], objects: [] })
		await rerender({ data: { layers: [{ id: 'bare', title: 'Пусто', width: 100, height: 100 }], objects: [] } })
		await waitFor(() => expect(overlay()).toBeNull())
		expect(status()).toHaveTextContent('')
		expect(region()).not.toHaveClass('base-image-map-3d__viewport--empty')
	})

	it('ошибка рендерера важнее: показан план и сообщение о запуске 3D', async () => {
		const result = render(BaseImageMap3D, {
			props: {
				data: { layers: [], objects: [] },
				rendererFactory: () => {
					throw new Error('no gl')
				},
			},
		})
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Не удалось запустить 3D'))
		expect(screen.getByRole('status')).not.toHaveClass('base-image-map-3d__status--hidden')
		result.unmount()
	})
})

describe('BaseImageMap3D: объект svg без фигуры', () => {
	const layer = { id: 'u', title: 'U', svg: SVG, width: 800, height: 400 }
	const object = (id: string, elementId: string) => ({ id, type: 'svg', title: id, elementId, layer: 'u' }) as const

	it('предупреждает в dev о каждом объекте, для которого в SVG нет элемента или он скрыт; найденные — молча', async () => {
		const hidden =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" x="1" y="1" width="9" height="9"/><rect id="ghost" display="none" width="9" height="9"/></svg>'
		const data = {
			layers: [{ ...layer, svg: hidden }],
			objects: [object('hall', 'hall'), object('ghost', 'ghost'), object('typo', 'hal')],
		}
		const { renderer } = await renderStates(data)
		await waitFor(() => expect(warn).toHaveBeenCalledWith(expect.stringContaining('объект «ghost» в 3D не показан')))
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('для элемента «hal»'))
		expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('объект «hall»'))
		expect(renderer.render).toBeDefined()
	})
})
