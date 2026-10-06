import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import BaseAudioPlayer from '../../../ui/BaseAudioPlayer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-player', time: 'story-themed-time' }

const template = `
	<div class="story-stack">
		<BaseAudioPlayer v-bind="args" title="По умолчанию" />
		<div style="--rise-audio-player-bg: var(--rise-bg-muted); --rise-audio-player-border: var(--rise-primary); --rise-audio-player-radius: var(--rise-radius-2xl); --rise-audio-player-padding-y: 16px; --rise-audio-player-button-radius: var(--rise-radius-md);">
			<BaseAudioPlayer v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseAudioPlayer v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-audio-player-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`bg`, `text`, `border`, `radius`, `gap`, `padding-x`, `padding-y`; кнопка пуска — `button-radius`; название — `title-font-weight`;',
					'реплика расшифровки — `cue-radius`, `cue-bg-selected`, `cue-border-selected` (список — docs/design/COMPONENT_TOKENS.md).',
					'Отступы плеера и панели расшифровки умножаются на плотность темы `--rise-density`. Проп `ui` добавляет классы к частям',
					'(`root`, `button`, `waveform`, `time`, `transcript`, `cue`… — `AUDIO_PLAYER_PARTS`); для всех плееров приложения —',
					'`defaults.BaseAudioPlayer.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAudioPlayer'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title'],
			}),
		},
	},
	render: args => ({
		components: { BaseAudioPlayer },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('group', { name: 'По умолчанию' })
		const themed = canvas.getByRole('group', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('group', { name: 'Классы через ui' })
		const button = (player: HTMLElement) => player.querySelector<HTMLElement>('.base-audio-player__button')!

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(getComputedStyle(button(themed)).borderTopLeftRadius).not.toBe(getComputedStyle(button(plain)).borderTopLeftRadius)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
			await expect(getComputedStyle(themed).paddingTop).toBe('16px')
			await expect(getComputedStyle(plain).paddingTop).toBe('8px')
		}
		await expect(classed).toHaveClass('base-audio-player', 'story-themed-player')
		await expect(classed.querySelector('.base-audio-player__time')).toHaveClass('story-themed-time')
	},
}
