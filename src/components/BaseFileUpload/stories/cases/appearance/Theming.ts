import { expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-upload', dropzone: 'story-themed-dropzone' }

const template = `
	<div class="story-stack">
		<BaseFileUpload v-bind="args" label="По умолчанию" />
		<div style="--rise-file-upload-dropzone-bg: var(--rise-bg-muted); --rise-file-upload-dropzone-border: var(--rise-primary); --rise-file-upload-dropzone-radius: var(--rise-radius-2xl); --rise-file-upload-dropzone-padding-y: 32px; --rise-file-upload-item-radius: var(--rise-radius-lg);">
			<BaseFileUpload v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseFileUpload v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-file-upload-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'`gap`; зона — `dropzone-bg`, `dropzone-bg-hover`, `dropzone-border`, `dropzone-radius`, `dropzone-padding-x`,',
					'`dropzone-padding-y`; строка файла — `item-bg`, `item-border`, `item-radius`, `item-padding` (список —',
					'docs/design/COMPONENT_TOKENS.md). Отступы зоны и списка умножаются на плотность темы `--rise-density`. Проп `ui` добавляет',
					'классы к частям (`root`, `dropzone`, `list`, `item`, `name`… — `FILE_UPLOAD_PARTS`); для всех полей приложения —',
					'`defaults.BaseFileUpload.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFileUpload'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-file-upload')]
		const zone = (field: HTMLElement) => field.querySelector<HTMLElement>('.base-file-upload__dropzone')!

		await expect(getComputedStyle(zone(themed)).backgroundColor).not.toBe(getComputedStyle(zone(plain)).backgroundColor)
		await expect(getComputedStyle(zone(themed)).borderTopColor).not.toBe(getComputedStyle(zone(plain)).borderTopColor)
		await expect(getComputedStyle(zone(themed)).borderTopLeftRadius).toBe('16px')
		await expect(getComputedStyle(zone(themed)).paddingTop).toBe('32px')
		await expect(getComputedStyle(zone(plain)).paddingTop).toBe('24px')
		await expect(classed).toHaveClass('base-file-upload', 'story-themed-upload')
		await expect(zone(classed)).toHaveClass('base-file-upload__dropzone', 'story-themed-dropzone')
	},
}
