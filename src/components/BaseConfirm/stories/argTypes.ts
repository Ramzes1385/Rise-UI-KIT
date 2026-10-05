import type { Meta } from '@storybook/vue3-vite'
import type BaseConfirm from '../ui/BaseConfirm.vue'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { MODAL_VARIANTS } from '@components/BaseModal/types/BaseModal.types'

export const argTypes = {
	...baseArgTypes({ variants: MODAL_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	confirmLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	cancelLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isDanger: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseConfirm>['argTypes']
