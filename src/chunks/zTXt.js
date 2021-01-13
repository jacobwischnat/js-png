import pako from 'pako';
import Chunk from './Chunk';
import {Buffer} from 'buffer/';
import * as helpers from '../helpers';

export default class zTXt extends Chunk {
    static get chunkName() {
        return 'zTXt';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        const nullIndex = this.data.indexOf(0x00);
        this.text = this.data.slice(0, nullIndex).toString();
        this.compression = this.data.readUInt8(nullIndex + 1);
        this.compressedText = this.data.slice(nullIndex + 2);

        this.decompressedText = Buffer.from(pako.inflate(helpers.bufferToArrayBuffer(this.compressedText))).toString().split('\n');

        return this;
    }

    static parse(png, buffer, size) {
        const ztxt = new zTXt(png);

        return ztxt.parse(buffer, size);
    }
}