import Chunk from './Chunk';

export default class eXIf extends Chunk {
    static get chunkName() {
        return 'eXIf';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        return this;
    }

    static parse(png, buffer) {
        const exif = new eXIf(png);

        return exif.parse(buffer);
    }
}