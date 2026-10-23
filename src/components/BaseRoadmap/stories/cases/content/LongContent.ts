import { expect } from 'storybook/test'
import { setup } from './LongContent.setup'
import type meta from '../../BaseRoadmap.stories'
import setupSource from './LongContent.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<div v-for="layout in layouts" :key="layout" class="story-stack">
			<span class="story-label">layout: {{ layout }}</span>
			<BaseRoadmap
				v-bind="args"
				:data="longRoadmap"
				:progress="longProgress"
				:layout="layout"
				:aria-label="'Путь архитектора — ' + layout"
				:expanded="longExpanded"
				:selected="null"
				:narrow-layout="null" />
		</div>
	</div>
`

const kit = scriptImports(setupSource, { imports: ['BaseRoadmap'] })

export const LongContent: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Длинное содержимое: 24 этапа, у раскрытого — 7 тем, названия в две-три строки. Карточки этапа и темы обрезают заголовок',
					'многоточием, полное название остаётся в DOM для скринридера, холст раскладки не шире контейнера: `path` и `snake` растут',
					'вниз, `horizontal` прокручивается вбок. Показана каждая раскладка.',
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
	},
	render: args => ({
		components: { BaseRoadmap },
		setup: useStorySetup(args, { slots: [], setup }),
		template,
	}),
	play: async ({ canvas }) => {
		const stages = await canvas.findAllByRole('button', { name: /^Этап 1, Этап 1\./ })
		await expect(stages).toHaveLength(4)
		const longTopic = canvas.getAllByRole('button', { name: /^Сквозное тестирование.*\(часть 1\)/ })
		await expect(longTopic.length).toBeGreaterThanOrEqual(4)
		const title = longTopic[0].querySelector('.base-roadmap__topic-title') as HTMLElement
		await expect(getComputedStyle(title).textOverflow).toBe('ellipsis')
	},
}
