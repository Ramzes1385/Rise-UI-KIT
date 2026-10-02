import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import { placeholderImage } from '@/stories/helpers'
import type BasePresentationPlayer from '../ui/BasePresentationPlayer.vue'

export const args = {
	title: 'Знакомство с компанией',
	slides: [
		{ id: 'intro', title: 'Кто мы', image: placeholderImage({ width: 1280, height: 720, hue: 24 }), duration: 4 },
		{ id: 'values', title: 'Наши ценности', image: placeholderImage({ width: 1280, height: 720, hue: 200 }), duration: 4 },
		{ id: 'team', title: 'Команда', image: placeholderImage({ width: 1280, height: 720, hue: 140 }), duration: 4 },
	],
	'onUpdate:slide': fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BasePresentationPlayer>['args']
