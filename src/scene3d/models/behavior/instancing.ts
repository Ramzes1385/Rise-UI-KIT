/** Composable: инстансинг встроенных моделей — по InstancedMesh на часть, перенос узла в отдельный объект и обратно */

import { PICK_INSTANCE_IDS_KEY } from '../../input/raycast'
import { buildPreset, collectMeshes } from '../runtime/modelBuild'
import type { BufferGeometry, Material, Mesh, Object3D } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Box3, Color, DynamicDrawUsage, InstancedMesh, Matrix4, Vector3 } from 'three'
import type { Model3DBuildScope, Model3DBuildTarget, Model3DScope } from '../../types/internal/model3dRuntime.types'
import type { Model3DEntry, Model3DGroupParts, Model3DInstancedGroup, Model3DMeshRef } from '../../types/internal/model3dInternal.types'

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

function instancedOf(source: Mesh, shape: { geometry: BufferGeometry; isDetail: boolean }, ids: string[]): InstancedMesh {
	const { geometry, isDetail } = shape
	const mesh = new InstancedMesh(geometry, source.material, ids.length)
	mesh.instanceMatrix.setUsage(DynamicDrawUsage)
	mesh.castShadow = source.castShadow
	mesh.receiveShadow = source.receiveShadow
	mesh.frustumCulled = false
	mesh.userData[PICK_INSTANCE_IDS_KEY] = ids
	mesh.userData.isDetail = isDetail
	return mesh
}

function plainParts(refs: Model3DMeshRef[], root: Object3D, ids: string[]): Model3DGroupParts {
	return {
		meshes: refs.map(ref => instancedOf(ref.mesh, { geometry: ref.mesh.geometry, isDetail: isDetailMesh(ref.mesh, root) }, ids)),
		locals: refs.map(ref => ref.mesh.matrixWorld.clone()),
		roles: refs.map(ref => ref.part ?? 'body'),
		ownedGeometries: [],
	}
}

function bakedGeometry(ref: Model3DMeshRef): BufferGeometry {
	const geometry = ref.mesh.geometry.clone().applyMatrix4(ref.mesh.matrixWorld)
	return geometry.index ? geometry.toNonIndexed() : geometry
}

const TINY_PART = 0.12

function sizeOf(box: Box3): number {
	return box.getSize(new Vector3()).length()
}

function detailMark(root: Object3D): (ref: Model3DMeshRef) => boolean {
	const whole = sizeOf(new Box3().setFromObject(root))
	return ref => isDetailMesh(ref.mesh, root) || sizeOf(new Box3().setFromObject(ref.mesh)) < whole * TINY_PART
}

function bucketKey(ref: Model3DMeshRef, isDetail: boolean): string {
	const { mesh } = ref
	return [(mesh.material as Material).uuid, isDetail, mesh.castShadow, mesh.receiveShadow].join('|')
}

/** Части с одним материалом, видимостью детали и тенями — один InstancedMesh с запечённым положением частей; мелкие части (меньше 12% модели) — деталь, прячется вдали */
function mergedParts(refs: Model3DMeshRef[], root: Object3D, ids: string[]): Model3DGroupParts {
	const isDetail = detailMark(root)
	const buckets = new Map<string, Model3DMeshRef[]>()
	refs.forEach(ref => {
		const key = bucketKey(ref, isDetail(ref))
		buckets.set(key, [...(buckets.get(key) ?? []), ref])
	})
	const result: Model3DGroupParts = { meshes: [], locals: [], roles: [], ownedGeometries: [] }
	buckets.forEach(list => {
		const merged = mergeGeometries(list.map(bakedGeometry))
		if (!merged) {
			const plain = plainParts(list, root, ids)
			result.meshes.push(...plain.meshes)
			result.locals.push(...plain.locals)
			result.roles.push(...plain.roles)
			return
		}
		result.meshes.push(instancedOf(list[0].mesh, { geometry: merged, isDetail: isDetail(list[0]) }, ids))
		result.locals.push(new Matrix4())
		result.roles.push(list[0].part ?? 'body')
		result.ownedGeometries.push(merged)
	})
	return result
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
	const parts = scope.options.isMergedInstancing ? mergedParts(refs, template.object, ids) : plainParts(refs, template.object, ids)
	const { meshes, locals, ownedGeometries } = parts
	const group: Model3DInstancedGroup = {
		key,
		template,
		meshes,
		locals,
		roles: parts.roles,
		ownedGeometries,
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
	group.ownedGeometries.forEach(geometry => geometry.dispose())
	group.template.dispose?.()
	scope.bank.release(group)
}
