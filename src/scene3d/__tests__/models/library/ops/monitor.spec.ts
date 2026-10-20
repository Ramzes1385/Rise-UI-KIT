import { describeLibraryModel } from '../../libraryChecks'
import { buildMonitor } from '../../../../models/library/ops/monitor'

describeLibraryModel('monitor', buildMonitor, { parts: ['body', 'detail', 'screen', 'light'], animations: ['blink'], anchorY: 1.36 })
