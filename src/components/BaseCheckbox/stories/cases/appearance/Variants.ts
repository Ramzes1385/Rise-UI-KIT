import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { CHECKBOX_VARIANTS } from '../../../types/BaseCheckbox.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = CHECKBOX_VARIANTS

const state = { values: Object.fromEntries(CHECKBOX_VARIANTS.map(variant => [variant, { off: false, on: true }])) }

const template = `
	<div class="story-col">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<span class="story-label">{{ variant }}</span>
			<BaseCheckbox v-bind="args" v-model="values[variant].off" :variant="variant" label="Email" />
			<BaseCheckbox v-bind="args" v-model="values[variant].on" :variant="variant" label="SMS" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Пять вариантов в двух состояниях. `default` — основной; `outline` — прозрачный, для цветного фона;',
					'`soft` — мягкий фон основного цвета; `ghost` — без рамки; `shadow` — с тенью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCheckbox'],
				script: `const variants = ${literal(variants)}`,
				state,
				omit: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
