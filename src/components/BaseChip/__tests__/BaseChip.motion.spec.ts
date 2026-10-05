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

	it('новое значение монтируется заново по ключу и проявляется через base-chip__value', async () => {
		const { container, rerender } = render(BaseChip, { props: { content: 1 }, ...REAL_TRANSITION })
		const before = container.querySelector('.base-chip__value')

		await rerender({ content: 2 })

		const entering = container.querySelector('.base-chip__value-enter-active')
		expect(entering).not.toBe(before)
		expect(entering).toHaveTextContent('2')
		await waitFor(() => expect(container.querySelectorAll('.base-chip__value')).toHaveLength(1))
		expect(container.querySelector('.base-chip__value')).toHaveTextContent('2')
	})

	it('без длительности перехода (reduce, пресет none) индикатор уходит сразу', async () => {
		const { container, rerender } = render(BaseChip, { props: { content: 1, isHiddenOnZero: true }, ...REAL_TRANSITION })

		await rerender({ content: 0 })

		await waitFor(() => expect(container.querySelector('.base-chip__badge')).toBeNull())
	})
})
