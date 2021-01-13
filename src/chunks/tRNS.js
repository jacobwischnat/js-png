
import Chunk from './Chunk';
import * as constants from '../constants';

export default class tRNS extends Chunk {
    static get chunkName() {
        return 'tRNS';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        switch (this.png.IHDR.colorType.type) {
            case 'PALETTE':
                this.palette = Array.from(this.data);
                break;
        }

        return this;
    }

    static parse(png, buffer, size) {
        const trns = new tRNS(png);

        return trns.parse(buffer, size);
    }
}