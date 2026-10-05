import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { literal, placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const small = placeholderImage({ width: 320, height: 202, hue: 200 })
const large = placeholderImage({ width: 640, height: 404, hue: 200 })

const template = `
	<div class="story-col">
		<BaseBankCard v-bind="args">
			<template #cover>
				<img :src="small" :srcset="small + ' 320w, ' + large + ' 640w'" sizes="320px" alt="" />
			</template>
		</BaseBankCard>
		<BaseBankCard v-bind="args" is-compact>
			<template #cover>
				<img :src="small" alt="" />
			</template>
		</BaseBankCard>
	</div>
`

export const CoverSlot: StoryObj<typeof meta> = {
	args: { brand: 'mir', last4: '9019', expiry: '03/36', holder: 'IVAN IVANOV', label: 'Семейная' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `cover` — своё содержимое обложки: картинка с `srcset`, `<picture>`, узор. Оно растягивается на всю карту (`object-fit: cover`), затемнение — как у пропа `cover`.',
					'Обложка декоративна (`aria-hidden`): картинке в слоте — пустой `alt`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBankCard'],
				script: [`const small = ${literal(small)}`, `const large = ${literal(large)}`].join('\n'),
				omit: ['cover'],
			}),
		},
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args, { data: { small, large }, slots: ['cover'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const covers = canvasElement.querySelectorAll('.card-cover')
		await expect(covers).toHaveLength(2)
		await expect(covers[0].querySelector('img')).toHaveAttribute('srcset')
		await expect(covers[0].querySelector('.card-cover__overlay')).not.toBeNull()
		await expect(covers[1].closest('.base-bank-card__brand')).not.toBeNull()
	},
}
