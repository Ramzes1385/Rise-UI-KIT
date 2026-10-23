import type meta from '../../BaseQrCode.stories'
import BaseQrCode from '../../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { QR_CODE_VARIANTS } from '../../../types/BaseQrCode.types'

const template = `
	<div class="story-row">
		<BaseQrCode v-for="variant in QR_CODE_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="\`QR-код, вариант \${variant}\`" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — код на светлой подложке со скруглением, outline — ещё и рамка.' },
			source: storySource({ template, imports: ['BaseQrCode', 'QR_CODE_VARIANTS'], omit: ['variant', 'label'] }),
		},
		controls: { include: ['sizeScale', 'size'] },
	},
	render: args => ({
		components: { BaseQrCode },
		setup: useStorySetup(args, { data: { QR_CODE_VARIANTS } }),
		template,
	}),
}
