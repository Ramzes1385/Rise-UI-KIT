import '@testing-library/jest-dom/vitest'
import BaseChip from '../ui/BaseChip.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { default: '<button>Уведомления</button>' }

describe('BaseChip: индикатор — BaseBadge', () => {
	it('индикатор — круглый BaseBadge с прежними классами и позицией', () => {
		const { container } = render(BaseChip, { props: { content: 7, placement: 'bottom-left' }, slots: SLOTS })
		const badge = container.querySelector('.base-chip__badge')!

		expect(badge).toHaveClass('base-badge', 'base-badge--round', 'base-chip__badge--bottom-left')
		expect(badge).toHaveTextContent('7')
		expect(badge).not.toHaveAttribute('role')
		expect(badge).not.toHaveAttribute('aria-label')
	})

	it('вариант и цвет чипа передаются бейджу', () => {
		const { container } = render(BaseChip, {
			props: { content: 7, variant: 'soft', color: { bg: { base: 'var(--rise-error)' } } },
			slots: SLOTS,
		})
		const badge = container.querySelector('.base-chip__badge')!

		expect(badge).toHaveClass('base-badge--soft')
		expect((badge as HTMLElement).style.getPropertyValue('--custom-bg')).toBe('var(--rise-error)')
	})

	it('с @click-badge бейдж — кнопка, без обработчика — нет', async () => {
		const onClickBadge = vi.fn()
		render(BaseChip, { props: { content: 7, 'onClick-badge': onClickBadge }, slots: SLOTS })
		const badge = screen.getByRole('button', { name: 'Индикатор: 7' })

		expect(badge).toHaveClass('base-chip__badge--clickable', 'base-badge--clickable')
		badge.click()
		expect(onClickBadge).toHaveBeenCalledTimes(1)
	})
})
