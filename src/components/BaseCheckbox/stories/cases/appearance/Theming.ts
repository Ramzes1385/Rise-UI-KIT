import { expect } from 'storybook/test'
import type meta from '../../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCheckbox from '../../../ui/BaseCheckbox.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { box: 'story-themed-box', label: 'story-themed-label' }

const state = { plain: true, themed: true, classed: true }

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseCheckbox v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-checkbox-box-bg-checked: var(--rise-success); --rise-checkbox-box-border-checked: var(--rise-success); --rise-checkbox-box-radius: var(--rise-radius-full); --rise-checkbox-label-text: var(--rise-text-muted);">
			<BaseCheckbox v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseCheckbox v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'isIndeterminate'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-checkbox-*` (квадрат: фон, рамка, фон и рамка отмеченного, радиус, тень, кольцо фокуса;',
					'цвет отметки, цвет подписи, зазор подписи) кит только читает: задайте их на `:root`, в теме или на контейнере — как здесь.',
					'Токены фона и рамки — вида `default`, радиус, тень и подпись — всех видов. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `label-wrapper`, `wrapper`, `input`, `box`, `icon`, `label`, `error`, `error-text`);',
					'глобально — `defaults.BaseCheckbox.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCheckbox'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseCheckbox },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-checkbox__box')]
		const labels = [...canvasElement.querySelectorAll<HTMLElement>('.base-checkbox__label')]

		await expect(getComputedStyle(themed!).backgroundColor).not.toBe(getComputedStyle(plain!).backgroundColor)
		await expect(getComputedStyle(themed!).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(labels[1]!).color).not.toBe(getComputedStyle(labels[0]!).color)
		await expect(classed).toHaveClass('base-checkbox__box', 'story-themed-box')
		await expect(labels[2]).toHaveClass('base-checkbox__label', 'story-themed-label')
	},
}
