import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, anna, ivan } from '../../shared'
import { AVATAR_VARIANTS } from '../../../types/BaseAvatar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = AVATAR_VARIANTS

const template = `
	<div class="story-col">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<span class="story-label">{{ variant }}</span>
			<BaseAvatar v-bind="args" :variant="variant" :name="anna.name" />
			<BaseAvatar v-bind="args" :variant="variant" :src="ivan.avatar" :name="ivan.name" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'shape', 'isOnline'] },
		docs: {
			description: {
				story: [
					'Пять вариантов — с инициалами и с изображением. `default` — основной; `soft` выделяет аватар цветом;',
					'`outline` и `shadow` отделяют аватар от неоднородного фона; `ghost` — без фона.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const variants = ${literal(variants)}`, `const anna = ${literal(anna)}`, `const ivan = ${literal(ivan)}`].join(
					'\n',
				),
				omit: CONTENT_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { variants, anna, ivan }, slots: CONTENT_ARGS }),
		template,
	}),
}
