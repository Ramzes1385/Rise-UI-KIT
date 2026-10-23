import type meta from '../BaseUser.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Вертикально: аватар над текстом — для карточек команды. Без фото — инициалы.' } } },
	args: { orientation: 'vertical', src: undefined, name: 'Дмитрий Орлов', description: 'Руководитель отдела' },
}
