import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { buildGeneratedMap } from '../../fixtures/generated'
import generatedSource from '../../fixtures/generated.ts?raw'
import { scriptImports, scriptSource, storySource, STORY_WAIT_TIMEOUT, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(generatedSource, { imports: ['BaseFlowMap'] })

const template = `
	<BaseFlowMap v-bind="args" :data="data" aria-label="Большая карта" :panels="['toolbar', 'minimap']" :particles="false" />
`

export const Performance: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'wheelZoom'] },
		docs: {
			description: {
				story: [
					'Большая карта: 300 узлов и около 580 связей, слоистая раскладка с прямыми линиями; частицы выключены (`particles: false`), панель — масштаб и мини-карта.',
					'Раскладка 300 узлов укладывается в бюджет ядра (медиана около 20 мс), пан и масштаб идут без разрывов. История не входит в скриншот-тесты: время отрисовки зависит от машины.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: kit.imports,
				importsFrom: kit.importsFrom,
				script: `${scriptSource(generatedSource)}\n\nconst data = buildGeneratedMap(300)`,
				omit: ['data', 'panels', 'particles'],
			}),
		},
	},
	args: { height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { data: buildGeneratedMap(300) } }),
		template,
	}),
	play: async ({ canvas, args }) => {
		await waitFor(() => expect(args.onReady).toHaveBeenCalled(), { timeout: STORY_WAIT_TIMEOUT * 3 })
		await expect(canvas.getByRole('graphics-document', { name: 'Схема: Большая карта: 300 узлов' })).toBeVisible()
		await expect(canvas.getAllByRole('graphics-object').length).toBeGreaterThan(50)
	},
}
