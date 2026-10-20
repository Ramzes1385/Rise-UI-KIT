import { describeModels } from './libraryKit'
import { buildBell } from '../../../models/library/ops/bell'
import { buildBank } from '../../../models/library/services/bank'
import { buildCart } from '../../../models/library/services/cart'
import { buildRack } from '../../../models/library/services/rack'
import { buildTerminal } from '../../../models/library/services/terminal'

describeModels([
	['cart', buildCart, ['body', 'accent', 'metal', 'detail'], 'roll'],
	['rack', buildRack, ['body', 'accent', 'metal', 'detail'], 'pulse'],
	['terminal', buildTerminal, ['body', 'screen', 'metal', 'detail', 'accent', 'light'], 'swipe'],
	['bank', buildBank, ['glass', 'accent'], null],
	['bell', buildBell, ['body', 'accent', 'detail', 'light', 'metal'], 'ring'],
])
