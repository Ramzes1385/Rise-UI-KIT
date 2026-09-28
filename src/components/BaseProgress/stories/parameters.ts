import type { Meta } from '@storybook/vue3-vite'
import type BaseProgress from '../ui/BaseProgress.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Индикатор выполнения известной длительности: загрузка файла, шаги мастера, заполненность профиля.',
				'Если длительность неизвестна — `isIndeterminate` или `BaseLoader`.',
				'',
				'- `line` — полоса 8px при `sizeScale` = 100; `circle` — кольцо 64px.',
				'- `hasLabel` показывает процент: над полосой у конца заливки или в центре кольца; текст меняется слотом.',
				'- Доступность: `role="progressbar"` со значением `aria-valuenow`; имя — `ariaLabel` (по умолчанию «Прогресс»)',
				'  или внешний `aria-labelledby`. В неопределённом режиме значение не сообщается.',
				'- Движение (бегущая полоса, striped, pulse, glow) отключается при системной настройке «уменьшить движение».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseProgress>['parameters']
