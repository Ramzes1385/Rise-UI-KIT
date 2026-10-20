/** Утилиты: библиотека встроенных 3D-моделей — id → фабрика; части `s3d-lib-a` и `s3d-lib-b` добавляют по строке на модель */

import { buildAi } from './ops/ai'
import { buildDb } from './data/db'
import { buildShape } from './shape'
import { buildRam } from './data/ram'
import { buildBell } from './ops/bell'
import { buildLock } from './edge/lock'
import { buildFlag } from './goals/flag'
import { buildClock } from './ops/clock'
import { buildCloud } from './edge/cloud'
import { buildGlobe } from './edge/globe'
import { buildUser } from './clients/user'
import { buildSearch } from './ops/search'
import { buildBucket } from './data/bucket'
import { buildScroll } from './data/scroll'
import { buildScales } from './edge/scales'
import { buildBook } from './learning/book'
import { buildCode } from './learning/code'
import { buildGear } from './learning/gear'
import { buildBank } from './services/bank'
import { buildCart } from './services/cart'
import { buildRack } from './services/rack'
import { buildPhone } from './clients/phone'
import { buildRocket } from './goals/rocket'
import { buildShield } from './goals/shield'
import { buildMailbox } from './ops/mailbox'
import { buildMonitor } from './ops/monitor'
import { buildGateway } from './edge/gateway'
import { buildFlask } from './learning/flask'
import { buildLaptop } from './clients/laptop'
import { buildConveyor } from './data/conveyor'
import { buildLayers } from './learning/layers'
import { buildWindow } from './learning/window'
import { buildServer } from './services/server'
import { buildAnalytics } from './ops/analytics'
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
	user: buildUser,
	globe: buildGlobe,
	scales: buildScales,
	cloud: buildCloud,
	bucket: buildBucket,
	scroll: buildScroll,
	search: buildSearch,
	analytics: buildAnalytics,
	monitor: buildMonitor,
	clock: buildClock,
	mailbox: buildMailbox,
	ai: buildAi,
	window: buildWindow,
	code: buildCode,
	gear: buildGear,
	layers: buildLayers,
	flask: buildFlask,
	book: buildBook,
	rocket: buildRocket,
	shield: buildShield,
	flag: buildFlag,
}
