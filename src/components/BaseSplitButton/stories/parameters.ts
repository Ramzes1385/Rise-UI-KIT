import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitButton from '../ui/BaseSplitButton.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Кнопка с меню: основное действие по клику и несколько похожих в меню справа («Сохранить» и «Сохранить как…»).',
				'',
				'- Две кнопки в группе: основная эмитит `click`, кнопка меню («Другие действия», `menuLabel`) открывает BaseDropdownMenu (APG Menu Button).',
				'- Пункты меню — формат BaseDropdownMenu: иконки, группы, опасные действия, ссылки; выбор — событие `select`.',
				'- `isLoading` занимает основную кнопку, меню остаётся доступным; `isDisabled` отключает обе.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSplitButton>['parameters']
