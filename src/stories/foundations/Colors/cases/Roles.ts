import type meta from '../Colors.stories'
import { templateSource } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'

const ROLES = [
	{ role: 'primary', description: 'Главные действия, выбранные и активные элементы, фокус' },
	{ role: 'success', description: 'Успех, завершённые шаги' },
	{ role: 'info', description: 'Информационные сообщения' },
	{ role: 'warning', description: 'Предупреждения' },
	{ role: 'error', description: 'Ошибки, разрушительные действия' },
]

const template = `
			<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));">
				<div v-for="item in roles" :key="item.role" class="fnd-role">
					<span class="fnd-role__name">{{ item.role }}</span>
					<span class="fnd__hint">{{ item.description }}</span>
					<span class="fnd-role__sample" :style="{ background: 'var(--rise-' + item.role + ')', color: 'var(--rise-on-' + item.role + ')' }">
						Заливка <span class="fnd-role__token">--rise-{{ item.role }}</span>
					</span>
					<span class="fnd-role__sample" :style="{ background: 'var(--rise-' + item.role + '-hover)', color: 'var(--rise-on-' + item.role + ')' }">
						Наведение <span class="fnd-role__token">-hover</span>
					</span>
					<span
						class="fnd-role__sample"
						:style="{ background: 'var(--rise-' + item.role + '-soft)', color: 'var(--rise-' + item.role + '-text)', boxShadow: 'inset 0 0 0 1px var(--rise-' + item.role + '-border)' }">
						Мягкий фон <span class="fnd-role__token">-soft · -text · -border</span>
					</span>
					<span class="fnd-role__sample" :style="{ color: 'var(--rise-' + item.role + ')', padding: '0 10px' }">
						Текст на фоне <span class="fnd-role__token">--rise-{{ item.role }}</span>
					</span>
				</div>
			</div>
		`

export const Roles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Цветовые роли. У каждой роли: основной цвет (`--rise-{роль}`), наведение (`-hover`), текст на заливке (`--rise-on-{роль}`),',
					'мягкий фон (`-soft`, `-soft-hover`), текст на мягком фоне (`-text`) и тонкая рамка (`-border`).',
				].join('\n'),
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		setup: () => ({ roles: ROLES }),
		template,
	}),
}
