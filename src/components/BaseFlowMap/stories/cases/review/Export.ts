import { setup } from './setup/Export.setup'
import { reviewArgs } from '../../reviewShared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import setupSource from './setup/Export.setup.ts?raw'
import { scriptImports, scriptSource, storySource, useStorySetup } from '@/stories/helpers'

const kit = scriptImports(setupSource, { imports: ['BaseFlowMap', 'BaseButton'] })

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="exportSvg">Экспорт SVG</BaseButton>
			<BaseButton variant="outline" @click="exportPng">Экспорт PNG</BaseButton>
			<BaseButton variant="outline" @click="exportJson">Выгрузить JSON</BaseButton>
		</div>
		<BaseFlowMap ref="map" v-bind="args" />
		<p class="story-label" role="status">{{ result }}</p>
	</div>
`

export const Export: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Экспорт картинки: `controller.exportSvg(options)` возвращает строку SVG, `exportPng(options)` — `Blob` PNG; `area` выбирает всё содержимое или видимую область, `pixelRatio` — плотность PNG, `background` — фон темы или прозрачный. В картинку попадает то, что видно на карте: узлы с подписями и цветами статусов, связи и группы; интерфейс (панели, булавки) в неё не входит.',
					'Приложение само сохраняет результат (ссылка на `Blob`, `download`); карта лишь отдаёт данные. Ошибка экспорта приходит событием `error` с кодом `export-failed`, а не исключением.',
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
	args: { ...reviewArgs, mode: 'view', suggestions: [], comments: [], versions: [], height: '560px' },
	render: args => ({
		components: { BaseFlowMap, BaseButton },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Экспорт SVG' }))
		await waitFor(() => expect(canvas.getByText(/^(SVG|PNG): /)).toHaveTextContent(/SVG: \d+ символов, начинается с <svg/))
		await userEvent.click(canvas.getByRole('button', { name: 'Экспорт PNG' }))
		await waitFor(() => expect(canvas.getByText(/^(SVG|PNG): /)).toHaveTextContent(/PNG: image\/png/), { timeout: 8000 })
	},
}
