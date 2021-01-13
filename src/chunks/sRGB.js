import Chunk from './Chunk';
import * as constants from '../constants';

export default class sRGB extends Chunk {
    static get chunkName() {
        return 'sRGB';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        const code = this.data.readUInt8(0);
        this.renderingIntent = {
            code,
            name: constants.RENDERING_INTENT[code]
        };

        return this;
    }

    static parse(png, buffer) {
        const srgb = new sRGB(png);

        return srgb.parse(buffer);
    }
}