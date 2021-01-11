import Chunk from './Chunk';
import * as constants from '../constants';

export default class IHDR extends Chunk {
    static get chunkName() {
        return 'IHDR';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        let index = 0;

        this.width = this.data.readUInt32BE(index); index += 4;
        this.height = this.data.readUInt32BE(index); index += 4;
        this.bitDepth = this.data.readUInt8(index); index += 1;
        this.colorType = this.data.readUInt8(index); index += 1;
        this.compressionMethod = this.data.readUInt8(index); index += 1;
        this.filterMethod = this.data.readUInt8(index); index += 1;
        this.interlaceMethod = this.data.readUInt8(index); index += 1;
        this.bytesPerPixel = constants.PIXEL_SIZE[this.colorType][this.bitDepth];
        this.colorType = constants.COLOR_TYPE[this.colorType];

        return this;
    }

    static parse(png, buffer) {
        const ihdr = new IHDR(png);

        return ihdr.parse(buffer);
    }
}