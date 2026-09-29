import { DEMO_CUES } from '../shared'
import { computed, ref, watch } from 'vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseSubtitleEditor.stories'
import { serializeSubtitles } from '@utils/subtitleUtils'
import { BaseMediaPlayer } from '@components/BaseMediaPlayer'
import BaseSubtitleEditor from '../../ui/BaseSubtitleEditor.vue'
import { DEMO_SOURCES } from '@components/BaseMediaPlayer/stories/shared'

export const WithPlayer: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Редактор и BaseMediaPlayer связаны общей позицией (`v-model:current-time` у обоих). Черновик субтитров плеер',
					'получает файлом из `serializeSubtitles(cues)` через `URL.createObjectURL` — правки сразу видны в кадре.',
				].join('\n'),
			},
		},
		controls: { disable: true },
	},
	render: () => ({
		components: { BaseSubtitleEditor, BaseMediaPlayer },
		setup() {
			const cues = ref(DEMO_CUES)
			const time = ref(0)
			const draft = computed(() => URL.createObjectURL(new Blob([serializeSubtitles(cues.value)], { type: 'text/vtt' })))
			watch(draft, (_, previous) => URL.revokeObjectURL(previous))
			const tracks = computed(() => [{ src: draft.value, label: 'Черновик', srclang: 'ru', isDefault: true }])
			return { cues, time, tracks, sources: DEMO_SOURCES }
		},
		template: `
			<div class="story-col" style="gap: 16px; max-width: 720px;">
				<BaseMediaPlayer v-model:current-time="time" :sources="sources" :tracks="tracks" title="Демо-ролик" :has-caption-upload="false" />
				<BaseSubtitleEditor v-model:cues="cues" v-model:current-time="time" :duration="12" file-name="demo" />
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Перейти к реплике 2' }))
		await waitFor(() => expect(canvas.getByRole('slider', { name: 'Перемотка' })).toHaveAttribute('aria-valuetext', '0:03 из 0:12'))
		const text = canvas.getByRole('textbox', { name: 'Текст реплики 2' })
		await userEvent.clear(text)
		await userEvent.type(text, 'Правка из редактора')
		const captions = (): string => canvasElement.querySelector('.base-media-player__captions')?.textContent?.trim() ?? ''
		await waitFor(() => expect(captions()).toContain('Правка из редактора'), { timeout: 4000 })
	},
}
