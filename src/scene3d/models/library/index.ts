/** Утилиты: библиотека встроенных 3D-моделей — id → фабрика; части `s3d-lib-a` и `s3d-lib-b` добавляют по строке на модель */

import { buildShape } from './shape'
import { buildServer } from './services/server'
import type { Model3DLibrary } from '../../types/internal/model3dInternal.types'

/** Встроенные модели: запасные `server` и `shape`; остальные id таблицы пресетов регистрируют части библиотеки */
export const MODEL3D_LIBRARY: Model3DLibrary = {
	server: buildServer,
	shape: buildShape,
}
