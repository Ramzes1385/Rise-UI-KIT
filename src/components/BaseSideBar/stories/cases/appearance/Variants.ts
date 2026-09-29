import { ref } from 'vue'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { SLOT_KEYS, BASIC_ITEMS } from '../../shared'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { SIDEBAR_VARIANTS } from '../../../types/BaseSideBar.types'

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Пять вариантов: `default` — панель с рамкой справа (край окна); `ghost` — без фона и рамки; `outline` и `shadow` —',
					'отдельная панель со скруглением; `soft` — мягкий нейтральный фон.',
				].join('\n'),
			},
			source: {
				code: SIDEBAR_VARIANTS.map(variant => `<BaseSideBar :items="items" variant="${variant}" title="${variant}" />`).join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'variant', 'width']),
			variants: SIDEBAR_VARIANTS,
			items: BASIC_ITEMS,
			collapsed: ref<Record<string, boolean>>(
				Object.fromEntries(SIDEBAR_VARIANTS.map(variant => [variant, Boolean(args.isCollapsed)])),
			),
		}),
		template: `
			<div class="story-row" style="align-items: stretch; height: 320px;">
				<BaseSideBar
					v-for="variant in variants"
					:key="variant"
					v-bind="props"
					v-model:is-collapsed="collapsed[variant]"
					:items="items"
					:variant="variant"
					:title="variant"
					:aria-label="'Боковая панель: ' + variant"
					:width="200"
					active-path="/dashboard" />
			</div>
		`,
	}),
}
