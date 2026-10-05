import type { Meta } from '@storybook/vue3-vite'
import type BaseAnimation from '../ui/BaseAnimation.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Обёртка над `<Transition>` с готовыми анимациями появления и исчезновения: сообщения об ошибке, подсказки,',
				'раскрывающиеся блоки, элементы списков.',
				'',
				'- `show` показывает и скрывает содержимое; `name` выбирает анимацию (`fade` по умолчанию).',
				'- `isGroup` — список (`<TransitionGroup>`): каждый дочерний элемент с `key` анимируется отдельно, соседи плавно сдвигаются.',
				'- Длительности и кривые — токены `--rise-duration*`/`--rise-ease*`; при системной настройке «уменьшить движение»',
				'  переходы мгновенные, а события `after-enter`/`after-leave` приходят как обычно.',
				'- Своего вида у обёртки нет, поэтому и токенов `--rise-animation-*` нет; классы частей (`root`, `inner`) — проп `ui`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAnimation>['parameters']
