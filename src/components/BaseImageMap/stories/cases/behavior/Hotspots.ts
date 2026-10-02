import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { active: 'active' } as const

const template = `
	<div class="story-stack story-medium">
		<BaseImageMap v-bind="args" v-model:active="active" />
		<p>Выбрано: {{ active ?? 'ничего' }}</p>
	</div>
`

export const Hotspots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Картинка с точками и областями. С клавиатуры карта — одна точка Tab: стрелки переходят к ближайшему объекту в их направлении, Home и End — к первому и последнему, недоступные пропускаются.',
					'Enter или Space выбирает объект (`v-model:active`) и выполняет его действие: окно, ссылка (хребет) или ничего (лес). Escape закрывает окно и возвращает фокус на объект.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseImageMap'], models: MODELS, types: { active: 'string | null' } }),
		},
	},
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const peak = canvas.getByRole('button', { name: 'Вершина' })
		await tabTo(peak, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'Солнце' })).toHaveFocus()
		await userEvent.keyboard('{ArrowDown}')
		const ridge = canvas.getByRole('link', { name: 'Хребет' })
		await expect(ridge).toHaveFocus()
		await userEvent.keyboard('{End}')
		await expect(ridge).toHaveFocus()
		await userEvent.keyboard('{Home}')
		await expect(peak).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(await screen.findByRole('dialog', { name: 'Вершина' })).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(peak).toHaveFocus())
		await expect(canvas.getByText('Выбрано: peak')).toBeVisible()
		await userEvent.tab()
		await expect(peak).not.toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(peak).toHaveFocus()
	},
}
