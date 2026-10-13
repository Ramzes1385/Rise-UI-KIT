import { expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseWatermark.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../../shared'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { email: '', isSent: false }

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-narrow story-stack">
			<BaseInput v-model="email" label="Эл. почта" type="email" />
			<BaseButton @click="isSent = true">Отправить</BaseButton>
			<span v-if="isSent">Письмо отправлено на {{ email }}</span>
		</div>
	</BaseWatermark>
`

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: слой знака не получает фокус и не перехватывает ввод. Tab переводит фокус на поле и на кнопку внутри обёртки,',
					'Enter нажимает кнопку.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseWatermark', 'BaseInput', 'BaseButton'], state }),
		},
	},
	render: args => ({
		components: { BaseWatermark, BaseInput, BaseButton },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForPattern(watermarkLayer(canvasElement))
		const input = canvas.getByLabelText('Эл. почта')
		await tabTo(input, userEvent)
		await expect(input).toHaveFocus()
		await userEvent.keyboard('anna@example.com')
		await expect(input).toHaveValue('anna@example.com')
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Отправить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByText('Письмо отправлено на anna@example.com')).toBeVisible()
	},
}
