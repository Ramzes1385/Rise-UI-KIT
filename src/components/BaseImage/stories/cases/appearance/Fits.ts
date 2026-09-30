import type meta from '../../BaseImage.stories'
import BaseImage from '../../../ui/BaseImage.vue'
import { expectImagesVisible } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const fits = ['cover', 'contain', 'none']

const frame = { bg: { base: 'var(--rise-bg-elevated)' } }

const template = `
	<div class="story-row" style="align-items: flex-start;">
		<div v-for="fit in fits" :key="fit" class="story-col" style="gap: 8px;">
			<span class="story-label">{{ fit }}</span>
			<BaseImage v-bind="args" :fit="fit" :width="120" :height="160" :color="frame" />
		</div>
	</div>
`

export const Fits: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['src', 'borderRadius', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Режимы заполнения `fit` на вертикальной рамке 120 × 160 (фон рамки — `color.bg`, чтобы были видны её границы):',
					'`cover` обрезает, `contain` вписывает целиком, `none` показывает в исходном размере.',
					'`fill` растягивает растровое изображение без сохранения пропорций; SVG с `preserveAspectRatio` по умолчанию',
					'(как иллюстрации в этих примерах) при `fill` выглядит как `contain`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseImage'],
				script: [`const fits = ${literal(fits)}`, `const frame = ${literal(frame)}`].join('\n'),
				omit: ['fit', 'width', 'height'],
			}),
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: useStorySetup(args, { data: { fits, frame }, slots: ['fit', 'width', 'height'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 3)
	},
}
