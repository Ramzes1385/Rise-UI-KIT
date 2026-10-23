import { BaseImage } from '@components/BaseImage'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { BaseAudioPlayer } from '@components/BaseAudioPlayer'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, STORY_IMAGES, staticStorySource, useStorySetup } from '@/stories/helpers'
import { DEMO_VOICE, DEMO_VOICE_DURATION, DEMO_VOICE_PEAKS } from '@components/BaseAudioPlayer/stories/shared'

const image = STORY_IMAGES[2]

const voice = { src: DEMO_VOICE, duration: DEMO_VOICE_DURATION, peaks: DEMO_VOICE_PEAKS }

const state = { size: 50 }

const template = `
	<div style="height: 320px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="size" label="Фотография" :min="25" :max="75">
			<template #start>
				<BaseImage :src="image.src" :alt="image.alt" width="100%" height="100%" fit="cover" />
			</template>
			<template #end>
				<div style="display: grid; gap: 12px; padding: 16px">
					<h3 style="margin: 0">Голосовая заметка</h3>
					<BaseAudioPlayer
						:src="voice.src"
						:duration="voice.duration"
						:peaks="voice.peaks"
						title="Голосовая заметка о долине" />
				</div>
			</template>
		</BaseSplitter>
	</div>
`

export const Media: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Медиа в панелях: слева изображение, справа аудиоплеер с волной. Звук и картинка — локальные файлы историй,',
					'без сети. Плеер не запускается сам; `min` не даёт сузить панель с плеером так, чтобы его органы управления обрезались.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter', 'BaseImage', 'BaseAudioPlayer'],
				state,
				script: [`const image = ${literal(image)}`, `const voice = ${literal(voice)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter, BaseImage, BaseAudioPlayer },
		setup: useStorySetup(args, { state, data: { image, voice } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const separator = canvas.getByRole('separator', { name: 'Фотография' })
		await checkSplitterKeyboard(separator, { min: 25, max: 75, step: 5 }, userEvent)
		await checkSplitterDrag(separator, { min: 25, max: 75 })
	},
}
