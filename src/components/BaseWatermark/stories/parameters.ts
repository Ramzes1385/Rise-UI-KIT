import type { Meta } from '@storybook/vue3-vite'
import type BaseWatermark from '../ui/BaseWatermark.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Водяной знак поверх содержимого: «Конфиденциально», имя и дата просмотра, логотип на документах и превью.',
				'',
				'- Знак — слой `.base-watermark__layer` поверх содержимого (слот `default`): `aria-hidden`, `pointer-events: none`, поэтому',
				'  не мешает кликам, фокусу и чтению с экранного диктора. Узор строится после монтирования.',
				'- `content` — текст (строка или массив строк), `image` — картинка вместо текста; `width` и `height` задают её размер.',
				'  Чтобы повернуть картинку, адрес должен быть `data:` или отдавать CORS-заголовки, иначе она повторяется без поворота.',
				'- `rotate` (по умолчанию -22), `gap` (число или `[x, y]`), `opacity` (0.15), `fontSize`, `textColor` (цвет CSS без `var()`).',
				'- Знак не заслоняет текст: серый слой с прозрачностью 0.15 оставляет читаемость и в светлой, и в тёмной теме.',
				'- `isProtected` возвращает слой, если его удалили из DOM или изменили `style`. От правил в таблицах стилей это не защищает.',
				'- Токенов `--rise-watermark-*` нет: перекраска — `textColor`, `opacity` и классы через `ui` и `customClass` (`root`, `layer`).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseWatermark>['parameters']
