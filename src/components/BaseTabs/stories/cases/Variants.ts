import { ref } from 'vue'
import { MODEL_KEYS } from '../shared'
import type meta from '../BaseTabs.stories'
import BaseTabs from '../../ui/BaseTabs.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TABS_VARIANTS } from '../../types/BaseTabs.types'

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
			source: { code: TABS_VARIANTS.map(variant => `<BaseTabs v-model="tab" :items="items" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, 'variant', 'default']),
			variants: TABS_VARIANTS,
			tabs: ref<Record<string, string>>(Object.fromEntries(TABS_VARIANTS.map(variant => [variant, 'specs']))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="variant in variants" :key="variant" class="story-col">
					<span class="story-label">{{ variant }}</span>
					<BaseTabs v-bind="props" v-model="tabs[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
