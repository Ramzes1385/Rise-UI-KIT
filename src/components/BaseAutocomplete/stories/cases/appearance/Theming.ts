import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAutocomplete.stories'
import BaseAutocomplete from '../../../ui/BaseAutocomplete.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { wrapper: 'story-themed-wrapper', panel: 'story-themed-panel', option: 'story-themed-option' }

const state = { plain: null, themed: null, classed: null }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseAutocomplete v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-bg: var(--rise-bg-muted); --rise-input-border: var(--rise-primary-border); --rise-input-border-focus: var(--rise-success); --rise-input-radius: var(--rise-radius-full);">
			<BaseAutocomplete v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseAutocomplete v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Поле рисует BaseInput: на него действуют токены `--rise-input-*` (фон, рамка, рамка в фокусе, радиус, отступы) —',
					'на `:root`, в теме или на контейнере, как здесь. Свои токены `--rise-autocomplete-*` — у списка подсказок: пункты',
					'`option-text`, `option-bg-hover` (наведение и пункт, выбранный стрелками), `option-bg-selected`, `option-padding-x`,',
					'`option-padding-y`, промежуток `list-gap`, текст «Загрузка…» и «Ничего не найдено» — `empty-text`. Список открывается',
					'в слое страницы (`body` или `teleportTo` плагина), поэтому его токены задавайте на `:root`, в теме или на контейнере',
					'слоя. Проп `ui` добавляет классы к частям: своим (`option`, `empty`, `options`…), панели BaseDropdown (`panel`)',
					'и частям поля BaseInput (`wrapper`, `field`, `label`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAutocomplete'],
				script: `const ui = ${literal(ui)}`,
				state,
				types: { plain: 'string | number | null', themed: 'string | number | null', classed: 'string | number | null' },
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseAutocomplete },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input__wrapper')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(classed).toHaveClass('base-input__wrapper', 'story-themed-wrapper')
		await userEvent.click(canvas.getByRole('combobox', { name: 'Классы через ui' }))
		const list = document.getElementById(canvas.getByRole('combobox', { name: 'Классы через ui' }).getAttribute('aria-controls')!)!
		await expect(list.closest('.base-dropdown__panel')).toHaveClass('story-themed-panel')
		await expect(list.querySelector('.base-autocomplete__option')).toHaveClass('story-themed-option')
		await userEvent.keyboard('{Escape}')
	},
}
