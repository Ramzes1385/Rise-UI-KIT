import { groupCommands, matchesCommand, nextEnabled, shortcutKeys } from '../../model/commands/commandSearch'

const COMMANDS = [
	{ id: 'a', label: 'Главная', group: 'Навигация', keywords: ['дашборд'] },
	{ id: 'b', label: 'Тёмная тема', group: 'Вид' },
	{ id: 'c', label: 'Задачи', group: 'Навигация', isDisabled: true },
	{ id: 'd', label: 'Выйти' },
]

describe('поиск команд', () => {
	it('matchesCommand: все слова, регистр, «ё», группа и ключевые слова', () => {
		expect(matchesCommand(COMMANDS[1], 'ТЕМНАЯ')).toBe(true)
		expect(matchesCommand(COMMANDS[0], 'нав дашб')).toBe(true)
		expect(matchesCommand(COMMANDS[0], 'нав тема')).toBe(false)
		expect(matchesCommand(COMMANDS[3], '  ')).toBe(true)
	})

	it('shortcutKeys и groupCommands: порядок групп по первому появлению, номера в порядке показа', () => {
		expect(shortcutKeys('mod+shift+k')).toEqual(['meta', 'shift', 'K'])
		expect(shortcutKeys('ctrl++')).toEqual(['ctrl', '+'])
		expect(shortcutKeys(undefined)).toEqual([])
		const groups = groupCommands(COMMANDS, 'p')
		expect(groups.map(group => [group.name, group.id, group.options.map(option => [option.command.id, option.index])])).toEqual([
			[
				'Навигация',
				'p-group-0',
				[
					['a', 0],
					['c', 1],
				],
			],
			['Вид', 'p-group-1', [['b', 2]]],
			['', 'p-group-2', [['d', 3]]],
		])
		expect(groups[0].options[0].id).toBe('p-option-a')
	})

	it('nextEnabled: по кругу, пропуская недоступные; пустой список', () => {
		const options = groupCommands(COMMANDS, 'p').flatMap(group => group.options)
		expect(nextEnabled(options, 0, 1)).toBe(2)
		expect(nextEnabled(options, 0, -1)).toBe(3)
		expect(nextEnabled(options, -1, 1)).toBe(0)
		expect(nextEnabled(options, 4, -1)).toBe(3)
		expect(nextEnabled([], 0, 1)).toBe(-1)
		expect(nextEnabled([options[1]], 0, 1)).toBe(-1)
	})
})
