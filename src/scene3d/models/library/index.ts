/** Утилиты: библиотека встроенных 3D-моделей — id → фабрика; части `s3d-lib-a` и `s3d-lib-b` добавляют по строке на модель */

import { buildDb } from './data/db'
import { buildShape } from './shape'
import { buildRam } from './data/ram'
import { buildBell } from './ops/bell'
import { buildLock } from './edge/lock'
import { buildBank } from './services/bank'
import { buildCart } from './services/cart'
import { buildRack } from './services/rack'
import { buildPhone } from './clients/phone'
import { buildGateway } from './edge/gateway'
import { buildLaptop } from './clients/laptop'
import { buildConveyor } from './data/conveyor'
import { buildServer } from './services/server'
import { buildTerminal } from './services/terminal'
import type { Model3DLibrary } from '../../types/internal/model3dInternal.types'

/** Встроенные модели: запасные `server` и `shape`; остальные id таблицы пресетов регистрируют части библиотеки */
export const MODEL3D_LIBRARY: Model3DLibrary = {
	server: buildServer,
	laptop: buildLaptop,
	phone: buildPhone,
	gateway: buildGateway,
	lock: buildLock,
	cart: buildCart,
	rack: buildRack,
	terminal: buildTerminal,
	bank: buildBank,
	bell: buildBell,
	ram: buildRam,
	db: buildDb,
	conveyor: buildConveyor,
	shape: buildShape,
}
