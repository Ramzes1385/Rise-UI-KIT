import { setup } from './SignIn.setup'
import type meta from '../Auth.stories'
import setupSource from './SignIn.setup.ts?raw'
import { BaseForm } from '@components/BaseForm'
import { BaseLink } from '@components/BaseLink'
import { waitFor, expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseFormField } from '@components/BaseFormField'
import { BaseSeparator } from '@components/BaseSeparator'
import { scriptSource, staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="blk-page blk-auth">
		<div class="blk-auth__card">
			<div class="blk-auth__header">
				<span class="blk-auth__logo" aria-hidden="true">R</span>
				<h1 class="blk-title">Вход в Rise</h1>
				<p class="blk-muted">Рады видеть вас снова</p>
			</div>
			<div class="blk-auth__social">
				<BaseButton variant="outline" class="blk-auth__wide">GitHub</BaseButton>
				<BaseButton variant="outline" class="blk-auth__wide">Google</BaseButton>
			</div>
			<BaseSeparator label="или по почте" />
			<BaseForm :schema="schema" :state="state" aria-label="Вход" @submit="signIn">
				<div class="blk-auth__fields">
					<BaseFormField label="E-mail" name="email" is-required>
						<BaseInput v-model="state.email" type="email" placeholder="name@example.com" :input-attrs="{ autocomplete: 'email' }" />
					</BaseFormField>
					<BaseFormField label="Пароль" name="password" is-required>
						<BaseInput v-model="state.password" type="password" :input-attrs="{ autocomplete: 'current-password' }" />
					</BaseFormField>
					<div class="blk-auth__row">
						<BaseCheckbox v-model="state.isRemembered" label="Запомнить меня" />
						<BaseLink href="#">Забыли пароль?</BaseLink>
					</div>
					<BaseButton type="submit" class="blk-auth__wide">Войти</BaseButton>
					<p role="status" class="blk-muted">{{ message }}</p>
				</div>
			</BaseForm>
			<p class="blk-auth__footer">Нет аккаунта? <BaseLink href="#">Зарегистрироваться</BaseLink></p>
		</div>
	</div>
`

export const SignIn: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вход по почте и паролю: кнопки входа через сервисы, разделитель, «Запомнить меня» и ссылка восстановления пароля.',
					'Без почты или с коротким паролем форма не отправляется: фокус переходит на первое поле с ошибкой.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseButton', 'BaseCheckbox', 'BaseForm', 'BaseFormField', 'BaseInput', 'BaseLink', 'BaseSeparator'],
				importsFrom: { '@ramzes1385/rise-ui-kit/utils': ['type StandardSchemaIssue', 'type StandardSchemaV1'] },
				vue: ['reactive', 'ref'],
				script: scriptSource(setupSource),
			}),
		},
	},
	render: args => ({
		components: { BaseButton, BaseCheckbox, BaseForm, BaseFormField, BaseInput, BaseLink, BaseSeparator },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Войти' }))
		const email = canvas.getByRole('textbox', { name: 'E-mail' })
		await waitFor(() => expect(email).toHaveFocus())
		await expect(email).toHaveAccessibleDescription('Введите e-mail, например name@example.com')

		await userEvent.type(email, 'anna@example.com')
		await userEvent.type(canvas.getByLabelText(/^Пароль/), 'rise-2026!')
		await userEvent.click(canvas.getByRole('button', { name: 'Войти' }))
		await waitFor(() => expect(canvas.getByText('Вы вошли как anna@example.com')).toHaveAttribute('role', 'status'))
	},
}
