import { editImports } from '../edit/editShared'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type BaseRoadmap from '../../../ui/BaseRoadmap.vue'
import type { RoadmapStatusChange } from '../../../types/BaseRoadmap.types'
import { expect, within, type userEvent as UserEvent } from 'storybook/test'

export {
	editArgs as hooksArgs,
	editControls as hooksControls,
	editModels as hooksModels,
	editTypes as hooksTypes,
} from '../edit/editShared'

export const hooksImports = [...editImports, 'type RoadmapStatusChange']

export const hooksVue = ['ref', 'onMounted', 'onBeforeUnmount']

export const hooksTemplate = `
	<BaseRoadmap
		ref="roadmap"
		v-bind="args"
		v-model:data="data"
		v-model:mode="mode"
		:before-change="guardChange"
		:before-delete="keepTopics" />
`

export const hooksScript = `
const roadmap = ref<InstanceType<typeof BaseRoadmap> | null>(null)
let off: (() => void) | undefined

// Правка идёт, кроме загрузки пути из JSON
function guardChange({ command }: { command: string }): boolean {
	return command !== 'importJson'
}

// Темы и этапы удалять нельзя
function keepTopics(): boolean {
	return false
}

// Подписка через ref: сюда приходит смена статуса темы в просмотре
function recordStatus({ topic, to }: RoadmapStatusChange): void {
	console.info(topic.title, to)
}

onMounted(() => {
	off = roadmap.value?.on('beforeStatusChange', recordStatus)
})
onBeforeUnmount(() => off?.())
`

function named<T extends (...args: never[]) => unknown>(handler: T, name: string): T {
	Object.defineProperty(handler, 'name', { value: name })
	return handler
}

export function hooksSetup() {
	const roadmap = ref<InstanceType<typeof BaseRoadmap> | null>(null)
	let off: (() => void) | undefined
	const guardChange = named(({ command }: { command: string }): boolean => command !== 'importJson', 'guardChange')
	const keepTopics = named((): boolean => false, 'keepTopics')
	const recordStatus = named(({ topic, to }: RoadmapStatusChange): void => {
		console.info(topic.title, to)
	}, 'recordStatus')
	onMounted(() => {
		off = roadmap.value?.on('beforeStatusChange', recordStatus)
	})
	onBeforeUnmount(() => off?.())
	return { roadmap, guardChange, keepTopics }
}

export async function openHooksTab(
	canvas: ReturnType<typeof within>,
	userEvent: Pick<ReturnType<(typeof UserEvent)['setup']>, 'click'>,
	topic: RegExp,
) {
	const area = within(await canvas.findByRole('region', { name: 'Путь обучения в режиме правки' }))
	await userEvent.click(await area.findByRole('button', { name: topic }))
	const inspector = canvas.getByRole('complementary', { name: 'Свойства' })
	const tab = await within(inspector).findByRole('tab', { name: /^Хуки/ })
	await userEvent.click(tab)
	await expect(tab).toHaveAttribute('aria-selected', 'true')
	return { inspector, tab }
}

export function hookCard(inspector: HTMLElement, handler: string): HTMLElement {
	const item = within(inspector).getByText(handler, { selector: '.base-roadmap__hook-fn' }).closest('li')
	if (!item) throw new Error(`Карточка подписки «${handler}» не найдена`)
	return item
}
