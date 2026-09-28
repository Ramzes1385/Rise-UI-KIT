import type { Meta } from '@storybook/vue3-vite'
import type BaseInputTags from '../ui/BaseInputTags.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле тегов: навыки, получатели, ключевые слова. Теги стоят в рамке поля перед строкой ввода.',
				'',
				'- Enter или запятая (`separators`) добавляют тег, вставка «a, b, c» — несколько тегов; пустой Enter отправляет форму.',
				'- Повтор не добавляется (`isUnique`), `maxTags` ограничивает число, `validate` отклоняет тег — текст остаётся в поле.',
				'- Клавиатура: в пустой строке ← или Backspace переводят фокус на последний тег, ←/→ — между тегами,',
				'  Backspace, Delete и Enter на теге удаляют его. Кнопки удаления вне порядка Tab.',
				'- Добавление и удаление тегов объявляются скринридеру через `role="status"`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseInputTags>['parameters']
