import type { Meta } from '@storybook/vue3-vite'
import type BaseMention from '../ui/BaseMention.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле с упоминаниями: после `@` (или своего `trigger`) под полем открывается список коллег из `options`.',
				'',
				'- Список фильтруется по имени и нику, без учёта регистра и «ё»/«е»; `search` сообщает набранный текст —',
				'  для загрузки вариантов с сервера.',
				'- Клавиатура: стрелки вверх и вниз выбирают вариант (`aria-activedescendant`), Enter или Tab вставляют',
				'  `@ник` и пробел, Escape закрывает список до следующего упоминания. Во время набора через IME клавиши не перехватываются.',
				'- Вставка — событие `mention` с выбранным вариантом; текст остаётся обычной строкой (`v-model`).',
				'- Подпись, ошибка и отключение — как у остальных полей формы; работает внутри BaseFormField.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMention>['parameters']
