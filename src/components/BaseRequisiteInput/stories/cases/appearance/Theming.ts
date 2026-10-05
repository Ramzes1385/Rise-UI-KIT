import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../../ui/BaseRequisiteInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', field: 'story-themed-field' }

const state = { plain: '7707083893', themed: '7707083893', classed: '7707083893' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseRequisiteInput v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full); --rise-input-padding-x: 16px;">
			<BaseRequisiteInput v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseRequisiteInput v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'kind', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Своих токенов у поля реквизита нет: рамку и фон рисует BaseInput, поэтому действуют его токены `--rise-input-*`',
					'(фон, текст, рамка, рамка в фокусе, радиус, отступы) — на `:root`, в теме или на контейнере. Проп `ui` передаёт классы',
					'частям внутреннего BaseInput: `wrapper`, `field`, `label`, `error-text`…',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRequisiteInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseRequisiteInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]
		const field = canvas.getByLabelText('Токены на контейнере')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(field).paddingLeft).toBe('16px')
		await userEvent.click(field)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await expect(canvas.getByLabelText('Классы через ui')).toHaveClass('story-themed-field')
	},
}
