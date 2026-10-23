import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { RANGE_VARIANTS } from '../../../types/BaseRange.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = RANGE_VARIANTS

const state = { values: Object.fromEntries(RANGE_VARIANTS.map(variant => [variant, 60])) }

const template = `
	<div class="story-stack story-narrow">
		<div v-for="variant in variants" :key="variant" class="story-row" style="flex-wrap: nowrap;">
			<span class="story-label">{{ variant }}</span>
			<BaseRange v-bind="args" v-model="values[variant]" :variant="variant" :aria-label="variant" />
		</div>
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseRange'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, number>' },
				omit: ['modelValue', 'variant', 'ariaLabel', 'thumb', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, {
			state,
			data: { variants },
			slots: ['modelValue', 'variant', 'ariaLabel', 'thumb', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
