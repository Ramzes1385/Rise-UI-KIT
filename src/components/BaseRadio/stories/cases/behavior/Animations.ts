import type meta from '../../BaseRadio.stories'
import { expect, waitFor } from 'storybook/test'
import BaseRadio from '../../../ui/BaseRadio.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const OWN_ARGS = ['modelValue', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<form>
			<BaseRadio v-bind="args" v-model="picked" />
		</form>
	`,
	components: { BaseRadio, BaseButton },
	imports: ['BaseRadio'],
	state: { picked: 'courier' },
	action: "picked = picked === 'courier' ? 'pickup' : 'courier'",
	trigger: 'Переключить',
	slots: OWN_ARGS,
	omit: OWN_ARGS,
})

const checkedLabels = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll('.base-radio-item')]
		.filter(item => item.querySelector('.base-radio-item__dot'))
		.map(item => item.textContent?.trim())

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isVertical', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Переключатели: точка выбора в четырёх пресетах движения. «Переключить» (или щелчок, стрелки) меняет выбор во всех',
					'четырёх группах: точка нового пункта вырастает из нуля (`transform: scale()` и `opacity`) с пружиной',
					'`--rise-ease-spring` — перелёт заметен в пресете `expressive`, — точка прежнего пункта гаснет за `--rise-duration-fast`.',
					'Невыбранный пункт точки в DOM не имеет; выбор читает скринридер у `<input type="radio">`. Каждая группа — в своей',
					'`<form>`: у четырёх копий одно имя `name`, а группы radio браузер разделяет по форме.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(checkedLabels(canvasElement)).toEqual(Array(4).fill('Самовывоз')))

		canvas.getAllByRole('radio', { name: 'Самовывоз' })[0]!.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(checkedLabels(canvasElement)).toEqual(Array(4).fill('Почтой России')))
		for (const radio of canvas.getAllByRole('radio', { name: 'Почтой России' })) await expect(radio).toBeChecked()
	},
}
