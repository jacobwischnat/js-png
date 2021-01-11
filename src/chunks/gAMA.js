import Chunk from './Chunk';

export default class gAMA extends Chunk {
    static get chunkName() {
        return 'gAMA';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        this.gamma = this.data.readUInt32BE(0);

        return this;
    }

    static parse(png, buffer) {
        const gama = new gAMA(png);

        return gama.parse(buffer);
    }
}