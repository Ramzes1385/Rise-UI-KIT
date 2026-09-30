import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SELECT_VARIANTS } from '../../../types/BaseSelect.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = SELECT_VARIANTS

const state = { values: { default: 'msk' } }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseSelect
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Шесть вариантов триггера — как у `BaseInput`. `default` — основной; `outline` — на цветном фоне;',
					'`soft`, `ghost` — в тулбарах и фильтрах; `shadow` — с тенью; `underline` — только нижняя линия.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSelect'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
