import { expect } from 'storybook/test'
import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', postfix: 'story-themed-symbol' }

const state = { plain: 1234.5, themed: 1234.5, classed: 1234.5 }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseMoneyInput v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full);">
			<BaseMoneyInput v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseMoneyInput v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Своих токенов у поля суммы нет: рамку, фон и знак валюты рисует BaseInput, поэтому действуют его токены `--rise-input-*`',
					'(фон, текст, рамка, рамка в фокусе, радиус, отступы) — на `:root`, в теме или на контейнере. Проп `ui` передаёт классы',
					'частям внутреннего BaseInput: `wrapper`, `field`, `prefix`/`postfix` — знак валюты, `label`…',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMoneyInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await userEvent.click(canvas.getByLabelText('Токены на контейнере'))
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await expect(classed.querySelector('.base-input__postfix')).toHaveClass('story-themed-symbol')
	},
}
