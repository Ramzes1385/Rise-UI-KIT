import { source } from './render'
import type { MarqueeStoryArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Бегущая строка: новости, акции, логотипы партнёров, курсы. Содержимое — слот default или `items` со слотами `item` и `separator`.',
				'',
				'- `direction` — `left` (по умолчанию), `right`, `up`, `down`; `speed` — пикселей в секунду: длительность круга считается по размеру содержимого, а не задаётся.',
				'- Бесшовный круг — копиями содержимого: они скрыты от скринридера (`aria-hidden`) и выведены из Tab (`inert`), ссылки в ленте дают одну остановку Tab.',
				'- Движение — CSS `transform`, без JS на каждый кадр. `hasFade` — затухание краёв.',
				'- Доступность: роль `marquee` с именем (`label`, по умолчанию «Бегущая строка»). Лента стоит, пока над ней указатель или внутри фокус;',
				'  кнопка паузы (`hasPauseButton`, по умолчанию есть) и `v-model:is-paused` — движение дольше 5 секунд должно останавливаться (WCAG 2.2.2).',
				'- При `prefers-reduced-motion` лента не движется и не копируется; длинная лента прокручивается, с клавиатуры тоже.',
				'- Перекраска — токены `--rise-marquee-*`, классы частей — проп `ui` (история «Токены»); движение — история «Анимации».',
			].join('\n'),
		},
	},
} satisfies Meta<MarqueeStoryArgs>['parameters']
