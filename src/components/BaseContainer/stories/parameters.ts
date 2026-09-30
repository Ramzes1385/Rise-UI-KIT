import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseContainer from '../ui/BaseContainer.vue'

export const parameters = {
	layout: 'fullscreen',
	docs: {
		source,
		description: {
			component: [
				'Контейнер страницы: ограничивает ширину содержимого, центрирует его и даёт боковые отступы.',
				'',
				'- `size` — наибольшая ширина вместе с отступами: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `full` — без ограничения.',
				'- Боковые отступы растут с экраном: 16px, от 640px — 24px, от 1024px — 32px (`sizeScale` масштабирует их).',
				'- `tag` — тег корня: `section`, `article`…',
				'',
				'Ту же ширину принимают BaseHeader и BaseFooter (`containerSize`), чтобы шапка, содержимое и подвал были на одной линии.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseContainer>['parameters']
