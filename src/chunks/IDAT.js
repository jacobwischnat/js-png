import pako from 'pako';
import {Buffer} from 'buffer/';

import Chunk from './Chunk';

import * as helpers from '../helpers';
import * as constants from '../constants';

export default class IDAT extends Chunk {
    constructor(png) {
        super(png);

        this.pixels = [];
        this.rows = [];

        this.compressed = false;
        this.decompressed = false;
        this.filtered = false;
        this.unfiltered = false;
    }

    static get chunkName() {
        return 'IDAT';
    }

    get lineSize() {
        return this.png.IHDR.width * this.png.IHDR.bytesPerPixel;
    }

    get bytesPerPixel() {
        return this.png.IHDR.bytesPerPixel;
    }

    inflate() {
        try {
            const data = Buffer.concat(this.datas.map(buffer => Buffer.from(buffer)));
            console.log(data.toString('hex').slice(0, 10));
            console.dir(pako);
            const inflated = pako.inflate(helpers.bufferToArrayBuffer(data));
            console.log({inflated});
            if (inflated) {
                this.data = Buffer.from(inflated);
                this.decompressed = true;
            }
        } catch (ex) {
            console.error(ex);
        }
    }

    unfilter() {
        try {
            this.rows = [];
            this.pixels = [];

            let mode = null;
            let index = 0;
            for (index = 0; index < this.data.length; index += 1) {
                if (index % (this.lineSize + 1) === 0) {
                    mode = this.data.readUInt8(index);
                    this.rows.push(constants.FILTERS[mode] || mode);
                }

                switch (mode) {
                    case constants.FILTERS.NONE:
                        {
                        const sourceLine = this.data.slice(index + 1, index + 1 + this.lineSize);
                        const line = sourceLine.map((_, i) => sourceLine.readUInt8(i));
                        this.pixels.push(...line);
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.SUB:
                        {
                        const line = [];
                        for (let i = 0; i < this.lineSize; i += 1) {
                            const diffIndex = index + 1 + i;
                            const value = this.data.readUInt8(diffIndex);
                            const lastPixel = line.length - this.bytesPerPixel;
                            if (line.length < this.bytesPerPixel) line.push(value);
                            else {
                                const refPixel = line[lastPixel];
                                line.push(helpers.rectify(value + refPixel));
                            }
                        }
                        this.pixels.push(...line);
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.UP:
                        {
                        for (let i = 0; i < this.lineSize; i += 1) {
                            const valueIndex = index + 1 + i;
                            const prior = this.pixels[this.pixels.length - this.lineSize];
                            // const prior = this.data.readUInt8(index - (this.lineSize - i))
                            const value = this.data.readUInt8(valueIndex);
                            this.pixels.push((value + prior) % 256);
                        }
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.AVG:
                        {
                        for (let i = 0; i < this.lineSize; i += 1) {
                            const offset = index + 1 + i;
                            const value = this.data.readUInt8(offset);
                            const aboveIndex = this.pixels.length - this.lineSize;
                            const above = this.pixels[aboveIndex];
                            const leftIndex = this.pixels.length - this.bytesPerPixel;
                            const left = (i - this.bytesPerPixel) > 0 ? this.pixels[leftIndex] : 0;
                            this.pixels.push(helpers.rectify(value + Math.floor((above + left) / 2)));
                        }
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.PAETH:
                        {
                        for (let i = 0; i < this.lineSize; i += 1) {
                            const offset = index + 1 + i;
                            const value = this.data.readUInt8(offset);
                            const aboveIndex = this.pixels.length - this.lineSize;
                            const above = this.pixels[aboveIndex];
                            if (i < this.bytesPerPixel) {
                                this.pixels.push(helpers.rectify(value + above));
                            } else {
                                const leftIndex = this.pixels.length - this.bytesPerPixel;
                                const left = this.pixels[leftIndex];
                                const adjacentIndex = aboveIndex - this.bytesPerPixel;
                                const adjacent = this.pixels[adjacentIndex];

                                this.pixels.push(helpers.rectify(value + helpers.paethPredictor(left, above, adjacent)));
                            }
                        }
                        index += this.lineSize;
                        }
                        continue;
                }
            }

            this.unfiltered = true;

            return this;
        } catch (ex) {
            console.error(ex);
        }
    }

    addChunk(buffer) {
        this.parse(buffer);
    }

    parse(buffer) {
        this.parseChunk(buffer);

        this.compressed = this.png.IHDR.compressionMethod === 0;
        if (this.compressed) this.inflate();

        this.filtered = this.png.IHDR.filterMethod === 0;
        if (this.filtered) this.unfilter();

        return this;
    }

    static parse(png, buffer, size) {
        const idat = new IDAT(png);

        return idat.parse(buffer, size);
    }
}