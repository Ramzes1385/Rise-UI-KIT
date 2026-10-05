import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseCountdown from '../ui/BaseCountdown.vue'

const NOW = new Date('2026-10-02T12:00:00Z').getTime()
const TO = NOW + 75_000

describe('BaseCountdown: проп ui', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(NOW)
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it('без ui — только классы кита', () => {
		const { container } = render(BaseCountdown, { props: { to: TO, format: ['minutes', 'seconds'] } })

		expect(container.querySelector('.base-countdown__unit')).toHaveAttribute('class', 'base-countdown__unit')
		expect(container.querySelector('.base-countdown__value')).toHaveAttribute('class', 'base-countdown__value')
		expect(container.querySelector('.base-countdown__caption')).toHaveAttribute('class', 'base-countdown__caption')
		expect(container.querySelector('.base-countdown__display')).toHaveAttribute('class', 'base-countdown__display')
		expect(container.querySelector('.base-countdown__digit')).toHaveAttribute('class', 'base-countdown__digit')
		expect(container.querySelector('.base-countdown__slot')).toHaveAttribute('class', 'base-countdown__slot')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = {
			root: 'u-root',
			display: 'u-display',
			spoken: 'u-spoken',
			unit: 'u-unit',
			value: 'u-value',
			caption: 'u-caption',
			slot: 'u-slot',
			digit: 'u-digit',
		}
		const { container } = render(BaseCountdown, {
			props: { to: TO, format: ['minutes', 'seconds'], variant: 'soft', customClass: { unit: 'own-unit' }, ui },
		})
		const root = container.querySelector('.base-countdown')!

		expect(root).toHaveClass('u-root', 'base-countdown--soft', 'base-countdown--blocks', 'base-countdown--digits-roll')
		expect(container.querySelector('.base-countdown__display')).toHaveClass('u-display')
		expect(container.querySelector('.base-countdown__spoken')).toHaveClass('u-spoken')
		expect(container.querySelector('.base-countdown__unit')).toHaveClass('u-unit', 'own-unit')
		expect(container.querySelector('.base-countdown__value')).toHaveClass('u-value')
		expect(container.querySelector('.base-countdown__caption')).toHaveClass('u-caption')
		expect(container.querySelector('.base-countdown__digit')).toHaveClass('u-digit')
		expect(container.querySelector('.base-countdown__slot')).toHaveClass('u-slot')
	})

	it('строка и окончание: части clock и finished', async () => {
		const { container } = render(BaseCountdown, {
			props: { to: NOW + 1000, layout: 'inline', ui: { clock: 'u-clock', finished: 'u-finished' } },
			slots: { finished: 'Началось' },
		})

		expect(container.querySelector('.base-countdown__clock')).toHaveClass('u-clock')
		expect(container.querySelector('.base-countdown__slot--static')).toHaveClass('base-countdown__slot')
		await vi.advanceTimersByTimeAsync(1000)
		expect(container.querySelector('.base-countdown__finished')).toHaveClass('u-finished')
	})

	it('классы из defaults.BaseCountdown.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseCountdown, {
			props: { to: TO, format: ['seconds'], ui: { digit: 'own-digit' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCountdown: { ui: { root: 'app-root', digit: 'app-digit' } } } })] },
		})

		expect(container.querySelector('.base-countdown')).toHaveClass('base-countdown', 'app-root')
		expect(container.querySelector('.base-countdown__digit')).toHaveAttribute('class', 'base-countdown__digit app-digit own-digit')
	})
})
