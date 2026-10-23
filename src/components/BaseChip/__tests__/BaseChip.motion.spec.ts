import '@testing-library/jest-dom/vitest'
import BaseChip from '../ui/BaseChip.vue'
import { render, waitFor } from '@testing-library/vue'

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

describe('BaseChip: анимации индикатора', () => {
	it('индикатор появляется через Transition base-chip__badge', async () => {
		const { container, rerender } = render(BaseChip, { props: { content: 0, isHiddenOnZero: true }, ...REAL_TRANSITION })
		expect(container.querySelector('.base-chip__badge')).toBeNull()

		await rerender({ content: 1 })

		expect(container.querySelector('.base-chip__badge')).toHaveClass('base-chip__badge-enter-from', 'base-chip__badge-enter-active')
	})

	it('новое значение меняет текст на том же узле без своей анимации: движение даёт только BaseBadge', async () => {
		const { container, rerender } = render(BaseChip, { props: { content: 1 }, ...REAL_TRANSITION })
		const badge = container.querySelector('.base-chip__badge')

		await rerender({ content: 2 })

		expect(container.querySelector('.base-chip__badge')).toBe(badge)
		expect(badge).toHaveTextContent('2')
		expect(badge?.className).not.toMatch(/bump/)
	})

	it('без длительности перехода (reduce, пресет none) индикатор уходит сразу', async () => {
		const { container, rerender } = render(BaseChip, { props: { content: 1, isHiddenOnZero: true }, ...REAL_TRANSITION })

		await rerender({ content: 0 })

		await waitFor(() => expect(container.querySelector('.base-chip__badge')).toBeNull())
	})
})
