import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/mainMap'
import type { StoryObj } from '@storybook/vue3-vite'

const LONG_TEXT = 'Очень длинное название сервиса, которое не помещается в карточку узла и обрезается многоточием '.repeat(3)

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинные подписи узлов (около 300 символов): карточка обрезает текст, полный текст — в подробностях.' },
		},
	},
	args: {
		data: { ...MAIN_MAP, nodes: MAIN_MAP.nodes.map((node, index) => (index === 4 ? { ...node, label: LONG_TEXT } : node)) },
	},
}
