import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Движение — это токены длительностей, кривых, сдвига и масштаба. Пресет меняет их все сразу: атрибут',
				'`data-rise-motion="none | subtle | standard | expressive"` на `<html>` или на любом контейнере, для всего',
				'приложения — опция плагина `createUiKitPlugin({ motion })`. Без атрибута действует `standard`: 140 / 200 / 320 мс (`--rise-duration-fast`, `--rise-duration`, `--rise-duration-slow`).',
				'',
				'Системная настройка «уменьшить движение» главнее пресета: длительности становятся `0.01ms`, сдвиг — `0`.',
				"То же для всех — `reducedMotion: 'always'` (киоски, тесты). JS-анимации читают те же токены через `useMotion()`.",
				'Пружина (`--rise-ease-spring`) перелетает цель только в `expressive` и только у transform; у прозрачности и цвета',
				'перелёта нет.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
