import Chunk from './Chunk';

export default class pHYs extends Chunk {
    static get chunkName() {
        return 'pHYs';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        let offset = 0;
        this.pixelsPerUnitX = this.data.readUInt32BE(offset); offset += 4;
        this.pixelsPerUnitY = this.data.readUInt32BE(offset); offset += 4;
        this.unitSpecifier = this.data.readUInt8(offset);

        return this;
    }

    static parse(png, buffer, size) {
        const phys = new pHYs(png);

        return phys.parse(buffer, size);
    }
}