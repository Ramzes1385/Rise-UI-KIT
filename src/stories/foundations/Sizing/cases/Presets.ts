import { ref } from 'vue'
import { OPTIONS } from '../shared'
import type meta from '../Sizing.stories'
import { BaseBadge } from '@components/BaseBadge'
import { BaseInput } from '@components/BaseInput'
import { templateSource } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseSwitch } from '@components/BaseSwitch'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { SIZE_PRESETS, sizeLabel } from '@/stories/helpers'

const template = `
			<div class="story-stack">
				<div v-for="preset in presets" :key="preset.name" class="story-row" style="flex-wrap: nowrap;">
					<span class="story-label">{{ sizeLabel(preset) }}<br />{{ preset.control }}</span>
					<BaseButton :size-scale="preset.sizeScale">Сохранить</BaseButton>
					<div style="width: 150px;"><BaseInput v-model="text" placeholder="Поле ввода" :size-scale="preset.sizeScale" /></div>
					<div style="width: 140px;"><BaseSelect v-model="lang" :options="options" :size-scale="preset.sizeScale" /></div>
					<BaseBadge label="Новый" variant="soft" :size-scale="preset.sizeScale" />
					<BaseSwitch v-model="on" label="Звук" :size-scale="preset.sizeScale" />
					<BaseCheckbox v-model="checked" label="Флажок" :size-scale="preset.sizeScale" />
				</div>
			</div>
		`

export const Presets: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пресеты sizeScale: одна строка — один размер. Кнопка, поле, селект, бейдж и переключатели масштабируются вместе.',
			},
			source: { code: templateSource(template) },
		},
	},
	render: () => ({
		components: { BaseBadge, BaseButton, BaseCheckbox, BaseInput, BaseSelect, BaseSwitch },
		setup: () => ({
			presets: SIZE_PRESETS,
			sizeLabel,
			options: OPTIONS,
			text: ref(''),
			lang: ref('ru'),
			on: ref(true),
			checked: ref(true),
		}),
		template,
	}),
}
