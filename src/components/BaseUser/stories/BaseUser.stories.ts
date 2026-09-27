/**
 * BaseUser — stories.
 *
 * Разделы: Default (песочница) → внешний вид (размеры, вертикально, без фото, длинные тексты) → сценарии (ссылка
 * на профиль, в сети, своя подпись).
 */

import { expect } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, STORY_USERS, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseBadge } from '@components/BaseBadge'
import { USER_VARIANTS } from '../model/BaseUser.types'
import BaseUser from '../ui/BaseUser.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

const [ANNA] = STORY_USERS

const meta = {
	title: 'Element/BaseUser',
	component: BaseUser,
	parameters: {
		docs: {
			description: {
				component: [
					'Человек: аватар, имя и подпись — автор комментария, исполнитель задачи, строка списка участников.',
					'',
					'- Аватар скрыт от скринридера (имя написано рядом); статус «в сети» — точка и скрытый текст.',
					'- `to` или `href` делают весь блок ссылкой на профиль (BaseLink: RouterLink приложения или `<a>`).',
					'- `orientation="vertical"` — аватар над текстом; слот `description` — своя подпись.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: USER_VARIANTS }),
		name: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		src: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isOnline: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
		to: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	},
	args: {
		name: ANNA.name,
		description: ANNA.role,
		src: ANNA.avatar,
		isOnline: false,
		orientation: 'horizontal',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseUser },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseUser v-bind="props" />',
	}),
} satisfies Meta<typeof BaseUser>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: фото, имя и должность. */
export const Default: Story = {
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Анна Смирнова')).toBeVisible()
		await expect(canvas.getByText('Дизайнер')).toBeVisible()
	},
}

/** Размеры через `sizeScale`: аватар и текст масштабируются вместе. */
export const Sizes: Story = {
	parameters: { controls: { include: ['orientation'] } },
	render: args => ({
		components: { BaseUser },
		setup: () => ({ props: useArgsWithoutSlots(args, ['sizeScale']), presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)), sizeLabel }),
		template: '<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ sizeLabel(preset) }}</span><BaseUser v-bind="props" :size-scale="preset.sizeScale" /></div></div>',
	}),
}

/** Вертикально: аватар над текстом — для карточек команды. Без фото — инициалы. */
export const Vertical: Story = {
	args: { orientation: 'vertical', src: undefined, name: 'Дмитрий Орлов', description: 'Руководитель отдела' },
}

/** Длинные имя и подпись обрезаются многоточием по ширине контейнера. */
export const LongContent: Story = {
	args: { name: 'Екатерина Александровна Константинопольская', description: 'Руководитель направления клиентского сервиса' },
	render: args => ({
		components: { BaseUser },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<div style="width: 220px;"><BaseUser v-bind="props" style="width: 100%;" /></div>',
	}),
	play: async ({ canvasElement }) => {
		const name = canvasElement.querySelector('.base-user__name') as HTMLElement
		await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth)
	},
}

/** Ссылка на профиль (`to`) и статус «в сети»: весь блок — ссылка, скринридер слышит «Анна Смирнова, в сети». */
export const ProfileLink: Story = {
	args: { to: '/users/1', isOnline: true },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Анна Смирнова.*в сети/ })
		await expect(link).toHaveAttribute('href', '/users/1')
	},
}

/** Своя подпись: слот `description` — роль бейджем. */
export const CustomDescription: Story = {
	render: args => ({
		components: { BaseUser, BaseBadge },
		setup: () => ({ props: useArgsWithoutSlots(args, ['description']) }),
		template: '<BaseUser v-bind="props"><template #description><BaseBadge variant="soft" label="Администратор" /></template></BaseUser>',
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Администратор')).toBeVisible()
	},
}
