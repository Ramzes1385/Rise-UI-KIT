import { reactive, ref } from 'vue'
import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

interface SignInForm {
	email: string
	password: string
	isRemembered: boolean
}

const schema: StandardSchemaV1<SignInForm> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as SignInForm
			const issues: StandardSchemaIssue[] = []
			if (!/^\S+@\S+\.\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			if (data.password.length < 8) issues.push({ message: 'Пароль — не короче 8 символов', path: ['password'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

export function setup() {
	const state = reactive<SignInForm>({ email: '', password: '', isRemembered: true })
	const message = ref('')

	function signIn(_event: Event, data?: unknown): void {
		message.value = `Вы вошли как ${(data as SignInForm).email}`
	}

	return { schema, state, message, signIn }
}
