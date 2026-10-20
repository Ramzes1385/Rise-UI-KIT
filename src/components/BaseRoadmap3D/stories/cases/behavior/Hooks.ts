import { setup } from './Hooks.setup'
import setupSource from './Hooks.setup.ts?raw'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { docsFrame, scriptImports, scriptSource, storySource, STORY_WAIT_TIMEOUT, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseRoadmap3D v-bind="args" height="460px" :on-scene-ready="onSceneReady" :on-model-ready="onModelReady" />
		<p class="story-label">{{ log }} · моделей на пьедесталах: {{ modelCount }}</p>
	</div>
`

const kit = scriptImports(setupSource, { importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] } })

export const Hooks: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			...docsFrame(660),
			description: {
				story: [
					'Хуки сцены: `onSceneReady` вызывается, когда остров собран (и после пересборки по новым данным), его результат — функция очистки —',
					'вызывается перед пересборкой и размонтированием; `onModelReady` — для каждой модели пьедестала; `onBeforeRender` вызывается перед кадром,',
					'только если задан. Через контекст сцены приложение добавляет свои объекты на остров.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				importsFrom: kit.importsFrom,
				vue: kit.vue,
				script: scriptSource(setupSource),
			}),
		},
		controls: { include: ['quality', 'isDisabled', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { slots: [], setup }),
		template,
	}),
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getByText(/Сцена собрана · моделей на пьедесталах: [1-9]/)).toBeVisible(), {
			timeout: STORY_WAIT_TIMEOUT,
		})
	},
}
