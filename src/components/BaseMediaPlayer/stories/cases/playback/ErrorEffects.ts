import { MISSING_SOURCE } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { MEDIA_ERROR_EFFECTS } from '../../../types/overlays/MediaError.types'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px">
		<BaseMediaPlayer v-for="effect in MEDIA_ERROR_EFFECTS" :key="effect" v-bind="args" :title="effect" :error-effect="effect" />
	</div>
`

export const ErrorEffects: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Фон экрана ошибки — свойство `error-effect`: `retro` (по умолчанию) — ретро-сетка с солнцем, как фон ошибки',
					'прежнего плеера, `aurora` — медленные переливы, `noise` — помехи «нет сигнала», `glitch` — сбой картинки, `none` —',
					'затемнение без анимации. Значок, заголовок, текст и «Повторить» появляются по очереди. Цвета берутся из палитры',
					'плеера (`accent-color`); при `prefers-reduced-motion` фон неподвижен. Свой текст — слот `error`, фон при этом остаётся.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer', 'MEDIA_ERROR_EFFECTS'] },
			}),
		},
	},
	args: { sources: MISSING_SOURCE, poster: undefined },
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args, { data: { MEDIA_ERROR_EFFECTS } }),
		template,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getAllByRole('alert')).toHaveLength(MEDIA_ERROR_EFFECTS.length), { timeout: STORY_WAIT_TIMEOUT })
		const effects = canvas
			.getAllByRole('alert')
			.map(alert => [...alert.classList].find(name => name.startsWith('base-media-player__overlay--')))
		await expect(effects).toEqual(MEDIA_ERROR_EFFECTS.map(effect => `base-media-player__overlay--${effect}`))
	},
}
