import { reactive, ref } from 'vue'
import type meta from '../../BaseForm.stories'
import BaseForm from '../../../ui/BaseForm.vue'
import { waitFor, expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseFormField } from '@components/BaseFormField'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

interface WebinarRequest {
	name: string
	email: string
	topics: (string | number)[]
}

const WEBINAR_SCHEMA: StandardSchemaV1<WebinarRequest> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as WebinarRequest
			const issues: StandardSchemaIssue[] = []
			if (!data.name.trim()) issues.push({ message: 'Введите имя', path: ['name'] })
			if (!/^\S+@\S+\.\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			if (data.topics.length === 0) issues.push({ message: 'Выберите хотя бы одну тему', path: ['topics'] })
			return issues.length ? { issues } : { value: { ...data, name: data.name.trim() } }
		},
	},
}

const WEBINAR_TOPICS = [
	{ value: 'forms', label: 'Формы' },
	{ value: 'tables', label: 'Таблицы' },
	{ value: 'a11y', label: 'Доступность' },
]

export const Schema: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Проверка по схеме: `schema` (Standard Schema — Zod, Valibot, ArkType) проверяет `state` перед `submit`. Ошибки',
					'показывают BaseFormField с тем же `name`, фокус — на первом поле с ошибкой; после первой отправки ошибка исчезает,',
					'как только поле исправлено. `submit` получает данные после схемы вторым аргументом.',
				].join('\n'),
			},
			source: {
				code: [
					'<script setup lang="ts">',
					'const schema = z.object({ name: z.string().trim().min(1, "Введите имя"), email: z.email("Введите e-mail"), topics: z.array(z.string()).min(1) })',
					'const state = reactive({ name: "", email: "", topics: [] })',
					'</script>',
					'',
					'<BaseForm :schema="schema" :state="state" @submit="(event, data) => send(data)">',
					'  <BaseFormField label="Имя" name="name" is-required><BaseInput v-model="state.name" /></BaseFormField>',
					'  <BaseFormField label="E-mail" name="email" is-required><BaseInput v-model="state.email" type="email" /></BaseFormField>',
					'  <BaseFormField label="Темы" name="topics" is-required><BaseCheckboxGroup v-model="state.topics" :options="topics" /></BaseFormField>',
					'  <BaseButton type="submit">Записаться</BaseButton>',
					'</BaseForm>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseForm, BaseFormField, BaseInput, BaseCheckboxGroup, BaseButton },
		setup: () => {
			const state = reactive<WebinarRequest>({ name: '', email: '', topics: [] })
			const sentName = ref('')
			return {
				props: useArgsWithoutSlots(args, ['default', 'onSubmit']),
				schema: WEBINAR_SCHEMA,
				state,
				topics: WEBINAR_TOPICS,
				sentName,
				handleSubmit: (_event: Event, data?: unknown) => {
					sentName.value = (data as WebinarRequest).name
				},
			}
		},
		template: `
			<div class="story-narrow">
				<BaseForm v-bind="props" :schema="schema" :state="state" aria-label="Заявка на вебинар" @submit="handleSubmit">
					<div class="story-col">
						<BaseFormField label="Имя" name="name" is-required>
							<BaseInput v-model="state.name" placeholder="Как к вам обращаться" />
						</BaseFormField>
						<BaseFormField label="E-mail" name="email" is-required description="Пришлём ссылку на трансляцию">
							<BaseInput v-model="state.email" type="email" placeholder="name@example.com" />
						</BaseFormField>
						<BaseFormField label="Темы" name="topics" is-required>
							<BaseCheckboxGroup v-model="state.topics" :options="topics" />
						</BaseFormField>
						<BaseButton type="submit">Записаться</BaseButton>
						<p v-if="sentName" role="status" style="margin: 0; color: var(--rise-success);">{{ sentName }}, вы записаны</p>
					</div>
				</BaseForm>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Записаться' }))
		const name = canvas.getByRole('textbox', { name: 'Имя' })
		await waitFor(() => expect(name).toHaveFocus())
		await expect(name).toHaveAccessibleDescription('Введите имя')
		await expect(canvas.getByRole('group', { name: 'Темы' })).toHaveAccessibleDescription('Выберите хотя бы одну тему')

		await userEvent.type(name, ' Анна ')
		await waitFor(() => expect(canvas.queryByText('Введите имя')).toBeNull())
		await userEvent.type(canvas.getByRole('textbox', { name: 'E-mail' }), 'anna@example.com')
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Доступность' }))
		await waitFor(() => expect(canvas.queryByText('Выберите хотя бы одну тему')).toBeNull())

		await userEvent.click(canvas.getByRole('button', { name: 'Записаться' }))
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Анна, вы записаны'))
	},
}
