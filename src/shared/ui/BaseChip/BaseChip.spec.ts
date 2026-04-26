/**
 * Unit-тесты для BaseChip.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseChip from './BaseChip.vue'

describe('BaseChip unit', () => {
	it('должен рендерить контент слота', () => {
		render(BaseChip, {
			slots: { default: 'Main Content' },
		})
		expect(screen.getByText('Main Content')).toBeInTheDocument()
	})

	it('должен рендерить индикатор с контентом', () => {
		render(BaseChip, {
			props: { content: 5 },
		})
		expect(screen.getByText('5')).toBeInTheDocument()
	})

	it('не должен рендерить индикатор если контент не передан', () => {
		const { container } = render(BaseChip)
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('должен скрывать индикатор при content=0 если isHiddenOnZero=true', () => {
		const { container } = render(BaseChip, {
			props: { content: 0, isHiddenOnZero: true },
		})
		expect(container.querySelector('.base-chip__badge')).not.toBeInTheDocument()
	})

	it('должен показывать индикатор при content=0 если isHiddenOnZero=false', () => {
		render(BaseChip, {
			props: { content: 0, isHiddenOnZero: false },
		})
		expect(screen.getByText('0')).toBeInTheDocument()
	})

	it('должен ограничивать число через maxValue', () => {
		render(BaseChip, {
			props: { content: 150, maxValue: 99 },
		})
		expect(screen.getByText('99+')).toBeInTheDocument()
	})
})
