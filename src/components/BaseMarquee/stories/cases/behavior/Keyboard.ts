import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import { emulateReducedMotion } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { isPaused: 'isPaused' }

const template = `
	<BaseMarquee v-bind="args" v-model:is-paused="isPaused" label="Акции">
		Скидка 20% на всё до воскресенья · Бесплатная доставка от 3000 ₽
	</BaseMarquee>
`

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab — на кнопку паузы, Enter и Пробел останавливают и запускают ленту; фокус внутри тоже останавливает её. Копии содержимого для бесшовного круга выведены из Tab (`inert`) и скрыты от скринридера. История включает движение, даже если в системе оно уменьшено.',
			},
			source: storySource({ template, imports: ['BaseMarquee'], models }),
		},
	},
	tags: ['!autodocs'],
	beforeEach: emulateReducedMotion(false),
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const copies = canvasElement.querySelectorAll('.base-marquee__group[aria-hidden="true"][inert]')
		await expect(copies.length).toBeGreaterThan(0)
		const pause = canvas.getByRole('button', { name: 'Остановить бегущую строку' })
		await tabTo(pause, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getByRole('marquee', { name: 'Акции' })).toHaveClass('base-marquee--paused'))
		await expect(canvas.getByRole('button', { name: 'Запустить бегущую строку' })).toHaveFocus()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(canvas.getByRole('marquee', { name: 'Акции' })).not.toHaveClass('base-marquee--paused'))
		await expect(canvas.getByRole('button', { name: 'Остановить бегущую строку' })).toHaveFocus()
	},
}
