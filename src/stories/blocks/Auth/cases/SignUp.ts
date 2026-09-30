import { reactive, ref } from 'vue'
import type meta from '../Auth.stories'
import { BaseForm } from '@components/BaseForm'
import { BaseLink } from '@components/BaseLink'
import { waitFor, expect } from 'storybook/test'
import { BaseAlert } from '@components/BaseAlert'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseFormField } from '@components/BaseFormField'
import type { PasswordRule } from '@components/BaseInput'
import { BasePhoneInput } from '@components/BasePhoneInput'
import { staticStorySource, useStorySetup } from '@/stories/helpers'
import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

interface SignUpForm {
	name: string
	email: string
	phone: string
	password: string
}

const PASSWORD_RULES: PasswordRule[] = [
	{ key: 'length', label: 'Не короче 8 символов', validate: (value: string) => value.length >= 8 },
	{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
	{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /\p{Lu}/u.test(value) },
]

const SCHEMA: StandardSchemaV1<SignUpForm> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as SignUpForm
			const issues: StandardSchemaIssue[] = []
			if (!data.name.trim()) issues.push({ message: 'Введите имя', path: ['name'] })
			if (!/^\S+@\S+\.\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			if (!/^\+\d{10,15}$/.test(data.phone)) issues.push({ message: 'Введите номер полностью', path: ['phone'] })
			if (!PASSWORD_RULES.every(rule => rule.validate(data.password)))
				issues.push({ message: 'Пароль не подходит под правила ниже', path: ['password'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

const template = `
	<div class="blk-page blk-auth">
		<div class="blk-auth__card">
			<div class="blk-auth__header">
				<span class="blk-auth__logo" aria-hidden="true">R</span>
				<h1 class="blk-title">Создайте аккаунт</h1>
				<p class="blk-muted">14 дней бесплатно, карта не нужна</p>
			</div>
			<BaseAlert
				v-if="createdFor"
				type="success"
				:description="'Аккаунт создан. Письмо для подтверждения отправлено на ' + createdFor" />
			<BaseForm v-else :schema="schema" :state="state" aria-label="Регистрация" @submit="signUp">
				<div class="blk-auth__fields">
					<BaseFormField label="Имя" name="name" is-required>
						<BaseInput v-model="state.name" placeholder="Анна Петрова" :input-attrs="{ autocomplete: 'name' }" />
					</BaseFormField>
					<BaseFormField label="E-mail" name="email" is-required>
						<BaseInput v-model="state.email" type="email" placeholder="name@example.com" :input-attrs="{ autocomplete: 'email' }" />
					</BaseFormField>
					<BaseFormField label="Телефон" name="phone" is-required description="Для входа по коду и восстановления доступа">
						<BasePhoneInput v-model="state.phone" />
					</BaseFormField>
					<BaseFormField label="Пароль" name="password" is-required>
						<BaseInput
							v-model="state.password"
							type="password"
							:password-rules="passwordRules"
							:input-attrs="{ autocomplete: 'new-password' }" />
					</BaseFormField>
					<BaseButton type="submit" class="blk-auth__wide">Создать аккаунт</BaseButton>
					<p class="blk-muted">
						Нажимая «Создать аккаунт», вы принимаете <BaseLink href="#">условия сервиса</BaseLink> и
						<BaseLink href="#">политику конфиденциальности</BaseLink>.
					</p>
				</div>
			</BaseForm>
			<p class="blk-auth__footer">Уже есть аккаунт? <BaseLink href="#">Войти</BaseLink></p>
		</div>
	</div>
`

const script = `
interface SignUpForm {
	name: string
	email: string
	phone: string
	password: string
}

const passwordRules: PasswordRule[] = [
	{ key: 'length', label: 'Не короче 8 символов', validate: (value: string) => value.length >= 8 },
	{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\\d/.test(value) },
	{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /\\p{Lu}/u.test(value) },
]

const schema: StandardSchemaV1<SignUpForm> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as SignUpForm
			const issues: StandardSchemaIssue[] = []
			if (!data.name.trim()) issues.push({ message: 'Введите имя', path: ['name'] })
			if (!/^\\S+@\\S+\\.\\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			if (!/^\\+\\d{10,15}$/.test(data.phone)) issues.push({ message: 'Введите номер полностью', path: ['phone'] })
			if (!passwordRules.every(rule => rule.validate(data.password)))
				issues.push({ message: 'Пароль не подходит под правила ниже', path: ['password'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

const state = reactive<SignUpForm>({ name: '', email: '', phone: '', password: '' })
const createdFor = ref('')

function signUp(_event: Event, data?: unknown): void {
	createdFor.value = (data as SignUpForm).email
}
`

export const SignUp: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Регистрация: имя, почта, телефон с выбором страны (BasePhoneInput) и пароль с правилами, которые отмечаются по мере',
					'ввода. После отправки форма сменяется сообщением об успехе; согласие с условиями — текстом под кнопкой.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: [
					'BaseAlert',
					'BaseButton',
					'BaseForm',
					'BaseFormField',
					'BaseInput',
					'BaseLink',
					'BasePhoneInput',
					'type PasswordRule',
				],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaIssue', 'type StandardSchemaV1'] },
				vue: ['reactive', 'ref'],
				script,
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton, BaseForm, BaseFormField, BaseInput, BaseLink, BasePhoneInput },
		setup: useStorySetup(args, {
			data: { schema: SCHEMA, passwordRules: PASSWORD_RULES },
			setup: () => {
				const state = reactive<SignUpForm>({ name: '', email: '', phone: '', password: '' })
				const createdFor = ref('')
				const signUp = (_event: Event, data?: unknown): void => {
					createdFor.value = (data as SignUpForm).email
				}
				return { state, createdFor, signUp }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Создать аккаунт' }))
		const name = canvas.getByRole('textbox', { name: 'Имя' })
		await waitFor(() => expect(name).toHaveFocus())
		await expect(name).toHaveAccessibleDescription('Введите имя')

		await userEvent.type(name, 'Анна Петрова')
		await userEvent.type(canvas.getByRole('textbox', { name: 'E-mail' }), 'anna@example.com')
		await userEvent.type(canvas.getByRole('textbox', { name: /^Телефон/ }), '9161234567')
		await userEvent.type(canvas.getByLabelText(/^Пароль/), 'Rise2026pass')
		await userEvent.click(canvas.getByRole('button', { name: 'Создать аккаунт' }))
		await waitFor(() =>
			expect(canvas.getByText('Аккаунт создан. Письмо для подтверждения отправлено на anna@example.com')).toBeVisible(),
		)
	},
}
