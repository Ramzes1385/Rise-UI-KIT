import type { Meta } from '@storybook/vue3-vite'
import type BaseImageCompare from '../ui/BaseImageCompare.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Сравнение «до / после»: две картинки друг над другом и граница, которую двигают мышью, пальцем или клавишами.',
				'',
				'- `before` слева от границы, `after` справа; подписи в углах — «До» и «После» (`before-label`, `after-label`).',
				'- `v-model:position` — положение границы в процентах. Нажатие в любом месте плавно переносит границу туда, при перетаскивании она идёт за указателем; при «уменьшении движения» — без анимации.',
				'- Ручка — `role="slider"`: ←/→ — на 1%, с Shift, PageUp/PageDown — на 10%, Home/End — края.',
				'- У обеих картинок свои описания `before-alt` и `after-alt`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImageCompare>['parameters']
