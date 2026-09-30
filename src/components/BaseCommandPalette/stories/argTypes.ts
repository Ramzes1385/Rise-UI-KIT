import type { Meta } from '@storybook/vue3-vite'
import type BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { COMMAND_PALETTE_VARIANTS } from '../types/BaseCommandPalette.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: COMMAND_PALETTE_VARIANTS }),
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	commands: { control: 'object', table: propGroup(ARG_GROUP.content) },
	hotkey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	command: slotArgType('Своя строка команды: { command, isActive }'),
	empty: slotArgType('Ничего не найдено: { query }'),
} satisfies Meta<typeof BaseCommandPalette>['argTypes']
