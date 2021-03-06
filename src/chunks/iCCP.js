import pako from 'pako';
import Chunk from './Chunk';
import {Buffer} from 'buffer/';
import * as helpers from '../helpers';

export default class iCCP extends Chunk {
    static get chunkName() {
        return 'iCCP';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        const nullIndex = this.data.indexOf(0x00);
        this.profileName = this.data.slice(0, nullIndex).toString();
        this.compression = this.data.readUInt8(nullIndex + 1);
        this.compressedProfile = this.data.slice(nullIndex + 2);

        this.profile = Buffer.from(pako.inflate(helpers.bufferToArrayBuffer(this.compressedProfile)));

        return this;
    }

    static parse(png, buffer, size) {
        const iccp = new iCCP(png);

        return iccp.parse(buffer, size);
    }
}