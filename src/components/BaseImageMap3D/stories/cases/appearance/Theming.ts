import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap3D from '../../../ui/BaseImageMap3D.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { IMAGE_MAP_MALL } from '@components/BaseImageMap/stories/fixtures'

const ui = {
	root: 'story-themed-map',
	viewport: 'story-themed-viewport',
	camera: 'story-themed-camera',
	directory: 'story-themed-directory',
	entry: 'story-themed-entry',
	legend: 'story-themed-legend',
}

const template = `
	<div class="story-medium">
		<BaseImageMap3D v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Части и токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Проп `ui` добавляет классы к частям карты, а не заменяет классы кита. Названия частей общие с BaseImageMap (`IMAGE_MAP_PARTS`),',
					'поэтому один объект работает и в 3D-, и в 2D-виде (`has2dToggle`). В 3D: `root`, `views`, `toolbar`, `layers`, `camera`, `viewport`, `canvas`,',
					'`state`, `point`, `marker`, `label`, `hint`, `tooltip` (карточка у точки), `status`, `popup` (окно карточки) — `IMAGE_MAP_3D_PARTS`;',
					'у вложенных списка объектов — `directory`, `search`, `filters`, `results`, `list`, `entry`, у легенды — `legend`, `legend-item`, `swatch`,',
					'у панели «Как пройти» — `route`, `route-steps`, `route-step`. Для всех 3D-карт приложения — `defaults.BaseImageMap3D.ui` плагина,',
					'классы склеиваются: сначала глобальные, затем экземпляра. Цвета, радиусы и отступы — токены `--rise-image-map-*` (как у BaseImageMap).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/map3d': ['BaseImageMap3D'] },
				script: `const ui = ${literal(ui)}`,
			}),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, hasLegend: true, layer: 'floor-1', height: '360px' },
	render: args => ({
		components: { BaseImageMap3D },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await waitFor(() => expect(canvasElement.querySelector('canvas')).not.toBeNull())
		await expect(canvasElement.querySelector('.base-image-map-3d')).toHaveClass('base-image-map-3d', ui.root)
		await expect(canvasElement.querySelector('.base-image-map-3d__viewport')).toHaveClass(ui.viewport)
		await expect(canvasElement.querySelector('.base-image-map-3d__camera')).toHaveClass(ui.camera)
		await expect(canvasElement.querySelector('.base-image-map__directory')).toHaveClass(ui.directory)
		await expect(canvasElement.querySelector('.base-image-map__entry')).toHaveClass(ui.entry)
		await expect(canvasElement.querySelector('.base-image-map__legend')).toHaveClass(ui.legend)
	},
}
