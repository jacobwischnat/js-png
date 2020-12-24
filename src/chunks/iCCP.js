import Chunk from './Chunk';

export default class iCCP extends Chunk {
    static get chunkName() {
        return 'iCCP';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        this.name = this.data.slice(0, this.data.indexOf(0x00)).toString();

        return this;
    }

    static parse(png, buffer, size) {
        const iccp = new iCCP(png);

        return iccp.parse(buffer, size);
    }
}