import { PHOTOS } from '../shared'
import type meta from '../BaseSlider.stories'
import BaseSlider from '../../ui/BaseSlider.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const ArrowPositions: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 720,
		controls: { include: ['isLoop', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Позиции стрелок: `center` (по умолчанию) — поверх слайдов по бокам; угловые — снаружи, над или под областью',
					'слайдов (оставьте для них место). Снаружи стрелки контурные, поверх фото — приподнятые с тенью.',
				].join('\n'),
			},
			source: {
				code: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
					.map(position => `<BaseSlider :items="slides" arrows-position="${position}" navigation="none" height="160px" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['items', 'arrowsPosition', 'navigation', 'height', 'hasCaption']),
			positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
			slidesFor: (position: string) => PHOTOS.slice(0, 3).map(photo => ({ ...photo, title: position })),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 300px; row-gap: 96px; padding: 40px 0;">
				<BaseSlider
					v-for="position in positions"
					:key="position"
					v-bind="props"
					:items="slidesFor(position)"
					:arrows-position="position"
					navigation="none"
					height="160px" />
			</div>
		`,
	}),
}
