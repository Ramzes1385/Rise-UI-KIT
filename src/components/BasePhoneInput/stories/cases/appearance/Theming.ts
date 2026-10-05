import { expect } from 'storybook/test'
import type meta from '../../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePhoneInput from '../../../ui/BasePhoneInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { trigger: 'story-themed-trigger', flag: 'story-themed-flag' }

const state = { plain: '+79161234567', themed: '+79161234567', classed: '+79161234567' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<BasePhoneInput v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-phone-input-country-border: var(--rise-primary-border); --rise-phone-input-flag-radius: var(--rise-radius-full); --rise-phone-input-option-bg-hover: var(--rise-primary-soft); --rise-phone-input-option-text-selected: var(--rise-primary); --rise-input-bg: var(--rise-bg-muted);">
			<BasePhoneInput v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BasePhoneInput v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Поле ввода — BaseInput: его рамку, фон и радиус задают токены `--rise-input-*`.',
					'Свои части поля телефона — токены `--rise-phone-input-*`: `country-border` (разделитель), `trigger-bg-hover`,',
					'`flag-radius`, `flag-shadow`, список стран — `list-gap`, `option-padding-x|y`, `option-text`, `option-bg-hover`,',
					'`option-bg-selected`, `option-text-selected`. Кит их только читает: задайте на `:root`, в теме или на контейнере',
					'(список стран открывается в слое страницы, поэтому токены списка задавайте на `:root` или в теме).',
					'Проп `ui` добавляет классы к частям (`root`, `country`, `trigger`, `flag`, `list`, `option`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePhoneInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BasePhoneInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-phone-input')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-phone-input__${name}`)!
		const wrapper = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-input__wrapper')!

		await expect(getComputedStyle(part(themed, 'country')).borderRightColor).not.toBe(
			getComputedStyle(part(plain, 'country')).borderRightColor,
		)
		await expect(getComputedStyle(part(themed, 'flag')).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(wrapper(themed)).backgroundColor).not.toBe(getComputedStyle(wrapper(plain)).backgroundColor)
		await expect(part(classed, 'trigger')).toHaveClass('base-phone-input__trigger', 'story-themed-trigger')
		await expect(part(classed, 'flag')).toHaveClass('base-phone-input__flag', 'story-themed-flag')
	},
}
