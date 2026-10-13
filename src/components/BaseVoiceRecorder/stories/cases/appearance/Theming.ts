import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseVoiceRecorder.stories'
import BaseVoiceRecorder from '../../../ui/BaseVoiceRecorder.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-recorder', status: 'story-themed-status' }

const template = `
	<div class="story-stack">
		<BaseVoiceRecorder v-bind="args" />
		<div style="--rise-voice-recorder-bg: var(--rise-bg-muted); --rise-voice-recorder-border: var(--rise-primary); --rise-voice-recorder-radius: var(--rise-radius-2xl); --rise-voice-recorder-height: 56px; --rise-voice-recorder-padding-x: 16px;">
			<BaseVoiceRecorder v-bind="args" />
		</div>
		<BaseVoiceRecorder v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-voice-recorder-*` кит только читает — задайте их на `:root`, в теме или на',
					'контейнере: панель — `bg`, `text`, `border`, `radius`, `height`, `gap`, `padding-x`, `padding-y`; точка записи —',
					'`dot-bg`; индикатор уровня — `meter-height`, `level-bg`, `level-radius`; ошибка — `error-text` (список —',
					'docs/design/COMPONENT_TOKENS.md). Отступы панели умножаются на плотность темы `--rise-density`; проп `color` и',
					'вариант soft главнее токенов фона. Проп `ui` добавляет классы к частям (`root`, `dot`, `time`, `meter`, `level`,',
					'`preview`, `error`, `status` — `VOICE_RECORDER_PARTS`); для всех диктофонов приложения —',
					'`defaults.BaseVoiceRecorder.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseVoiceRecorder'],
				script: `const ui = ${literal(ui)}`,
			}),
		},
	},
	render: args => ({
		components: { BaseVoiceRecorder },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-voice-recorder')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(themed.getBoundingClientRect().height).toBeGreaterThan(plain.getBoundingClientRect().height)
		await expect(classed).toHaveClass('base-voice-recorder', 'story-themed-recorder')
		await expect(classed.querySelector('.base-voice-recorder__status')).toHaveClass('story-themed-status')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).minHeight).toBe('56px')
			await expect(getComputedStyle(plain).minHeight).toBe('48px')
			await expect(getComputedStyle(themed).paddingLeft).toBe('16px')
			await expect(getComputedStyle(plain).paddingLeft).toBe('8px')
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		}
	},
}
