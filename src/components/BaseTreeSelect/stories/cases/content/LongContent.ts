import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, STORY_LONG_ITEMS } from '../../shared'
import { expect, screen, waitFor, within } from 'storybook/test'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		label: 'Разделы каталога',
		placeholder: 'Выберите разделы',
		items: STORY_LONG_ITEMS,
		isMultiple: true,
		isDefaultExpandAll: true,
		maxTagCount: 2,
		modelValue: ['garden', 'furniture', 'lights', 'tools'],
	},
	parameters: {
		docs: {
			...docsFrame(420),
			description: {
				story: [
					'Длинные подписи: метки в поле обрезаются многоточием, в списке подписи переносятся.',
					'`maxTagCount: 2` — остальные выбранные узлы показаны счётчиком «+2», поле не растёт.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Разделы каталога' })
		await expect(within(trigger).getByText('+2')).toBeInTheDocument()
		const tag = within(trigger).getByText(/Садовая техника/)
		await expect(tag.scrollWidth).toBeGreaterThan(tag.clientWidth)
		await userEvent.click(trigger)
		const node = await screen.findByRole('treeitem', { name: /Мебель для веранды/ })
		await waitFor(() => expect(node.getBoundingClientRect().height).toBeGreaterThan(36))
		await expect(screen.getByRole('treeitem', { name: /Каталог товаров/ })).toHaveAttribute('aria-checked', 'mixed')
	},
}
