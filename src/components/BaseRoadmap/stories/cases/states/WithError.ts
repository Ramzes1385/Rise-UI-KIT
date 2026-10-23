import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { miniProgress, miniRoadmap } from '../../demo/mini'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const state = { error: '' }

const template = `
	<div class="story-stack">
		<BaseRoadmap v-bind="args" :storage="storage" @progress-error="error = 'Не удалось работать с хранилищем прогресса'" />
		<p v-if="error" class="story-label" role="alert">{{ error }}</p>
	</div>
`

const script = `
const storage = {
	load: () => Promise.reject(new Error('Хранилище недоступно')),
	save: () => Promise.reject(new Error('Хранилище недоступно')),
}
`

const storage = {
	load: () => Promise.reject(new Error('Хранилище недоступно')),
	save: () => Promise.reject(new Error('Хранилище недоступно')),
}

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(700),
			description: {
				story: [
					'Ошибка хранилища: `load` или `save` упал (сервер недоступен, localStorage отключён или переполнен). Роадмап не ломается —',
					'прогресс живёт в памяти, а событие `progress-error` получает ошибку, и приложение показывает своё сообщение.',
					'`createLocalStorageProgress()` без доступа к localStorage при сохранении сообщает «Хранилище прогресса недоступно».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseRoadmap'], state, script }),
		},
	},
	args: { data: miniRoadmap, progress: miniProgress, layout: 'list', expanded: ['basics'], selected: null },
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { state, slots: [], data: { storage } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось работать с хранилищем прогресса')
		await expect(canvas.getByRole('button', { name: /^Шаблоны/ })).toBeVisible()
	},
}
