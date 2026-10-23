import { PROMO_ITEMS } from '../../shared'
import type meta from '../../BaseSlider.stories'
import BaseSlider from '../../../ui/BaseSlider.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseSlider v-bind="args">
		<template #default>
			<BaseSkeleton shape="rect" width="100%" height="100%" />
		</template>
	</BaseSlider>
`

export const Loading: StoryObj<typeof meta> = {
	args: {
		items: PROMO_ITEMS.slice(0, 3),
		height: '220px',
		slidesPerView: 2,
		spaceBetween: 16,
		hasArrows: false,
		navigation: 'none',
		hasCaption: false,
	},
	parameters: {
		maxWidth: 720,
		docs: {
			description: {
				story: [
					'Пока слайды загружаются, передайте заглушки: `items` нужной длины и `BaseSkeleton` в слоте `default`.',
					'Навигацию на время загрузки можно скрыть (`hasArrows=false`, `navigation="none"`).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSkeleton', 'BaseSlider'] }),
		},
	},
	render: args => ({
		components: { BaseSlider, BaseSkeleton },
		setup: useStorySetup(args),
		template,
	}),
}
