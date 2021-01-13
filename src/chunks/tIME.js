import Chunk from './Chunk';

export default class tIME extends Chunk {
    static get chunkName() {
        return 'tIME';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        this.dateTime = {};

        let offset = 0;
        this.dateTime.year = this.data.readUInt16BE(offset); offset += 2;
        this.dateTime.month = this.data.readUInt8(offset); offset += 1;
        this.dateTime.day = this.data.readUInt8(offset); offset += 1;
        this.dateTime.hour = this.data.readUInt8(offset); offset += 1;
        this.dateTime.minute = this.data.readUInt8(offset); offset += 1;
        this.dateTime.second = this.data.readUInt8(offset); offset += 1;

        return this;
    }

    static parse(png, buffer, size) {
        const time = new tIME(png);

        return time.parse(buffer, size);
    }
}