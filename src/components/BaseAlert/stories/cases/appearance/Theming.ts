import { expect } from 'storybook/test'
import type meta from '../../BaseAlert.stories'
import BaseAlert from '../../../ui/BaseAlert.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-alert', title: 'story-themed-title' }

const template = `
	<div class="story-stack story-medium">
		<BaseAlert v-bind="args" title="По умолчанию" />
		<div style="--rise-alert-bg: var(--rise-primary-soft); --rise-alert-text: var(--rise-primary-text); --rise-alert-radius: var(--rise-radius-2xl); --rise-alert-padding-y: 20px; --rise-alert-font-size: var(--rise-font-size-base);">
			<BaseAlert v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseAlert v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['type', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-alert-*` кит только читает: `bg`, `text` (заливка варианта `default`),',
					'`border`, `radius`, `shadow`, `padding-x`, `padding-y`, `gap`, `font-size` — задайте их на `:root`, в теме или на контейнере,',
					'как здесь. Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `icon-wrapper`, `content`, `title`, `description`, `text`, `actions`, `close`);',
					'глобально — `defaults.BaseAlert.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAlert'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title', 'default', 'actions'],
			}),
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: useStorySetup(args, { data: { ui }, slots: ['title', 'default', 'actions'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = canvas.getAllByRole('status')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(themed).paddingTop).toBe('20px')
		await expect(getComputedStyle(plain).paddingTop).toBe('12px')
		await expect(classed).toHaveClass('base-alert', 'story-themed-alert')
		await expect(classed.querySelector('.base-alert__title')).toHaveClass('story-themed-title')
	},
}
