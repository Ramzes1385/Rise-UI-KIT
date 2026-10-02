import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div style="min-height: 300vh; padding-bottom: 96px">
		<p>Прокрутите страницу вниз — панель спрячется, вверх — вернётся.</p>
	</div>
	<BaseBottomNav v-bind="args" v-model="active" />
`

export const HideOnScroll: StoryObj<typeof meta> = {
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				story: 'Закреплённая панель (`isFixed`) с `hideOnScroll`: прячется при прокрутке окна вниз, возвращается при прокрутке вверх и при фокусе на пункте. Содержимому страницы нужен нижний отступ под панель.',
			},
			source: storySource({ template, imports: ['BaseBottomNav'], models: MODELS }),
		},
	},
	tags: ['!autodocs'],
	args: { isFixed: true, hideOnScroll: true },
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const nav = canvas.getByRole('navigation', { name: 'Нижняя навигация' })
		const view = canvasElement.ownerDocument.defaultView as Window
		await expect(nav).toHaveClass('base-bottom-nav--fixed')

		view.scrollTo(0, 400)
		await waitFor(() => expect(nav).toHaveClass('base-bottom-nav--hidden'))
		view.scrollTo(0, 100)
		await waitFor(() => expect(nav).not.toHaveClass('base-bottom-nav--hidden'))
		view.scrollTo(0, 0)
	},
}
