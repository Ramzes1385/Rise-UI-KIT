import { MODEL_KEYS } from '../../shared'
import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { list: 'story-themed-list', indicator: 'story-themed-indicator', tab: 'story-themed-tab' }

const state = { tabs: { plain: 'specs', themed: 'specs', classed: 'specs' } }

const hidden = [...MODEL_KEYS, 'default']

const template = `
	<div class="story-stack">
		<div class="story-col">
			<span class="story-label">По умолчанию</span>
			<BaseTabs v-bind="args" v-model="tabs.plain" />
		</div>
		<div class="story-col" style="--rise-tabs-indicator-bg: var(--rise-success); --rise-tabs-indicator-height: 3px; --rise-tabs-tab-text-selected: var(--rise-success-text); --rise-tabs-border: var(--rise-border-accented); --rise-tabs-gap: 12px;">
			<span class="story-label">Токены на контейнере</span>
			<BaseTabs v-bind="args" v-model="tabs.themed" />
		</div>
		<div class="story-col">
			<span class="story-label">Классы через ui</span>
			<BaseTabs v-bind="args" v-model="tabs.classed" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isFullWidth'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-tabs-*` кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Список: `gap` — расстояние между вкладками; `border` — линия под списком (`underline`, `arc`); `tab-padding-x`,',
					'`tab-text`, `tab-text-selected` — вкладка; `indicator-bg` — линия или подложка выбранной вкладки, `indicator-height` —',
					'толщина линии, `indicator-radius`, `indicator-shadow` — подложка (`pills`, `rounded`); `list-bg`, `list-padding`,',
					'`list-radius` — контейнер вкладок `pills` и `rounded`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `nav`, `scroll-btn`, `list`, `indicator`, `tab`, `icon`, `label`, `content`,',
					'`panel`); глобально — `defaults.BaseTabs.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTabs'],
				state,
				types: { tabs: 'Record<string, string>' },
				script: `const ui = ${literal(ui)}`,
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { state, data: { ui }, slots: hidden }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = canvas.getAllByRole('tablist')
		const indicator = (list: HTMLElement) => list.querySelector('.base-tabs__indicator') as HTMLElement
		await waitFor(() => expect(indicator(themed)).not.toBeNull())
		await waitFor(() => expect(indicator(plain)).not.toBeNull())

		await expect(getComputedStyle(indicator(themed)).backgroundColor).not.toBe(getComputedStyle(indicator(plain)).backgroundColor)
		await expect(getComputedStyle(themed).columnGap).not.toBe(getComputedStyle(plain).columnGap)
		if (!isStoryBranded()) await expect(getComputedStyle(indicator(themed)).height).toBe('3px')
		if (!isStoryBranded()) await expect(getComputedStyle(indicator(plain)).height).toBe('2px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).columnGap).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).columnGap).toBe('4px')
		await expect(classed).toHaveClass('base-tabs__list', 'story-themed-list')
		await expect(indicator(classed)).toHaveClass('base-tabs__indicator', 'story-themed-indicator')
		await expect(canvas.getAllByRole('tab', { name: 'Обзор' })[2]).toHaveClass('base-tabs__tab', 'story-themed-tab')
	},
}
