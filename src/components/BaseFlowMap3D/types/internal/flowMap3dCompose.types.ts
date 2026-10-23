import type { Ref, ShallowRef } from 'vue'
import type { useFlowMap3DStage } from '../../model/useFlowMap3DStage'
import type { Model3DDefinitions } from '@/scene3d/types/model3d.types'
import type { useFlowMap3DSettings } from '../../model/ui/useFlowMap3DDock'
import type { useFlowMap3DCore } from '../../model/compose/useFlowMap3DCore'
import type { useFlowMap3DInput } from '../../model/compose/useFlowMap3DInput'
import type { BaseFlowMap3DEmits, FlowMap3DProps } from '../BaseFlowMap3D.types'
import type { useFlowMap3DSnapshot } from '../../model/data/useFlowMap3DSnapshot'

/** Ссылки на элементы шаблона */
export interface FlowMap3DRefs {
	rootRef: Readonly<ShallowRef<HTMLElement | null>>
	viewportRef: Readonly<ShallowRef<HTMLElement | null>>
	canvasRef: Readonly<ShallowRef<HTMLCanvasElement | null>>
	labelsRef: Readonly<ShallowRef<HTMLElement | null>>
}

/** Ядро компонента: модель карты, вид, размеры, озвучка */
type FlowMap3DCore = ReturnType<typeof useFlowMap3DCore>

/** Настройки вида: пресет, «Слои», частицы */
type FlowMap3DSettings = ReturnType<typeof useFlowMap3DSettings>

/** Сцена: холст, камера, подписи, состояния */
export type FlowMap3DStage = ReturnType<typeof useFlowMap3DStage>

/** Ввод: выбор, фокус, клавиатура, указатель, список */
export type FlowMap3DInput = ReturnType<typeof useFlowMap3DInput>

/** Снимок данных для сцены */
type FlowMap3DSnapshotRef = ReturnType<typeof useFlowMap3DSnapshot>

/** Что компонент добавляет к общим частям для шаблона */
export interface FlowMap3DTemplateExtras {
	snapshot: FlowMap3DSnapshotRef
	classes: Readonly<{ value: Record<string, string | undefined> }>
}

/** Общие части, из которых собирается компонент */
export interface FlowMap3DComposeParts {
	props: FlowMap3DProps
	emit: BaseFlowMap3DEmits
	core: FlowMap3DCore
	settings: FlowMap3DSettings
	refs: FlowMap3DRefs
	hovered: Ref<string | null>
	focused: Ref<string | null>
	/** Модели приложения: читаются при создании компонента, до ленивой «Правки» */
	appModels: Model3DDefinitions
}
