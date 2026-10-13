import { source } from './render'
import type BaseStack from '../ui/BaseStack.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	layout: 'padded',
	docs: {
		source,
		description: {
			component: [
				'Стек — раскладка элементов в один столбец или ряд с равными промежутками (flexbox): вместо отступов у каждого элемента.',
				'',
				'- `direction` — столбец (по умолчанию), ряд и обратный порядок; `gap` — промежуток `none`, `xs` 4px, `sm` 8px, `md` 16px (по умолчанию), `lg` 24px, `xl` 32px.',
				'- `align` и `justify` — выравнивание по поперечной и главной осям; `isWrap` переносит элементы на новую линию; `isInline` делает стек строчным.',
				'- `tag` — тег корня (`section`, `ul`, `nav`…): для `ul` и `ol` дочерние элементы — `li`.',
				'- `sizeScale` масштабирует промежутки; фона, рамки и вариантов оформления у стека нет.',
				'',
				'Двумерная сетка колонок — `BaseGrid`; ширину страницы ограничивает `BaseContainer`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseStack>['parameters']
