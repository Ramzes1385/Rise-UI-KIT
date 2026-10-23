import { describeModels } from './libraryKit'
import { buildLock } from '../../../models/library/edge/lock'
import { buildPhone } from '../../../models/library/clients/phone'
import { buildGateway } from '../../../models/library/edge/gateway'
import { buildLaptop } from '../../../models/library/clients/laptop'

describeModels([
	['laptop', buildLaptop, ['body', 'metal', 'screen', 'accent', 'detail'], null],
	['phone', buildPhone, ['body', 'accent', 'screen', 'detail'], null],
	['gateway', buildGateway, ['body', 'detail', 'accent', 'screen', 'light'], 'gate'],
	['lock', buildLock, ['body', 'detail', 'metal', 'light', 'accent'], 'unlock'],
])
