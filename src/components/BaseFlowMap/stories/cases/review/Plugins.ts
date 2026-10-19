import { flowNode } from '../../shared'
import { setup } from './setup/Plugins.setup'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import setupSource from './setup/Plugins.setup.ts?raw'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" :aria-pressed="isOn" @click="toggle">{{ isOn ? 'Отключить плагин' : 'Подключить плагин' }}</BaseButton>
		</div>
		<BaseFlowMap v-bind="args" :plugins="plugins" />
		<ol class="story-col" aria-label="Журнал плагина">
			<li v-for="(line, index) in log" :key="index" class="story-label">{{ line }}</li>
		</ol>
	</div>
`

export const Plugins: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Плагины: `defineFlowPlugin` собирает набор нотаций, раскладок, маршрутизаторов, проверок карты (`validators`) и хуков, который подключается пропом `plugins` (всему приложению — `defaults.BaseFlowMap.plugins`).',
					'`setup(controller)` вызывается при подключении и может подписаться на события; функция, которую он вернёт, вызывается при отключении — подписки снимаются. Ошибка плагина не ломает карту: она попадает в предупреждение «плагин выбросил ошибку», остальные плагины работают; повторное имя — предупреждение, действует последний.',
					'Плагин «audit» здесь пишет в журнал при подключении, на клик по узлу и при отключении; кнопка переключает проп `plugins`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				vue: kit.vue,
				importsFrom: kit.importsFrom,
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getByText('audit: подключён')).toBeVisible())
		await userEvent.click(flowNode(canvas, 'Orders'))
		await waitFor(() => expect(canvas.getByText('audit: клик по orders')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Отключить плагин' }))
		await waitFor(() => expect(canvas.getByText('audit: отключён')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Подключить плагин' }))
		await waitFor(() => expect(canvas.getAllByText('audit: подключён').length).toBeGreaterThan(0))
	},
}
