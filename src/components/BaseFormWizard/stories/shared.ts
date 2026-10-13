import { reactive, ref } from 'vue'
import { useStorySetup } from '@/stories/helpers'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import BaseFormWizard from '../ui/BaseFormWizard.vue'
import { BaseFormField } from '@components/BaseFormField'
import type { StandardSchemaV1 } from '@utils/form/formUtils'
import type { FormWizardStep } from '../types/BaseFormWizard.types'
import type { StorySourceOptions } from '@/stories/helpers/types/helpers.types'

export const EMAIL_SCHEMA: StandardSchemaV1 = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as { email: string }
			const issues = [{ message: 'Введите почту, например name@example.com', path: ['email'] }]
			return /^\S+@\S+\.\S+$/.test(data.email) ? { value } : { issues }
		},
	},
}

export const SCHEMA_CODE = String.raw`
const emailSchema: StandardSchemaV1 = {
	'~standard': {
		version: 1,
		vendor: 'story',
		validate: value => {
			const data = value as { email: string }
			const issues = [{ message: 'Введите почту, например name@example.com', path: ['email'] }]
			return /^\S+@\S+\.\S+$/.test(data.email) ? { value } : { issues }
		},
	},
}
`

export const REGISTRATION_STEPS: FormWizardStep[] = [
	{ id: 'account', title: 'Аккаунт', description: 'Почта для входа в кабинет', schema: EMAIL_SCHEMA },
	{ id: 'profile', title: 'Профиль', description: 'Можно пропустить и заполнить позже', isOptional: true },
	{ id: 'confirm', title: 'Подтверждение', description: 'Проверьте данные и завершите регистрацию' },
]

export const REGISTRATION_STEPS_CODE = String.raw`
const steps = [
	{ id: 'account', title: 'Аккаунт', description: 'Почта для входа в кабинет', schema: emailSchema },
	{ id: 'profile', title: 'Профиль', description: 'Можно пропустить и заполнить позже', isOptional: true },
	{ id: 'confirm', title: 'Подтверждение', description: 'Проверьте данные и завершите регистрацию' },
]
`

export const REGISTRATION_IMPORTS = ['BaseFormField', 'BaseInput']

export const REGISTRATION_STATE = { step: 'account' }

export const DEMO_STEPS: FormWizardStep[] = [
	{ id: 'account', title: 'Аккаунт' },
	{ id: 'profile', title: 'Профиль' },
	{ id: 'confirm', title: 'Подтверждение' },
]

export const REGISTRATION_STATE_CODE = String.raw`
const state = reactive({ email: '', name: '' })
const finished = ref('')

function handleFinish(data?: Record<string, unknown>): void {
	finished.value = String(data?.email)
}
`

export function registrationSetup() {
	const state = reactive({ email: '', name: '' })
	const finished = ref('')
	const handleFinish = (data?: Record<string, unknown>): void => {
		finished.value = String(data?.email)
	}
	return { state, finished, handleFinish }
}

export function registrationTemplate(attrs = ''): string {
	const wizardAttrs = ['v-bind="args"', 'v-model:step="step"', ':steps="steps"', ':state="state"', attrs, '@finish="handleFinish"']
	return `
	<div class="story-medium">
		<BaseFormWizard ${wizardAttrs.filter(Boolean).join(' ')}>
			<template #step-account>
				<BaseFormField label="Почта" name="email" is-required description="Отправим на неё письмо для входа">
					<BaseInput v-model="state.email" type="email" placeholder="name@example.com" />
				</BaseFormField>
			</template>
			<template #step-profile>
				<BaseFormField label="Имя" name="name">
					<BaseInput v-model="state.name" placeholder="Как к вам обращаться" />
				</BaseFormField>
			</template>
			<template #step-confirm>
				<p>Почта: {{ state.email }}. Имя: {{ state.name || 'не указано' }}.</p>
			</template>
		</BaseFormWizard>
		<p v-if="finished" role="status">Регистрация завершена: {{ finished }}</p>
	</div>
`
}

export interface WizardCaseOptions {
	template: string
	script: string
	data?: Record<string, unknown>
	state?: Record<string, unknown>
	setup?: () => Record<string, unknown>
	imports?: string[]
	vue?: string[]
	omit?: string[]
}

const BASE_COMPONENTS = { BaseFormWizard, BaseFormField, BaseInput, BaseButton }

export function wizardSource(options: WizardCaseOptions): StorySourceOptions {
	return {
		template: options.template,
		imports: ['BaseFormWizard', ...(options.imports ?? [])],
		importsFrom: options.script.includes('StandardSchemaV1')
			? { '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaV1'] }
			: undefined,
		vue: options.vue,
		state: options.state ?? {},
		script: options.script,
		omit: options.omit,
	}
}

export function wizardRender(options: WizardCaseOptions) {
	return <TArgs extends object>(args: TArgs) => ({
		components: BASE_COMPONENTS,
		setup: useStorySetup(args, { state: options.state ?? {}, data: options.data, setup: options.setup }),
		template: options.template,
	})
}
