import { BaseImage } from '@components/BaseImage'
import type meta from '../../BaseSplitter.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSplitter from '../../../ui/BaseSplitter.vue'
import { checkSplitterDrag, checkSplitterKeyboard } from '../../play'
import { literal, STORY_IMAGES, staticStorySource, useStorySetup } from '@/stories/helpers'

const image = STORY_IMAGES[0]

const paragraphs = [
	'Маршрут проходит по гребню хребта и занимает два дня. Первый день — подъём через лес к приюту на высоте 1 800 метров.',
	'На второй день выходим до рассвета: по гребню идти проще, пока нет ветра, а свет над долиной меняется каждые десять минут.',
	'Снаряжение берите по сезону: в начале октября ночью уже бывает минус, а на открытых участках дует постоянно.',
	'Воду набираем у приюта и в ручье на седловине. Между ними источников нет, поэтому нужен запас не меньше двух литров.',
	'Спуск начинается с седловины и ведёт по тропе вдоль реки к парковке. Последние три километра лучше пройти засветло.',
	'Записывайтесь в группу заранее: на тропе одновременно может быть не больше двенадцати человек.',
]

const state = { size: 40 }

const template = `
	<div style="height: 360px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
		<BaseSplitter v-model="size" label="Фотография" :min="20" :max="70">
			<template #start>
				<BaseImage :src="image.src" :alt="image.alt" width="100%" height="100%" fit="cover" />
			</template>
			<template #end>
				<article aria-label="Описание маршрута" style="padding: 12px 16px">
					<h3 style="margin-top: 0">Гребень за два дня</h3>
					<p v-for="paragraph in paragraphs" :key="paragraph">{{ paragraph }}</p>
				</article>
			</template>
		</BaseSplitter>
	</div>
`

export const ImageAndText: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Картинка слева, длинный текст справа. Картинка заполняет свою панель (`fit="cover"`) и подстраивается под её размер,',
					'а текст не помещается в панель и прокручивается внутри неё: у прокручиваемой панели есть `tabindex`, поэтому её можно',
					'прокрутить с клавиатуры. `min` и `max` не дают сжать ни картинку, ни текст до нечитаемого размера.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseSplitter', 'BaseImage'],
				state,
				script: [`const image = ${literal(image)}`, `const paragraphs = ${literal(paragraphs)}`].join('\n'),
			}),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseSplitter, BaseImage },
		setup: useStorySetup(args, { state, data: { image, paragraphs } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const separator = canvas.getByRole('separator', { name: 'Фотография' })
		await checkSplitterKeyboard(separator, { min: 20, max: 70, step: 5 }, userEvent)
		await checkSplitterDrag(separator, { min: 20, max: 70 })
	},
}
