import '@testing-library/jest-dom/vitest'
import BasePopover from '../ui/BasePopover.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BasePopover integration', () => {
	describe('переключение', () => {
		it('должен эмитить update:isOpen при клике на триггер', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				props: { isOpen: false },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			await user.click(screen.getByText('Триггер'))

			expect(emitted()).toHaveProperty('update:isOpen')
		})

		it('должен эмитить true при первом клике', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				props: { isOpen: false },
				slots: {
					trigger: '<button>Триггер</button>',
					default: '<p>Контент</p>',
				},
			})

			await user.click(screen.getByText('Триггер'))

			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.at(-1)?.[0]).toBe(true)
		})
	})

	describe('триггер без кнопки (fu-keyboard)', () => {
		it('span в слоте — role="button", Tab, Enter и Space открывают и закрывают', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				slots: { trigger: '<span>Подробнее</span>', default: '<p>Контент</p>' },
			})

			const trigger = screen.getByRole('button', { name: 'Подробнее' })
			expect(trigger).toHaveAttribute('tabindex', '0')
			expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
			await user.tab()
			expect(trigger).toHaveFocus()
			await user.keyboard('{Enter}')
			expect(trigger).toHaveAttribute('aria-expanded', 'true')
			await user.keyboard(' ')
			expect(trigger).toHaveAttribute('aria-expanded', 'false')
			const events = emitted()['update:isOpen'] as boolean[][]
			expect(events.map(([value]) => value)).toEqual([true, false])
		})

		it('другие клавиши не переключают', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				slots: { trigger: '<span>Подробнее</span>', default: '<p>Контент</p>' },
			})

			await user.tab()
			await user.keyboard('a')
			expect(emitted()).not.toHaveProperty('update:isOpen')
		})

		it('кнопка в слоте — без role и tabindex, Enter открывает один раз', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BasePopover, {
				slots: { trigger: '<button type="button">Открыть</button>', default: '<p>Контент</p>' },
			})

			const trigger = screen.getByRole('button', { name: 'Открыть' })
			expect(trigger).not.toHaveAttribute('role')
			expect(trigger).not.toHaveAttribute('tabindex')
			await user.tab()
			await user.keyboard('{Enter}')
			expect(emitted()['update:isOpen']).toEqual([[true]])
		})
	})
})
