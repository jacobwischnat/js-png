import Chunk from './Chunk';

export default class sBIT extends Chunk {
    static get chunkName() {
        return 'sBIT';
    }

    parse(buffer) {
        this.parseChunk(buffer);

        switch (this.png.IHDR.colorType.type) {
            case 'RGBA':
                this.redBits = this.data.readUInt8(0);
                this.greenBits = this.data.readUInt8(1);
                this.blueBits = this.data.readUInt8(2);
                this.alphaBits = this.data.readUInt8(3);
                break;
        }

        return this;
    }

    static parse(png, buffer, size) {
        const sbit = new sBIT(png);

        return sbit.parse(buffer, size);
    }
}