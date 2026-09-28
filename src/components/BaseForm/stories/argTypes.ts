import type BaseForm from '../ui/BaseForm.vue'
import type { Meta } from '@storybook/vue3-vite'
import { FORM_VARIANTS } from '../types/BaseForm.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FORM_VARIANTS }),
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: { control: false },
} satisfies Meta<typeof BaseForm>['argTypes']
