import { FRAME } from '../../shared'
import BaseFab from '../../../ui/BaseFab.vue'
import type meta from '../../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { FAB_VARIANTS } from '../../../types/BaseFab.types'
import type { FabPosition } from '../../../types/BaseFab.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const variants = FAB_VARIANTS

const frame = FRAME

const positions = ['bottom-left', 'bottom-right', 'top-left'] as FabPosition[]

const template = `
	<div :style="frame"><BaseFab v-for="(variant, index) in variants" :key="variant" v-bind="args" :variant="variant" :position="positions[index]" :label="variant" /></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: `default` — заливка, `soft` — мягкий цвет, `outline` — рамка.' },
			source: storySource({
				template,
				imports: ['BaseFab'],
				script: [
					`const variants = ${literal(variants)}`,
					`const frame = ${literal(frame)}`,
					`const positions = ${literal(positions)}`,
				].join('\n'),
				omit: ['variant', 'position'],
			}),
		},
		controls: { include: ['sizeScale', 'isExtended'] },
	},
	render: args => ({
		components: { BaseFab },
		setup: useStorySetup(args, { data: { variants, frame, positions }, slots: ['variant', 'position'] }),
		template,
	}),
}
