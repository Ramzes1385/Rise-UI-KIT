import type meta from '../../BaseInput.stories'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { INPUT_VARIANTS } from '../../../types/BaseInput.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = INPUT_VARIANTS

const state = { values: {} }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseInput
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:variant="variant"
			:label="variant"
			placeholder="Введите текст" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Семь вариантов. `default` — основной; `outline` — на цветном фоне; `soft`, `ghost` — в плотных интерфейсах',
					'(тулбары, фильтры таблиц); `filled` — приподнятое поле; `underline` — только нижняя линия; `shadow` — с тенью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseInput'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string>' },
				omit: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseInput },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['modelValue', 'label', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
