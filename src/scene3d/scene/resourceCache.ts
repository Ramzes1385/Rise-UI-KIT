import type { Scene3DResourceCache, Scene3DResourceKind } from '../types/internal/scene3dInternal.types'

const KINDS: readonly Scene3DResourceKind[] = ['geometry', 'material', 'texture']

/** Кеш общих ресурсов сцены: одинаковый ключ — один объект, освобождается, когда ссылок не осталось */
export function createResourceCache(): Scene3DResourceCache {
	const slots: Record<Scene3DResourceKind, Map<string, { value: { dispose: () => void }; refs: number }>> = {
		geometry: new Map(),
		material: new Map(),
		texture: new Map(),
	}

	function acquire<T extends { dispose: () => void }>(kind: Scene3DResourceKind, key: string, build: () => T): T {
		const slot = slots[kind].get(key)
		if (slot) {
			slot.refs += 1
			return slot.value as T
		}
		const value = build()
		slots[kind].set(key, { value, refs: 1 })
		return value
	}

	return {
		geometry: (key, build) => acquire('geometry', key, build),
		material: (key, build) => acquire('material', key, build),
		texture: (key, build) => acquire('texture', key, build),
		release(kind, key) {
			const slot = slots[kind].get(key)
			if (!slot) return
			slot.refs -= 1
			if (slot.refs > 0) return
			slot.value.dispose()
			slots[kind].delete(key)
		},
		dispose() {
			KINDS.forEach(kind => {
				slots[kind].forEach(slot => slot.value.dispose())
				slots[kind].clear()
			})
		},
	}
}
