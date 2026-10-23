import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTimePicker from '../../../ui/BaseTimePicker.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', field: 'story-themed-field', option: 'story-themed-option' }

const state = { plain: '10:00', themed: '10:00', classed: '10:00' }

const template = `
	<div class="story-grid" style="--story-grid-min: 200px;">
		<BaseTimePicker v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full);">
			<BaseTimePicker v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseTimePicker v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Своих токенов у поля времени нет: рамку, фон и список рисуют BaseInput и BaseAutocomplete, поэтому действуют их токены —',
					'`--rise-input-*` (фон, рамка, рамка в фокусе, радиус, отступы) и `--rise-autocomplete-*` (пункты списка) — на `:root`,',
					'в теме или на контейнере, как здесь. Проп `ui` передаёт классы частям внутреннего BaseAutocomplete: `wrapper`, `field`,',
					'`panel`, `option`, `match`…',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTimePicker'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseTimePicker },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await expect(classed.querySelector('.base-input__field')).toHaveClass('story-themed-field')
		await userEvent.click(canvas.getByRole('combobox', { name: 'Классы через ui' }))
		await waitFor(() => expect(document.querySelector('.base-autocomplete__option')).toHaveClass('story-themed-option'))
		await userEvent.keyboard('{Escape}')
	},
}
