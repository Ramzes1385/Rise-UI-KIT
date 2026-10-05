import { expect } from 'storybook/test'
import type meta from '../../BaseForm.stories'
import BaseForm from '../../../ui/BaseForm.vue'
import { BaseInput } from '@components/BaseInput'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-form', content: 'story-themed-content' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px; align-items: start;">
		<BaseForm v-bind="args" aria-label="По умолчанию">
			<BaseInput v-model="plain" label="По умолчанию" />
		</BaseForm>
		<div style="--rise-form-padding: 28px; --rise-form-radius: var(--rise-radius-2xl); --rise-form-border: var(--rise-primary); --rise-form-bg: var(--rise-bg-muted);">
			<BaseForm v-bind="args" aria-label="Токены на контейнере">
				<BaseInput v-model="themed" label="Токены на контейнере" />
			</BaseForm>
		</div>
		<BaseForm v-bind="args" aria-label="Классы через ui" :ui="ui">
			<BaseInput v-model="classed" label="Классы через ui" />
		</BaseForm>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { variant: 'outline' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isLoading'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-form-*` (фон, рамка, радиус, тень, отступ вариантов `outline`, `soft`, `shadow`,',
					'фон слоя загрузки) кит только читает: задайте их на `:root`, в теме или на контейнере. Отступ умножается на плотность',
					'темы `--rise-density`. Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `overlay`,',
					'`content`, `fieldset`); глобально — `defaults.BaseForm.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseForm', 'BaseInput'],
				state,
				script: `const ui = ${literal(ui)}`,
				omit: ['default'],
			}),
		},
	},
	render: args => ({
		components: { BaseForm, BaseInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-form')]

		await expect(getComputedStyle(themed).paddingTop).toBe('28px')
		await expect(getComputedStyle(plain).paddingTop).toBe('20px')
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-form', 'story-themed-form')
		await expect(classed.querySelector('.base-form__content')).toHaveClass('story-themed-content')
	},
}
