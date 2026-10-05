import { expect } from 'storybook/test'
import type meta from '../../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSegmented from '../../../ui/BaseSegmented.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { track: 'story-themed-track', indicator: 'story-themed-indicator' }

const state = { plain: 'week', themed: 'week', classed: 'week' }

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const template = `
	<div class="story-stack">
		<BaseSegmented v-bind="args" v-model="plain" label="По умолчанию" />
		<div style="--rise-segmented-track-bg: var(--rise-primary-soft); --rise-segmented-indicator-bg: var(--rise-primary); --rise-segmented-segment-text-checked: var(--rise-on-primary); --rise-segmented-track-radius: var(--rise-radius-full); --rise-segmented-segment-radius: var(--rise-radius-full);">
			<BaseSegmented v-bind="args" v-model="themed" label="Токены на контейнере" />
		</div>
		<BaseSegmented v-bind="args" v-model="classed" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isBlock', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-segmented-*` (дорожка: фон, рамка, радиус, зазор; индикатор выбора: фон,',
					'тень; сегмент: текст, текст выбранного, радиус, отступы, начертание) кит только читает: задайте их на `:root`, в теме или',
					'на контейнере. Фон, тень индикатора и цвет выбранного текста — вида `default`. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `label`, `track`, `indicator`, `segment`, `input`, `icon`, `text`, `error`);',
					'глобально — `defaults.BaseSegmented.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSegmented'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSegmented },
		setup: useStorySetup(args, { state, data: { ui }, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-segmented')]
		const part = (root: HTMLElement, name: string) => root.querySelector<HTMLElement>(`.base-segmented__${name}`)!

		await expect(getComputedStyle(part(themed!, 'indicator')).backgroundColor).not.toBe(
			getComputedStyle(part(plain!, 'indicator')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed!, 'track')).backgroundColor).not.toBe(
			getComputedStyle(part(plain!, 'track')).backgroundColor,
		)
		await expect(getComputedStyle(part(themed!, 'track')).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(part(themed!, 'indicator')).borderTopLeftRadius).toBe('9999px')
		await expect(part(classed!, 'track')).toHaveClass('base-segmented__track', 'story-themed-track')
		await expect(part(classed!, 'indicator')).toHaveClass('base-segmented__indicator', 'story-themed-indicator')
	},
}
