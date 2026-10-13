import '@testing-library/jest-dom/vitest'
import { defineComponent } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import type { CommandItem } from '../types/BaseCommandPalette.types'
import { render, screen, waitFor, within } from '@testing-library/vue'

const COMMANDS: CommandItem[] = [
	{ id: 'home', label: 'Главная', group: 'Навигация', icon: 'home', shortcut: 'mod+h', description: 'Дашборд' },
	{ id: 'tasks', label: 'Задачи', group: 'Навигация' },
]

const PARTS = [
	'search',
	'input',
	'list',
	'group',
	'group-title',
	'option',
	'icon',
	'text',
	'label',
	'description',
	'shortcut',
	'footer',
] as const

const transitionOn = { stubs: { Transition: false } }

const dialog = () => screen.getByRole('dialog')

const part = (name: string) => dialog().querySelector(`.base-command-palette__${name}`)

afterEach(() => {
	document.body.innerHTML = ''
})

describe('BaseCommandPalette: проп ui', () => {
	it('без ui — классы кита на окне, затемнении и частях', () => {
		render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true, hotkey: null } })

		expect(dialog()).toHaveClass('base-modal__content', 'base-command-palette__content')
		expect(dialog().closest('.base-modal')).toHaveClass('base-command-palette')
		expect(part('body')).toHaveClass('base-modal__body')
		for (const name of PARTS) expect(part(name)).not.toBeNull()
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([
			['root', 'u-root'],
			['content', 'u-content'],
			['body', 'u-body'],
			...PARTS.map(name => [name, `u-${name}`]),
		])
		render(BaseCommandPalette, {
			props: { commands: COMMANDS, isOpen: true, hotkey: null, ui, customClass: { root: 'own-root', option: 'own-option' } },
		})

		expect(dialog()).toHaveClass('base-command-palette__content', 'u-content')
		expect(dialog().closest('.base-modal')).toHaveClass('base-command-palette', 'u-root', 'own-root')
		expect(part('body')).toHaveClass('u-body')
		for (const name of PARTS) expect(part(name)).toHaveClass(`u-${name}`)
		expect(part('option')).toHaveClass('own-option')
	})

	it('«Ничего не найдено» получает класс части empty; глобальные классы из defaults.BaseCommandPalette.ui', () => {
		render(BaseCommandPalette, {
			props: { commands: [], isOpen: true, hotkey: null, ui: { empty: 'own-empty' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseCommandPalette: { ui: { empty: 'app-empty', root: 'app-root' } } } })],
			},
		})

		expect(part('empty')).toHaveClass('base-empty', 'base-command-palette__empty', 'app-empty', 'own-empty')
		expect(dialog().closest('.base-modal')).toHaveClass('base-command-palette', 'app-root')
	})
})

describe('BaseCommandPalette: проп animation и isContained', () => {
	it('по умолчанию окно появляется масштабом (scale) и телепортируется', () => {
		const { container } = render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true, hotkey: null } })

		expect(dialog().closest('.base-modal')).toHaveClass('base-modal--animation-scale')
		expect(container.contains(dialog())).toBe(false)
		expect(dialog()).toHaveAttribute('aria-modal', 'true')
	})

	it('animation уходит в BaseModal; умолчание — из defaults.BaseCommandPalette.animation', () => {
		render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true, hotkey: null, animation: 'slide' } })
		expect(dialog().closest('.base-modal')).toHaveClass('base-modal--animation-slide')
		document.body.innerHTML = ''

		render(BaseCommandPalette, {
			props: { commands: COMMANDS, isOpen: true, hotkey: null },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCommandPalette: { animation: 'fade' } } })] },
		})
		expect(dialog().closest('.base-modal')).toHaveClass('base-modal--animation-fade')
	})

	it('isContained — окно на месте, немодальное', () => {
		const { container } = render(BaseCommandPalette, { props: { commands: COMMANDS, isOpen: true, hotkey: null, isContained: true } })

		expect(container.contains(dialog())).toBe(true)
		expect(dialog().closest('.base-modal')).toHaveClass('base-modal--contained')
		expect(dialog()).not.toHaveAttribute('aria-modal')
	})

	it('телепортированное окно наследует тему и пресет движения области палитры', async () => {
		const Host = defineComponent({
			components: { BaseCommandPalette },
			setup: () => ({ commands: COMMANDS }),
			template: `
				<div data-rise-theme="violet" data-rise-motion="expressive">
					<BaseCommandPalette :commands="commands" is-open :hotkey="null" />
				</div>
			`,
		})
		render(Host, { global: transitionOn })

		const overlay = screen.getByRole('dialog').closest('.base-modal')
		await waitFor(() => expect(overlay).toHaveAttribute('data-rise-motion', 'expressive'))
		expect(overlay).toHaveAttribute('data-rise-theme', 'violet')
		expect(within(dialog()).getAllByRole('option')).toHaveLength(2)
	})
})
