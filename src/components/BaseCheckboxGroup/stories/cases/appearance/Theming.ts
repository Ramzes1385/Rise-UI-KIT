import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'
import BaseCheckboxGroup from '../../../ui/BaseCheckboxGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { options: 'story-themed-options', checkbox: 'story-themed-checkbox' }

const state = { plain: ['email'], themed: ['email'], classed: ['email'] }

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseCheckboxGroup v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-checkbox-group-label-text: var(--rise-primary-text); --rise-checkbox-group-label-font-weight: var(--rise-font-weight-semibold); --rise-checkbox-group-options-gap: 4px; --rise-checkbox-box-bg-checked: var(--rise-success); --rise-checkbox-box-border-checked: var(--rise-success);">
			<BaseCheckboxGroup v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseCheckboxGroup v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isVertical', 'hasSelectAll'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-checkbox-group-*` (зазор группы, зазор между флажками — по горизонтали вдвое больше,',
					'цвет и начертание заголовка, цвет ошибки) кит только читает: задайте их на `:root`, в теме или на контейнере. Флажки группы —',
					'BaseCheckbox, их красят токены `--rise-checkbox-*` на том же контейнере. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `label`, `required`, `options`, `select-all`, `checkbox`, `error`);',
					'глобально — `defaults.BaseCheckboxGroup.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCheckboxGroup'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseCheckboxGroup },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-checkbox-group')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-checkbox-group__${name}`)!
		const box = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-checkbox__box')!

		await expect(getComputedStyle(part(themed!, 'label')).color).not.toBe(getComputedStyle(part(plain!, 'label')).color)
		await expect(getComputedStyle(part(themed!, 'label')).fontWeight).toBe('600')
		await expect(getComputedStyle(part(themed!, 'options')).rowGap).toBe('4px')
		await expect(getComputedStyle(part(themed!, 'options')).columnGap).toBe('8px')
		await expect(getComputedStyle(box(themed!)).backgroundColor).not.toBe(getComputedStyle(box(plain!)).backgroundColor)
		await expect(part(classed!, 'options')).toHaveClass('base-checkbox-group__options', 'story-themed-options')
		await expect(part(classed!, 'checkbox')).toHaveClass('base-checkbox-group__checkbox', 'story-themed-checkbox')
	},
}
