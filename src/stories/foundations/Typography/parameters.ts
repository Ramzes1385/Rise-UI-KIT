import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Шрифты: `--rise-font-sans` — Rise Grotesk (латиница Space Grotesk, кириллица Onest), `--rise-font-mono` — Rise Mono (Space Mono, кириллица IBM Plex Mono).',
				'Файлы шрифтов входят в пакет и подключаются вместе со стилями кита — см. README, раздел «Шрифты».',
				'',
				'Заголовки — Rise Grotesk 600 с разрядкой `--rise-tracking-heading` (от 30px — `--rise-tracking-display`); служебные подписи — Rise Mono',
				'капсом с `--rise-tracking-label`. Цифры в таблицах, счётчиках и времени — табличные (`tabular-nums`).',
				'',
				'Размер и межстрочный интервал идут парами: `--rise-font-size-sm` + `--rise-line-height-sm` и т. д.',
				'В SCSS компонентов — миксин `@include text-size(sm)`, который ещё и масштабирует пару по `sizeScale`.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
