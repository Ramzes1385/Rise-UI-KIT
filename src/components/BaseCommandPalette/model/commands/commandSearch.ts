import type { CommandGroupView, CommandItem, CommandOptionView } from '../../types/BaseCommandPalette.types'

const normalize = (text: string): string => text.toLocaleLowerCase().replace(/ё/g, 'е')

export function matchesCommand(command: CommandItem, query: string): boolean {
	const words = normalize(query).split(/\s+/).filter(Boolean)
	const haystack = normalize([command.label, command.group, command.description, ...(command.keywords ?? [])].filter(Boolean).join(' '))
	return words.every(word => haystack.includes(word))
}

function displayKey(key: string): string {
	if (key.toLowerCase() === 'mod') return 'meta'
	return key.length === 1 ? key.toUpperCase() : key
}

export const shortcutKeys = (shortcut: string | undefined): string[] => (shortcut ? shortcut.split(/\+(?!$)/).map(displayKey) : [])

export function groupCommands(commands: readonly CommandItem[], prefix: string): CommandGroupView[] {
	const names = [...new Set(commands.map(command => command.group ?? ''))]
	let index = 0
	return names.map((name, groupIndex) => ({
		name,
		id: `${prefix}-group-${groupIndex}`,
		options: commands
			.filter(command => (command.group ?? '') === name)
			.map(command => ({ command, id: `${prefix}-option-${command.id}`, index: index++, keys: shortcutKeys(command.shortcut) })),
	}))
}

export function nextEnabled(options: readonly CommandOptionView[], from: number, step: 1 | -1): number {
	const size = options.length
	for (let offset = 1; offset <= size; offset += 1) {
		const index = (((from + step * offset) % size) + size) % size
		if (!options[index].command.isDisabled) return index
	}
	return -1
}
