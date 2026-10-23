import { expect } from 'storybook/test'
import { SHORT_ITEMS } from '../../shared'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const items = SHORT_ITEMS
const ui = { root: 'story-themed-menu', item: 'story-themed-item', label: 'story-themed-label' }

const template = `
	<div class="story-grid" style="--story-grid-min: 200px;">
		<div class="story-col">
			<span class="story-label">По умолчанию</span>
			<BaseMenu v-bind="args" :items="items" />
		</div>
		<div class="story-col" style="--rise-menu-bg: var(--rise-bg-muted); --rise-menu-radius: var(--rise-radius-xl); --rise-menu-padding: 8px; --rise-menu-item-text: var(--rise-primary-text); --rise-menu-item-bg-hover: var(--rise-bg-accented);">
			<span class="story-label">Токены на контейнере</span>
			<BaseMenu v-bind="args" :items="items" />
		</div>
		<div class="story-col">
			<span class="story-label">Классы через ui</span>
			<BaseMenu v-bind="args" :items="items" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-menu-*` кит только читает: панель — `bg`, `border`, `radius`, `shadow`, `padding`;',
					'пункт — `item-text`, `item-text-hover`, `item-bg-hover`, `item-bg-active`, `item-radius`, `item-padding-x`, `item-padding-y`.',
					'Задайте их на `:root`, в теме или на контейнере, как здесь; `customColor` сильнее токенов. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `group`, `item`, `icon`, `label`, `divider`); глобально — `defaults.BaseMenu.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMenu'],
				script: [`const items = ${literal(items)}`, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['items', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseMenu },
		setup: useStorySetup(args, { data: { items, ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-menu')]
		const item = (menu: HTMLElement) => menu.querySelector('.base-menu__item') as HTMLElement

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(item(themed)).color).not.toBe(getComputedStyle(item(plain)).color)
		await expect(getComputedStyle(themed).paddingTop).not.toBe(getComputedStyle(plain).paddingTop)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('8px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('4px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		await expect(classed).toHaveClass('base-menu', 'story-themed-menu')
		await expect(item(classed)).toHaveClass('base-menu__item', 'story-themed-item')
		await expect(classed.querySelector('.base-menu__label')).toHaveClass('story-themed-label')
	},
}
