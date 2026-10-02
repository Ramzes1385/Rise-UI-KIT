import type { Meta } from '@storybook/vue3-vite'
import type BaseDescriptions from '../ui/BaseDescriptions.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Список «поле — значение» для страниц деталей: реквизиты, карточка заказа, профиль, настройки.',
				'',
				'- Разметка — `dl`, у каждого поля `dt` (подпись) и `dd` (значение) в своём `div`: скринридер читает пары «термин — определение».',
				'- Колонки — по ширине контейнера: не больше `columns`, каждая не уже `minItemWidth`; на узком экране — одна колонка.',
				'  `span` у поля — сколько колонок оно занимает, `full` — всю строку.',
				'- `layout`: `horizontal` — подпись слева (ширина — `labelWidth`), в узкой колонке значение переносится под неё;',
				'  `vertical` — подпись над значением.',
				'- Пустое значение — «—» (`emptyValue`), полей нет — «Нет данных» (`emptyText`, слот `empty`).',
				'- Копирование — `isCopyable` у списка или поля: кнопка «Копировать: ИНН», `copyText` — свой текст для буфера,',
				'  событие `copy`; результат объявляется через `role="status"`.',
				'- Слоты: `title`, `extra`, `label` и `value` для всех полей, `label-<key>` и `value-<key>` — для одного поля.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDescriptions>['parameters']
