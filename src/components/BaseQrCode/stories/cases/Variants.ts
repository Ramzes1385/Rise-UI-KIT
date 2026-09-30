import type meta from '../BaseQrCode.stories'
import BaseQrCode from '../../ui/BaseQrCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { QR_CODE_VARIANTS } from '../../types/BaseQrCode.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты: default — код на светлой подложке со скруглением, outline — ещё и рамка.' } },
		controls: { include: ['sizeScale', 'size'] },
	},
	render: args => ({
		components: { BaseQrCode },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: QR_CODE_VARIANTS }),
		template:
			'<div class="story-row"><BaseQrCode v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :label="`QR-код, вариант ${variant}`" /></div>',
	}),
}
