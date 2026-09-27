/**
 * Unit-тесты BaseSegmented: группа radio, имя, варианты и состояния.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseSegmented from '../ui/BaseSegmented.vue'
import type { SegmentedOption } from '../model/BaseSegmented.types'

const OPTIONS: SegmentedOption[] = [
	{ value: 'day', label: 'День', icon: 'calendar' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'year', label: 'Год', isDisabled: true },
]

describe('BaseSegmented', () => {
	it('radiogroup с именем из заголовка; сегменты — radio с общим name, выбранный отмечен', () => {
		const { container } = render(BaseSegmented, { props: { options: OPTIONS, modelValue: 'week', label: 'Период' } })

		expect(screen.getByRole('radiogroup', { name: 'Период' })).toBeInTheDocument()
		const radios = screen.getAllByRole('radio') as HTMLInputElement[]
		expect(radios).toHaveLength(3)
		expect(new Set(radios.map(radio => radio.name)).size).toBe(1)
		expect(screen.getByRole('radio', { name: 'Неделя' })).toBeChecked()
		expect(screen.getByRole('radio', { name: 'Год' })).toBeDisabled()
		expect(container.querySelector('.base-segmented__segment--checked')).toHaveTextContent('Неделя')
		expect(container.querySelector('.base-segmented__icon')).not.toBeNull()
	})

	it('имя без заголовка — ariaLabel; свой name; isBlock и вариант', () => {
		const { container } = render(BaseSegmented, { props: { options: OPTIONS, ariaLabel: 'Вид', name: 'view', isBlock: true, variant: 'soft' } })

		expect(screen.getByRole('radiogroup', { name: 'Вид' })).toBeInTheDocument()
		expect((screen.getAllByRole('radio')[0] as HTMLInputElement).name).toBe('view')
		expect(container.querySelector('.base-segmented')).toHaveClass('base-segmented--block', 'base-segmented--soft')
	})

	it('ошибка описывает группу; isDisabled отключает все сегменты', () => {
		render(BaseSegmented, { props: { options: OPTIONS, label: 'Период', error: 'Выберите период', isDisabled: true } })

		expect(screen.getByRole('radiogroup', { name: 'Период' })).toHaveAccessibleDescription('Выберите период')
		for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled()
	})
})
