import '@testing-library/jest-dom/vitest'
import BaseSegmented from '../ui/BaseSegmented.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { SegmentedOption } from '../types/BaseSegmented.types'

const OPTIONS: SegmentedOption[] = [
	{ value: 'day', label: 'День', icon: 'calendar' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'year', label: 'Год', icon: 'star', isDisabled: true },
]

describe('BaseSegmented: isIconOnly', () => {
	it('подпись сегмента с иконкой скрыта визуально, но остаётся именем radio; без иконки подпись видна', () => {
		const { container } = render(BaseSegmented, {
			props: { options: OPTIONS, modelValue: 'day', ariaLabel: 'Период', isIconOnly: true },
		})

		expect(container.querySelector('.base-segmented')).toHaveClass('base-segmented--icon-only')
		expect(screen.getByRole('radio', { name: 'День' })).toBeChecked()
		const texts = container.querySelectorAll('.base-segmented__text')
		expect(texts[0]).toHaveClass('base-segmented__text--hidden')
		expect(texts[1]).not.toHaveClass('base-segmented__text--hidden')
		expect(container.querySelectorAll('.base-segmented__segment--icon-only')).toHaveLength(2)
		expect(screen.getByRole('radio', { name: 'Год' })).toBeDisabled()
	})

	it('без isIconOnly подписи видны и модификаторов нет', () => {
		const { container } = render(BaseSegmented, { props: { options: OPTIONS, ariaLabel: 'Период' } })

		expect(container.querySelector('.base-segmented')).not.toHaveClass('base-segmented--icon-only')
		expect(container.querySelector('.base-segmented__text--hidden')).toBeNull()
		expect(container.querySelector('.base-segmented__segment--icon-only')).toBeNull()
	})

	it('наведение и фокус показывают подсказку с подписью, обёртки вокруг сегмента нет', async () => {
		const user = userEvent.setup()
		const { container } = render(BaseSegmented, { props: { options: OPTIONS, ariaLabel: 'Период', isIconOnly: true } })

		expect(container.querySelector('.base-segmented__track > .base-segmented__segment')).not.toBeNull()
		expect(container.querySelector('.base-tooltip')).toBeNull()
		await user.hover(screen.getByRole('radio', { name: 'День' }).closest('label')!)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('День')
		await user.unhover(screen.getByRole('radio', { name: 'День' }).closest('label')!)

		await user.tab()
		expect(await screen.findByRole('tooltip')).toHaveTextContent('День')
	})

	it('выбор сегмента по-прежнему уходит в v-model', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSegmented, {
			props: { options: OPTIONS, modelValue: 'week', ariaLabel: 'Период', isIconOnly: true },
		})

		await user.click(screen.getByRole('radio', { name: 'День' }))
		expect(emitted()['update:modelValue']).toEqual([['day']])
		expect(emitted().change).toEqual([['day']])
	})
})
