import { expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseFormField.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFormField from '../../../ui/BaseFormField.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-field', label: 'story-themed-label' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseFormField v-bind="args" label="По умолчанию">
			<BaseInput v-model="plain" />
		</BaseFormField>
		<div style="--rise-form-field-gap: 12px; --rise-form-field-label-text: var(--rise-primary-text); --rise-form-field-label-font-weight: var(--rise-font-weight-semibold); --rise-form-field-description-text: var(--rise-text-toned);">
			<BaseFormField v-bind="args" label="Токены на контейнере">
				<BaseInput v-model="themed" />
			</BaseFormField>
		</div>
		<BaseFormField v-bind="args" label="Классы через ui" :ui="ui">
			<BaseInput v-model="classed" />
		</BaseFormField>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { description: 'Подсказка под полем' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'description', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-form-field-*` (отступ между частями, фон, рамка, радиус, тень, отступы вариантов,',
					'цвет и начертание подписи, цвет описания и ошибки) кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям (`root`, `header`, `label`, `required`,',
					'`content`, `description`, `error`); глобально — `defaults.BaseFormField.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFormField', 'BaseInput'],
				state,
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseFormField, BaseInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-form-field')]
		const label = (field: HTMLElement) => getComputedStyle(field.querySelector('.base-form-field__label')!)

		await expect(label(themed).color).not.toBe(label(plain).color)
		await expect(label(themed).fontWeight).toBe('600')
		await expect(label(plain).fontWeight).toBe('500')
		await expect(getComputedStyle(themed).rowGap).toBe('12px')
		await expect(getComputedStyle(plain).rowGap).toBe('6px')
		await expect(classed).toHaveClass('base-form-field', 'story-themed-field')
		await expect(classed.querySelector('.base-form-field__label')).toHaveClass('story-themed-label')
	},
}
