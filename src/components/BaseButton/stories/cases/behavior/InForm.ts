import { fn, expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource } from '@/stories/helpers'

const template = `
	<form class="story-row" aria-label="Профиль" @submit.prevent>
		<BaseButton type="submit">Сохранить</BaseButton>
		<BaseButton type="reset" variant="outline">Сбросить</BaseButton>
	</form>
`

export const InForm: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кнопки в форме: `type="submit"` отправляет форму, `type="reset"` сбрасывает её.',
					'Пока кнопка отправки в `isLoading`, повторная отправка невозможна.',
				].join('\n'),
			},
			source: staticStorySource({ template, imports: ['BaseButton'] }),
		},
	},
	render: () => ({ components: { BaseButton }, template }),
	play: async ({ canvas, userEvent }) => {
		const onSubmit = fn()
		canvas.getByRole('form', { name: 'Профиль' }).addEventListener('submit', onSubmit)
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(onSubmit).toHaveBeenCalledOnce()
	},
}
