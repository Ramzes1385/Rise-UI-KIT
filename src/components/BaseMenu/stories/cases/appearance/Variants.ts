import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { MENU_VARIANTS } from '../../../types/BaseMenu.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = SHORT_ITEMS

const template = `
	<div class="story-grid" style="--story-grid-min: 200px;">
		<div v-for="variant in MENU_VARIANTS" :key="variant" class="story-col">
			<span class="story-label">{{ variant }}</span>
			<BaseMenu v-bind="args" :items="items" :variant="variant" />
		</div>
	</div>
`

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
			source: storySource({ template, imports: ['BaseMenu', 'MENU_VARIANTS'], script: `const items = ${literal(items)}` }),
		},
	},
	render: args => ({
		components: { BaseMenu },
		setup: useStorySetup(args, { data: { MENU_VARIANTS, items } }),
		template,
	}),
}
