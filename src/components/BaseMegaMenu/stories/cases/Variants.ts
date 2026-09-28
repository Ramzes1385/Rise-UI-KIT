import { COLUMNS } from '../shared'
import type meta from '../BaseMegaMenu.stories'
import BaseMegaMenu from '../../ui/BaseMegaMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { MEGA_MENU_VARIANTS } from '../../types/BaseMegaMenu.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Варианты панели columns: `default` — плавающая панель; `ghost` — без фона и рамки (меню внутри другой поверхности);',
					'`outline` — выразительная рамка; `shadow` — крупная тень; `soft` — мягкий нейтральный фон.',
				].join('\n'),
			},
			source: { code: MEGA_MENU_VARIANTS.map(variant => `<BaseMegaMenu :columns="columns" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseMegaMenu },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['column-title', 'nav-item', 'item']),
			variants: MEGA_MENU_VARIANTS,
			columns: COLUMNS.slice(0, 2),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseMegaMenu v-bind="props" :columns="columns" layout="columns" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
