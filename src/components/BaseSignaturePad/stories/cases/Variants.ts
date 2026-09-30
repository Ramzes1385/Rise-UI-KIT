import type meta from '../BaseSignaturePad.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_SIGNATURE } from '../sampleSignature'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseSignaturePad from '../../ui/BaseSignaturePad.vue'
import { SIGNATURE_PAD_VARIANTS } from '../../types/BaseSignaturePad.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: default — рамка на фоне страницы, soft — подложка без рамки, outline — прозрачное поле с рамкой. Поле 400 × 160 сужено контейнером до 280px — подпись масштабируется вместе с ним.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: SIGNATURE_PAD_VARIANTS, strokes: SAMPLE_SIGNATURE }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<div v-for="variant in variants" :key="variant" style="width: 280px">
					<BaseSignaturePad v-bind="props" :variant="variant" :model-value="strokes" :label="variant" />
				</div>
			</div>
		`,
	}),
}
