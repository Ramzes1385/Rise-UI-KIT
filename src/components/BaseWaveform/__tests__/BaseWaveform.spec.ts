import '@testing-library/jest-dom/vitest'
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
