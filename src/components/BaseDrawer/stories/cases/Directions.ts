import { ref } from 'vue'
import type meta from '../BaseDrawer.stories'
import BaseDrawer from '../../ui/BaseDrawer.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, expect, waitFor } from 'storybook/test'
import { DRAWER_DIRECTIONS } from '../../types/BaseDrawer.types'

export const Directions: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: '`direction`: снизу, сверху, слева, справа — у каждой панели скругление у внутреннего края.' } },
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseDrawer, BaseButton },
		setup: () => {
			const openDirection = ref<string | null>(null)
			return {
				props: useArgsWithoutSlots(args, ['isOpen', 'direction', 'title', 'description']),
				directions: DRAWER_DIRECTIONS,
				openDirection,
			}
		},
		template: `
			<div class="story-row">
				<BaseButton v-for="direction in directions" :key="direction" variant="outline" @click="openDirection = direction">{{ direction }}</BaseButton>
			</div>
			<BaseDrawer
				v-for="direction in directions"
				:key="direction"
				v-bind="props"
				:direction="direction"
				:title="'Панель: ' + direction"
				:is-open="openDirection === direction"
				@update:is-open="openDirection = null">
				<p style="margin: 0">Содержимое панели.</p>
			</BaseDrawer>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'left' }))
		const dialog = await screen.findByRole('dialog', { name: 'Панель: left' })
		await expect(dialog).toHaveClass('base-drawer__panel--left')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
