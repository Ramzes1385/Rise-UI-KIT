import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import BaseTour from '../ui/BaseTour.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'
import type { TourStep } from '../types/BaseTour.types'

vi.mock('@composables/overlay/useScrollLock', () => ({
	useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }),
}))

const STEPS: TourStep[] = [
	{ target: '#step-1', title: 'Шаг 1', content: 'Первый' },
	{ target: '#step-2', title: 'Шаг 2', content: 'Второй' },
]
const NO_TARGET: TourStep[] = [{ title: 'Без цели', content: 'По центру' }]
const PARTS = [
	'overlay',
	'card',
	'panel',
	'header',
	'title',
	'close',
	'content',
	'footer',
	'progress',
	'dot',
	'counter',
	'actions',
] as const

const part = (name: string) => document.querySelector(`.base-tour__${name}`)

describe('BaseTour: проп ui', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="step-1">A</div><div id="step-2">B</div>'
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('без ui — только классы кита на частях', async () => {
		render(BaseTour, { props: { isOpen: true, steps: NO_TARGET } })
		await screen.findByText('Без цели')

		expect(part('panel')).toHaveAttribute('class', 'base-tour__panel')
		expect(part('footer')).toHaveAttribute('class', 'base-tour__footer')
	})

	it('классы ui добавляются к частям', async () => {
		const ui = Object.fromEntries(['root', ...PARTS].map(name => [name, `own-${name}`]))
		render(BaseTour, { props: { isOpen: true, steps: NO_TARGET, ui } })
		await screen.findByText('Без цели')

		expect(document.querySelector('.base-tour')).toHaveClass('own-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-tour__${name}`, `own-${name}`)
	})

	it('классы ui на подсветке, стрелке и полосе прогресса', async () => {
		const steps = Array.from({ length: 10 }, (_, index) => ({ target: '#step-1', title: `Шаг ${index + 1}` }))
		const ui = { spotlight: 'own-spot', arrow: 'own-arrow', 'progress-bar': 'own-bar', 'progress-bar-fill': 'own-fill' }
		render(BaseTour, { props: { isOpen: true, steps, ui } })
		await screen.findByText('Шаг 1')

		expect(part('spotlight')).toHaveClass('own-spot')
		expect(part('progress-bar')).toHaveClass('own-bar')
		expect(part('progress-bar-fill')).toHaveClass('own-fill')
	})

	it('классы из defaults.BaseTour.ui плагина склеиваются с классами экземпляра', async () => {
		render(BaseTour, {
			props: { isOpen: true, steps: NO_TARGET, ui: { panel: 'own-panel' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTour: { ui: { root: 'app-root', panel: 'app-panel' } } } })] },
		})
		await screen.findByText('Без цели')

		expect(document.querySelector('.base-tour')).toHaveClass('app-root')
		expect(part('panel')).toHaveAttribute('class', 'base-tour__panel app-panel own-panel')
	})
})

describe('BaseTour: анимация', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="step-1">A</div><div id="step-2">B</div>'
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('по умолчанию — scale на слое и карточке', async () => {
		render(BaseTour, { props: { isOpen: true, steps: NO_TARGET } })
		await screen.findByText('Без цели')

		expect(document.querySelector('.base-tour')).toHaveClass('base-tour--animation-scale')
		expect(part('card')).toHaveClass('base-tour__card--animation-scale')
	})

	it('заданная анимация и умолчание из плагина', async () => {
		render(BaseTour, {
			props: { isOpen: true, steps: NO_TARGET },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTour: { animation: 'slide' } } })] },
		})
		await screen.findByText('Без цели')
		expect(part('card')).toHaveClass('base-tour__card--animation-slide')

		document.body.innerHTML = ''
		render(BaseTour, { props: { isOpen: true, steps: NO_TARGET, animation: 'none' } })
		await screen.findByText('Без цели')
		expect(document.querySelector('.base-tour')).toHaveClass('base-tour--animation-none')
		expect(part('card')).toHaveClass('base-tour__card--animation-none')
	})

	it('слой тура проявляется через Transition base-tour', async () => {
		render(BaseTour, { props: { isOpen: true, steps: NO_TARGET }, global: { stubs: { Transition: false } } })
		await screen.findByText('Без цели')

		expect(document.querySelector('.base-tour')).toBeInTheDocument()
	})
})

describe('BaseTour: подсветка и прогресс', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="step-1">A</div><div id="step-2">B</div>'
	})

	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('подсветка позиционируется transform, без top/left; радиус без пропа — из стилей', async () => {
		render(BaseTour, { props: { isOpen: true, steps: STEPS } })
		await screen.findByText('Шаг 1')

		const spotlight = part('spotlight') as HTMLElement
		await vi.waitFor(() => expect(spotlight).not.toHaveClass('base-tour__spotlight--focusing'), { timeout: 2000 })
		expect(spotlight.style.transform).toMatch(/^translate\(/)
		expect(spotlight.style.top).toBe('')
		expect(spotlight.style.left).toBe('')
		expect(spotlight.style.borderRadius).toBe('')
	})

	it('радиус из пропа — inline', async () => {
		render(BaseTour, { props: { isOpen: true, steps: STEPS, radius: 12 } })
		await screen.findByText('Шаг 1')

		await vi.waitFor(() => expect((part('spotlight') as HTMLElement).style.borderRadius).toBe('12px'), { timeout: 2000 })
	})
})

describe('BaseTour: тема и движение области', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('слой тура наследует data-rise-theme, data-theme и data-rise-motion места в разметке', async () => {
		const Host = defineComponent({
			setup: () => () =>
				h('div', { 'data-rise-theme': 'violet', 'data-theme': 'dark', 'data-rise-motion': 'subtle' }, [
					h(BaseTour, { isOpen: true, steps: NO_TARGET }),
				]),
		})
		render(Host)
		await screen.findByText('Без цели')

		const root = document.querySelector('.base-tour')
		expect(root).toHaveAttribute('data-rise-theme', 'violet')
		expect(root).toHaveAttribute('data-theme', 'dark')
		expect(root).toHaveAttribute('data-rise-motion', 'subtle')
	})
})
