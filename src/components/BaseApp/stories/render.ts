import { defineComponent } from 'vue'
import BaseApp from '../ui/BaseApp.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useToast } from '@composables/app/useToast'
import type { ToastOptions } from '@composables/app/useToast'

const TOAST_EXAMPLES: { label: string; toast: ToastOptions }[] = [
	{ label: 'Успех', toast: { type: 'success', title: 'Серия опубликована', description: 'Серия 3 доступна подписчикам сообщества.' } },
	{ label: 'Ошибка', toast: { type: 'error', title: 'Не удалось загрузить видео', description: 'Файл больше 4 ГБ.' } },
	{ label: 'Предупреждение', toast: { type: 'warning', title: 'Заканчивается место', description: 'Занято 4,6 из 5 ГБ.' } },
	{ label: 'Информация', toast: { type: 'info', title: 'Доступно обновление', description: 'Новая версия редактора субтитров.' } },
]

const ToastButtons = defineComponent({
	components: { BaseButton },
	setup() {
		const toast = useToast()
		return { examples: TOAST_EXAMPLES, show: (options: ToastOptions) => toast.add(options), clear: () => toast.clear() }
	},
	template: `
		<div class="story-row">
			<BaseButton v-for="example in examples" :key="example.label" variant="outline" @click="show(example.toast)">
				{{ example.label }}
			</BaseButton>
			<BaseButton variant="ghost" @click="clear">Закрыть все</BaseButton>
		</div>
	`,
})

export const render = (args => ({
	components: { BaseApp, ToastButtons },
	setup: () => ({ args }),
	template: '<BaseApp v-bind="args"><ToastButtons /></BaseApp>',
})) satisfies Meta<typeof BaseApp>['render']
