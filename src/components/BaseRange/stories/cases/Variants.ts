import { ref } from 'vue'
import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { RANGE_VARIANTS } from '../../types/BaseRange.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — трек bg-accented; `soft` — трек мягкого основного цвета; `outline` — трек-контур;',
					'`ghost` — без трека, только заполнение; `shadow` — бегунок с заметной тенью.',
				].join('\n'),
			},
			source: { code: RANGE_VARIANTS.map(variant => `<BaseRange v-model="volume" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['modelValue', 'variant', 'ariaLabel', 'thumb', 'onUpdate:modelValue']),
			variants: RANGE_VARIANTS,
			values: ref<Record<string, number>>(Object.fromEntries(RANGE_VARIANTS.map(variant => [variant, 60]))),
		}),
		template: `
			<div class="story-stack story-narrow">
				<div v-for="variant in variants" :key="variant" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ variant }}</span>
					<BaseRange v-bind="props" v-model="values[variant]" :variant="variant" :aria-label="variant" />
				</div>
			</div>
		`,
	}),
}
