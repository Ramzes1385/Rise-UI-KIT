import { reactive, ref } from 'vue'
import type { StandardSchemaV1, StandardSchemaIssue } from '@utils/form/formUtils'

interface ProfileForm {
	name: string
	email: string
	bio: string
	language: string
	theme: string
	notify: { tasks: boolean; mentions: boolean; digest: boolean }
}

const initial: ProfileForm = {
	name: 'Анна Петрова',
	email: 'anna@example.com',
	bio: 'Дизайнер интерфейсов в команде платежей',
	language: 'ru',
	theme: 'system',
	notify: { tasks: true, mentions: true, digest: false },
}

const schema: StandardSchemaV1<ProfileForm> = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as ProfileForm
			const issues: StandardSchemaIssue[] = []
			if (!data.name.trim()) issues.push({ message: 'Введите имя', path: ['name'] })
			if (!/^\S+@\S+\.\S+$/.test(data.email)) issues.push({ message: 'Введите e-mail, например name@example.com', path: ['email'] })
			return issues.length ? { issues } : { value: data }
		},
	},
}

const languages = [
	{ value: 'ru', label: 'Русский' },
	{ value: 'en', label: 'English' },
]

const themes = [
	{ value: 'light', label: 'Светлая' },
	{ value: 'dark', label: 'Тёмная' },
	{ value: 'system', label: 'Как в системе' },
]

const copyOf = (form: ProfileForm): ProfileForm => ({ ...form, notify: { ...form.notify } })

export function setup() {
	const state = reactive<ProfileForm>(copyOf(initial))
	const message = ref('')

	function save(): void {
		message.value = 'Изменения сохранены'
	}

	function reset(): void {
		Object.assign(state, copyOf(initial))
		message.value = ''
	}

	return { schema, languages, themes, state, message, save, reset }
}
