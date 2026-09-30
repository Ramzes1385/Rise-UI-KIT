import { PHOTOS } from '../../shared'
import type meta from '../../BaseSlider.stories'
import BaseSlider from '../../../ui/BaseSlider.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => ({
	name: position,
	items: PHOTOS.slice(0, 3).map(photo => ({ ...photo, title: position })),
}))

const hidden = ['items', 'arrowsPosition', 'navigation', 'height', 'hasCaption']

const template = `
	<div class="story-grid" style="--story-grid-min: 300px; row-gap: 96px; padding: 40px 0;">
		<BaseSlider
			v-for="position in positions"
			:key="position.name"
			v-bind="args"
			:items="position.items"
			:arrows-position="position.name"
			navigation="none"
			height="160px" />
	</div>
`

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
			source: storySource({
				template,
				imports: ['BaseSlider'],
				script: `const positions = ${literal(positions)}`,
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseSlider },
		setup: useStorySetup(args, { data: { positions }, slots: hidden }),
		template,
	}),
}
