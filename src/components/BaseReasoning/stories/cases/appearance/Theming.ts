import { expect } from 'storybook/test'
import type meta from '../../BaseReasoning.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseReasoning from '../../../ui/BaseReasoning.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-reasoning', trigger: 'story-themed-trigger' }

const template = `
	<div class="story-stack story-medium">
		<BaseReasoning v-bind="args" variant="soft" title="По умолчанию" />
		<div style="--rise-reasoning-bg: var(--rise-primary-soft); --rise-reasoning-text: var(--rise-primary-text); --rise-reasoning-radius: var(--rise-radius-2xl); --rise-reasoning-padding-x: 20px; --rise-reasoning-trigger-font-weight: var(--rise-font-weight-bold);">
			<BaseReasoning v-bind="args" variant="soft" title="Токены на контейнере" />
		</div>
		<BaseReasoning v-bind="args" variant="soft" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale', 'isOpen'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-reasoning-*` кит только читает: `bg`, `text`, `border` (вариант `outline`),',
					'`radius`, `padding-x`, `padding-y` (варианты `soft` и `outline`), `font-size`, `trigger-gap`, `trigger-font-weight`,',
					'`trigger-text-hover`, `content-border` (линия слева у `default`) — задайте их на `:root`, в теме или на контейнере, как здесь.',
					'Отступы умножаются на плотность темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `trigger`, `title`, `arrow`, `collapse`, `content`);',
					'глобально — `defaults.BaseReasoning.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseReasoning'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title', 'variant', 'default'],
			}),
		},
	},
	render: args => ({
		components: { BaseReasoning },
		setup: useStorySetup(args, { data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const block = (name: string) => canvas.getByRole('button', { name }).closest('.base-reasoning') as HTMLElement
		const plain = block('По умолчанию')
		const themed = block('Токены на контейнере')
		const classed = block('Классы через ui')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('20px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('12px')
		await expect(classed).toHaveClass('base-reasoning', 'story-themed-reasoning')
		await expect(classed.querySelector('.base-reasoning__trigger')).toHaveClass('story-themed-trigger')
	},
}
