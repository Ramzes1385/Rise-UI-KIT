import type { Meta } from '@storybook/vue3-vite'
import type BaseCookieConsent from '../ui/BaseCookieConsent.vue'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'
import { COOKIE_CONSENT_POSITIONS, COOKIE_CONSENT_VARIANTS } from '../types/BaseCookieConsent.types'

export const argTypes = {
	...baseArgTypes({ variants: COOKIE_CONSENT_VARIANTS }),
	categories: { control: 'object', table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.state) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	default: slotArgType('Описание (заменяет description): например, со ссылкой на политику конфиденциальности'),
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isSettingsOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	storageKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	position: { control: 'inline-radio', options: COOKIE_CONSENT_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseCookieConsent>['argTypes']
