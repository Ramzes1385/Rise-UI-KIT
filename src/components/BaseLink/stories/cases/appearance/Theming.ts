import { expect } from 'storybook/test'
import type meta from '../../BaseLink.stories'
import BaseLink from '../../../ui/BaseLink.vue'
import { BaseText } from '@components/BaseText'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-link', external: 'story-themed-external' }

const template = `
	<div class="story-stack">
		<BaseText>Откройте <BaseLink v-bind="args" label="По умолчанию" />, чтобы пригласить участников.</BaseText>
		<BaseText style="--rise-link-text: var(--rise-text-highlighted); --rise-link-text-hover: var(--rise-primary-text); --rise-link-font-weight: var(--rise-font-weight-semibold); --rise-link-radius: var(--rise-radius-sm);">
			Откройте <BaseLink v-bind="args" label="Токены на контейнере" />, чтобы пригласить участников.
		</BaseText>
		<BaseText>Откройте <BaseLink v-bind="args" href="https://example.com" target="_blank" label="Классы через ui" :ui="ui" />.</BaseText>
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
					'Перекраска без пропов. Токены `--rise-link-*` кит только читает: `text` и `text-hover` (цвет варианта `default`;',
					'`ghost` берёт цвет текста вокруг), `font-size` (по умолчанию `1em`), `font-weight` (по умолчанию как у текста), `radius`',
					'и `ring` — скругление и цвет кольца фокуса. Задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `external`, `hint`); глобально — `defaults.BaseLink.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseLink', 'BaseText'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label', 'variant', 'linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseLink, BaseText },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('link', { name: 'По умолчанию' })
		const themed = canvas.getByRole('link', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('link', { name: /Классы через ui/ })

		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		await expect(getComputedStyle(themed).fontWeight).not.toBe(getComputedStyle(plain).fontWeight)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).fontWeight).toBe('600')
		await expect(classed).toHaveClass('base-link', 'story-themed-link')
		await expect(classed.querySelector('.base-link__external')).toHaveClass('story-themed-external')
	},
}
