import { expect } from 'storybook/test'
import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-loader', label: 'story-themed-label' }

const template = `
	<div class="story-row">
		<BaseLoader v-bind="args" has-label />
		<div style="--rise-loader-text: var(--rise-success); --rise-loader-spinner-track-bg: var(--rise-border); --rise-loader-icon-size: var(--rise-font-size-3xl); --rise-loader-label-text: var(--rise-text-highlighted); --rise-loader-gap: var(--rise-control-gap);">
			<BaseLoader v-bind="args" has-label />
		</div>
		<BaseLoader v-bind="args" has-label :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-loader-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `text` (цвет индикатора), `icon-size` (размер), `gap`,',
					'`spinner-track-bg` (дорожка спиннера), `label-text`, `label-font-size`, `bg` (подложка `isOverlay`). Проп `color` сильнее токена.',
					'Проп `ui` добавляет классы к частям (`root`, `animation`, `spinner`, `spinner-track`, `spinner-fill`, `dot`, `pulse`, `bar`,',
					'`label`, `announce`); глобально — `defaults.BaseLoader.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseLoader'], script: `const ui = ${literal(ui)}`, omit: ['hasLabel'] }),
		},
	},
	render: args => ({
		components: { BaseLoader },
		setup: useStorySetup(args, { data: { ui }, slots: ['hasLabel'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-loader')]
		const frame = (loader: HTMLElement) => getComputedStyle(loader.querySelector('.base-loader__animation')!)
		const label = (loader: HTMLElement) => getComputedStyle(loader.querySelector('.base-loader__label')!)

		await expect(frame(plain).width).toBe('32px')
		await expect(frame(themed).width).toBe('30px')
		await expect(label(themed).color).not.toBe(label(plain).color)
		await expect(getComputedStyle(themed).getPropertyValue('--loader-color')).not.toBe(
			getComputedStyle(plain).getPropertyValue('--loader-color'),
		)
		await expect(classed).toHaveClass('base-loader', 'story-themed-loader')
		await expect(classed.querySelector('.base-loader__label')).toHaveClass('story-themed-label')
	},
}
