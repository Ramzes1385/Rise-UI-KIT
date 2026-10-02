import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCryptoProSign from '../../ui/BaseCryptoProSign.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { CRYPTO_PRO_SIGN_VARIANTS } from '../../types/BaseCryptoProSign.types'

const template = `<div class="story-row"><BaseCryptoProSign v-for="variant in CRYPTO_PRO_SIGN_VARIANTS" :key="variant" v-bind="args" :variant="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все варианты оформления. Размер из Controls применяется ко всем.' },
			source: storySource({ template, imports: ['BaseCryptoProSign', 'CRYPTO_PRO_SIGN_VARIANTS'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCryptoProSign },
		setup: useStorySetup(args, { data: { CRYPTO_PRO_SIGN_VARIANTS } }),
		template,
	}),
}
