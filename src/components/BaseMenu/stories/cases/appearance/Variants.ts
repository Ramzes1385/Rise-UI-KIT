import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { MENU_VARIANTS } from '../../../types/BaseMenu.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Пять вариантов: `default` — плавающая панель; `ghost` — без фона, рамки и тени, для меню внутри другой поверхности;',
					'`outline` — выразительная рамка; `shadow` — крупная тень; `soft` — мягкий нейтральный фон.',
				].join('\n'),
			},
			source: { code: MENU_VARIANTS.map(variant => `<BaseMenu :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseMenu },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: MENU_VARIANTS, items: SHORT_ITEMS }),
		template: `
			<div class="story-grid" style="--story-grid-min: 200px;">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseMenu v-bind="props" :items="items" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
