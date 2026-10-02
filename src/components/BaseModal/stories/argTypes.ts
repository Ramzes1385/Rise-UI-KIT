import type BaseModal from '../ui/BaseModal.vue'
import type { Meta } from '@storybook/vue3-vite'
import { MODAL_VARIANTS } from '../types/BaseModal.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MODAL_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	fullScreen: { control: 'select', options: ['width', 'height', 'both'], table: propGroup(ARG_GROUP.appearance) },
	hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Текст в теле окна'),
	footer: { control: false },
} satisfies Meta<typeof BaseModal>['argTypes']
