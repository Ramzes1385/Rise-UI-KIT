import { scrollList } from '../shared'
import type meta from '../BaseBackTop.stories'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Прокрутите ленту: кнопка появится в углу, клик вернёт ленту к началу и переведёт в неё фокус.' } },
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const list = await scrollList(canvasElement)
		await userEvent.click(await canvas.findByRole('button', { name: 'Наверх' }))
		await waitFor(() => expect(list.scrollTop).toBe(0))
		await expect(list).toHaveFocus()
		await expect(args.onClick).toHaveBeenCalledOnce()
		await waitFor(() => expect(canvas.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument())
	},
}
