import { ref } from 'vue'
import type meta from '../../BaseRating.stories'
import BaseRating from '../../../ui/BaseRating.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { RATING_VARIANTS } from '../../../types/BaseRating.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'isDisabled', 'isReadonly'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — только звёзды; `outline` — ряд в коробке поля высотой 32px, как `BaseInput`;',
					'`soft` — мягкий фон; `ghost` — фон появляется при наведении; `shadow` — коробка поля с тенью.',
				].join('\n'),
			},
			source: { code: RATING_VARIANTS.map(variant => `<BaseRating v-model="rating" variant="${variant}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseRating },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'variant', 'onUpdate:modelValue']),
			variants: RATING_VARIANTS,
			values: ref<Record<string, number>>(Object.fromEntries(RATING_VARIANTS.map(variant => [variant, 3]))),
		}),
		template: `
			<div class="story-col">
				<div v-for="variant in variants" :key="variant" class="story-row">
					<span class="story-label">{{ variant }}</span>
					<BaseRating v-bind="props" v-model="values[variant]" :variant="variant" />
				</div>
			</div>
		`,
	}),
}
