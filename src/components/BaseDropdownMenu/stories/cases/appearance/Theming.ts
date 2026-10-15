import { BaseApp } from '@components/BaseApp'
import { screen, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { docsFrame, isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { panel: 'story-themed-panel', item: 'story-themed-item' }

const template = `
	<div style="display: grid; grid-template-columns: repeat(3, 260px); gap: 16px; align-items: start;">
		<BaseDropdownMenu v-bind="args" is-open aria-label="По умолчанию">
			<BaseButton variant="outline">По умолчанию</BaseButton>
		</BaseDropdownMenu>
		<div style="--rise-dropdown-menu-panel-width: 240px; --rise-dropdown-menu-item-padding-x: 12px; --rise-dropdown-menu-item-padding-y: 8px; --rise-dropdown-menu-item-radius: var(--rise-radius-lg); --rise-dropdown-menu-item-font-size: var(--rise-font-size-base); --rise-dropdown-menu-item-icon-size: 20px; --rise-dropdown-menu-shortcut-text: var(--rise-text);">
			<BaseApp teleport-to="#story-dropdown-menu-layer">
				<BaseDropdownMenu v-bind="args" is-open aria-label="Токены">
					<BaseButton variant="outline">Токены</BaseButton>
				</BaseDropdownMenu>
				<div id="story-dropdown-menu-layer" />
			</BaseApp>
		</div>
		<BaseDropdownMenu v-bind="args" is-open aria-label="Классы через ui" :ui="ui">
			<BaseButton variant="outline">Классы через ui</BaseButton>
		</BaseDropdownMenu>
	</div>
`

const firstItem = async (name: string): Promise<HTMLElement> => {
	const menu = await screen.findByRole('menu', { name })
	return menu.querySelector<HTMLElement>('[role="menuitem"]')!
}

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-dropdown-menu-*` кит только читает: `panel-width` (наименьшая ширина),',
					'`item-text`, `item-bg-hover` (пункт под указателем и с фокусом), `item-radius`, `item-padding-x`, `item-padding-y`,',
					'`item-font-size`, `item-icon-size`, `label-text` (подпись группы), `separator-border`, `shortcut-text` — задайте их на `:root`,',
					'в теме или на контейнере. Фон, рамка и тень панели — общие токены всплывающих панелей `--rise-dropdown-panel-*`.',
					'Меню телепортируется, поэтому токены контейнера доходят до него, когда контейнер — цель телепорта',
					'(`<BaseApp teleport-to>`, как здесь) или его предок. Проп `ui` добавляет классы к частям (`root`, `trigger`, `panel`,',
					'`content`, `group`, `item`, `label`, `separator`, `shortcut`, `icon`; панели подменю — тоже); глобально — `defaults.BaseDropdownMenu.ui`.',
				].join('\n'),
			},
			...docsFrame(300),
			source: storySource({
				template,
				imports: ['BaseDropdownMenu', 'BaseButton', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['isOpen', 'ariaLabel', 'onUpdate:isOpen'],
			}),
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async () => {
		const plain = await firstItem('По умолчанию')
		const themed = await firstItem('Токены')
		const classed = await firstItem('Классы через ui')
		const panelOf = (item: HTMLElement) => item.closest<HTMLElement>('.base-dropdown__panel')!

		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		if (!isStoryBranded())
			await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('8px')
		if (!isStoryBranded()) await expect(getComputedStyle(panelOf(themed)).minWidth).toBe('240px')
		await expect(classed).toHaveClass('base-dropdown-menu__item', 'story-themed-item')
		await expect(panelOf(classed)).toHaveClass('base-dropdown-menu__panel', 'story-themed-panel')
	},
}
