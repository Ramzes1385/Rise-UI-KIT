import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const failingRenderer = (): never => {
	throw new Error('WebGL недоступен')
}

const template = `
	<BaseFlowMap3D v-bind="args" :renderer-factory="failingRenderer" />
`

export const RendererFallback: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Рендерер не создался (здесь `rendererFactory` бросает ошибку; в жизни — контекст отклонён, потерян или модель не загрузилась): карта сама показывает 2D, объявляет это сообщением `role="status"` и шлёт событие `fallback` с причиной `error` (без WebGL вообще — `unsupported`).',
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
				script: "const failingRenderer = () => {\n\tthrow new Error('WebGL недоступен')\n}",
			}),
		},
		controls: { exclude: ['rendererFactory', 'view'] },
	},
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { data: { failingRenderer } }),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		await waitFor(() => expect(canvas.getByText('Не удалось запустить 3D — показана карта в 2D')).toHaveAttribute('role', 'status'))
		await expect(args.onFallback).toHaveBeenCalledWith('error')
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		await expect(await canvas.findByRole('graphics-document', { name: 'Схема: Оформление заказа' })).toBeVisible()
	},
}
