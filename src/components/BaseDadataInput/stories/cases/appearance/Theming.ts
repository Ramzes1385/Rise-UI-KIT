import { DEMO_DELAY } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', panel: 'story-themed-panel', option: 'story-themed-option' }

const state = { plain: '', themed: '', classed: '' }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px; min-height: 280px;">
		<BaseDadataInput v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full);">
			<BaseDadataInput v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseDadataInput v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Своих токенов у поле DaDataа нет: поле и список подсказок рисует BaseAutocomplete. На поле действуют токены BaseInput',
					'`--rise-input-*` (фон, рамка, рамка в фокусе, радиус, отступы) — на `:root`, в теме или на контейнере, как здесь.',
					'Список подсказок — токены `--rise-autocomplete-*` (`option-text`, `option-bg-hover`, `option-bg-selected`,',
					'`option-padding-x`, `option-padding-y`, `list-gap`, `empty-text`): список открывается в слое страницы (`body` или',
					'`teleportTo` плагина), поэтому их задавайте на `:root` или в теме. Проп `ui` передаёт классы частям внутреннего',
					'BaseAutocomplete: списку (`panel`, `option`, `empty`…) и полю (`wrapper`, `field`, `label`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDadataInput'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		const field = canvas.getByRole('combobox', { name: 'Классы через ui' })
		await userEvent.type(field, 'сбер')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		const list = document.getElementById(field.getAttribute('aria-controls')!)!
		await expect(list.closest('.base-dropdown__panel')).toHaveClass('story-themed-panel')
		await expect(list.querySelector('.base-autocomplete__option')).toHaveClass('story-themed-option')
		await userEvent.keyboard('{Escape}')
	},
}
