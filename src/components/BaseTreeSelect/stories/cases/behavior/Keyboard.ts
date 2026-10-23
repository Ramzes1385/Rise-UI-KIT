import { docsFrame } from '../../shared'
import type meta from '../../BaseTreeSelect.stories'
import { tabTo, inlineKey } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

const activeLabel = (trigger: HTMLElement): string | undefined =>
	document.getElementById(trigger.getAttribute('aria-activedescendant') ?? '')?.textContent?.trim()

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(380),
			description: {
				story: [
					'Клавиатура по APG Combobox с деревом: фокус остаётся в поле, активный узел — `aria-activedescendant`.',
					'Стрелка вниз открывает список; вправо раскрывает ветку и ведёт к первому ребёнку, влево — к родителю и сворачивает;',
					'Enter выбирает узел и закрывает список, Escape закрывает без выбора.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город доставки' })
		await tabTo(trigger, userEvent)

		await userEvent.keyboard('{ArrowDown}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await screen.findByRole('tree', { name: 'Город доставки' })
		await expect(activeLabel(trigger)).toBe('Центральный округ')

		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await waitFor(() => expect(screen.getByRole('treeitem', { name: 'Центральный округ' })).toHaveAttribute('aria-expanded', 'true'))
		await userEvent.keyboard(inlineKey('{ArrowRight}') + '{ArrowDown}{ArrowDown}')
		await expect(activeLabel(trigger)).toBe('Тула')
		await userEvent.keyboard(inlineKey('{ArrowLeft}'))
		await expect(activeLabel(trigger)).toBe('Центральный округ')
		await userEvent.keyboard(inlineKey('{ArrowRight}') + inlineKey('{ArrowRight}') + '{Enter}')

		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await expect(trigger).toHaveTextContent('Москва')
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'))
		await expect(trigger).toHaveTextContent('Москва')
	},
}
