import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, STORY_USERS } from '@/stories/helpers'

export const Group: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Группа аватаров: соседние аватары перекрываются, а кольцо цвета фона (`--rise-bg`) разделяет их.',
					'Последний аватар со слотом показывает, сколько участников не поместилось.',
				].join('\n'),
			},
			source: {
				code: [
					'<div style="display: flex;">',
					'  <BaseAvatar',
					'    v-for="(user, index) in users.slice(0, 3)"',
					'    :key="user.id"',
					'    :src="user.avatar"',
					'    :name="user.name"',
					"    :style=\"{ marginLeft: index ? '-8px' : 0, boxShadow: '0 0 0 2px var(--rise-bg)' }\" />",
					'  <BaseAvatar style="margin-left: -8px; box-shadow: 0 0 0 2px var(--rise-bg)">+{{ users.length - 3 }}</BaseAvatar>',
					'</div>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'isOnline', 'shape']),
			users: STORY_USERS.slice(0, 3),
			rest: STORY_USERS.length - 3,
			ring: '0 0 0 2px var(--rise-bg)',
		}),
		template: `
			<div class="story-row" style="gap: 0;">
				<BaseAvatar
					v-for="(user, index) in users"
					:key="user.id"
					v-bind="props"
					:src="user.avatar"
					:alt="user.name"
					:name="user.name"
					:style="{ marginLeft: index ? '-8px' : 0, boxShadow: ring }" />
				<BaseAvatar v-bind="props" :style="{ marginLeft: '-8px', boxShadow: ring }">+{{ rest }}</BaseAvatar>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img')).toHaveLength(3)
		await expect(canvas.getByText('+2')).toBeVisible()
	},
}
