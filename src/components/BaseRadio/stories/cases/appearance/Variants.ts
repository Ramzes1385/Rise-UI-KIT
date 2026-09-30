import type meta from '../../BaseRadio.stories'
import BaseRadio from '../../../ui/BaseRadio.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { RADIO_VARIANTS } from '../../../types/BaseRadio.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = RADIO_VARIANTS

const state = { values: Object.fromEntries(RADIO_VARIANTS.map(variant => [variant, 'pickup'])) }

const template = `
	<div class="story-stack">
		<BaseRadio
			v-for="variant in variants"
			:key="variant"
			v-bind="args"
			v-model="values[variant]"
			:name="'delivery-' + variant"
			:variant="variant"
			:label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isVertical', 'error'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — основной; `outline` — прозрачный круг, для цветного фона; `ghost` — без рамки;',
					'`shadow` — с тенью; `bordered` — опции-кнопки без круга.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRadio'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, string | number>' },
				omit: ['default', 'modelValue', 'name', 'label', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRadio },
		setup: useStorySetup(args, {
			state,
			data: { variants },
			slots: ['default', 'modelValue', 'name', 'label', 'variant', 'onUpdate:modelValue'],
		}),
		template,
	}),
}
