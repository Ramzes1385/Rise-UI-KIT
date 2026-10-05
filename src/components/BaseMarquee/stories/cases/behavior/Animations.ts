import { NEWS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseMarquee :key="replay" v-bind="args" :items="news" label="Новости">
			<template #separator>•</template>
		</BaseMarquee>
	`,
	components: { BaseButton, BaseMarquee },
	imports: ['BaseMarquee'],
	state: { news: [...NEWS] },
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['speed', 'direction', 'hasFade'] },
		docs: {
			description: {
				story: [
					'Лента в колонках четырёх пресетов движения; «Повторить» запускает её заново. Скорость ленты — проп `speed` (px/с),',
					'длительность круга считается по размеру содержимого (`--marquee-duration`), поэтому пресеты движения её не меняют.',
					'Лента — декоративная бесконечная анимация: при системной настройке «уменьшить движение» она стоит, не копируется и',
					'прокручивается вручную, кнопки паузы нет. Наведение и фокус внутри останавливают её; кнопка паузы — проп `hasPauseButton`.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('marquee', { name: 'Новости' })).toHaveLength(4))
		for (const marquee of canvas.getAllByRole('marquee', { name: 'Новости' })) await waitFor(() => expect(marquee).toBeVisible())
	},
}
