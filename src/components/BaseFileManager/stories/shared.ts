import { setup } from './files.setup'
import setupSource from './files.setup.ts?raw'
import { BaseButton } from '@components/BaseButton'
import BaseFileManager from '../ui/BaseFileManager.vue'
import { scriptSource, useStorySetup } from '@/stories/helpers'
import type { StorySourceOptions } from '@/stories/helpers/types/helpers.types'

export const MODELS = { path: 'path', selected: 'selected', query: 'query', view: 'view', sort: 'sort' } as const

const MODEL_TYPES = {
	path: 'string | null',
	selected: 'string[]',
	query: 'string',
	view: 'FileManagerView',
	sort: 'FileManagerSort',
}

const MODEL_ATTRS = [
	'v-model:path="path"',
	'v-model:selected="selected"',
	'v-model:query="query"',
	'v-model:view="view"',
	'v-model:sort="sort"',
]

const EVENT_ATTRS = ['@create-folder="createFolder"', '@rename="rename"', '@delete="remove"', '@move="move"', '@upload="upload"']

export interface ManagerTagOptions {
	tabs?: number
	attrs?: string[]
	isModel?: boolean
	isStatic?: boolean
	items?: string
}

export function managerTag({ tabs = 1, attrs = [], isModel = false, isStatic = false, items = 'items' }: ManagerTagOptions = {}): string {
	const pad = '\t'.repeat(tabs)
	const props = ['v-bind="args"', ...(isModel ? MODEL_ATTRS : []), ...attrs, `:items="${items}"`, ...(isStatic ? [] : EVENT_ATTRS)]
	return ['<BaseFileManager', ...props.map(prop => `\t${prop}`), '/>'].map(line => `${pad}${line}`).join('\n')
}

export interface ManagerCaseOptions {
	template: string
	isModel?: boolean
	state?: Record<string, unknown>
	data?: Record<string, unknown>
	script?: string
	imports?: string[]
	omit?: string[]
	vue?: string[]
	setup?: () => Record<string, unknown>
	raw?: string
	isStatic?: boolean
}

function usedTypes(options: ManagerCaseOptions, raw: string): string[] {
	const models = options.isModel ? ['type FileManagerSort', 'type FileManagerView'] : []
	return raw.includes('FileManagerItem') ? ['type FileManagerItem', ...models] : models
}

export function managerSource(options: ManagerCaseOptions): StorySourceOptions {
	const raw = options.isStatic ? '' : (options.raw ?? setupSource)
	return {
		template: options.template,
		imports: ['BaseFileManager', ...usedTypes(options, raw), ...(options.imports ?? [])],
		models: options.isModel ? MODELS : undefined,
		types: options.isModel ? MODEL_TYPES : undefined,
		state: options.state,
		vue: [...(options.isStatic ? [] : ['ref']), ...(options.vue ?? [])],
		script: [scriptSource(raw), options.script].filter(Boolean).join('\n\n'),
		omit: options.omit,
	}
}

export function managerRender(options: ManagerCaseOptions) {
	return <TArgs extends object>(args: TArgs) => ({
		components: { BaseFileManager, BaseButton },
		setup: useStorySetup(args, {
			models: options.isModel ? MODELS : undefined,
			state: options.state,
			data: options.data,
			setup: options.setup ?? (options.isStatic ? undefined : setup),
		}),
		template: options.template,
	})
}
