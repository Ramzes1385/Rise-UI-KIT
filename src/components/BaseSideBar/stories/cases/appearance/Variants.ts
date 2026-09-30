import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { SLOT_KEYS, BASIC_ITEMS } from '../../shared'
import { SIDEBAR_VARIANTS } from '../../../types/BaseSideBar.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = BASIC_ITEMS

const collapsedState = (isCollapsed: boolean) => ({
	collapsed: Object.fromEntries(SIDEBAR_VARIANTS.map(variant => [variant, isCollapsed])),
})

const hidden = [...SLOT_KEYS, 'isCollapsed', 'onUpdate:isCollapsed', 'title', 'items', 'variant', 'width']

const template = `
	<div class="story-row" style="align-items: stretch; height: 320px;">
		<BaseSideBar
			v-for="variant in SIDEBAR_VARIANTS"
			:key="variant"
			v-bind="args"
			v-model:is-collapsed="collapsed[variant]"
			:items="items"
			:variant="variant"
			:title="variant"
			:aria-label="'Боковая панель: ' + variant"
			:width="200"
			active-path="/dashboard" />
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseSideBar', 'SIDEBAR_VARIANTS'],
				script: `const items = ${literal(items)}`,
				state: collapsedState(false),
				types: { collapsed: 'Record<string, boolean>' },
				omit: [...hidden, 'linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: useStorySetup(args, {
			state: collapsedState(Boolean(args.isCollapsed)),
			data: { SIDEBAR_VARIANTS, items },
			slots: hidden,
		}),
		template,
	}),
}
