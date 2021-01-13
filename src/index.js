import * as chunks from './chunks';
import * as constants from './constants';

import {Buffer} from 'buffer/';

export default class PNG {
    constructor(opts = {}) {
        this.opts = opts;
    }

    load(data) {
        let index = 0;

        const buffer = Buffer.from(data);
        const signature = buffer.slice(0, constants.SIGNATURE_SIZE);
        index += constants.SIGNATURE_SIZE;

        if (signature.toString('hex') !== constants.SIGNATURE_PNG) {
            throw new Error('Invalid PNG file.');
        }

        while (index < buffer.length) {
            const size = buffer.readUInt32BE(index);
            const type = buffer.slice(index + 4, index + 8).toString();

            if (chunks[type]) {
                if (this[type]) this[type].addChunk(buffer.slice(index));
                else this[type] = chunks[type].parse(this, buffer.slice(index));
            } else {
                this[type] = chunks.Chunk.parse(this, buffer.slice(index));
            }

            index += 12 + size;
        }

        if (this.IEND) {
            if (this.IDAT.compressed) this.IDAT.inflate();
            if (this.IDAT.filtered) this.IDAT.unfilter();
        }
    }

    imageData() {
        let {pixels} = this.IDAT;
        if (this.IHDR.bytesPerPixel === 3) {
            pixels = pixels.reduce((a, _, i, o) => {
                if (i % 3 === 0) {
                    a.push(...o.slice(i, i + 3), 0xFF);
                }

                return a;
            }, []);
        }

        if (this.IHDR.bytesPerPixel === 6) {
            pixels = pixels.reduce((a, _, i, o) => {
                if (i % 6 === 0) {
                    const [r,,g,,b] = o.slice(i, i + 6)
                    a.push(r, g, b, 0xFF);
                }

                return a;
            }, []);
        }
        const data = new Uint8ClampedArray(pixels);

        return new ImageData(data, this.IHDR.width, this.IHDR.height);
    }

    static load(data, opts) {
        const png = new PNG(opts);

        return png.load(data);
    }
}