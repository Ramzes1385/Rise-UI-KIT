/**
 * BaseForm — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты) → состояния (загрузка, disabled) →
 * сценарии (валидация при отправке, проверка по схеме, отправка с загрузкой) → клавиатура.
 */

import { reactive, ref } from 'vue'
import { expect, fn, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BaseFormField } from '@components/BaseFormField'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import { ARG_GROUP, baseArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import BaseForm from '../ui/BaseForm.vue'
import { FORM_VARIANTS } from '../types/BaseForm.types'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { StandardSchemaIssue, StandardSchemaV1 } from '@utils/formUtils'

/** Время «ответа сервера» в сценарии отправки с загрузкой, мс */
const SUBMIT_DELAY = 600

/** Данные заявки на вебинар */
interface WebinarRequest {
	name: string
	email: string
	topics: (string | number)[]
}

/**
 * Схема заявки в формате Standard Schema — такой объект отдают Zod, Valibot и ArkType (`z.object({ … })`).
 * Здесь она написана вручную, чтобы пример не зависел от библиотеки.
 */
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

const meta = {
	title: 'Form/BaseForm',
	component: BaseForm,
	parameters: {
		docs: {
			description: {
				component: [
					'Обёртка над `<form>`: отправка без перезагрузки страницы, состояния загрузки и блокировки.',
					'',
					'- Событие `submit` приходит, только если форма не в `isLoading` и не в `isDisabled`; нативная отправка всегда отменяется.',
					'- `isLoading` показывает подложку с лоадером, ставит `aria-busy` и блокирует нативные поля через `<fieldset disabled>`;',
					'  после разблокировки фокус возвращается на поле или кнопку, где был.',
					'- Раскладку полей задаёт содержимое (или `customClass.content`). Кнопке отправки нужен `type="submit"`.',
					'- Кастомные контролы кита (BaseSelect, BaseRange, BaseRating, BaseFileUpload, BaseEditor, BaseCheckboxGroup) блокируются вместе с формой.',
					'- `schema` (Standard Schema: Zod, Valibot, ArkType) проверяет `state` перед `submit`; ошибки показывают BaseFormField с тем же `name`,',
					'  фокус уходит на первое поле с ошибкой, после первой отправки ошибки исчезают по мере исправления.',
					'',
					'Имя форме даёт `aria-label` на компоненте. Подпись и ошибку поля задают props поля или обёртка `BaseFormField`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: FORM_VARIANTS }),
		isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		default: { control: false },
	},
	args: {
		isLoading: false,
		isDisabled: false,
		variant: 'default',
		sizeScale: 100,
		onSubmit: fn(),
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), name: ref('Анна'), email: ref('anna@example.com') }),
		template: `
			<div class="story-narrow">
				<BaseForm v-bind="props" aria-label="Подписка на рассылку">
					<div class="story-col">
						<BaseInput v-model="name" label="Имя" placeholder="Как к вам обращаться" />
						<BaseInput v-model="email" type="email" label="Email" placeholder="name@example.com" />
						<BaseButton type="submit">Подписаться</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
	}),
} satisfies Meta<typeof BaseForm>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте props в Controls. Кнопка `type="submit"` отправляет форму — приходит событие `submit`. */
export const Default: Story = {
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Подписаться' }))
		await expect(args.onSubmit).toHaveBeenCalledOnce()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Варианты: `default` и `ghost` — без оформления, `outline` — рамка, `soft` — мягкий фон, `shadow` — рамка и тень. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'isLoading', 'isDisabled'] },
		docs: { source: { code: FORM_VARIANTS.map(variant => `<BaseForm variant="${variant}" @submit="save">…</BaseForm>`).join('\n') } },
	},
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'variant']),
			variants: FORM_VARIANTS,
			values: ref<Record<string, string>>(Object.fromEntries(FORM_VARIANTS.map(variant => [variant, '']))),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px;">
				<BaseForm v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :aria-label="'Форма ' + variant">
					<div class="story-col">
						<BaseInput v-model="values[variant]" :label="variant" placeholder="name@example.com" />
						<BaseButton type="submit">Подписаться</BaseButton>
					</div>
				</BaseForm>
			</div>
		`,
	}),
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Загрузка: подложка с лоадером поверх полей, форма помечена `aria-busy`, нативные поля и кнопки отключены.
 * Отправка в этом состоянии не вызывает `submit`.
 */
export const Loading: Story = {
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('form', { name: 'Подписка на рассылку' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('status')).toHaveAccessibleName('Загрузка')
		await expect(canvas.getByLabelText('Email')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
	},
}

/** Отключённая форма: приглушена, поля и кнопки отключены (в том числе для клавиатуры), `submit` не вызывается. */
export const Disabled: Story = {
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Имя')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
		// Лоадер не показывается: статус «Загрузка» есть только во время isLoading
		await expect(canvas.queryByRole('status')).toBeNull()
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Валидация при отправке: пустые обязательные поля получают ошибку, после исправления форма отправляется.
 * Story без play: её сценарий (отправка пустой и заполненной формы) проверяет e2e-тест `BaseForm.e2e.spec.ts`.
 */
export const Validation: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
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

/**
 * Проверка по схеме: `schema` (Standard Schema — Zod, Valibot, ArkType) проверяет `state` перед `submit`. Ошибки
 * показывают BaseFormField с тем же `name`, фокус — на первом поле с ошибкой; после первой отправки ошибка исчезает,
 * как только поле исправлено. `submit` получает данные после схемы вторым аргументом.
 */
export const Schema: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
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

/**
 * Отправка с загрузкой: на время запроса форма в `isLoading`, поля заблокированы. После ответа фокус
 * возвращается на кнопку отправки — клавиатурный пользователь не теряет позицию.
 */
export const SubmitWithLoading: Story = {
	parameters: { controls: { include: ['variant', 'sizeScale'] } },
	render: args => ({
		components: { BaseForm, BaseInput, BaseButton },
		setup: () => {
			const email = ref('anna@example.com')
			const isLoading = ref(false)
			const isSaved = ref(false)

			function handleSubmit(): void {
				isLoading.value = true
				isSaved.value = false
				// Имитация запроса к серверу: суть примера — состояние загрузки на время ответа
				setTimeout(() => {
					isLoading.value = false
					isSaved.value = true
				}, SUBMIT_DELAY)
			}

			return { props: useArgsWithoutSlots(args, ['default', 'isLoading', 'onSubmit']), email, isLoading, isSaved, handleSubmit }
		},
		template: `
			<div class="story-narrow">
				<BaseForm v-bind="props" :is-loading="isLoading" aria-label="Настройки рассылки" @submit="handleSubmit">
					<div class="story-col">
						<BaseInput v-model="email" type="email" label="Email для рассылки" placeholder="name@example.com" />
						<BaseButton type="submit">Сохранить</BaseButton>
						<p v-if="isSaved" role="status" style="margin: 0; color: var(--rise-success);">Настройки сохранены</p>
					</div>
				</BaseForm>
			</div>
		`,
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

// ─── Доступность ───────────────────────────────────────────────────────────────

/** Клавиатура: Tab переводит фокус между полями, Enter в поле отправляет форму. */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const email = canvas.getByLabelText('Email')
		await userEvent.click(canvas.getByLabelText('Имя'))
		await userEvent.tab()
		await expect(email).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSubmit).toHaveBeenCalledOnce()
	},
}
