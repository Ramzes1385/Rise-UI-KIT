import { docsFrame } from '../../shared'
import { BaseApp } from '@components/BaseApp'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseContextMenu.stories'
import BaseContextMenu from '../../../ui/BaseContextMenu.vue'
import { screen, expect, waitFor, within } from 'storybook/test'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { panel: 'story-themed-panel', item: 'story-themed-item' }

const template = `
	<div style="display: grid; grid-template-columns: repeat(3, 240px); gap: 16px; align-items: start;">
		<BaseContextMenu v-bind="args" aria-label="По умолчанию">
			<BaseButton variant="outline">По умолчанию</BaseButton>
		</BaseContextMenu>
		<div style="--rise-context-menu-panel-width: 220px; --rise-context-menu-item-padding-x: 12px; --rise-context-menu-item-padding-y: 8px; --rise-context-menu-item-radius: var(--rise-radius-lg); --rise-context-menu-item-font-size: var(--rise-font-size-base); --rise-context-menu-shortcut-text: var(--rise-text);">
			<BaseApp teleport-to="#story-context-menu-layer">
				<BaseContextMenu v-bind="args" aria-label="Токены">
					<BaseButton variant="outline">Токены</BaseButton>
				</BaseContextMenu>
				<div id="story-context-menu-layer" />
			</BaseApp>
		</div>
		<BaseContextMenu v-bind="args" aria-label="Классы через ui" :ui="ui">
			<BaseButton variant="outline">Классы через ui</BaseButton>
		</BaseContextMenu>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов (правый клик по кнопке открывает меню). Токены `--rise-context-menu-*` кит только читает:',
					'`panel-width` (наименьшая ширина), `item-text`, `item-bg-hover`, `item-radius`, `item-padding-x`, `item-padding-y`,',
					'`item-font-size`, `item-icon-size`, `label-text`, `separator-border`, `shortcut-text` — задайте их на `:root`, в теме',
					'или на контейнере; токены `--rise-dropdown-menu-*` на контекстное меню не действуют. Фон, рамка и тень панели —',
					'общие токены всплывающих панелей `--rise-dropdown-panel-*`. Меню телепортируется, поэтому токены контейнера доходят до него,',
					'когда контейнер — цель телепорта (`<BaseApp teleport-to>`, как здесь) или его предок. Проп `ui` добавляет классы к частям',
					'(`root`, `panel`, `content`, `group`, `item`, `label`, `separator`, `shortcut`, `icon`); глобально — `defaults.BaseContextMenu.ui`.',
				].join('\n'),
			},
			...docsFrame(280),
			source: storySource({
				template,
				imports: ['BaseContextMenu', 'BaseButton', 'BaseApp'],
				script: `const ui = ${literal(ui)}`,
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseContextMenu, BaseButton, BaseApp },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const measure = async (name: string) => {
			await userEvent.pointer({ keys: '[MouseRight]', target: canvas.getByRole('button', { name }) })
			const item = within(await screen.findByRole('menu', { name })).getAllByRole('menuitem')[0]
			const style = getComputedStyle(item)
			const result = { item, paddingLeft: style.paddingLeft, radius: style.borderTopLeftRadius }
			await userEvent.keyboard('{Escape}')
			await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
			return result
		}
		const plain = await measure('По умолчанию')
		const themed = await measure('Токены')
		const classed = await measure('Классы через ui')

		await expect(themed.paddingLeft).not.toBe(plain.paddingLeft)
		await expect(themed.radius).not.toBe(plain.radius)
		if (!isStoryBranded()) await expect(themed.paddingLeft).toBe('12px')
		if (!isStoryBranded()) await expect(plain.paddingLeft).toBe('8px')
		await expect(classed.item).toHaveClass('base-dropdown-menu__item', 'base-context-menu__item', 'story-themed-item')
	},
}
