import { expect } from 'storybook/test'
import type meta from '../BaseWaveform.stories'
import BaseWaveform from '../../ui/BaseWaveform.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-waveform', bar: 'story-themed-bar' }

const template = `
	<div class="story-stack">
		<BaseWaveform v-bind="args" label="По умолчанию" />
		<div style="--rise-waveform-fill-bg: var(--rise-success); --rise-waveform-bar-bg: var(--rise-bg-accented); --rise-waveform-height: 56px; --rise-waveform-gap: 4px; --rise-waveform-bar-radius: var(--rise-radius-xs);">
			<BaseWaveform v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseWaveform v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'currentTime'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-waveform-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`gap`, `height`, `radius` — шкала; `bar-bg`, `bar-radius` — столбик; `fill-bg` — сыгранная часть; `selection-bg`,',
					'`selection-border` — выделенный фрагмент (список — docs/design/COMPONENT_TOKENS.md). Проп `color` и вариант soft',
					'главнее токенов цвета. Проп `ui` добавляет классы к частям (`root`, `bar`, `selection`, `hint` — `WAVEFORM_PARTS`);',
					'для всех волн приложения — `defaults.BaseWaveform.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseWaveform'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseWaveform },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-waveform')]
		const played = (waveform: HTMLElement) => waveform.querySelector<HTMLElement>('.base-waveform__bar--played')!
		const rest = (waveform: HTMLElement) => waveform.querySelector<HTMLElement>('.base-waveform__bar:not(.base-waveform__bar--played)')!

		await expect(getComputedStyle(played(themed)).backgroundColor).not.toBe(getComputedStyle(played(plain)).backgroundColor)
		await expect(getComputedStyle(rest(themed)).backgroundColor).not.toBe(getComputedStyle(rest(plain)).backgroundColor)
		await expect(themed.getBoundingClientRect().height).toBeGreaterThan(plain.getBoundingClientRect().height)
		await expect(classed).toHaveClass('base-waveform', 'story-themed-waveform')
		await expect(played(classed)).toHaveClass('base-waveform__bar', 'story-themed-bar')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).height).toBe('56px')
			await expect(getComputedStyle(plain).height).toBe('40px')
			await expect(getComputedStyle(themed).columnGap).toBe('4px')
			await expect(getComputedStyle(played(themed)).borderTopLeftRadius).toBe('2px')
		}
	},
}
