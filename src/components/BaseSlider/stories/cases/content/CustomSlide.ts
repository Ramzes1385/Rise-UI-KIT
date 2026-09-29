import { expect } from 'storybook/test'
import { BaseCard } from '@components/BaseCard'
import type meta from '../../BaseSlider.stories'
import { PROMO_ITEMS, PROMOS } from '../../shared'
import BaseSlider from '../../../ui/BaseSlider.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const CustomSlide: StoryObj<typeof meta> = {
	args: {
		items: PROMO_ITEMS,
		height: '300px',
		slidesPerView: 2,
		spaceBetween: 16,
		hasCaption: false,
		arrowsPosition: 'top-right',
	},
	parameters: {
		maxWidth: 720,
		docs: {
			description: {
				story: [
					'Свои слайды: слот `default` получает `{ item, index }` и рисует любое содержимое — здесь карточки акций',
					'с кнопкой. Слоты `header` и `footer` — над и под каруселью, `caption` — своя подпись. Стрелки `top-right`',
					'встают справа от заголовка из слота `header`. Кнопки на невидимых слайдах недоступны с клавиатуры, пока',
					'слайд не станет видимым.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseSlider :items="promos" :slides-per-view="2" :space-between="16" :has-caption="false" arrows-position="top-right">',
					'  <template #header>…</template>',
					'  <template #default="{ item }">',
					'    <BaseCard variant="soft" :title="item.title" height="100%">…</BaseCard>',
					'  </template>',
					'</BaseSlider>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider, BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), promos: PROMOS }),
		template: `
			<BaseSlider v-bind="props">
				<template #header>
					<div class="story-row" style="min-height: 32px; margin-bottom: 8px;">
						<strong>Акции недели</strong>
					</div>
				</template>
				<template #default="{ index }">
					<BaseCard variant="soft" :title="promos[index].title" :subtitle="promos[index].subtitle" height="100%">
						<div class="story-col">
							<span>{{ promos[index].text }}</span>
							<BaseButton variant="outline">Подробнее</BaseButton>
						</div>
					</BaseCard>
				</template>
			</BaseSlider>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [first, , third] = canvas.getAllByRole('button', { name: 'Подробнее' })
		await tabTo(first!, userEvent)
		await expect(third!.closest('[inert]')).not.toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(third!.closest('[inert]')).toBeNull()
	},
}
