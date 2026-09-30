import { defineComponent } from 'vue'
import BaseApp from '../ui/BaseApp.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useToast } from '@composables/app/useToast'
import type { ToastOptions } from '@composables/app/useToast'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const examples: { label: string; toast: ToastOptions }[] = [
	{ label: 'Успех', toast: { type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' } },
	{ label: 'Ошибка', toast: { type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ.' } },
	{ label: 'Предупреждение', toast: { type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ.' } },
	{ label: 'Информация', toast: { type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров.' } },
]

const toastButtonsTemplate = `
	<div class="story-row">
		<BaseButton v-for="example in examples" :key="example.label" variant="outline" @click="show(example.toast)">
			{{ example.label }}
		</BaseButton>
		<BaseButton variant="ghost" @click="clear">Закрыть все</BaseButton>
	</div>
`

const toastButtonsScript = `
const examples: { label: string; toast: ToastOptions }[] = ${literal(examples)}
const toast = useToast()

function show(options: ToastOptions): void {
	toast.add(options)
}

function clear(): void {
	toast.clear()
}
`

const ToastButtons = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		const show = (options: ToastOptions): void => {
			toast.add(options)
		}
		const clear = (): void => {
			toast.clear()
		}
		return { examples, show, clear }
	},
	template: toastButtonsTemplate,
})

const template = `
	<BaseApp v-bind="args"><ToastButtons /></BaseApp>
`

export const source = storySource({
	template,
	imports: ['BaseApp'],
	components: {
		ToastButtons: {
			template: toastButtonsTemplate,
			imports: ['BaseButton', 'useToast', 'type ToastOptions'],
			script: toastButtonsScript,
		},
	},
})

export const render = (args => ({
	components: { BaseApp, ToastButtons },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseApp>['render']
