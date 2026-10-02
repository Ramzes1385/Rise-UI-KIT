import type BaseStat from '../ui/BaseStat.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Карточка показателя для дашбордов: подпись, значение, изменение за период и место для графика.',
				'',
				'- Число в `value` форматируется по языку кита через `Intl.NumberFormat` с параметрами `valueFormat`: валюта, проценты,',
				"  `notation: 'compact'` («4,82 млн ₽»). Строка выводится как есть.",
				'- `change` — изменение; по умолчанию доля для процентов (`0.12` → «+12 %»), свой формат — `changeFormat`.',
				'  Знак задаёт стрелку, цвет — оценку: рост зелёный, снижение красный; `isInverse` меняет их местами (отток, возвраты).',
				'- Слот `chart` — для BaseSparkline, `icon` — значок в углу; `label`, `value`, `change` заменяют части целиком.',
				'- Разметка — `dl`: подпись `dt`, значение и изменение `dd`. Стрелка декоративная, знак числа читается скринридером.',
				'  При `isLoading` — заглушки и `aria-busy`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseStat>['parameters']
