/** Composable: инстансинг встроенных моделей — по InstancedMesh на часть, перенос узла в отдельный объект и обратно */

import type { Object3D } from 'three'
import { PICK_INSTANCE_IDS_KEY } from '../../input/raycast'
import { buildPreset, collectMeshes } from '../runtime/modelBuild'
import { Color, DynamicDrawUsage, InstancedMesh, Matrix4 } from 'three'
import type { Model3DEntry, Model3DInstancedGroup } from '../../types/internal/model3dInternal.types'
import type { Model3DBuildScope, Model3DBuildTarget, Model3DScope } from '../../types/internal/model3dRuntime.types'

const HIDDEN = new Matrix4().makeScale(0, 0, 0)
const LOD_DETAIL = 'lod-detail'

/** Встроенная модель без своих настроек, цвета и материалов может рисоваться инстансингом: ключ группы — id модели */
export function groupKeyOf(entry: Model3DEntry): string | null {
	const { definition } = entry.resolution
	const isPlain = 'preset' in definition && definition.tint === undefined && definition.scale === undefined
	return isPlain && !entry.custom.size && !entry.colors.size ? definition.preset : null
}

function isDetailMesh(mesh: Object3D, stop: Object3D): boolean {
	for (let node: Object3D | null = mesh; node && node !== stop; node = node.parent) if (node.name === LOD_DETAIL) return true
	return false
}

/** Собрать группу: образец модели строится один раз, на каждую его часть — InstancedMesh на всех членов */
export function createGroup(scope: Model3DBuildScope, key: string, members: readonly Model3DEntry[]): Model3DInstancedGroup {
	const geometryKeys = new Set<string>()
	const materialKeys = new Set<string>()
	const target: Model3DBuildTarget = { id: key, node: members[0].selection.node, modelId: key, geometryKeys, materialKeys }
	const template = buildPreset(scope, target, key)
	template.object.updateMatrixWorld(true)
	const ids = members.map(member => member.id)
	const refs = collectMeshes(template)
	const meshes = refs.map(ref => {
		const mesh = new InstancedMesh(ref.mesh.geometry, ref.mesh.material, ids.length)
		mesh.instanceMatrix.setUsage(DynamicDrawUsage)
		mesh.castShadow = ref.mesh.castShadow
		mesh.receiveShadow = ref.mesh.receiveShadow
		mesh.frustumCulled = false
		mesh.userData[PICK_INSTANCE_IDS_KEY] = ids
		mesh.userData.isDetail = isDetailMesh(ref.mesh, template.object)
		return mesh
	})
	const group: Model3DInstancedGroup = {
		key,
		template,
		meshes,
		locals: refs.map(ref => ref.mesh.matrixWorld.clone()),
		roles: refs.map(ref => ref.part ?? 'body'),
		ids,
		geometryKeys,
		materialKeys,
	}
	members.forEach((member, index) => {
		member.groupKey = key
		member.groupIndex = index
		member.mode = 'instanced'
	})
	return group
}

/** Записать матрицы экземпляров по положению корней узлов; вынесенные и удалённые прячутся нулевым масштабом */
export function syncGroup(group: Model3DInstancedGroup, entries: ReadonlyMap<string, Model3DEntry>): void {
	const matrix = new Matrix4()
	group.ids.forEach((id, index) => {
		const entry = entries.get(id)
		const isShown = entry?.mode === 'instanced' && entry.groupIndex === index
		if (isShown) entry.body.updateWorldMatrix(true, false)
		group.meshes.forEach((mesh, part) => {
			mesh.setMatrixAt(index, isShown ? matrix.multiplyMatrices(entry.body.matrixWorld, group.locals[part]) : HIDDEN)
		})
	})
	group.meshes.forEach(mesh => (mesh.instanceMatrix.needsUpdate = true))
}

/** Цвет экземпляра: множитель к цвету материала (наведение светлее, приглушённый и серый темнее) */
export function tintInstance(group: Model3DInstancedGroup, index: number, factor: number): void {
	const color = new Color(factor, factor, factor)
	group.meshes.forEach(mesh => {
		mesh.setColorAt(index, color)
		if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
	})
}

/** Убрать группу из сцены и вернуть ресурсы */
export function disposeGroup(group: Model3DInstancedGroup, scope: Model3DScope): void {
	group.meshes.forEach(mesh => {
		mesh.removeFromParent()
		mesh.dispose()
	})
	group.template.dispose?.()
	scope.bank.release(group)
}
