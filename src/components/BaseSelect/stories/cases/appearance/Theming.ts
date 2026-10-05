import { GENRES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { trigger: 'story-themed-trigger', tag: 'story-themed-tag' }

const state = { plain: ['drama', 'comedy'], themed: ['drama', 'comedy'], classed: ['drama', 'comedy'] }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseSelect v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-select-bg: var(--rise-bg-muted); --rise-select-border: var(--rise-primary-border); --rise-select-radius: var(--rise-radius-full); --rise-select-padding-x: 16px; --rise-select-tag-bg: var(--rise-bg-accented); --rise-select-tag-text: var(--rise-text-highlighted);">
			<BaseSelect v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseSelect v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { options: GENRES, isMultiple: true, placeholder: 'Выберите жанры' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-select-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Триггер: `bg`, `border`, `border-focus`, `radius` (без своих — общие `--rise-input-*`), `text`, `padding-x`,',
					'`padding-y`; метки мультивыбора — `tag-bg`, `tag-text`; пункты списка — `option-bg-hover` (и подсветка с клавиатуры),',
					'`option-bg-selected`, `option-text-selected`, `option-padding-x`, `option-padding-y`.',
					'Проп `ui` добавляет классы к частям поля и выпадающего списка (`root`, `trigger`, `tag`, `option`, `check`…).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSelect'],
				script: `const ui = ${literal(ui)}`,
				state,
				types: { plain: '(string | number)[]', themed: '(string | number)[]', classed: '(string | number)[]' },
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSelect },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-select__trigger')]
		const plainTag = plain.querySelector<HTMLElement>('.base-select__tag')!
		const themedTag = themed.querySelector<HTMLElement>('.base-select__tag')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).paddingRight).toBe('16px')
		await expect(getComputedStyle(themedTag).backgroundColor).not.toBe(getComputedStyle(plainTag).backgroundColor)
		await expect(classed).toHaveClass('base-select__trigger', 'story-themed-trigger')
		await expect(canvas.getByRole('combobox', { name: 'Классы через ui' }).querySelector('.base-select__tag')).toHaveClass(
			'story-themed-tag',
		)
	},
}
