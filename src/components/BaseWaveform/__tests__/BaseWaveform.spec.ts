import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseWaveform from '../ui/BaseWaveform.vue'
import { render, screen } from '@testing-library/vue'

const PEAKS = [0.2, 1, 0.5, 0.02]

function setup(props: Record<string, unknown> = {}) {
	return render(BaseWaveform, { props: { peaks: PEAKS, duration: 40, label: 'Перемотка', ...props } })
}

describe('BaseWaveform unit', () => {
	it('столбики по амплитудам (не ниже 6%), сыгранная часть — по позиции', () => {
		const { container } = setup({ currentTime: 20 })
		const bars = [...container.querySelectorAll<HTMLElement>('.base-waveform__bar')]
		expect(bars.map(bar => bar.style.height)).toEqual(['20%', '100%', '50%', '6%'])
		expect(bars.map(bar => bar.classList.contains('base-waveform__bar--played'))).toEqual([true, true, false, false])
	})

	it('столбиков столько, сколько помещается по ширине: волна всегда на всю ширину', async () => {
		const observers: Array<() => void> = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				constructor(callback: () => void) {
					observers.push(callback)
				}
				observe(): void {
					observers.at(-1)?.()
				}
				disconnect = vi.fn()
			},
		)
		const style = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ columnGap: '2px' } as CSSStyleDeclaration)
		const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(98)
		const bars = (container: Element): string[] =>
			[...container.querySelectorAll<HTMLElement>('.base-waveform__bar')].map(bar => bar.style.height)

		const wide = setup({ peaks: [0, 1] })
		await nextTick()
		expect(bars(wide.container)).toHaveLength(20)
		expect(bars(wide.container).slice(0, 3)).toEqual(['6%', '6%', `${(2 / 19) * 100}%`])
		const dense = setup({ peaks: Array.from({ length: 40 }, (_, index) => (index % 2 ? 1 : 0.1)) })
		await nextTick()
		expect(new Set(bars(dense.container))).toEqual(new Set(['100%']))

		width.mockReturnValue(10)
		const narrow = setup()
		await nextTick()
		expect(bars(narrow.container)).toHaveLength(8)
		style.mockReturnValue({ columnGap: '' } as CSSStyleDeclaration)
		const unknownGap = setup()
		await nextTick()
		expect(bars(unknownGap.container)).toHaveLength(PEAKS.length)
		narrow.unmount()
		vi.stubGlobal('ResizeObserver', undefined)
		const noObserver = setup()
		await nextTick()
		expect(bars(noObserver.container)).toHaveLength(PEAKS.length)
		vi.unstubAllGlobals()
	})

	it('шкала для скринридера: имя, границы, позиция текстом', () => {
		setup({ currentTime: 12.6, duration: 3725 })
		const slider = screen.getByRole('slider', { name: 'Перемотка' })
		expect(slider).toHaveAttribute('aria-valuemax', '3725')
		expect(slider).toHaveAttribute('aria-valuenow', '13')
		expect(slider).toHaveAttribute('aria-valuetext', '0:00:12 из 1:02:05')
		expect(slider).toHaveAttribute('tabindex', '0')
		expect(slider).not.toHaveAttribute('aria-describedby')
	})

	it('фрагмент: подсветка по долям записи и описание для скринридера', () => {
		const { container } = setup({ selection: { start: 10, end: 30 } })
		const selection = container.querySelector<HTMLElement>('.base-waveform__selection') as HTMLElement
		expect(selection.style.left).toBe('25%')
		expect(selection.style.width).toBe('50%')
		expect(screen.getByRole('slider')).toHaveAccessibleDescription('Фрагмент 0:10–0:30')
	})

	it('нулевая длительность и позиция за концом не ломают вид', () => {
		const { container } = setup({ duration: 0, currentTime: 5, selection: { start: 0, end: 2 } })
		expect(container.querySelectorAll('.base-waveform__bar--played')).toHaveLength(0)
		expect((container.querySelector('.base-waveform__selection') as HTMLElement).style.left).toBe('0%')
	})

	it('отключённая волна: вне порядка Tab и aria-disabled', () => {
		setup({ isDisabled: true })
		const slider = screen.getByRole('slider')
		expect(slider).toHaveAttribute('tabindex', '-1')
		expect(slider).toHaveAttribute('aria-disabled', 'true')
		expect(slider).toHaveClass('base-waveform--disabled')
	})

	it('вариант, масштаб, customClass и класс выделяемой волны', () => {
		const { container } = setup({
			variant: 'soft',
			sizeScale: 125,
			isSelectable: true,
			customClass: { root: 'my-root', bar: 'my-bar', selection: 'my-selection' },
			selection: { start: 1, end: 2 },
		})
		const root = container.querySelector('.base-waveform') as HTMLElement
		expect(root).toHaveClass('base-waveform--soft', 'base-waveform--selectable', 'my-root')
		expect(root.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(container.querySelector('.base-waveform__bar')).toHaveClass('my-bar')
		expect(container.querySelector('.base-waveform__selection')).toHaveClass('my-selection')
	})
})
