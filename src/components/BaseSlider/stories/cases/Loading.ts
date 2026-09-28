import { PROMO_ITEMS } from '../shared'
import type meta from '../BaseSlider.stories'
import BaseSlider from '../../ui/BaseSlider.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseSkeleton } from '@components/BaseSkeleton'

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
			source: {
				code: [
					'<BaseSlider :items="placeholders" :has-arrows="false" navigation="none" :has-caption="false">',
					'  <template #default><BaseSkeleton shape="rect" width="100%" height="100%" /></template>',
					'</BaseSlider>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider, BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseSlider v-bind="props">
				<template #default>
					<BaseSkeleton shape="rect" width="100%" height="100%" />
				</template>
			</BaseSlider>
		`,
	}),
}
