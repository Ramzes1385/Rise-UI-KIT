import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { miniProgress, miniRoadmap } from '../../demo/mini'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'
import { createLocalStorageProgress } from '../../../model/progress/localStorageProgress'

const models = { progress: 'progress' }

const types = { progress: 'RoadmapProgress', saved: 'string' }

const state = { saved: 'Ещё не сохраняли' }

const template = `
	<div class="story-stack">
		<BaseRoadmap v-bind="args" v-model:progress="progress" :storage="storage" @progress-save="saved = 'Сохранено в localStorage'" />
		<p class="story-label" role="status">{{ saved }}</p>
	</div>
`

const STORAGE_KEY = 'story-roadmap:vue-start'

export const Progress: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(760),
			description: {
				story: [
					'Прогресс отдельно от данных. `v-model:progress` отдаёт приложению объект `{ version, topics }` после каждой отметки, а `storage`',
					'сохраняет его: `createLocalStorageProgress()` пишет в localStorage по ключу `data.id`, запись откладывается на 300 мс и',
					'выполняется при размонтировании. Загруженный прогресс сливается с текущим по `updatedAt` каждой темы.',
					'Свой сервер — любой объект с `load(key)` и `save(key, progress)`, синхронный или асинхронный.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseRoadmap', 'createLocalStorageProgress', 'type RoadmapProgress'],
				models,
				state,
				types,
				script: "const storage = createLocalStorageProgress({ prefix: 'story-roadmap:' })",
			}),
		},
	},
	args: {
		data: miniRoadmap,
		progress: miniProgress,
		layout: 'list',
		expanded: ['basics'],
		selected: null,
	},
	beforeEach: () => {
		localStorage.removeItem(STORAGE_KEY)
	},
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, {
			models,
			state,
			slots: [],
			data: { storage: createLocalStorageProgress({ prefix: 'story-roadmap:' }) },
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(await canvas.findByRole('button', { name: /^Реактивность/ }))
		const subtopic = await screen.findByRole('checkbox', { name: 'computed и watch' })
		await expect(subtopic).not.toBeChecked()
		await userEvent.click(subtopic)
		await waitFor(() => expect(subtopic).toBeChecked())
		await expect(await canvas.findByText('Сохранено в localStorage', undefined, { timeout: 3000 })).toBeVisible()
		const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as { topics?: Record<string, { subtopics?: string[] }> }
		await expect(stored.topics?.reactivity?.subtopics).toEqual(['reactivity-1', 'reactivity-2'])
	},
}
