import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, anna, maria } from '../../shared'
import { AVATAR_SHAPES } from '../../../types/BaseAvatar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const shapes = AVATAR_SHAPES

const template = `
	<div class="story-col">
		<div v-for="shape in shapes" :key="shape" class="story-row">
			<span class="story-label">{{ shape }}</span>
			<BaseAvatar v-bind="args" :shape="shape" :name="anna.name" />
			<BaseAvatar v-bind="args" :shape="shape" :src="maria.avatar" :name="maria.name" />
		</div>
	</div>
`

export const Shapes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isOnline'] },
		docs: {
			description: {
				story: 'Формы: по умолчанию `square` — скруглённый квадрат (радиус `md`), он подходит и людям, и организациям, проектам и каналам; `circle` — круглая форма, когда нужно подчеркнуть человека.',
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const shapes = ${literal(shapes)}`, `const anna = ${literal(anna)}`, `const maria = ${literal(maria)}`].join(
					'\n',
				),
				omit: [...CONTENT_ARGS, 'shape'],
			}),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { shapes, anna, maria }, slots: [...CONTENT_ARGS, 'shape'] }),
		template,
	}),
}
