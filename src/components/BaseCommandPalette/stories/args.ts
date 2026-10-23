import { COMMANDS } from './shared'
import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCommandPalette from '../ui/BaseCommandPalette.vue'

export const args = {
	commands: COMMANDS,
	hotkey: 'mod+k',
	hotkeyScope: 'global',
	variant: 'default',
	sizeScale: 100,
	onSelect: fn(),
} satisfies Meta<typeof BaseCommandPalette>['args']
