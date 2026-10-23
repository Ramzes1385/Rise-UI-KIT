import type { Meta } from '@storybook/vue3-vite'
import type BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import { BUTTON_VARIANTS } from '@components/BaseButton/types/BaseButton.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BUTTON_VARIANTS }),
	...hiddenArgTypes('colorMode'),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseColorModeButton>['argTypes']
