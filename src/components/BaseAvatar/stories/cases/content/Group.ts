import { expect } from 'storybook/test'
import { CONTENT_ARGS } from '../../shared'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, STORY_USERS, storySource, useStorySetup } from '@/stories/helpers'

const users = STORY_USERS.slice(0, 3)

const rest = STORY_USERS.length - 3

const ring = '0 0 0 2px var(--rise-bg)'

const template = `
	<div class="story-row" style="gap: 0;">
		<BaseAvatar
			v-for="(user, index) in users"
			:key="user.id"
			v-bind="args"
			:src="user.avatar"
			:alt="user.name"
			:name="user.name"
			:style="{ marginLeft: index ? '-8px' : 0, boxShadow: ring }" />
		<BaseAvatar v-bind="args" :style="{ marginLeft: '-8px', boxShadow: ring }">+{{ rest }}</BaseAvatar>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const users = ${literal(users)}`, `const rest = ${literal(rest)}`, `const ring = ${literal(ring)}`].join('\n'),
				omit: [...CONTENT_ARGS, 'isOnline', 'shape'],
			}),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { users, rest, ring }, slots: [...CONTENT_ARGS, 'isOnline', 'shape'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('img')).toHaveLength(3)
		await expect(canvas.getByText('+2')).toBeVisible()
	},
}
