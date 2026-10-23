import type meta from '../BaseDrawer.stories'
import BaseDrawer from '../../ui/BaseDrawer.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { DRAWER_DIRECTIONS } from '../../types/BaseDrawer.types'

const HIDDEN_ARGS = ['isOpen', 'direction', 'title', 'description']

const state = { openDirection: null }

const template = `
	<div class="story-row">
		<BaseButton v-for="direction in DRAWER_DIRECTIONS" :key="direction" variant="outline" @click="openDirection = direction">{{ direction }}</BaseButton>
	</div>
	<BaseDrawer
		v-for="direction in DRAWER_DIRECTIONS"
		:key="direction"
		v-bind="args"
		:direction="direction"
		:title="'Панель: ' + direction"
		:is-open="openDirection === direction"
		@update:is-open="openDirection = null">
		<p style="margin: 0">Содержимое панели.</p>
	</BaseDrawer>
`

export const Directions: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: '`direction`: снизу, сверху, слева, справа — у каждой панели скругление у внутреннего края.' },
			source: storySource({
				template,
				imports: ['BaseDrawer', 'BaseButton', 'DRAWER_DIRECTIONS'],
				state,
				types: { openDirection: 'string | null' },
				omit: HIDDEN_ARGS,
			}),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseDrawer, BaseButton },
		setup: useStorySetup(args, { state, data: { DRAWER_DIRECTIONS }, slots: HIDDEN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'left' }))
		const dialog = await screen.findByRole('dialog', { name: 'Панель: left' })
		await expect(dialog).toHaveClass('base-drawer__panel--left')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
