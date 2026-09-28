import { expect } from 'storybook/test'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { AvatarGroupItem } from '../types/BaseAvatarGroup.types'
import { AVATAR_GROUP_VARIANTS } from '../types/BaseAvatarGroup.types'
import { ARG_GROUP, baseArgTypes, propGroup, SIZE_PRESETS, sizeLabel, STORY_USERS, useArgsWithoutSlots } from '@/stories/helpers'

/** Участники проекта: у пятерых есть фото, у двоих — инициалы */
const PEOPLE: AvatarGroupItem[] = [
	...STORY_USERS.map(user => ({ name: user.name, src: user.avatar })),
	{ name: 'Дмитрий Орлов' },
	{ name: 'Светлана Белова' },
]

const meta = {
	title: 'Element/BaseAvatarGroup',
	component: BaseAvatarGroup,
	parameters: {
		docs: {
			description: {
				component: [
					'Группа аватаров внахлёст: участники проекта, соавторы документа. Лишние — «+N».',
					'',
					'- Разметка — список: скринридер слышит имена людей (аватары скрыты) и «и ещё N»; имя группы — `ariaLabel`.',
					'- `max` — сколько аватаров показать; если остаётся один человек, показывается и он, а не «+1».',
					'- Вариант и форма (`shape`) передаются каждому аватару.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: AVATAR_GROUP_VARIANTS }),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		shape: { control: 'inline-radio', options: ['circle', 'square'], table: propGroup(ARG_GROUP.appearance) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	},
	args: {
		items: PEOPLE,
		max: 4,
		shape: 'circle',
		ariaLabel: 'Участники проекта',
		variant: 'default',
		sizeScale: 100,
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseAvatarGroup v-bind="props" />',
	}),
} satisfies Meta<typeof BaseAvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Песочница: четыре аватара и «+3». */
export const Default: Story = {
	play: async ({ canvas }) => {
		const list = canvas.getByRole('list', { name: 'Участники проекта' })
		await expect(list.querySelectorAll('li')).toHaveLength(5)
		await expect(canvas.getByText('и ещё 3')).toBeInTheDocument()
	},
}

/** Варианты аватаров — как у BaseAvatar. */
export const Variants: Story = {
	parameters: { controls: { include: ['sizeScale', 'shape'] } },
	render: args => ({
		components: { BaseAvatarGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: AVATAR_GROUP_VARIANTS }),
		template:
			'<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseAvatarGroup v-bind="props" :variant="variant" /></div></div>',
	}),
}

/** Размеры через `sizeScale`: аватары и нахлёст масштабируются вместе. */
export const Sizes: Story = {
	parameters: { controls: { include: ['variant', 'shape'] } },
	render: args => ({
		components: { BaseAvatarGroup },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['sizeScale']),
			presets: SIZE_PRESETS.filter(preset => ['xs', 'md', 'xl'].includes(preset.name)),
			sizeLabel,
		}),
		template:
			'<div class="story-stack"><div v-for="preset in presets" :key="preset.name" class="story-row"><span class="story-label" style="width: 96px;">{{ sizeLabel(preset) }}</span><BaseAvatarGroup v-bind="props" :size-scale="preset.sizeScale" /></div></div>',
	}),
}

/** Квадратные аватары (`shape="square"`) — для команд и организаций. */
export const Square: Story = {
	args: { shape: 'square' },
}

/** Остался один человек сверх `max` — он показывается вместо «+1». */
export const NoSingleRest: Story = {
	args: { items: PEOPLE.slice(0, 5) },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
		await expect(canvas.queryByText(/и ещё/)).toBeNull()
	},
}
