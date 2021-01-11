import * as constants from '../constants';

import EventEmitter from 'events/';
import {Buffer} from 'buffer/';

export default class Chunk extends EventEmitter {
    constructor(png) {
        super();
        this.png = png;
        this.datas = [];
    }

    parseChunk(buffer) {
        let index = 0;

        /* Standard Chunk Properties */
        const size = buffer.readUInt32BE(index); index += 4;
        if (this.size) {
            this.size += size;
        } else {
            this.size = size;
        }
        this.type = buffer.slice(index, index + 4).toString();
        this.isAncillary = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 1;
        this.isPrivate = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 2;
        this.isSafeToCopy = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 1;
        if (this.data) {
            const data = buffer.slice(index, index + size); index += size;
            this.datas.push(data);
            this.data = Buffer.concat([this.data, data]);
        } else {
            const data = buffer.slice(index, index + size); index += size;
            this.datas.push(data);
            this.data = data;
        }
        this.crc = buffer.slice(index, index + 4); index += 4;
        if (this.sourceData) {
            const data = buffer.slice(0, index);
            this.sourceData = Buffer.concat([this.sourceData, data]);
        } else {
            this.sourceData = buffer.slice(0, index);
        }

        return this;
    }

    parse(buffer) {
        this.parseChunk(buffer);

        return this;
    }

    static parse(png, buffer) {
        const chunk = new Chunk(png);

        return chunk.parse(buffer);
    }
}