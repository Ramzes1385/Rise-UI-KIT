import BasePin from '../../../ui/BasePin.vue'
import type meta from '../../BasePin.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { PIN_VARIANTS } from '../../../types/BasePin.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = PIN_VARIANTS

const state = { values: Object.fromEntries(PIN_VARIANTS.map(variant => [variant, '48'])) }

const template = `
	<div class="story-col">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<span class="story-label">{{ variant }}</span>
			<BasePin v-bind="args" v-model="values[variant]" :variant="variant" :aria-label="'Код, вариант ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'length', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: 'Пять вариантов, как у `BaseInput`: `default`, `outline` — без фона, `soft` — мягкий фон, `ghost` — без рамки, `shadow` — с тенью.',
			},
			source: storySource({
				template,
				imports: ['BasePin'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['default', 'modelValue', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BasePin },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['default', 'modelValue', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
