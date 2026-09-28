import type BaseUser from '../ui/BaseUser.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Человек: аватар, имя и подпись — автор комментария, исполнитель задачи, строка списка участников.',
				'',
				'- Аватар скрыт от скринридера (имя написано рядом); статус «в сети» — точка и скрытый текст.',
				'- `to` или `href` делают весь блок ссылкой на профиль (BaseLink: RouterLink приложения или `<a>`).',
				'- `orientation="vertical"` — аватар над текстом; слот `description` — своя подпись.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseUser>['parameters']
