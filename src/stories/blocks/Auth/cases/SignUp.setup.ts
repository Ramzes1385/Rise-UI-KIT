import { reactive, ref } from 'vue'
import type { PasswordRule } from '@components/BaseInput'
import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

interface SignUpForm {
	name: string
	email: string
	phone: string
	password: string
}

const passwordRules: PasswordRule[] = [
	{ key: 'length', label: 'Не короче 8 символов', validate: (value: string) => value.length >= 8 },
	{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
	{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /\p{Lu}/u.test(value) },
]

const schema: StandardSchemaV1<SignUpForm> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as SignUpForm
			const issues: StandardSchemaIssue[] = []
			if (!data.name.trim()) issues.push({ message: 'Введите имя', path: ['name'] })
			if (!/^\S+@\S+\.\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			if (!/^\+\d{10,15}$/.test(data.phone)) issues.push({ message: 'Введите номер полностью', path: ['phone'] })
			if (!passwordRules.every(rule => rule.validate(data.password)))
				issues.push({ message: 'Пароль не подходит под правила ниже', path: ['password'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

export function setup() {
	const state = reactive<SignUpForm>({ name: '', email: '', phone: '', password: '' })
	const createdFor = ref('')

	function signUp(_event: Event, data?: unknown): void {
		createdFor.value = (data as SignUpForm).email
	}

	return { schema, passwordRules, state, createdFor, signUp }
}
