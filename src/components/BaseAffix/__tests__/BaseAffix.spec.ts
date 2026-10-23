import '@testing-library/jest-dom/vitest'
import { createSSRApp, h } from 'vue'
import BaseAffix from '../ui/BaseAffix.vue'
import { createUiKitPlugin } from '@/plugin'
import { renderToString } from 'vue/server-renderer'
import { render, screen } from '@testing-library/vue'

interface FakeEntryInit {
	intersectionRatio: number
	boundingClientRect: { top: number; bottom: number }
	rootBounds: { top: number; bottom: number } | null
}

class FakeIntersectionObserver {
	static instances: FakeIntersectionObserver[] = []
	readonly observe = vi.fn()
	readonly disconnect = vi.fn()
	readonly callback: (entries: IntersectionObserverEntry[]) => void
	readonly options: IntersectionObserverInit
	constructor(callback: (entries: IntersectionObserverEntry[]) => void, options: IntersectionObserverInit) {
		this.callback = callback
		this.options = options
		FakeIntersectionObserver.instances.push(this)
	}
	trigger(init: FakeEntryInit): void {
		this.callback([init as unknown as IntersectionObserverEntry])
	}
}

function lastObserver(): FakeIntersectionObserver {
	return FakeIntersectionObserver.instances[FakeIntersectionObserver.instances.length - 1]
}

const STUCK_TOP: FakeEntryInit = {
	intersectionRatio: 0.5,
	boundingClientRect: { top: -10, bottom: 40 },
	rootBounds: { top: 0, bottom: 800 },
}
const FREE: FakeEntryInit = {
	intersectionRatio: 1,
	boundingClientRect: { top: 100, bottom: 150 },
	rootBounds: { top: 0, bottom: 800 },
}
const STUCK_BOTTOM: FakeEntryInit = {
	intersectionRatio: 0.5,
	boundingClientRect: { top: 770, bottom: 820 },
	rootBounds: { top: 0, bottom: 800 },
}

function rootOf(container: Element): HTMLElement {
	return container.firstElementChild as HTMLElement
}

describe('BaseAffix unit', () => {
	beforeEach(() => {
		FakeIntersectionObserver.instances = []
		vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		document.body.innerHTML = ''
	})

	describe('рендер и стили', () => {
		it('рендерит слот в div.base-affix с top 0px по умолчанию', () => {
			const { container } = render(BaseAffix, { slots: { default: 'Содержимое' } })
			const root = rootOf(container)
			expect(screen.getByText('Содержимое')).toBeInTheDocument()
			expect(root.tagName).toBe('DIV')
			expect(root).toHaveClass('base-affix')
			expect(root).not.toHaveClass('base-affix--fixed')
			expect(root).not.toHaveClass('base-affix--shadow')
			expect(root.style.top).toBe('0px')
			expect(root.style.bottom).toBe('')
		})

		it('offsetTop задаёт top в px', () => {
			const { container } = render(BaseAffix, { props: { offsetTop: 24 } })
			expect(rootOf(container).style.top).toBe('24px')
			expect(rootOf(container).style.bottom).toBe('')
		})

		it('только offsetBottom не задаёт top', () => {
			const { container } = render(BaseAffix, { props: { offsetBottom: 16 } })
			expect(rootOf(container).style.top).toBe('')
			expect(rootOf(container).style.bottom).toBe('16px')
		})

		it('оба отступа задают оба значения', () => {
			const { container } = render(BaseAffix, { props: { offsetTop: 8, offsetBottom: 12 } })
			expect(rootOf(container).style.top).toBe('8px')
			expect(rootOf(container).style.bottom).toBe('12px')
		})

		it('hasShadow, customClass, ui и sizeScale', () => {
			const { container } = render(BaseAffix, {
				props: { hasShadow: true, sizeScale: 125, customClass: { root: 'my-root' }, ui: { root: 'own-root' } },
			})
			const root = rootOf(container)
			expect(root).toHaveClass('base-affix--shadow', 'my-root', 'own-root')
			expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('defaults.BaseAffix плагина применяются', () => {
			const { container } = render(BaseAffix, {
				global: { plugins: [createUiKitPlugin({ defaults: { BaseAffix: { hasShadow: true } } })] },
			})
			expect(rootOf(container)).toHaveClass('base-affix--shadow')
		})
	})

	describe('наблюдатель', () => {
		it('наблюдает за корнем с rootMargin для offsetTop 0 и root null', () => {
			const { container } = render(BaseAffix)
			const observer = lastObserver()
			expect(observer.observe).toHaveBeenCalledWith(rootOf(container))
			expect(observer.options.root).toBeNull()
			expect(observer.options.rootMargin).toBe('-1px 0px 0px 0px')
			expect(observer.options.threshold).toEqual([0, 1])
		})

		it('rootMargin зависит от offsetTop и offsetBottom', () => {
			render(BaseAffix, { props: { offsetTop: 10 } })
			expect(lastObserver().options.rootMargin).toBe('-11px 0px 0px 0px')
			render(BaseAffix, { props: { offsetBottom: 16 } })
			expect(lastObserver().options.rootMargin).toBe('0px 0px -17px 0px')
			render(BaseAffix, { props: { offsetTop: 0, offsetBottom: 0 } })
			expect(lastObserver().options.rootMargin).toBe('-1px 0px -1px 0px')
		})

		it('селектор находит элемент-корень наблюдателя', () => {
			const scroller = document.createElement('div')
			scroller.id = 'scroller'
			document.body.appendChild(scroller)
			render(BaseAffix, { props: { target: '#scroller' } })
			expect(lastObserver().options.root).toBe(scroller)
		})

		it('HTMLElement в target становится корнем наблюдателя', () => {
			const scroller = document.createElement('div')
			render(BaseAffix, { props: { target: scroller } })
			expect(lastObserver().options.root).toBe(scroller)
		})

		it('селектор без совпадений даёт root null', () => {
			render(BaseAffix, { props: { target: '#missing' } })
			expect(lastObserver().options.root).toBeNull()
		})
	})

	describe('прилипание', () => {
		it('прилипает сверху: класс, слот-проп isFixed и событие change', async () => {
			const { container, emitted } = render(BaseAffix, {
				slots: { default: ({ isFixed }: { isFixed: boolean }) => h('span', isFixed ? 'прилип' : 'свободен') },
			})
			expect(screen.getByText('свободен')).toBeInTheDocument()
			lastObserver().trigger(STUCK_TOP)
			expect(await screen.findByText('прилип')).toBeInTheDocument()
			expect(rootOf(container)).toHaveClass('base-affix--fixed')
			expect(emitted().change).toEqual([[true]])
		})

		it('повтор того же состояния не эмитит change, возврат эмитит', async () => {
			const { container, emitted } = render(BaseAffix)
			const observer = lastObserver()
			observer.trigger(STUCK_TOP)
			observer.trigger(STUCK_TOP)
			expect(emitted().change).toEqual([[true]])
			observer.trigger(FREE)
			observer.trigger(FREE)
			expect(emitted().change).toEqual([[true], [false]])
			await Promise.resolve()
			expect(rootOf(container)).not.toHaveClass('base-affix--fixed')
		})

		it('свободный элемент без смены значения не эмитит change', () => {
			const { emitted } = render(BaseAffix)
			lastObserver().trigger(FREE)
			expect(emitted().change).toBeUndefined()
		})

		it('без rootBounds элемент не считается прилипшим', () => {
			const { emitted } = render(BaseAffix)
			lastObserver().trigger({ ...STUCK_TOP, rootBounds: null })
			expect(emitted().change).toBeUndefined()
		})

		it('ratio 1 перекрывает положение элемента', () => {
			const { emitted } = render(BaseAffix)
			lastObserver().trigger({ ...STUCK_TOP, intersectionRatio: 1 })
			expect(emitted().change).toBeUndefined()
		})

		it('при заданном top положение внизу не прилипает', () => {
			const { emitted } = render(BaseAffix, { props: { offsetTop: 0 } })
			lastObserver().trigger(STUCK_BOTTOM)
			expect(emitted().change).toBeUndefined()
		})

		it('прилипает снизу при заданном offsetBottom', () => {
			const { emitted } = render(BaseAffix, { props: { offsetBottom: 0 } })
			lastObserver().trigger(STUCK_BOTTOM)
			expect(emitted().change).toEqual([[true]])
		})

		it('при только offsetBottom положение сверху не прилипает', () => {
			const { emitted } = render(BaseAffix, { props: { offsetBottom: 0 } })
			lastObserver().trigger(STUCK_TOP)
			expect(emitted().change).toBeUndefined()
		})

		it('учитывает последнюю запись из пачки', () => {
			const { emitted } = render(BaseAffix)
			lastObserver().callback([FREE, STUCK_TOP] as unknown as IntersectionObserverEntry[])
			expect(emitted().change).toEqual([[true]])
		})
	})

	describe('жизненный цикл', () => {
		it('смена offsetTop, offsetBottom и target переподключает наблюдатель', async () => {
			const { rerender } = render(BaseAffix, { props: { offsetTop: 0 } })
			const first = lastObserver()
			await rerender({ offsetTop: 20 })
			const second = lastObserver()
			expect(first.disconnect).toHaveBeenCalledTimes(1)
			expect(second).not.toBe(first)
			expect(second.options.rootMargin).toBe('-21px 0px 0px 0px')

			await rerender({ offsetBottom: 5 })
			const third = lastObserver()
			expect(second.disconnect).toHaveBeenCalledTimes(1)
			expect(third.options.rootMargin).toBe('-21px 0px -6px 0px')

			const scroller = document.createElement('div')
			await rerender({ target: scroller })
			expect(third.disconnect).toHaveBeenCalledTimes(1)
			expect(lastObserver().options.root).toBe(scroller)
		})

		it('размонтирование отключает наблюдатель', () => {
			const { unmount } = render(BaseAffix)
			const observer = lastObserver()
			unmount()
			expect(observer.disconnect).toHaveBeenCalledTimes(1)
		})

		it('без IntersectionObserver рендерится без ошибок и не эмитит change', () => {
			vi.stubGlobal('IntersectionObserver', undefined)
			const { container, emitted, unmount } = render(BaseAffix, { slots: { default: 'Контент' } })
			expect(screen.getByText('Контент')).toBeInTheDocument()
			expect(rootOf(container)).toHaveClass('base-affix')
			expect(emitted().change).toBeUndefined()
			expect(() => unmount()).not.toThrow()
		})

		it('рендерится на сервере без ошибок', async () => {
			const html = await renderToString(createSSRApp({ render: () => h(BaseAffix, null, { default: () => 'SSR' }) }))
			expect(html).toContain('base-affix')
			expect(html).toContain('SSR')
		})
	})
})
