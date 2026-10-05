import BaseApp from '../../../ui/BaseApp.vue'
import type meta from '../../BaseApp.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useLoadingBar } from '@composables/app/useLoadingBar'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { 'loading-bar': 'story-themed-bar' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="loadingBar.start">Начать загрузку</BaseButton>
			<BaseButton variant="outline" @click="loadingBar.finish">Завершить</BaseButton>
		</div>
		<div class="story-frame story-medium" style="height: 48px; contain: layout;">
			<BaseApp>По умолчанию</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 48px; contain: layout; --rise-app-loading-bar-bg: var(--rise-success); --rise-app-loading-bar-height: 6px;">
			<BaseApp>Токены на контейнере</BaseApp>
		</div>
		<div class="story-frame story-medium" style="height: 48px; contain: layout;">
			<BaseApp :ui="ui">Классы через ui</BaseApp>
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Перекраска полосы загрузки без пропов. Токены `--rise-app-loading-bar-*` кит только читает: `bg` (цвет полосы, кроме ошибки)',
					'и `height` (толщина, когда проп `loadingBar.height` не задан) — задайте их на `:root`, в теме или на контейнере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к части `loading-bar` (класс кита — `base-app-loading-bar`);',
					'глобально — `defaults.BaseApp.ui` плагина. Полоса одна на страницу (`useLoadingBar()`), здесь три BaseApp показывают её',
					'каждый в своём контейнере (`contain: layout`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseApp', 'BaseButton', 'useLoadingBar'],
				script: [`const ui = ${literal(ui)}`, 'const loadingBar = useLoadingBar()'].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseApp, BaseButton },
		setup: useStorySetup(args, { data: { ui }, setup: () => ({ loadingBar: useLoadingBar() }) }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Начать загрузку' }))
		await waitFor(() => expect(canvas.getAllByRole('progressbar')).toHaveLength(3))
		const [plain, themed, classed] = canvas.getAllByRole('progressbar')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).height).not.toBe(getComputedStyle(plain).height)
		if (!isStoryBranded()) await expect(getComputedStyle(plain).height).toBe('3px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).height).toBe('6px')
		await expect(classed).toHaveClass('base-app-loading-bar', 'story-themed-bar')

		await userEvent.click(canvas.getByRole('button', { name: 'Завершить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-app-loading-bar')).toHaveLength(0))
	},
}
