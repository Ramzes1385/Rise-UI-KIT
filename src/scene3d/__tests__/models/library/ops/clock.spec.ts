import { describeLibraryModel } from '../../libraryChecks'
import { buildClock } from '../../../../models/library/ops/clock'

describeLibraryModel('clock', buildClock, { parts: ['body', 'accent', 'detail', 'metal', 'light'], animations: ['spin'], anchorY: 1.28 })
