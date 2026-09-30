import type meta from '../BaseSignaturePad.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_SIGNATURE } from '../sampleSignature'
import BaseSignaturePad from '../../ui/BaseSignaturePad.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { SIGNATURE_PAD_VARIANTS } from '../../types/BaseSignaturePad.types'

const variants = SIGNATURE_PAD_VARIANTS

const strokes = SAMPLE_SIGNATURE

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="variant in variants" :key="variant" style="width: 280px">
			<BaseSignaturePad v-bind="args" :variant="variant" :model-value="strokes" :label="variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты: default — рамка на фоне страницы, soft — подложка без рамки, outline — прозрачное поле с рамкой. Поле 400 × 160 сужено контейнером до 280px — подпись масштабируется вместе с ним.',
			},
			source: storySource({
				template,
				imports: ['BaseSignaturePad'],
				script: [`const variants = ${literal(variants)}`, `const strokes = ${literal(strokes)}`].join('\n'),
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseSignaturePad },
		setup: useStorySetup(args, { data: { variants, strokes } }),
		template,
	}),
}
