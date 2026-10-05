import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseInputNumber.stories'
import BaseInputNumber from '../../../ui/BaseInputNumber.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { button: 'story-themed-button', wrapper: 'story-themed-wrapper' }

const state = { plain: 2, themed: 2, classed: 2 }

const template = `
	<div class="story-grid" style="--story-grid-min: 200px;">
		<BaseInputNumber v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-number-button-text: var(--rise-primary); --rise-input-number-button-bg: var(--rise-primary-soft); --rise-input-number-button-bg-hover: var(--rise-primary-soft-hover); --rise-input-number-button-width: 40px; --rise-input-number-button-icon-size: 16px;">
			<BaseInputNumber v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseInputNumber v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Кнопки −/+ читают токены `--rise-input-number-button-*`: `text`, `text-hover`, `text-disabled`,',
					'`bg`, `bg-hover`, `bg-active`, `width`, `icon-size`; рамку и фон поля рисует BaseInput — его токены `--rise-input-*`.',
					'Задайте их на `:root`, в теме или на контейнере. Проп `ui` добавляет классы к частям: `button` — кнопкам,',
					'`wrapper`, `field`, `label`… — частям внутреннего BaseInput.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseInputNumber'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseInputNumber },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input-number')].map(root =>
			root.querySelector<HTMLElement>('.base-input-number__button')!,
		)

		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).width).toBe('40px')
		await expect(getComputedStyle(themed.querySelector('svg')!).width).toBe('16px')
		await expect(classed).toHaveClass('base-input-number__button', 'story-themed-button')
		await expect(classed.closest('.base-input__wrapper')).toHaveClass('story-themed-wrapper')
	},
}
