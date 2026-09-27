/**
 * BaseForm — stories.
 *
 * Разделы: Default (песочница) → внешний вид (варианты) → состояния (загрузка, disabled) →
 * сценарии (валидация при отправке, отправка с загрузкой) → клавиатура.
 */

import { expect, fn, waitFor } from 'storybook/test'
import { ref } from 'vue'
import { ARG_GROUP, baseArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { FORM_VARIANTS } from '../model/BaseForm.types'
import BaseForm from '../ui/BaseForm.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Время «ответа сервера» в сценарии отправки с загрузкой, мс */
const SUBMIT_DELAY = 600

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
					'- `BaseSelect`, `BaseRange`, `BaseRating` и `BaseEditor` fieldset не блокирует — отключайте их собственными props.',
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
