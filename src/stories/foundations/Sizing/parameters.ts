import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Размер любого компонента задаёт одно число — `sizeScale` в процентах. 100 — базовый размер: высота контролов 32px, кегль 14/20.',
				'Все длины в стилях умножаются на `--size-scale` функцией `sz()`, поэтому компонент масштабируется целиком: отступы, шрифт, иконки, радиусы.',
				'',
				'Пресеты xs–xl повторяют шкалу Nuxt UI. Кнопки, поля, селекты и переключатели одного `sizeScale` одной высоты — их можно ставить в один ряд.',
				'Плотность всего интерфейса меняют токены `--rise-control-padding-y/x` — без пропов у каждого компонента.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
