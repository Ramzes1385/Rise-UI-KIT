import type { Meta } from '@storybook/vue3-vite'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import type BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'
import { COMMAND_PALETTE_HOTKEY_SCOPES, COMMAND_PALETTE_VARIANTS } from '../types/BaseCommandPalette.types'

export const argTypes = {
	...baseArgTypes({ variants: COMMAND_PALETTE_VARIANTS }),
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	commands: { control: 'object', table: propGroup(ARG_GROUP.content) },
	hotkey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	hotkeyScope: { control: 'inline-radio', options: COMMAND_PALETTE_HOTKEY_SCOPES, table: propGroup(ARG_GROUP.behavior) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	command: slotArgType('Своя строка команды: { command, isActive }'),
	empty: slotArgType('Ничего не найдено: { query }'),
} satisfies Meta<typeof BaseCommandPalette>['argTypes']
