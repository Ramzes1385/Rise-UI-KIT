import { expect } from 'storybook/test'
import { FORMAT_BUTTONS } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../../BaseToolbar.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseToolbar from '../../../ui/BaseToolbar.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const format = FORMAT_BUTTONS

const ui = { root: 'story-themed-toolbar' }

const buttons = `<BaseButton v-for="button in format" :key="button.icon" variant="ghost" :aria-label="button.label" :padding="{ x: 6, y: 6 }"><BaseIcon :name="button.icon" /></BaseButton>`

const template = `
	<div class="story-stack">
		<BaseToolbar v-bind="args" aria-label="По умолчанию">
			${buttons}
		</BaseToolbar>
		<div style="--rise-toolbar-bg: var(--rise-bg-elevated); --rise-toolbar-border: var(--rise-primary); --rise-toolbar-radius: var(--rise-radius-full); --rise-toolbar-padding: 8px; --rise-toolbar-gap: 8px;">
			<BaseToolbar v-bind="args" aria-label="Токены на контейнере">
				${buttons}
			</BaseToolbar>
		</div>
		<BaseToolbar v-bind="args" aria-label="Классы через ui" :ui="ui">
			${buttons}
		</BaseToolbar>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'orientation', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-toolbar-*` — `bg` (фон; у `soft` по умолчанию `bg-elevated`), `border` (цвет рамки,',
					'видна у `outline`), `radius`, `shadow`, `padding` (внутренний отступ; у `ghost` его нет) и `gap` (между элементами) —',
					'кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к `root` (элемент с `role="toolbar"`); глобально — `defaults.BaseToolbar.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseIcon', 'BaseToolbar'],
				script: [`const format = ${literal(format)}`, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon },
		setup: useStorySetup(args, { data: { format, ui }, slots: ['ariaLabel'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('toolbar', { name: 'По умолчанию' })
		const themed = canvas.getByRole('toolbar', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('toolbar', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe(getComputedStyle(plain).borderTopLeftRadius)
		if (!isStoryBranded()) await expect(getComputedStyle(plain).columnGap).toBe('4px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).columnGap).toBe('8px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('8px')
		await expect(classed).toHaveClass('base-toolbar', 'story-themed-toolbar')
	},
}
