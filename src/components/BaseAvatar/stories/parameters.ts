import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatar from '../ui/BaseAvatar.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Аватар пользователя или объекта: изображение, а если его нет — инициалы из `name` (до двух букв).',
				'',
				'- `default` — нейтральный фон; `soft` — мягкий фон основного цвета; `outline`, `shadow`, `ghost` — для аватаров на цветном фоне и в плотных списках.',
				'- Размер задаёт `sizeScale`: 100 — 32px, как высота кнопки и поля.',
				'- Если изображение не загрузилось, показываются инициалы; при смене `src` аватар снова пробует его загрузить.',
				'- `isOnline` добавляет точку статуса с доступным именем «в сети».',
				'',
				'Аватар не фокусируется: для действия по клику оберните его в кнопку или ссылку с `aria-label`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAvatar>['parameters']
