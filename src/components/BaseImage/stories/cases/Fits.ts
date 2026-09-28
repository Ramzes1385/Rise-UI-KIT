import type meta from '../BaseImage.stories'
import BaseImage from '../../ui/BaseImage.vue'
import { expectImagesVisible } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: ['cover', 'contain', 'none']
					.map(fit => `<BaseImage src="…" alt="…" fit="${fit}" :width="120" :height="160" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['fit', 'width', 'height']),
			fits: ['cover', 'contain', 'none'],
			frame: { bg: { base: 'var(--rise-bg-elevated)' } },
		}),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="fit in fits" :key="fit" class="story-col" style="gap: 8px;">
					<span class="story-label">{{ fit }}</span>
					<BaseImage v-bind="props" :fit="fit" :width="120" :height="160" :color="frame" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 3)
	},
}
