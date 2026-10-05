import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseSegmented from '../ui/BaseSegmented.vue'
import userEvent from '@testing-library/user-event'
import { SEGMENTED_PARTS } from '../types/BaseSegmented.types'
import { render, screen, waitFor } from '@testing-library/vue'
import type { SegmentedOption } from '../types/BaseSegmented.types'

const OPTIONS: SegmentedOption[] = [
	{ value: 'day', label: 'День', icon: 'calendar' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'year', label: 'Год', isDisabled: true },
]

function rect(left: number, width: number): DOMRect {
	return { left, top: 10, width, height: 28, right: left + width, bottom: 38, x: left, y: 10, toJSON: () => ({}) } as DOMRect
}

function mockLayout(): void {
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		if (this.classList.contains('base-segmented__track')) return rect(100, 300)
		const segments = [...(this.parentElement?.querySelectorAll('[data-indicator-item]') ?? [])]
		return rect(102 + segments.indexOf(this) * 100, 90 + segments.indexOf(this))
	})
}

function renderSegmented(initial: string | null, wrapperAttrs = '') {
	const model = ref<string | number | null>(initial)
	const { container } = render({
		components: { BaseSegmented },
		setup: () => ({ model, options: OPTIONS }),
		template: `<div ${wrapperAttrs}><BaseSegmented v-model="model" :options="options" aria-label="Период" /></div>`,
	})
	return { model, track: container.querySelector<HTMLElement>('.base-segmented__track')! }
}

const indicatorOf = (track: HTMLElement) => track.querySelector('.base-segmented__indicator')

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('BaseSegmented: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, модификаторы и customClass сохраняются', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...SEGMENTED_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseSegmented, {
			props: {
				options: OPTIONS,
				modelValue: 'day',
				label: 'Период',
				error: 'Выберите период',
				isBlock: true,
				customClass: { root: 'own-root', segment: 'own-segment' },
				ui,
			},
		})
		const root = container.querySelector('.base-segmented')!
		await nextTick()

		expect(root).toHaveClass('u-root', 'base-segmented--block', 'base-segmented--error', 'own-root')
		for (const part of SEGMENTED_PARTS) expect(root.querySelector(`.base-segmented__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-segmented__segment')).toHaveClass('base-segmented__segment--checked', 'own-segment')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = render(BaseSegmented, {
			props: { options: OPTIONS, modelValue: 'week', ariaLabel: 'Период', ui: { indicator: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSegmented: { ui: { root: 'app-root', indicator: 'app' } } } })] },
		})
		const root = container.querySelector('.base-segmented')!
		await nextTick()

		expect(root).toHaveClass('base-segmented', 'app-root')
		expect(root.querySelector('.base-segmented__text')).toHaveAttribute('class', 'base-segmented__text')
		expect(root.querySelector('.base-segmented__indicator')).toHaveClass('base-segmented__indicator', 'app', 'own')
	})
})

describe('BaseSegmented: скользящий индикатор', () => {
	it('один индикатор под выбранным сегментом: первый замер без перехода, затем переезд к новому выбору', async () => {
		mockLayout()
		const user = userEvent.setup()
		const { model, track } = renderSegmented('day')
		await nextTick()

		expect(track.querySelectorAll('.base-segmented__indicator')).toHaveLength(1)
		expect(indicatorOf(track)).toHaveAttribute('aria-hidden', 'true')
		expect(indicatorOf(track)).toHaveClass('base-segmented__indicator--instant')
		expect(track.style.getPropertyValue('--indicator-x')).toBe('2px')
		expect(track.style.getPropertyValue('--indicator-w')).toBe('90px')
		await waitFor(() => expect(indicatorOf(track)).not.toHaveClass('base-segmented__indicator--instant'))

		await user.click(screen.getByText('Неделя'))
		expect(model.value).toBe('week')
		await waitFor(() => expect(track.style.getPropertyValue('--indicator-x')).toBe('102px'))
		expect(track.style.getPropertyValue('--indicator-w')).toBe('91px')
		expect(indicatorOf(track)).not.toHaveClass('base-segmented__indicator--instant')
	})

	it('без выбора и при значении не из списка индикатора нет; выбор появился — ставится без перехода', async () => {
		const { model, track } = renderSegmented(null)
		await nextTick()

		expect(indicatorOf(track)).not.toBeInTheDocument()
		expect(track.style.getPropertyValue('--indicator-x')).toBe('')
		model.value = 'month'
		await nextTick()
		expect(indicatorOf(track)).not.toBeInTheDocument()

		model.value = 'week'
		await waitFor(() => expect(indicatorOf(track)).toHaveClass('base-segmented__indicator--instant'))
	})

	it('выбранный сегмент отключён или вся группа отключена — индикатор приглушён', async () => {
		const { model, track } = renderSegmented('year')
		await nextTick()

		expect(indicatorOf(track)).toHaveClass('base-segmented__indicator--disabled')
		model.value = 'day'
		await nextTick()
		expect(indicatorOf(track)).not.toHaveClass('base-segmented__indicator--disabled')

		const disabled = render(BaseSegmented, { props: { options: OPTIONS, modelValue: 'day', ariaLabel: 'Вид', isDisabled: true } })
		await nextTick()
		expect(disabled.container.querySelector('.base-segmented__indicator')).toHaveClass('base-segmented__indicator--disabled')
	})

	it('пресет none и prefers-reduced-motion: индикатор сразу в конечном положении', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		mockLayout()
		const { model, track } = renderSegmented('day', 'data-rise-motion="none"')
		await nextTick()

		model.value = 'week'
		await nextTick()
		expect(track.style.getPropertyValue('--indicator-x')).toBe('102px')
		expect(track.querySelector('.base-segmented__segment--checked')).toHaveTextContent('Неделя')
	})
})
