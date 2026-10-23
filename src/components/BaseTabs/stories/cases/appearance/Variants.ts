import { MODEL_KEYS } from '../../shared'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { TABS_VARIANTS } from '../../../types/BaseTabs.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { tabs: Object.fromEntries(TABS_VARIANTS.map(variant => [variant, 'specs'])) }

const hidden = [...MODEL_KEYS, 'variant', 'default']

const template = `
	<div class="story-stack">
		<div v-for="variant in TABS_VARIANTS" :key="variant" class="story-col">
			<span class="story-label">{{ variant }}</span>
			<BaseTabs v-bind="args" v-model="tabs[variant]" :variant="variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isFullWidth'] },
		docs: {
			description: {
				story: [
					'Четыре варианта. `underline` — навигация по разделам страницы; `pills` и `rounded` — переключатели режимов',
					'(компактные сегменты); `arc` — вкладки над панелью с содержимым.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTabs', 'TABS_VARIANTS'],
				state,
				types: { tabs: 'Record<string, string>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { state, data: { TABS_VARIANTS }, slots: hidden }),
		template,
	}),
}
