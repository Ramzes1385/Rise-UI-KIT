import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import type BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'
import { PRESENTATION_PLAYER_VARIANTS } from '../types/BasePresentationPlayer.types'

export const argTypes = {
	...baseArgTypes({ variants: PRESENTATION_PLAYER_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BasePresentationPlayer>['argTypes']
