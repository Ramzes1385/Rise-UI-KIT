import type meta from '../BaseAvatar.stories'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, anna, maria } from '../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { AVATAR_SHAPES } from '../../types/BaseAvatar.types'

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isOnline'] },
		docs: {
			description: { story: 'Формы: `circle` — для людей, `square` — для организаций, проектов и каналов.' },
			source: { code: AVATAR_SHAPES.map(shape => `<BaseAvatar shape="${shape}" name="Анна Смирнова" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, [...CONTENT_ARGS, 'shape']), shapes: AVATAR_SHAPES, anna, maria }),
		template: `
			<div class="story-col">
				<div v-for="shape in shapes" :key="shape" class="story-row">
					<span class="story-label">{{ shape }}</span>
					<BaseAvatar v-bind="props" :shape="shape" :name="anna.name" />
					<BaseAvatar v-bind="props" :shape="shape" :src="maria.avatar" :name="maria.name" />
				</div>
			</div>
		`,
	}),
}
