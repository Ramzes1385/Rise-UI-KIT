import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSwitch from '../ui/BaseSwitch.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Переключатель — включает и выключает настройку, которая применяется сразу: уведомления, тёмная тема, автопродление.',
				'',
				'- Нативный checkbox с `role="switch"`: скринридер озвучивает «переключатель, включён/выключен», Space переключает.',
				'- Подпись (`label` или слот `label`) — имя переключателя; клик по ней тоже переключает.',
				'- Ошибка (`error`) помечает переключатель `aria-invalid` и связана с ним через `aria-describedby`.',
				'- `reverse` ставит подпись слева, а трек — у правого края: так выглядят списки настроек.',
				'',
				'Если значение применяется только после отправки формы, используйте `BaseCheckbox`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSwitch>['parameters']
