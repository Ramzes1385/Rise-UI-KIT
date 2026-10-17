import { expect } from 'storybook/test'
import type meta from '../../BaseInput.stories'
import BaseInput from '../../../ui/BaseInput.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', field: 'story-themed-field' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseInput v-bind="args" v-model="plain" label="По умолчанию" placeholder="Введите текст" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full); --rise-input-padding-x: 16px;">
			<BaseInput v-bind="args" v-model="themed" label="Токены на контейнере" placeholder="Введите текст" />
		</div>
		<BaseInput v-bind="args" v-model="classed" label="Классы через ui" placeholder="Введите текст" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-input-*` (фон, текст, рамка, рамка в фокусе, радиус, отступы) кит только читает:',
					'задайте их на `:root`, в теме или на контейнере. Проп `ui` добавляет классы к частям (`root`, `wrapper`, `field`, `label`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]
		const field = canvas.getByRole('textbox', { name: 'Токены на контейнере' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(field).paddingInlineStart).toBe('16px')
		await userEvent.click(field)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await expect(canvas.getByRole('textbox', { name: 'Классы через ui' })).toHaveClass('story-themed-field')
	},
}
