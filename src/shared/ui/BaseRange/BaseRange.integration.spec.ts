/**
 * Integration-тесты для BaseRange.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseRange from './BaseRange.vue'

describe('BaseRange integration', () => {
	it('должен эмитить update:modelValue при клике на трек', async () => {
		const { container, emitted } = render(BaseRange, {
			props: { modelValue: 0, min: 0, max: 100 },
		})

		const track = container.querySelector('.base-range__track-wrapper')
		if (!track) throw new Error('Track not found')

		// Эмулируем клик в середине трека
		// В тестах getBoundingClientRect возвращает нули, поэтому логика getValueFromEvent может выдать min
		// Но мы проверяем сам факт вызова события
		await fireEvent.mouseDown(track, { clientX: 50 })
		await fireEvent.mouseUp(window)

		expect(emitted()).toHaveProperty('update:modelValue')
	})
})
