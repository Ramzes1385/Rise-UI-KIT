import type { Meta } from '@storybook/vue3-vite'
import type BaseCommentThread from '../ui/BaseCommentThread.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Ветка комментариев: ответы с отступом, «Нравится», «Ответить», сворачивание ответов и поле нового комментария.',
				'Данные — у приложения: новый комментарий приходит событием `reply` (`parentId` — на что ответили, null — в ветку),',
				'отметка — событием `like`; приложение добавляет их в `comments`.',
				'',
				'- Глубже `maxDepth` (3) ответы идут без нового отступа, чтобы узкий экран не превращался в лесенку.',
				'- Клавиатура: «Ответить» открывает поле и ставит в него фокус; Ctrl+Enter (⌘+Enter) отправляет, Escape отменяет,',
				'  после этого фокус возвращается на «Ответить». «Нравится» — кнопка-переключатель (`aria-pressed`),',
				'  «Показать ответы» — `aria-expanded`.',
				'- Каждый комментарий — `article` с именем автора; ветка — область «Комментарии» (или `label`).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCommentThread>['parameters']
