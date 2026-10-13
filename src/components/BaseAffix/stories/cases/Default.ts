import type meta from '../BaseAffix.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: прокрутите область вниз, и панель прилипнет к её верху (`position: sticky`), а событие `change` сообщит `true`; при возврате вверх — `false`. Меняйте `offsetTop` и `hasShadow` в Controls.',
			},
		},
	},
	play: async ({ canvas, canvasElement, args }) => {
		const container = canvasElement.querySelector('#story-affix-default') as HTMLElement
		const affix = canvasElement.querySelector('.base-affix') as HTMLElement
		await expect(affix).not.toHaveClass('base-affix--fixed')
		await expect(canvas.getByText('Панель на своём месте')).toBeVisible()

		container.scrollTop = 200
		await waitFor(() => expect(affix).toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(true))
		await expect(canvas.getByText('Панель закреплена')).toBeVisible()

		container.scrollTop = 0
		await waitFor(() => expect(affix).not.toHaveClass('base-affix--fixed'))
		await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false))
	},
}
