import { expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import BaseImageMapEditor from '../../../ui/BaseImageMapEditor.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { map: 'modelValue' }

const template = `
	<BaseImageMapEditor v-bind="args" v-model="map">
		<template #toolbar>
			<BaseButton variant="solid">Опубликовать</BaseButton>
		</template>
	</BaseImageMapEditor>
`

export const CustomToolbar: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Слот `toolbar` добавляет свои кнопки в конец панели инструментов — здесь «Опубликовать». JSON, который отправит такая кнопка, — значение `v-model`.',
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseImageMapEditor', 'type ImageMapData'],
				models,
				types: { map: 'ImageMapData' },
			}),
		},
	},
	render: args => ({
		components: { BaseImageMapEditor, BaseButton },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const publish = canvas.getByRole('button', { name: 'Опубликовать' })
		const toolbar = canvasElement.querySelector('.base-image-map-editor__toolbar') as HTMLElement
		await expect(toolbar.lastElementChild).toBe(publish)
		await tabTo(publish, userEvent, 30)
	},
}
