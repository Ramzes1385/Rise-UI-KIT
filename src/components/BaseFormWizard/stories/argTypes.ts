import type { Meta } from '@storybook/vue3-vite'
import type BaseFormWizard from '../ui/BaseFormWizard.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { FORM_WIZARD_TITLE_TAGS, FORM_WIZARD_VARIANTS } from '../types/BaseFormWizard.types'

export const argTypes = {
	...baseArgTypes({ variants: FORM_WIZARD_VARIANTS }),
	steps: { control: false, table: propGroup(ARG_GROUP.content) },
	step: { control: false, table: propGroup(ARG_GROUP.state) },
	state: { control: false, table: propGroup(ARG_GROUP.content) },
	isLinear: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	titleTag: { control: 'inline-radio', options: FORM_WIZARD_TITLE_TAGS, table: propGroup(ARG_GROUP.a11y) },
} satisfies Meta<typeof BaseFormWizard>['argTypes']
