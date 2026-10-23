import { ref } from 'vue'
import type meta from '../../BaseForm.stories'
import BaseForm from '../../../ui/BaseForm.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const SUBMIT_DELAY = 600

const template = `
	<div class="story-narrow">
		<BaseForm v-bind="args" :is-loading="isLoading" aria-label="Настройки рассылки" @submit="handleSubmit">
			<div class="story-col">
				<BaseInput v-model="email" type="email" label="Email для рассылки" placeholder="name@example.com" />
				<BaseButton type="submit">Сохранить</BaseButton>
				<p v-if="isSaved" role="status" style="margin: 0; color: var(--rise-success);">Настройки сохранены</p>
			</div>
		</BaseForm>
	</div>
`

const script = `
const email = ref('anna@example.com')
const isLoading = ref(false)
const isSaved = ref(false)

function handleSubmit(): void {
	isLoading.value = true
	isSaved.value = false
	setTimeout(() => {
		isLoading.value = false
		isSaved.value = true
	}, ${SUBMIT_DELAY})
}
`

export const SubmitWithLoading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Отправка с загрузкой: на время запроса форма в `isLoading`, поля заблокированы. После ответа фокус',
					'возвращается на кнопку отправки — клавиатурный пользователь не теряет позицию.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseForm', 'BaseInput', 'BaseButton'],
				vue: ['ref'],
				script,
				omit: ['default', 'isLoading', 'onSubmit'],
			}),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: useStorySetup(args, {
			slots: ['default', 'isLoading', 'onSubmit'],
			setup: () => {
				const email = ref('anna@example.com')
				const isLoading = ref(false)
				const isSaved = ref(false)

				function handleSubmit(): void {
					isLoading.value = true
					isSaved.value = false
					setTimeout(() => {
						isLoading.value = false
						isSaved.value = true
					}, SUBMIT_DELAY)
				}

				return { email, isLoading, isSaved, handleSubmit }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const form = canvas.getByRole('form', { name: 'Настройки рассылки' })
		const save = canvas.getByRole('button', { name: 'Сохранить' })
		await userEvent.click(save)
		await expect(form).toHaveAttribute('aria-busy', 'true')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Настройки сохранены'), { timeout: SUBMIT_DELAY * 5 })
		await expect(form).not.toHaveAttribute('aria-busy')
		await expect(save).toHaveFocus()
	},
}
