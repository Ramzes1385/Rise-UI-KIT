import { computed } from 'vue'
import { pathKey, toPathList } from './levels/cascaderTree'
import type {
	BaseCascaderEmits,
	CascaderLevels,
	CascaderPath,
	CascaderProps,
	CascaderTag,
	CascaderValue,
} from '../types/BaseCascader.types'

export function useCascaderValue(props: CascaderProps, emit: BaseCascaderEmits, levels: CascaderLevels) {
	const paths = computed(() => toPathList(props.modelValue, Boolean(props.isMultiple)))
	const keys = computed(() => new Set(paths.value.map(pathKey)))
	const nodesOf = (path: CascaderPath) => path.map(id => levels.index.value.nodes.get(id))
	const labelsOf = (path: CascaderPath): string[] => path.map(id => levels.index.value.nodes.get(id)?.label ?? id)
	const singlePath = computed(() => paths.value[0] ?? [])

	function emitValue(value: CascaderValue): void {
		emit('update:modelValue', value)
		emit('change', value)
	}

	return {
		paths,
		singlePath,
		singleLabels: computed(() => labelsOf(singlePath.value)),
		singleNodes: computed(() => nodesOf(singlePath.value)),
		displayText: computed(() => labelsOf(singlePath.value).join(props.separator)),
		tags: computed((): CascaderTag[] =>
			props.isMultiple ? paths.value.map(path => ({ key: pathKey(path), path, text: labelsOf(path).join(props.separator) })) : [],
		),
		isPathSelected: (path: CascaderPath): boolean => keys.value.has(pathKey(path)),
		commit(path: CascaderPath): void {
			if (!props.isMultiple) {
				emitValue(path)
				return
			}
			const key = pathKey(path)
			emitValue(keys.value.has(key) ? paths.value.filter(item => pathKey(item) !== key) : [...paths.value, path])
		},
		remove(path: CascaderPath): void {
			const key = pathKey(path)
			emitValue(paths.value.filter(item => pathKey(item) !== key))
		},
	}
}
