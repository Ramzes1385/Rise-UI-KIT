import type meta from '../Typography.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

const WEIGHTS = [
	{ token: '--rise-font-weight-normal', value: 400, usage: 'Текст' },
	{ token: '--rise-font-weight-medium', value: 500, usage: 'Кнопки, пункты меню, подписи полей' },
	{ token: '--rise-font-weight-semibold', value: 600, usage: 'Заголовки' },
	{ token: '--rise-font-weight-bold', value: 700, usage: 'Акценты в тексте' },
]

const template = `
			<div>
				<div v-for="item in weights" :key="item.token" class="fnd-type">
					<span class="fnd-type__meta">{{ item.token }}<br />{{ item.value }} · {{ item.usage }}</span>
					<span class="fnd-type__sample" :style="{ fontWeight: 'var(' + item.token + ')', fontSize: '18px' }">
						Интерфейс Rise UI Kit — Interface 0123456789
					</span>
				</div>
			</div>
		`

export const Weights: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Начертания шрифта.' }, source: { code: templateSource(template) } } },
	render: () => ({
		setup: () => ({ weights: WEIGHTS }),
		template,
	}),
}
