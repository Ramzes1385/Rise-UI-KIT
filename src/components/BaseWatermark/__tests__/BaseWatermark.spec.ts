import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { createSSRApp, h, nextTick } from 'vue'
import BaseWatermark from '../ui/BaseWatermark.vue'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'vue/server-renderer'
import { render, screen, waitFor } from '@testing-library/vue'

function layerOf(container: Element): HTMLElement {
	return container.querySelector('.base-watermark__layer') as HTMLElement
}

function decodedBackground(layer: HTMLElement): string {
	const url = layer.style.backgroundImage.slice(5, -2)
	return decodeURIComponent(url.slice(url.indexOf(',') + 1))
}

function tick(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, 0))
}

describe('BaseWatermark: узор и слой', () => {
	it('текст: слой с data-URI SVG, размером, z-index, opacity и aria-hidden', async () => {
		const { container } = render(BaseWatermark, { props: { content: 'Черновик' } })
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).toContain('url("data:image/svg+xml'))
		expect(layer).toHaveAttribute('aria-hidden', 'true')
		expect(layer.style.backgroundSize).toMatch(/^\d+px \d+px$/)
		expect(layer.style.zIndex).toBe('9')
		expect(layer.style.opacity).toBe('0.15')
		expect(layer.style.backgroundRepeat).toBe('repeat')
		expect(decodedBackground(layer)).toContain('Черновик')
	})

	it('без content и image — только z-index и opacity', async () => {
		const { container } = render(BaseWatermark)
		await tick()
		const layer = layerOf(container)
		expect(layer.style.backgroundImage).toBe('')
		expect(layer.style.backgroundSize).toBe('')
		expect(layer.style.zIndex).toBe('9')
		expect(layer.style.opacity).toBe('0.15')
	})

	it('пустые строки в content — узора нет', async () => {
		const { container } = render(BaseWatermark, { props: { content: ['  ', ''] } })
		await tick()
		expect(layerOf(container).style.backgroundImage).toBe('')
	})

	it('массив строк — несколько text', async () => {
		const { container } = render(BaseWatermark, { props: { content: ['Имя', 'Дата'] } })
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		expect(decodedBackground(layer).match(/<text /g)).toHaveLength(4)
	})

	it('content, rotate, gap, fontSize и textColor пересчитывают узор', async () => {
		const { container, rerender } = render(BaseWatermark, { props: { content: 'A' } })
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		const initial = layer.style.backgroundImage

		await rerender({ content: 'Другой' })
		await waitFor(() => expect(decodedBackground(layer)).toContain('Другой'))

		await rerender({ rotate: 10 })
		await waitFor(() => expect(decodedBackground(layer)).toContain('rotate(10 '))

		await rerender({ textColor: '#ff0000' })
		await waitFor(() => expect(decodedBackground(layer)).toContain('fill="#ff0000"'))

		await rerender({ fontSize: 30 })
		await waitFor(() => expect(decodedBackground(layer)).toContain('font-size="30"'))

		const before = layer.style.backgroundSize
		await rerender({ gap: 300 })
		await waitFor(() => expect(layer.style.backgroundSize).not.toBe(before))
		expect(layer.style.backgroundImage).not.toBe(initial)
	})

	it('смена opacity и zIndex не пересчитывает узор, но обновляет стиль', async () => {
		const { container, rerender } = render(BaseWatermark, { props: { content: 'A' } })
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		const image = layer.style.backgroundImage
		await rerender({ opacity: 0.4, zIndex: 3 })
		expect(layer.style.opacity).toBe('0.4')
		expect(layer.style.zIndex).toBe('3')
		expect(layer.style.backgroundImage).toBe(image)
	})

	it('удаление content убирает узор', async () => {
		const { container, rerender } = render(BaseWatermark, { props: { content: 'A' } })
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		await rerender({ content: undefined })
		await waitFor(() => expect(layer.style.backgroundImage).toBe(''))
	})

	it('слот default идёт до слоя и остаётся доступным; клик по содержимому работает', async () => {
		const onClick = vi.fn()
		const { container } = render(BaseWatermark, {
			props: { content: 'X' },
			slots: { default: () => h('button', { onClick }, 'Открыть') },
		})
		const root = container.querySelector('.base-watermark') as HTMLElement
		expect(root.firstElementChild).toBe(screen.getByRole('button', { name: 'Открыть' }))
		expect(root.lastElementChild).toBe(layerOf(container))
		await userEvent.click(screen.getByRole('button', { name: 'Открыть' }))
		expect(onClick).toHaveBeenCalledTimes(1)
	})
})

class FakeImage {
	static instances: FakeImage[] = []
	naturalWidth = 100
	naturalHeight = 50
	crossOrigin = ''
	onload: (() => void) | null = null
	onerror: (() => void) | null = null
	src = ''
	constructor() {
		FakeImage.instances.push(this)
	}
}

describe('BaseWatermark: картинка', () => {
	beforeEach(() => {
		FakeImage.instances = []
		vi.stubGlobal('Image', FakeImage)
		const context = { scale: vi.fn(), save: vi.fn(), translate: vi.fn(), rotate: vi.fn(), drawImage: vi.fn(), restore: vi.fn() }
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
		vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,AAA')
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('image рисуется через canvas', async () => {
		const { container } = render(BaseWatermark, { props: { image: '/logo.png' } })
		FakeImage.instances[0].onload?.()
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).toContain('data:image/png;base64'))
	})

	it('ошибка загрузки — плитка space с адресом картинки', async () => {
		const { container } = render(BaseWatermark, { props: { image: '/logo.png', height: 20 } })
		FakeImage.instances[0].onerror?.()
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).toBe('url("/logo.png")'))
		expect(layer.style.backgroundRepeat).toBe('space')
		expect(layer.style.backgroundSize).toBe('120px 20px')
	})

	it('без height у запасной плитки размер auto', async () => {
		const { container } = render(BaseWatermark, { props: { image: '/logo.png' } })
		FakeImage.instances[0].onerror?.()
		await waitFor(() => expect(layerOf(container).style.backgroundSize).toBe('120px'))
	})

	it('гонка: при быстрой смене image применяется последний результат', async () => {
		const { container, rerender } = render(BaseWatermark, { props: { image: '/first.png' } })
		await rerender({ image: '/second.png' })
		expect(FakeImage.instances).toHaveLength(2)
		FakeImage.instances[1].onerror?.()
		const layer = layerOf(container)
		await waitFor(() => expect(layer.style.backgroundImage).toBe('url("/second.png")'))
		FakeImage.instances[0].onerror?.()
		await tick()
		expect(layer.style.backgroundImage).toBe('url("/second.png")')
	})
})

describe('BaseWatermark: классы, defaults, SSR', () => {
	it('customClass строкой — на корень', () => {
		const { container } = render(BaseWatermark, { props: { customClass: 'my-root' } })
		expect(container.querySelector('.base-watermark')).toHaveClass('my-root')
	})

	it('customClass объектом — по элементам', () => {
		const { container } = render(BaseWatermark, { props: { customClass: { root: 'my-root', layer: 'my-layer' } } })
		expect(container.querySelector('.base-watermark')).toHaveClass('my-root')
		expect(layerOf(container)).toHaveClass('base-watermark__layer', 'my-layer')
	})

	it('ui из пропа и из defaults плагина склеиваются', () => {
		const { container } = render(BaseWatermark, {
			props: { ui: { layer: 'own-layer' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseWatermark: { ui: { root: 'app-root', layer: 'app-layer' } } } })] },
		})
		expect(container.querySelector('.base-watermark')).toHaveClass('app-root')
		expect(layerOf(container)).toHaveAttribute('class', 'base-watermark__layer app-layer own-layer')
	})

	it('kitDefaults: opacity из defaults плагина, проп перекрывает', () => {
		const plugin = createUiKitPlugin({ defaults: { BaseWatermark: { opacity: 0.5 } } })
		const first = render(BaseWatermark, { global: { plugins: [plugin] } })
		expect(layerOf(first.container).style.opacity).toBe('0.5')
		const second = render(BaseWatermark, { props: { opacity: 0.8 }, global: { plugins: [plugin] } })
		expect(layerOf(second.container).style.opacity).toBe('0.8')
	})

	it('SSR: рендерится без ошибок и без background-image', async () => {
		const app = createSSRApp({ render: () => h(BaseWatermark, { content: 'Черновик' }, () => 'Текст') })
		const html = await renderToString(app)
		expect(html).toContain('base-watermark__layer')
		expect(html).toContain('Текст')
		expect(html).not.toContain('background-image')
	})
})

describe('BaseWatermark: защита isProtected', () => {
	function mountProtected(props: Record<string, unknown> = {}) {
		const view = render(BaseWatermark, { props: { content: 'Секрет', isProtected: true, ...props } })
		const root = view.container.querySelector('.base-watermark') as HTMLElement
		return { ...view, root, layer: layerOf(view.container) }
	}

	it('слой, убранный из корня, возвращается', async () => {
		const { root, layer } = mountProtected()
		layer.remove()
		await waitFor(() => expect(layer.parentNode).toBe(root))
	})

	it('изменённые style, class, hidden и aria-hidden восстанавливаются', async () => {
		const { layer } = mountProtected()
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		await nextTick()
		const style = layer.getAttribute('style')
		const className = layer.getAttribute('class')
		layer.setAttribute('style', 'display:none')
		layer.setAttribute('class', 'x')
		layer.setAttribute('hidden', '')
		layer.setAttribute('aria-hidden', 'false')
		await waitFor(() => expect(layer.getAttribute('style')).toBe(style))
		expect(layer.getAttribute('class')).toBe(className)
		expect(layer).not.toHaveAttribute('hidden')
		expect(layer).toHaveAttribute('aria-hidden', 'true')
	})

	it('удалённый атрибут возвращается', async () => {
		const { layer } = mountProtected()
		layer.removeAttribute('aria-hidden')
		await waitFor(() => expect(layer).toHaveAttribute('aria-hidden', 'true'))
	})

	it('после перерендера (смена opacity) новые значения не откатываются', async () => {
		const { layer, rerender } = mountProtected()
		await waitFor(() => expect(layer.style.backgroundImage).not.toBe(''))
		await rerender({ opacity: 0.6 })
		await tick()
		expect(layer.style.opacity).toBe('0.6')
		layer.style.opacity = '0'
		await waitFor(() => expect(layer.style.opacity).toBe('0.6'))
	})

	it('isProtected → false останавливает защиту, → true включает снова', async () => {
		const { root, layer, rerender } = mountProtected()
		await rerender({ isProtected: false })
		layer.remove()
		await tick()
		expect(layer.parentNode).toBeNull()
		root.append(layer)
		await rerender({ isProtected: true })
		layer.remove()
		await waitFor(() => expect(layer.parentNode).toBe(root))
	})

	it('без isProtected слой не возвращается', async () => {
		const { layer } = mountProtected({ isProtected: false })
		layer.remove()
		await tick()
		expect(layer.parentNode).toBeNull()
	})

	it('после размонтирования наблюдатель отключён', () => {
		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
		const { unmount } = mountProtected()
		unmount()
		expect(disconnect).toHaveBeenCalled()
		disconnect.mockRestore()
	})

	it('колбэк наблюдателя после размонтирования ничего не делает', () => {
		const callbacks: MutationCallback[] = []
		vi.stubGlobal(
			'MutationObserver',
			class {
				constructor(callback: MutationCallback) {
					callbacks.push(callback)
				}
				observe = vi.fn()
				disconnect = vi.fn()
				takeRecords = vi.fn()
			},
		)
		const { unmount } = mountProtected()
		unmount()
		expect(() => callbacks[0]([], {} as MutationObserver)).not.toThrow()
		vi.unstubAllGlobals()
	})

	it('без MutationObserver ничего не падает', () => {
		vi.stubGlobal('MutationObserver', undefined)
		expect(() => mountProtected()).not.toThrow()
		vi.unstubAllGlobals()
	})
})
