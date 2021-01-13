import Chunk from './Chunk';

export default class PLTE extends Chunk {
    static get chunkName() {
        return 'PLTE';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        this.palette = [];

        let offset = 0;
        do {
            const bytes = this.data.slice(offset, offset + 3);
            const red = this.data.readUInt8(offset); offset += 1;
            const green = this.data.readUInt8(offset); offset += 1;
            const blue = this.data.readUInt8(offset); offset += 1;

            this.palette.push({red, green, blue, bytes});
        } while (offset < this.data.length);

        return this;
    }

    static parse(png, buffer) {
        const plte = new PLTE(png);

        return plte.parse(buffer);
    }
}