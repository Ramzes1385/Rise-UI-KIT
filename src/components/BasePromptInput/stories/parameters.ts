import type { Meta } from '@storybook/vue3-vite'
import type BasePromptInput from '../ui/BasePromptInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле запроса к ИИ-ассистенту: растёт по тексту до `max-rows` строк, снизу — панель со слотами и кнопкой отправки.',
				'',
				'- Enter отправляет (`submit`), Shift+Enter — новая строка; во время набора через IME Enter не отправляет.',
				'  Подсказка об этом связана с полем через `aria-describedby`. После отправки поле очищается, фокус остаётся в нём.',
				'- Пустой запрос не отправляется: кнопка «Отправить» неактивна.',
				'- `is-generating` — идёт ответ: кнопка «Остановить ответ» (`stop`), Enter не отправляет.',
				'- Без `label` доступное имя поля — «Сообщение». Работает внутри BaseFormField.',
				'- Слоты `start` и `end` — панель под полем: вложения, выбор модели, голосовой ввод.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePromptInput>['parameters']
