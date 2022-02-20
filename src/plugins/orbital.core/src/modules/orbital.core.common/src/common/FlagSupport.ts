import {IFlag} from 'orbital.core.types';
import Base from './Base';

class FlagSupport extends Base implements IFlag {

    private _flags: number = 0;

    constructor() {
        super();
        this._flags = 0;
    }

    getBitMask(): number {
        return this._flags;
    }

    /**
     * Returns true the flag (or one of the flags)
     * indicated by the given bitmask is set to true.
     * @param flag - the bitmask of flag(s)
     */
    getFlag(flag: number): boolean {
        return (this._flags & flag) !== 0;
    }

    resetFlags(): void {
        this._flags = 0;
    }

    /**
     * Sets the flag (or all of the flags) indicated by
     * the given bitmask to the given value.
     * @param flag - the bitmask of the flag(s)
     * @param value - the new value
     */
    setFlag(flag: number, value: boolean): void {
        if (typeof flag === 'undefined') {
            throw new Error('Invalid flag name');
        }
        if (value) {
            this._flags |= flag;
        } else {
            this._flags &= ~flag;
        }
    }
}

export default FlagSupport;
