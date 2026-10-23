import { expect } from 'storybook/test'
import type meta from '../../BaseInputTags.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseInputTags from '../../../ui/BaseInputTags.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { list: 'story-themed-list', tag: 'story-themed-tag' }

const state = { plain: ['Vue', 'Vite'], themed: ['Vue', 'Vite'], classed: ['Vue', 'Vite'] }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseInputTags v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-input-tags-tag-bg: var(--rise-primary-soft); --rise-input-tags-tag-text: var(--rise-primary-text); --rise-input-tags-tag-border: var(--rise-primary-border); --rise-input-tags-tag-radius: var(--rise-radius-full); --rise-input-tags-gap: 8px;">
			<BaseInputTags v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseInputTags v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-input-tags-*` кит только читает: задайте их на `:root`, в теме или на контейнере.',
					'Тег: `tag-bg`, `tag-text`, `tag-border`, `tag-radius`, `tag-height`, `tag-padding-x`; кнопка удаления —',
					'`remove-bg-hover`; расстояние между тегами и строкой ввода — `gap`. Рамку, фон и строку ввода рисует BaseInput:',
					'их перекрашивают токены `--rise-input-*`. Проп `ui` добавляет классы к частям (`root`, `list`, `tag`, `text`, `remove`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseInputTags'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: ['modelValue', 'label', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseInputTags },
		setup: useStorySetup(args, { state, data: { ui }, slots: ['modelValue', 'label', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-input-tags__list')]
		const plainTag = plain.querySelector<HTMLElement>('.base-input-tags__tag .base-badge')!
		const themedTag = themed.querySelector<HTMLElement>('.base-input-tags__tag .base-badge')!

		await expect(getComputedStyle(themedTag).backgroundColor).not.toBe(getComputedStyle(plainTag).backgroundColor)
		await expect(getComputedStyle(themedTag).color).not.toBe(getComputedStyle(plainTag).color)
		await expect(getComputedStyle(themedTag).borderTopColor).not.toBe(getComputedStyle(plainTag).borderTopColor)
		await expect(getComputedStyle(themedTag).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).columnGap).toBe('8px')
		await expect(classed).toHaveClass('base-input-tags__list', 'story-themed-list')
		await expect(classed.querySelector('.base-input-tags__tag')).toHaveClass('story-themed-tag')
	},
}
