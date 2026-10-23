import { ITEMS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseAccordionItem } from '../../../types/BaseAccordion.types'

const DISABLED_ITEMS: BaseAccordionItem[] = [
	ITEMS[0],
	ITEMS[1],
	{ label: 'Оплата при получении', content: 'Способ временно недоступен.', isDisabled: true },
	ITEMS[3],
]

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённый пункт приглушён, помечен `aria-disabled` и не раскрывается ни кликом, ни с клавиатуры.' },
		},
	},
	args: { items: DISABLED_ITEMS },
	play: async ({ canvas }) => {
		const header = canvas.getByRole('button', { name: 'Оплата при получении' })
		await expect(header).toHaveAttribute('aria-disabled', 'true')
		await expect(header).toHaveAttribute('aria-expanded', 'false')
	},
}
