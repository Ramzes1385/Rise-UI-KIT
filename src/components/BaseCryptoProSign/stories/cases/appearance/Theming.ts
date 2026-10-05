import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCryptoProSign.stories'
import BaseCryptoProSign from '../../../ui/BaseCryptoProSign.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-sign', actions: 'story-themed-actions' }

const template = `
	<div class="story-row" style="align-items: flex-start">
		<BaseCryptoProSign v-bind="args" aria-label="По умолчанию" />
		<div style="display: contents; --rise-crypto-pro-sign-radius: var(--rise-radius-2xl); --rise-crypto-pro-sign-border: var(--rise-primary); --rise-crypto-pro-sign-text: var(--rise-text-highlighted);">
			<BaseCryptoProSign v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseCryptoProSign v-bind="args" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены компонента `--rise-crypto-pro-sign-*` (фон, текст, рамка, радиус, отступы и промежутки',
					'формы, кнопок и итога) кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `status`, `empty`, `certificate`,',
					'`source`, `hint`, `actions`, `result`, `error`, `live`) — для утилитарного CSS; глобально — `defaults.BaseCryptoProSign.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCryptoProSign'], script: `const ui = ${literal(ui)}` }),
			story: { inline: false, height: '460px' },
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCryptoProSign },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('region', { name: 'По умолчанию' })
		const themed = canvas.getByRole('region', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('region', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('8px')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		await expect(classed).toHaveClass('base-crypto-pro-sign', 'story-themed-sign')
		await waitFor(() => expect(classed.querySelector('.base-crypto-pro-sign__actions')).toHaveClass('story-themed-actions'))
	},
}
