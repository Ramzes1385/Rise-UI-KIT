import type { Meta } from '@storybook/vue3-vite'
import type BaseFileManager from '../ui/BaseFileManager.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Файловый менеджер: дерево папок слева, панель с «хлебными крошками», поиском и действиями, содержимое папки списком или плитками и строка состояния.',
				'',
				'- `items` — плоский список записей (`id`, `parentId`, `name`, `type`, `size`, `modifiedAt`, `mime`). Менеджер ничего не читает и не пишет:',
				'  об операциях он сообщает событиями `create-folder`, `rename`, `delete`, `move`, `upload`, а приложение выполняет их и обновляет `items`.',
				'- Состояние — `v-model:path` (текущая папка, `null` — корень), `v-model:selected`, `v-model:view`, `v-model:sort`, `v-model:query`; без них менеджер хранит значения сам.',
				'- Выбор: клик, Ctrl+клик, Shift+клик, Ctrl+A. Клавиатура: стрелки, Home и End, Enter открывает, Backspace поднимается выше, F2 переименовывает,',
				'  Delete удаляет после подтверждения, набор букв ведёт к записи с таким началом имени. Записи переносятся перетаскиванием на папку или в дерево.',
				'- Состояния: `isLoading` (заготовки), `error` (сообщение и «Повторить»), `isReadonly` (только просмотр), `isDisabled`; пустая папка и «ничего не найдено» — слот `empty`.',
				'- Доступность: список записей — `listbox` с множественным выбором и одной остановкой Tab (roving tabindex), строка состояния — `role="status"`.',
				'- Перекраска — токены `--rise-file-manager-*`, классы частей — проп `ui`; иконку записи заменяет слот `icon`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFileManager>['parameters']
