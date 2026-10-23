import '@testing-library/jest-dom/vitest'
import { defineComponent } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseTooltip from '../ui/BaseTooltip.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const SLOTS = { default: '<button type="button">Цель</button>' }

const popup = async (): Promise<HTMLElement> => screen.findByRole('tooltip')

afterEach(() => {
	document.body.innerHTML = ''
})

describe('BaseTooltip: проп ui', () => {
	it('без ui — только классы кита: обёртка, подсказка и текст', async () => {
		const { container } = render(BaseTooltip, { props: { text: 'Подсказка', isAlwaysVisible: true }, slots: SLOTS })
		const tooltip = await popup()

		expect(container.querySelector('.base-tooltip')).toHaveAttribute('class', 'base-tooltip')
		expect(tooltip).toHaveClass('base-tooltip-popup', 'base-tooltip-popup--top')
		expect(tooltip).not.toHaveClass('base-tooltip__popup')
		expect(tooltip.querySelector('.base-tooltip__text')).toHaveClass('base-text')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', async () => {
		const { container } = render(BaseTooltip, {
			props: {
				text: 'Подсказка',
				isAlwaysVisible: true,
				customClass: { root: 'own-root', tooltip: 'own-popup' },
				ui: { root: 'u-root', popup: 'u-popup', text: 'u-text' },
			},
			slots: SLOTS,
		})
		const tooltip = await popup()

		expect(container.querySelector('.base-tooltip')).toHaveClass('u-root', 'own-root')
		expect(tooltip.className).toMatch(/^base-tooltip-popup u-popup /)
		expect(tooltip).toHaveClass('own-popup')
		expect(tooltip.querySelector('.base-tooltip__text')).toHaveClass('u-text')
	})

	it('классы из defaults.BaseTooltip.ui склеиваются с классами экземпляра', async () => {
		render(BaseTooltip, {
			props: { text: 'Подсказка', isAlwaysVisible: true, ui: { popup: 'own-popup' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTooltip: { ui: { popup: 'app-popup' } } } })] },
		})

		expect((await popup()).className).toMatch(/^base-tooltip-popup app-popup own-popup /)
	})
})

describe('BaseTooltip: проп animation', () => {
	it('по умолчанию — fade', async () => {
		render(BaseTooltip, { props: { text: 'Подсказка', isAlwaysVisible: true }, slots: SLOTS })

		expect(await popup()).toHaveClass('base-tooltip-popup--animation-fade')
	})

	it('заданная анимация — модификатор подсказки', async () => {
		render(BaseTooltip, { props: { text: 'Подсказка', isAlwaysVisible: true, animation: 'slide' }, slots: SLOTS })

		expect(await popup()).toHaveClass('base-tooltip-popup--animation-slide')
	})

	it('умолчание из defaults.BaseTooltip.animation плагина', async () => {
		render(BaseTooltip, {
			props: { text: 'Подсказка', isAlwaysVisible: true },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTooltip: { animation: 'pop' } } })] },
		})

		expect(await popup()).toHaveClass('base-tooltip-popup--animation-pop')
	})

	it('подсказка в теле документа наследует тему и пресет движения области триггера', async () => {
		const Host = defineComponent({
			components: { BaseTooltip },
			template: `
				<div data-theme="dark" data-rise-theme="violet" data-rise-motion="subtle">
					<BaseTooltip text="Подсказка" is-always-visible><button type="button">Цель</button></BaseTooltip>
				</div>
			`,
		})
		const { container } = render(Host)
		const tooltip = await popup()

		await waitFor(() => expect(tooltip).toHaveAttribute('data-rise-motion', 'subtle'))
		expect(tooltip).toHaveAttribute('data-rise-theme', 'violet')
		expect(tooltip).toHaveAttribute('data-theme', 'dark')
		expect(container.contains(tooltip)).toBe(false)
	})
})

describe('BaseTooltip: цикл кадров без requestAnimationFrame (FOLLOW_UPS № 80)', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('видимая подсказка размонтируется после сноса окружения без ошибки', async () => {
		const { unmount } = render(BaseTooltip, { props: { text: 'Подсказка', isAlwaysVisible: true }, slots: SLOTS })
		await popup()
		vi.stubGlobal('cancelAnimationFrame', undefined)
		vi.stubGlobal('requestAnimationFrame', undefined)

		expect(() => unmount()).not.toThrow()
	})

	it('открытие без requestAnimationFrame не запускает цикл и не падает', async () => {
		vi.stubGlobal('requestAnimationFrame', undefined)
		render(BaseTooltip, { props: { text: 'Подсказка', isAlwaysVisible: true }, slots: SLOTS })

		expect(await popup()).toBeInTheDocument()
	})
})
