import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseSlideover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { screen, within, waitFor, expect } from 'storybook/test'

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'hasOverlay']

const state = { isOpen: false, width: '320', clicks: 0 }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton variant="outline" @click="isOpen = true">Свойства слоя</BaseButton>
			<BaseButton variant="ghost" @click="clicks++">Добавить слой</BaseButton>
		</div>
		<BaseText>Слоёв добавлено: {{ clicks }}</BaseText>
	</div>
	<BaseSlideover v-bind="args" v-model:is-open="isOpen" title="Свойства" :has-overlay="false">
		<BaseInput v-model="width" label="Ширина, px" />
	</BaseSlideover>
`

export const NonModal: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Немодальная панель: `hasOverlay: false`. Затемнения нет, страница под панелью кликается и прокручивается,',
					'фокус при открытии остаётся на кнопке и свободно переходит между страницей и панелью (без `aria-modal` и ловушки).',
					'Escape закрывает панель, только когда фокус в ней. Для инспекторов и панелей свойств рядом с рабочей областью.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSlideover', 'BaseButton', 'BaseInput', 'BaseText'], state, omit: OWN_ARGS }),
		},
		controls: { include: ['side', 'width', 'closeOnEscape'] },
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseSlideover, BaseButton, BaseInput, BaseText },
		setup: useStorySetup(args, { state, slots: OWN_ARGS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Свойства слоя' })
		await userEvent.click(trigger)

		const dialog = await screen.findByRole('dialog', { name: 'Свойства' })
		await expect(dialog).not.toHaveAttribute('aria-modal')
		await expect(trigger).toHaveFocus()

		await userEvent.click(canvas.getByRole('button', { name: 'Добавить слой' }))
		await expect(canvas.getByText('Слоёв добавлено: 1')).toBeVisible()
		await expect(dialog).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await expect(dialog).toBeInTheDocument()

		await userEvent.click(within(dialog).getByLabelText('Ширина, px'))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
