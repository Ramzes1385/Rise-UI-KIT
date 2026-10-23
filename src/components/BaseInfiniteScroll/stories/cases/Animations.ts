import { defineComponent, ref } from 'vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'
import { BaseAnimation } from '@components/BaseAnimation'
import BaseInfiniteScroll from '../../ui/BaseInfiniteScroll.vue'
import { motionPresetsStory, storySource } from '@/stories/helpers'
import type { InfiniteScrollLoadEvent } from '../../types/BaseInfiniteScroll.types'

const PAGE = 3

const TOTAL = 9

const DELAY = 600

const feedTemplate = `
	<BaseInfiniteScroll mode="manual" @load="onLoad">
		<BaseAnimation is-group name="list" tag="ul" style="margin: 0; padding: 8px 0; list-style: none; display: grid; gap: 8px">
			<li v-for="item in orders" :key="item">{{ item }}</li>
		</BaseAnimation>
	</BaseInfiniteScroll>
`

const feedScript = `
const orders = ref(Array.from({ length: ${PAGE} }, (_, index) => \`Заказ № \${1000 + index}\`))

function onLoad({ done }: InfiniteScrollLoadEvent): void {
	setTimeout(() => {
		const start = orders.value.length
		orders.value.push(...Array.from({ length: ${PAGE} }, (_, index) => \`Заказ № \${1000 + start + index}\`))
		done(orders.value.length >= ${TOTAL} ? 'empty' : 'ok')
	}, ${DELAY})
}
`

const OrdersFeed = defineComponent({
	components: { BaseAnimation, BaseInfiniteScroll },
	setup() {
		const orders = ref(Array.from({ length: PAGE }, (_, index) => `Заказ № ${1000 + index}`))
		const onLoad = ({ done }: InfiniteScrollLoadEvent): void => {
			setTimeout(() => {
				const start = orders.value.length
				orders.value.push(...Array.from({ length: PAGE }, (_, index) => `Заказ № ${1000 + start + index}`))
				done(orders.value.length >= TOTAL ? 'empty' : 'ok')
			}, DELAY)
		}
		return { orders, onLoad }
	},
	template: feedTemplate,
})

const motion = motionPresetsStory({
	item: `
		<OrdersFeed :key="replay" />
	`,
	components: { BaseButton, OrdersFeed },
	imports: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Догрузка по кнопке «Загрузить еще» в колонках четырёх пресетов движения. Лоадер в строке состояния появляется',
					'прозрачностью за `--rise-duration` (`--rise-ease-out`) и гаснет за `--rise-duration-fast` поверх строки, не сдвигая её',
					'(уходящий лоадер — `position: absolute`). Новые строки — содержимое приложения: здесь они появляются через',
					'`BaseAnimation is-group name="list"` (сдвиг `--rise-motion-distance`). «Повторить» монтирует ленты заново.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; при «уменьшить движение»",
					'лоадер и строки появляются сразу.',
				].join('\n'),
			},
			source: storySource({
				template: motion.template,
				imports: ['BaseButton'],
				state: { replay: 0 },
				components: {
					OrdersFeed: {
						template: feedTemplate,
						imports: ['BaseAnimation', 'BaseInfiniteScroll', 'type InfiniteScrollLoadEvent'],
						vue: ['ref'],
						script: feedScript,
					},
				},
			}),
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const rows = () => canvasElement.querySelectorAll('li').length
		await expect(rows()).toBe(PAGE * 4)
		for (const button of canvas.getAllByRole('button', { name: 'Загрузить еще' })) await userEvent.click(button)
		await waitFor(() => expect(rows()).toBe(PAGE * 2 * 4), { timeout: 3000 })
		await waitFor(() => expect(canvasElement.querySelector('.base-infinite-scroll__loader')).toBeNull())
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(rows()).toBe(PAGE * 4))
	},
}
