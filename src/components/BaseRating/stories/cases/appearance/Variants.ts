import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { RATING_VARIANTS } from '../../../types/BaseRating.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = RATING_VARIANTS

const state = { values: Object.fromEntries(RATING_VARIANTS.map(variant => [variant, 3])) }

const template = `
	<div class="story-col">
		<div v-for="variant in variants" :key="variant" class="story-row">
			<span class="story-label">{{ variant }}</span>
			<BaseRating v-bind="args" v-model="values[variant]" :variant="variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'isReadonly'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — только звёзды; `outline` — ряд в коробке поля высотой 36px, как `BaseInput`;',
					'`soft` — мягкий фон; `ghost` — фон появляется при наведении; `shadow` — коробка поля с тенью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRating'],
				script: `const variants = ${literal(variants)}`,
				state,
				types: { values: 'Record<string, number>' },
				omit: ['default', 'modelValue', 'variant', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: useStorySetup(args, { state, data: { variants }, slots: ['default', 'modelValue', 'variant', 'onUpdate:modelValue'] }),
		template,
	}),
}
