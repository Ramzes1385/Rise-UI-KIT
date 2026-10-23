import { source } from './render'
import type BaseKbd from '../ui/BaseKbd.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Клавиша в тексте и подсказках: «Нажмите Ctrl + K», сочетание у пункта меню.',
				'',
				'- Разметка — `<kbd>`. Служебные клавиши (`meta`, `shift`, `enter`, стрелки…) показываются символом, скринридер слышит название.',
				'- `meta` и `alt` на macOS — ⌘ и ⌥, на других системах — Ctrl и Alt (`platform` задаёт систему явно).',
				'- Сочетание — несколько BaseKbd подряд; знак «+» между ними ставит приложение.',
				'- Перекраска — токены `--rise-kbd-*`, классы частей — проп `ui` (история «Токены»); движение — история «Анимации».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseKbd>['parameters']
