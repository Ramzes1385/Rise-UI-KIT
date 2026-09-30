import { reactive, ref } from 'vue'
import type meta from '../Settings.stories'
import { BaseForm } from '@components/BaseForm'
import { waitFor, expect } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { templateSource } from '@/stories/helpers'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import type { StoryObj } from '@storybook/vue3-vite'
import { EMAIL_PATTERN, schemaOf } from '../../shared'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseFormField } from '@components/BaseFormField'
import { BaseSegmented } from '@components/BaseSegmented'
import { BasePopconfirm } from '@components/BasePopconfirm'

interface ProfileForm {
	name: string
	email: string
	bio: string
	language: string
	theme: string
	notify: { tasks: boolean; mentions: boolean; digest: boolean }
}

const INITIAL: ProfileForm = {
	name: 'Анна Петрова',
	email: 'anna@example.com',
	bio: 'Дизайнер интерфейсов в команде платежей',
	language: 'ru',
	theme: 'system',
	notify: { tasks: true, mentions: true, digest: false },
}

const SCHEMA = schemaOf<ProfileForm>([
	['name', data => data.name.trim().length > 0, 'Введите имя'],
	['email', data => EMAIL_PATTERN.test(data.email), 'Введите e-mail, например name@example.com'],
])

const LANGUAGES = [
	{ value: 'ru', label: 'Русский' },
	{ value: 'en', label: 'English' },
]

const THEMES = [
	{ value: 'light', label: 'Светлая' },
	{ value: 'dark', label: 'Тёмная' },
	{ value: 'system', label: 'Как в системе' },
]

const template = `
	<div class="blk-page blk-settings">
		<div class="blk-settings__header">
			<h1 class="blk-title">Настройки</h1>
			<p class="blk-muted">Профиль, вид интерфейса и уведомления вашего аккаунта</p>
		</div>
		<BaseForm :schema="schema" :state="state" aria-label="Настройки аккаунта" @submit="save">
			<section class="blk-settings__section" aria-labelledby="blk-settings-profile">
				<div>
					<h2 id="blk-settings-profile" class="blk-settings__section-title">Профиль</h2>
					<p class="blk-muted">Так вас видят коллеги в задачах и комментариях</p>
				</div>
				<div class="blk-settings__fields">
					<div class="blk-settings__avatar">
						<BaseAvatar :name="state.name" :size-scale="150" />
						<BaseButton variant="outline">Загрузить фото</BaseButton>
						<BaseButton variant="ghost">Удалить фото</BaseButton>
					</div>
					<BaseFormField label="Имя" name="name" is-required>
						<BaseInput v-model="state.name" :input-attrs="{ autocomplete: 'name' }" />
					</BaseFormField>
					<BaseFormField label="E-mail" name="email" is-required description="Сюда приходят уведомления и письма о входе">
						<BaseInput v-model="state.email" type="email" :input-attrs="{ autocomplete: 'email' }" />
					</BaseFormField>
					<BaseFormField label="О себе" name="bio">
						<BaseTextarea v-model="state.bio" :rows="3" :maxlength="160" />
					</BaseFormField>
				</div>
			</section>
			<section class="blk-settings__section" aria-labelledby="blk-settings-interface">
				<div>
					<h2 id="blk-settings-interface" class="blk-settings__section-title">Интерфейс</h2>
					<p class="blk-muted">Язык подписей и цветовая тема</p>
				</div>
				<div class="blk-settings__fields">
					<BaseFormField label="Язык" name="language">
						<BaseSelect v-model="state.language" :options="languages" />
					</BaseFormField>
					<BaseFormField label="Тема" name="theme">
						<BaseSegmented v-model="state.theme" :options="themes" />
					</BaseFormField>
				</div>
			</section>
			<section class="blk-settings__section" aria-labelledby="blk-settings-notify">
				<div>
					<h2 id="blk-settings-notify" class="blk-settings__section-title">Уведомления</h2>
					<p class="blk-muted">Письма на почту из раздела «Профиль»</p>
				</div>
				<div class="blk-settings__fields">
					<BaseSwitch v-model="state.notify.tasks" label="Новые задачи и изменения в моих задачах" />
					<BaseSwitch v-model="state.notify.mentions" label="Упоминания в комментариях" />
					<BaseSwitch v-model="state.notify.digest" label="Сводка за неделю по понедельникам" />
				</div>
			</section>
			<section class="blk-settings__section" aria-labelledby="blk-settings-danger">
				<div>
					<h2 id="blk-settings-danger" class="blk-settings__section-title">Удаление аккаунта</h2>
					<p class="blk-muted">Проекты и задачи удалятся без возможности восстановления</p>
				</div>
				<div class="blk-settings__fields">
					<BasePopconfirm
						title="Удалить аккаунт?"
						description="Отменить удаление будет нельзя."
						confirm-label="Удалить"
						is-danger
						@confirm="message = 'Запрос на удаление отправлен'">
						<BaseButton variant="outline">Удалить аккаунт</BaseButton>
					</BasePopconfirm>
				</div>
			</section>
			<div class="blk-settings__actions">
				<p role="status" class="blk-settings__status">{{ message }}</p>
				<BaseButton variant="ghost" @click="reset">Отменить</BaseButton>
				<BaseButton type="submit">Сохранить</BaseButton>
			</div>
		</BaseForm>
	</div>
`

const copyOf = (form: ProfileForm): ProfileForm => ({ ...form, notify: { ...form.notify } })

export const Profile: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Настройки профиля: аватар с инициалами, имя, почта, «О себе», язык и тема, переключатели уведомлений и удаление',
					'аккаунта с подтверждением. «Сохранить» проверяет форму по схеме, «Отменить» возвращает прежние значения.',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		components: {
			BaseAvatar,
			BaseButton,
			BaseForm,
			BaseFormField,
			BaseInput,
			BasePopconfirm,
			BaseSegmented,
			BaseSelect,
			BaseSwitch,
			BaseTextarea,
		},
		setup: () => {
			const state = reactive<ProfileForm>(copyOf(INITIAL))
			const message = ref('')
			return {
				schema: SCHEMA,
				state,
				message,
				languages: LANGUAGES,
				themes: THEMES,
				save: () => {
					message.value = 'Изменения сохранены'
				},
				reset: () => {
					Object.assign(state, copyOf(INITIAL))
					message.value = ''
				},
			}
		},
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const name = canvas.getByRole('textbox', { name: 'Имя' })
		await userEvent.clear(name)
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await waitFor(() => expect(name).toHaveFocus())
		await expect(name).toHaveAccessibleDescription('Введите имя')

		await userEvent.type(name, 'Анна Смирнова')
		await userEvent.click(canvas.getByRole('switch', { name: 'Сводка за неделю по понедельникам' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await waitFor(() => expect(canvas.getByText('Изменения сохранены')).toHaveAttribute('role', 'status'))
		await expect(canvas.getByRole('switch', { name: 'Сводка за неделю по понедельникам' })).toBeChecked()

		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expect(name).toHaveValue('Анна Петрова')
		await expect(canvas.getByRole('switch', { name: 'Сводка за неделю по понедельникам' })).not.toBeChecked()
	},
}
