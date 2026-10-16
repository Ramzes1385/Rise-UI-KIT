import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSideBar from '../../../ui/BaseSideBar.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-side-bar', title: 'story-themed-title' }

const template = `
	<div class="story-row" style="align-items: stretch;">
		<BaseSideBar v-bind="args" title="По умолчанию" style="height: 420px;" />
		<div style="display: flex; height: 420px; --rise-side-bar-bg: var(--rise-bg-muted); --rise-side-bar-border: var(--rise-primary); --rise-side-bar-item-radius: var(--rise-radius-full); --rise-side-bar-item-bg-selected: var(--rise-primary); --rise-side-bar-item-text-selected: var(--rise-on-primary);">
			<BaseSideBar v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseSideBar v-bind="args" title="Классы через ui" :ui="ui" style="height: 420px;" />
	</div>
`

const hidden = [...SLOT_KEYS, 'title', 'linkComponent']

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { width: 240 },
	parameters: {
		a11y: { config: { rules: [{ id: 'landmark-unique', enabled: false }] } },
		controls: { include: ['variant', 'width', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-side-bar-*` кит только читает: панель — `bg`, `text`, `border`, `radius` и `shadow`',
					'(варианты `outline`, `shadow`); пункты — `item-radius`, `item-text`, `item-bg-hover`, `item-text-hover`, `item-bg-selected`,',
					'`item-text-selected`; полоска текущего пункта — `indicator-bg`. Задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `header`, `title`, `toggle`, `navigation`, `loading`, `body`, `footer`,',
					'`collapsed`); глобально — `defaults.BaseSideBar.ui` плагина.',
					'В превью три боковые панели с одним именем ориентира, поэтому правило axe `landmark-unique` у этой истории выключено.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSideBar'],
				script: `const ui = ${literal(ui)}`,
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseSideBar },
		setup: useStorySetup(args, { data: { ui }, slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		const sidebar = (title: string) => canvas.getByText(title).closest('.base-side-bar') as HTMLElement
		const current = (root: HTMLElement) => root.querySelector('.base-side-bar-nav__link--current') as HTMLElement
		const plain = sidebar('По умолчанию')
		const themed = sidebar('Токены на контейнере')
		const classed = sidebar('Классы через ui')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(current(themed)).backgroundColor).not.toBe(getComputedStyle(current(plain)).backgroundColor)
		await expect(getComputedStyle(current(themed)).color).not.toBe(getComputedStyle(current(plain)).color)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(current(themed)).borderTopLeftRadius).toBe('9999px')
			await expect(getComputedStyle(current(plain)).borderTopLeftRadius).toBe('6px')
		}
		await expect(classed).toHaveClass('base-side-bar', 'story-themed-side-bar')
		await expect(canvas.getByText('Классы через ui')).toHaveClass('base-side-bar__title', 'story-themed-title')
	},
}
