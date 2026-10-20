import { describeModels } from './libraryKit'
import { buildDb } from '../../../models/library/data/db'
import { buildRam } from '../../../models/library/data/ram'
import { buildConveyor } from '../../../models/library/data/conveyor'

describeModels([
	['ram', buildRam, ['detail', 'accent', 'body', 'light'], 'blink'],
	['db', buildDb, ['body', 'accent', 'screen'], 'spin'],
	['conveyor', buildConveyor, ['accent', 'body', 'metal', 'detail'], 'flow'],
])
