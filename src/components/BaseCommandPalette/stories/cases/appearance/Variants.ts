import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommandPalette.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseCommandPalette from '../../../ui/BaseCommandPalette.vue'
import { COMMAND_PALETTE_VARIANTS } from '../../../types/BaseCommandPalette.types'

const state = { opened: null }

const template = `
	<div style="display: flex; gap: 8px">
		<template v-for="variant in COMMAND_PALETTE_VARIANTS" :key="variant">
			<BaseButton variant="outline" @click="opened = variant">{{ variant }}</BaseButton>
			<BaseCommandPalette
				v-bind="args"
				:variant="variant"
				:hotkey="null"
				:is-open="opened === variant"
				@update:is-open="value => !value && (opened = null)" />
		</template>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты окна — как у BaseModal: `default` — рамка и тень, `shadow` — только тень, `ghost` — без фона.',
			},
			source: storySource({
				template,
				imports: ['BaseCommandPalette', 'BaseButton', 'COMMAND_PALETTE_VARIANTS'],
				state,
				types: { opened: 'string | null' },
				omit: ['variant', 'hotkey'],
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCommandPalette, BaseButton },
		setup: useStorySetup(args, { state, data: { COMMAND_PALETTE_VARIANTS } }),
		template,
	}),
}
