import type meta from '../BaseAvatar.stories'
import BaseAvatar from '../../ui/BaseAvatar.vue'
import { CONTENT_ARGS, anna, ivan } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { AVATAR_VARIANTS } from '../../types/BaseAvatar.types'

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
			source: { code: AVATAR_VARIANTS.map(variant => `<BaseAvatar variant="${variant}" name="Анна Смирнова" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: () => ({ props: useArgsWithoutSlots(args, CONTENT_ARGS), variants: AVATAR_VARIANTS, anna, ivan }),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseAvatar v-bind="props" :variant="variant" :name="anna.name" />
					<BaseAvatar v-bind="props" :variant="variant" :src="ivan.avatar" :name="ivan.name" />
				</div>
			</div>
		`,
	}),
}
