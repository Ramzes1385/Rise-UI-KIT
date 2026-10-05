import { ITEMS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBottomNav from '../../../ui/BaseBottomNav.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'modelValue' } as const

const template = `
	<div class="story-narrow">
		<BaseBottomNav v-bind="args" v-model="active" />
	</div>
`

export const Floating: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`floating` — парящая скруглённая панель с тенью и отступом от краёв окна (с учётом безопасной зоны). Выбранный пункт отмечает подложка, которая скользит к новому пункту (`transform`, длительность — `--rise-duration-slow`).',
			},
			source: storySource({ template, imports: ['BaseBottomNav'], models: MODELS }),
		},
	},
	args: { variant: 'floating' },
	render: args => ({
		components: { BaseBottomNav },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await expect(canvas.getByRole('navigation')).toHaveClass('base-bottom-nav--floating')
		const indicator = canvasElement.querySelector<HTMLElement>('.base-bottom-nav__indicator')
		await expect(indicator).toHaveAttribute('aria-hidden', 'true')

		await userEvent.click(canvas.getByRole('button', { name: 'Чаты' }))
		await expect(canvas.getByRole('button', { name: 'Чаты' })).toHaveAttribute('aria-current', 'page')
		await waitFor(() => expect(indicator?.style.transform).toContain('2 * 100%'))
		await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[2])
	},
}
