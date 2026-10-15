import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommandPalette.stories'
import BaseCommandPalette from '../../../ui/BaseCommandPalette.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { content: 'story-themed-palette', option: 'story-themed-option' }

const template = `
	<div class="story-stack">
		<div class="story-frame" style="height: 380px;">
			<BaseCommandPalette v-bind="args" is-open is-contained aria-label="По умолчанию" />
		</div>
		<div class="story-frame" style="height: 380px; --rise-command-palette-content-width: 520px; --rise-command-palette-input-height: 44px; --rise-command-palette-option-bg-selected: var(--rise-primary-soft); --rise-command-palette-option-text-selected: var(--rise-primary-text); --rise-command-palette-option-radius: var(--rise-radius-lg); --rise-command-palette-group-title-text: var(--rise-primary-text);">
			<BaseCommandPalette v-bind="args" is-open is-contained aria-label="Токены на контейнере" />
		</div>
		<div class="story-frame" style="height: 380px;">
			<BaseCommandPalette v-bind="args" is-open is-contained aria-label="Классы через ui" :ui="ui" />
		</div>
	</div>
`

const activeOption = (dialog: HTMLElement): HTMLElement => within(dialog).getAllByRole('option', { selected: true })[0]

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { hotkey: null },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-command-palette-*` кит только читает: `content-width` (наибольшая ширина окна),',
					'`input-height`, `input-font-size`, `option-padding-x`, `option-padding-y`, `option-radius`, `option-bg-selected`,',
					'`option-text-selected` (подсвеченная команда), `group-title-text`, `group-title-font-size`, `footer-font-size` —',
					'задайте их на `:root`, в теме или на контейнере. Рамку, фон и тень окна задают токены BaseModal `--rise-modal-content-*`.',
					'Проп `ui` добавляет классы к частям (`root`, `content`, `body`, `search`, `input`, `list`, `group`, `group-title`,',
					'`option`, `icon`, `text`, `label`, `description`, `shortcut`, `empty`, `footer`); глобально — `defaults.BaseCommandPalette.ui`.',
					'Здесь палитры встроены в блоки (`is-contained`); обычная палитра телепортируется и наследует тему области.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCommandPalette'],
				script: `const ui = ${literal(ui)}`,
				omit: ['isOpen', 'ariaLabel', 'isContained'],
			}),
		},
	},
	render: args => ({
		components: { BaseCommandPalette },
		setup: useStorySetup(args, { data: { ui }, slots: ['command', 'empty'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = await canvas.findByRole('dialog', { name: 'По умолчанию' })
		const themed = canvas.getByRole('dialog', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('dialog', { name: 'Классы через ui' })

		await expect(getComputedStyle(activeOption(themed)).backgroundColor).not.toBe(getComputedStyle(activeOption(plain)).backgroundColor)
		if (!isStoryBranded())
			await expect(getComputedStyle(activeOption(themed)).borderTopLeftRadius).not.toBe(
				getComputedStyle(activeOption(plain)).borderTopLeftRadius,
			)
		if (!isStoryBranded()) await expect(getComputedStyle(within(themed).getByRole('combobox')).height).toBe('44px')
		if (!isStoryBranded()) await expect(getComputedStyle(within(plain).getByRole('combobox')).height).toBe('52px')
		await expect(classed).toHaveClass('base-command-palette__content', 'story-themed-palette')
		await expect(activeOption(classed)).toHaveClass('base-command-palette__option', 'story-themed-option')
	},
}
