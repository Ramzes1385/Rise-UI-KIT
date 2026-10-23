import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseAnchor from '../ui/BaseAnchor.vue'
import { render } from '@testing-library/vue'
import type { AnchorItem } from '../types/BaseAnchor.types'

const ITEMS: AnchorItem[] = [
	{ id: 'intro', label: 'Введение' },
	{ id: 'setup', label: 'Установка', children: [{ id: 'setup-npm', label: 'Через npm' }] },
	{ id: 'usage', label: 'Использование' },
]

const LINK_HEIGHT = 28

function box([left, top, width, height]: [number, number, number, number]): DOMRect {
	return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function measure(this: Element): DOMRect {
	if (this.classList.contains('base-anchor')) return box([10, 100, 200, 160])
	const items = [...document.querySelectorAll('[data-indicator-item]')]
	const index = items.indexOf(this)
	if (index < 0) return box([0, 0, 0, 0])
	return box([11, 100 + index * (LINK_HEIGHT + 2), 199, LINK_HEIGHT + index])
}

describe('BaseAnchor: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseAnchor, { props: { items: ITEMS } })

		expect(container.querySelector('nav')).toHaveAttribute('class', 'base-anchor base-anchor--vertical')
		expect(container.querySelector('ol')).toHaveAttribute('class', 'base-anchor__list')
		expect(container.querySelector('li')).toHaveAttribute('class', 'base-anchor__item')
		expect(container.querySelectorAll('a')[1]).toHaveAttribute('class', 'base-anchor__link')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseAnchor, {
			props: {
				items: ITEMS,
				variant: 'soft',
				customClass: { root: 'own-root', link: 'own-link' },
				ui: { root: 'u-root', list: 'u-list', item: 'u-item', link: 'u-link', indicator: 'u-indicator' },
			},
		})
		await nextTick()

		expect(container.querySelector('nav')).toHaveClass('base-anchor', 'u-root', 'base-anchor--soft', 'own-root')
		expect(container.querySelector('ol')).toHaveClass('base-anchor__list', 'u-list')
		expect(container.querySelector('li')).toHaveClass('base-anchor__item', 'u-item')
		expect(container.querySelector('a')).toHaveClass('base-anchor__link', 'u-link', 'base-anchor__link--active', 'own-link')
	})

	it('классы из defaults.BaseAnchor.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAnchor, {
			props: { items: ITEMS, ui: { link: 'own-link' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAnchor: { ui: { root: 'app-root', link: 'app-link' } } } })] },
		})

		expect(container.querySelector('nav')).toHaveClass('app-root')
		expect(container.querySelectorAll('a')[1]).toHaveAttribute('class', 'base-anchor__link app-link own-link')
	})
})

describe('BaseAnchor: индикатор текущего пункта', () => {
	let frames: FrameRequestCallback[]

	const indicator = (container: Element) => container.querySelector('.base-anchor__indicator')
	const nav = (container: Element) => container.querySelector<HTMLElement>('nav')!

	function flushFrames(): void {
		while (frames.length) frames.shift()!(0)
	}

	beforeEach(() => {
		frames = []
		vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(measure)
		vi.stubGlobal(
			'requestAnimationFrame',
			vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
		)
	})

	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
		document.body.innerHTML = ''
	})

	it('один индикатор на оглавление: пункты — data-indicator-item, позиция и размер — переменные на <nav>', async () => {
		const { container } = render(BaseAnchor, { props: { items: ITEMS } })
		await nextTick()

		expect(container.querySelectorAll('.base-anchor__indicator')).toHaveLength(1)
		expect(indicator(container)).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelectorAll('a[data-indicator-item]')).toHaveLength(4)
		expect(nav(container).style.getPropertyValue('--indicator-x')).toBe('1px')
		expect(nav(container).style.getPropertyValue('--indicator-y')).toBe('0px')
		expect(nav(container).style.getPropertyValue('--indicator-w')).toBe('199px')
		expect(nav(container).style.getPropertyValue('--indicator-h')).toBe(`${LINK_HEIGHT}px`)
	})

	it('смена текущего пункта — индикатор переезжает: новые --indicator-y и --indicator-h; переход включается после первого кадра', async () => {
		const { container, rerender } = render(BaseAnchor, { props: { items: ITEMS } })
		await nextTick()
		expect(indicator(container)).toHaveClass('base-anchor__indicator--instant')
		flushFrames()
		await nextTick()
		expect(indicator(container)).not.toHaveClass('base-anchor__indicator--instant')

		await rerender({ active: 'usage' })
		await nextTick()

		expect(nav(container).style.getPropertyValue('--indicator-y')).toBe(`${3 * (LINK_HEIGHT + 2)}px`)
		expect(nav(container).style.getPropertyValue('--indicator-h')).toBe(`${LINK_HEIGHT + 3}px`)
		expect(indicator(container)).not.toHaveClass('base-anchor__indicator--instant')
	})

	it('пресет data-rise-motion="none" — индикатор сразу на месте: класс --instant и после кадров, и после смены пункта', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = render(BaseAnchor, { props: { items: ITEMS } })
		await nextTick()
		flushFrames()
		await nextTick()
		expect(indicator(container)).toHaveClass('base-anchor__indicator--instant')

		await rerender({ active: 'setup' })
		await nextTick()

		expect(nav(container).style.getPropertyValue('--indicator-y')).toBe(`${LINK_HEIGHT + 2}px`)
		expect(indicator(container)).toHaveClass('base-anchor__indicator--instant')
	})

	it('prefers-reduced-motion: reduce — индикатор с классом --instant', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		const { container } = render(BaseAnchor, { props: { items: ITEMS, direction: 'horizontal' } })
		await nextTick()
		flushFrames()
		await nextTick()

		expect(indicator(container)).toHaveClass('base-anchor__indicator--instant')
	})

	it('текущий пункт не найден среди ссылок — индикатора нет', async () => {
		const { container, rerender } = render(BaseAnchor, { props: { items: ITEMS } })
		await nextTick()

		await rerender({ active: 'missing' })
		await nextTick()

		expect(indicator(container)).toBeNull()
		expect(container.querySelector('[aria-current]')).toBeNull()
	})
})
