import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseWaveform from '../ui/BaseWaveform.vue'

const PEAKS = [0.2, 1, 0.5]
const base = { peaks: PEAKS, duration: 30, label: 'Перемотка' }

function stubReducedMotion(matches: boolean) {
	vi.stubGlobal(
		'matchMedia',
		vi.fn((query: string) => ({
			matches: matches && query === '(prefers-reduced-motion: reduce)',
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		})),
	)
}

describe('BaseWaveform: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = { root: 'u-root', bar: 'u-bar', selection: 'u-selection', hint: 'u-hint' }
		const { container } = render(BaseWaveform, {
			props: { ...base, selection: { start: 5, end: 10 }, ui, customClass: { bar: 'own-bar' } },
		})
		const root = container.querySelector('.base-waveform')!
		expect(root).toHaveClass('base-waveform', 'u-root')
		for (const bar of root.querySelectorAll('.base-waveform__bar')) expect(bar).toHaveClass('u-bar', 'own-bar')
		expect(root.querySelector('.base-waveform__selection')).toHaveClass('u-selection')
		expect(root.querySelector('.base-waveform__hint')).toHaveClass('u-hint')
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = render(BaseWaveform, {
			props: { ...base, ui: { bar: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseWaveform: { ui: { bar: 'app', root: 'app-root' } } } })] },
		})
		expect(container.querySelector('.base-waveform')).toHaveClass('app-root')
		expect(container.querySelector('.base-waveform__bar')).toHaveAttribute('class', 'base-waveform__bar app own')

		const plain = render(BaseWaveform, { props: { ...base, selection: { start: 0, end: 5 } } })
		expect(plain.container.querySelector('.base-waveform__selection')).toHaveAttribute('class', 'base-waveform__selection')
		expect(plain.container.querySelector('.base-waveform__hint')).toHaveAttribute('class', 'base-waveform__hint')
	})
})

describe('BaseWaveform: движение', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('высота столбика — transform: scaleY, раскладка не меняется: inline height нет', async () => {
		const { container, rerender } = render(BaseWaveform, { props: base })
		const bar = container.querySelector<HTMLElement>('.base-waveform__bar')!
		expect(bar.style.height).toBe('')
		expect(bar.style.transform).toBe('scaleY(0.2)')
		await rerender({ peaks: [0.8, 1, 0.5] })
		expect(bar.style.transform).toBe('scaleY(0.8)')
		expect(bar.style.height).toBe('')
	})

	it('прогресс воспроизведения — только класс played, без стилей раскладки', async () => {
		const { container, rerender } = render(BaseWaveform, { props: { ...base, currentTime: 0 } })
		const bars = [...container.querySelectorAll<HTMLElement>('.base-waveform__bar')]
		expect(bars.filter(bar => bar.classList.contains('base-waveform__bar--played'))).toHaveLength(0)
		await rerender({ currentTime: 30 })
		expect(bars.filter(bar => bar.classList.contains('base-waveform__bar--played'))).toHaveLength(3)
		expect(bars.map(bar => bar.style.width)).toEqual(['', '', ''])
	})

	it('при prefers-reduced-motion и пресете none — сразу конечная высота', () => {
		stubReducedMotion(true)
		const reduced = render(BaseWaveform, { props: base })
		expect([...reduced.container.querySelectorAll<HTMLElement>('.base-waveform__bar')].map(bar => bar.style.transform)).toEqual([
			'scaleY(0.2)',
			'scaleY(1)',
			'scaleY(0.5)',
		])
		stubReducedMotion(false)
		const none = render(BaseWaveform, { props: base, global: { plugins: [createUiKitPlugin({ motion: 'none' })] } })
		expect(none.container.querySelector<HTMLElement>('.base-waveform__bar')!.style.transform).toBe('scaleY(0.2)')
	})
})
