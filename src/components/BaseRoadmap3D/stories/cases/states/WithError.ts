import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseRoadmap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../../../ui/BaseRoadmap3D.vue'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'

const failingRenderer = (): never => {
	throw new Error('WebGL недоступен')
}

const template = `
	<BaseRoadmap3D v-bind="args" :renderer-factory="failingRenderer" />
`

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			...docsFrame(760),
			description: {
				story: [
					'Рендерер недоступен (здесь `rendererFactory` бросает ошибку; в жизни — нет WebGL, контекст отклонён или потерян): путь сам',
					'показывает 2D, объявляет это сообщением `role="status"` и шлёт событие `fallback` с причиной `error` (без WebGL — `unsupported`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D'] },
				script: "const failingRenderer = () => {\n\tthrow new Error('WebGL недоступен')\n}",
			}),
		},
		controls: { exclude: ['rendererFactory', 'view'] },
	},
	render: args => ({
		components: { BaseRoadmap3D },
		setup: useStorySetup(args, { slots: [], data: { failingRenderer } }),
		template,
	}),
	play: async ({ canvas, canvasElement, args }) => {
		await waitFor(() => expect(canvas.getByText('Не удалось запустить 3D — показана 2D-карта')).toHaveAttribute('role', 'status'))
		await expect(args.onFallback).toHaveBeenCalledWith('error')
		await expect(canvasElement.querySelector('canvas')).toBeNull()
		await expect(await canvas.findByRole('button', { name: /^Pinia/ })).toBeVisible()
	},
}
