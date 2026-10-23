import { expect } from 'storybook/test'
import type meta from '../../BaseIcon.stories'
import BaseIcon from '../../../ui/BaseIcon.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-icon', svg: 'story-themed-svg' }

const template = `
	<div class="story-row">
		<BaseIcon v-bind="args" />
		<div style="--rise-icon-icon-size: var(--rise-font-size-3xl); --rise-icon-text: var(--rise-success);">
			<BaseIcon v-bind="args" />
		</div>
		<BaseIcon v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['name', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены компонента кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `--rise-icon-icon-size` (размер, 20px), `--rise-icon-text` (цвет,',
					'по умолчанию цвет текста вокруг). Проп `color` сильнее токена. Проп `ui` добавляет классы к частям `root` и `svg`;',
					'глобально — `defaults.BaseIcon.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseIcon'], script: `const ui = ${literal(ui)}`, omit: ['color'] }),
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: useStorySetup(args, { data: { ui }, slots: ['color'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-icon')]
		const svg = (icon: HTMLElement) => getComputedStyle(icon.querySelector('svg')!)

		await expect(svg(plain).width).toBe('20px')
		await expect(svg(themed).width).toBe('30px')
		await expect(svg(themed).color).not.toBe(svg(plain).color)
		await expect(classed).toHaveClass('base-icon', 'story-themed-icon')
		await expect(classed.querySelector('.base-icon__svg')).toHaveClass('story-themed-svg')
	},
}
