import type { Meta } from '@storybook/vue3-vite'
import type BaseSlider from '../ui/BaseSlider.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Карусель изображений, видео или своих слайдов (слот `default`) со стрелками, точками или миниатюрами.',
				'',
				'- Навигация: `navigation` — точки, миниатюры, оба варианта или ничего; стрелки `hasArrows` — по бокам',
				'  (`arrowsPosition="center"`) или снаружи в углах. Если листать нечего, стрелки и навигация не выводятся.',
				'- Смена слайдов: `animation` (slide, fade, scale, flip), свайп и перетаскивание мышью; несколько слайдов',
				'  на экране — `slidesPerView`, шаг — `slidesPerGroup`, промежуток — `spaceBetween`.',
				'- Автопрокрутка `isAutoplay` останавливается, пока указатель над слайдером или фокус внутри него,',
				'  и не запускается при системной настройке «уменьшить движение».',
				'- Доступность: у стрелок, точек и миниатюр есть имена («Следующий слайд», «Слайд 2 из 6»), текущая точка',
				'  помечена `aria-current`; невидимые слайды `inert` — их содержимое не попадает в порядок Tab.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSlider>['parameters']
