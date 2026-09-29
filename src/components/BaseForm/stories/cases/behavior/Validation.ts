import { ref } from 'vue'
import type meta from '../../BaseForm.stories'
import BaseForm from '../../../ui/BaseForm.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Validation: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Валидация при отправке: пустые обязательные поля получают ошибку, после исправления форма отправляется.',
					'Story без play: её сценарий (отправка пустой и заполненной формы) проверяет e2e-тест `BaseForm.e2e.spec.ts`.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: () => {
			const name = ref('')
			const email = ref('')
			const errors = ref<{ name?: string; email?: string }>({})
			const isSent = ref(false)

			function handleSubmit(): void {
				errors.value = {
					name: name.value.trim() ? undefined : 'Введите имя',
					email: email.value.includes('@') ? undefined : 'Введите email, например name@example.com',
				}
				isSent.value = !errors.value.name && !errors.value.email
			}

			return { props: useArgsWithoutSlots(args, ['default', 'onSubmit']), name, email, errors, isSent, handleSubmit }
		},
		template: `
			<div class="story-narrow">
				<BaseForm v-bind="props" aria-label="Заявка на консультацию" @submit="handleSubmit">
					<div class="story-col">
						<BaseInput v-model="name" label="Имя" placeholder="Введите имя" is-required :error="errors.name" />
						<BaseInput v-model="email" type="email" label="Email" placeholder="name@example.com" is-required :error="errors.email" />
						<BaseButton type="submit">Отправить</BaseButton>
						<p v-if="isSent" role="status" style="margin: 0; color: var(--rise-success);">Заявка отправлена</p>
					</div>
				</BaseForm>
			</div>
		`,
	}),
}
