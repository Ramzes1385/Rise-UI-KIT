import type BaseText from '../ui/BaseText.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Текстовый примитив библиотеки: абзацы, подписи, заголовки внутри компонентов.',
				'',
				'- По умолчанию — `<p>`, кегль 14/20, цвет `--rise-text`.',
				'- `tag` задаёт семантику и вес по умолчанию (`h1`…`h6`, `strong` жирные); размер заголовка — `sizeScale`, явный вес — `weight`.',
				'- `sizeScale` масштабирует кегль вместе с интерлиньяжем, `color` перекрашивает текст (лучше токенами `var(--rise-…)`).',
				'- Длинный текст переносится; `truncate` обрезает его многоточием в одну строку или в `maxLines` строк, `nowrap` запрещает перенос.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseText>['parameters']
