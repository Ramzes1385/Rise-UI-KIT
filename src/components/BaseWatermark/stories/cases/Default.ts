import type meta from '../BaseWatermark.stories'
import { expect, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseWatermark from '../../ui/BaseWatermark.vue'
import { watermarkLayer, waitForPattern } from '../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { name: '' }

const template = `
	<BaseWatermark v-bind="args">
		<div class="story-frame story-narrow story-stack">
			<strong>Договор оказания услуг № 24-117</strong>
			<span>Исполнитель обязуется подготовить отчёт к 30 октября, заказчик — принять и оплатить работу.</span>
			<BaseInput v-model="name" label="Ваше имя" />
			<BaseButton>Подписать</BaseButton>
		</div>
	</BaseWatermark>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: карточка с текстом и формой под знаком «Конфиденциально». Знак лежит поверх содержимого, но клики, ввод',
					'и чтение проходят сквозь него. Меняйте текст, поворот, расстояние и прозрачность в панели Controls.',
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
		const layer = watermarkLayer(canvasElement)
		await waitForPattern(layer)
		await expect(layer).toHaveAttribute('aria-hidden', 'true')
		await expect(getComputedStyle(layer).pointerEvents).toBe('none')

		const button = canvas.getByRole('button', { name: 'Подписать' })
		button.scrollIntoView()
		await waitFor(() => {
			const rect = button.getBoundingClientRect()
			const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
			expect(button.contains(target)).toBe(true)
		})

		const input = canvas.getByLabelText('Ваше имя')
		await userEvent.type(input, 'Анна')
		await expect(input).toHaveValue('Анна')
	},
}
