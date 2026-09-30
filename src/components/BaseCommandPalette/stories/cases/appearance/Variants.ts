import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import type meta from '../../BaseCommandPalette.stories'
import BaseCommandPalette from '../../../ui/BaseCommandPalette.vue'
import { COMMAND_PALETTE_VARIANTS } from '../../../types/BaseCommandPalette.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты окна — как у BaseModal: `default` — рамка и тень, `shadow` — только тень, `ghost` — без фона.',
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCommandPalette, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: COMMAND_PALETTE_VARIANTS, opened: ref<string | null>(null) }),
		template: `
			<div style="display: flex; gap: 8px">
				<template v-for="variant in variants" :key="variant">
					<BaseButton variant="outline" @click="opened = variant">{{ variant }}</BaseButton>
					<BaseCommandPalette
						v-bind="props"
						:variant="variant"
						:hotkey="null"
						:is-open="opened === variant"
						@update:is-open="value => !value && (opened = null)" />
				</template>
			</div>`,
	}),
}
