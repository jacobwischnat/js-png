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
        return this.png.IHDR.width * (this.hasPalette ? 1 : this.png.IHDR.bytesPerPixel);
    }

    get bytesPerPixel() {
        return this.png.IHDR.bytesPerPixel;
    }

    get hasPalette() {
        return this.png.IHDR.colorType.type === 'PALETTE';
    }

    inflate() {
        try {
            const data = Buffer.concat(this.datas.map(buffer => Buffer.from(buffer)));
            const inflated = pako.inflate(helpers.bufferToArrayBuffer(data));
            if (inflated) {
                this.data = Buffer.from(inflated);
                this.decompressed = true;
            }
        } catch (ex) {

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
                        const line = Array.from(sourceLine).flatMap(idx => {
                            if (this.hasPalette) {
                                const {bytes} = this.png.PLTE.palette[idx];

                                const data = [];
                                for (let b = 0; b < bytes.length; b += 1) {
                                    data.push(bytes.readUInt8(b));
                                }

                                if (this.png?.tRNS?.palette) {
                                    if (isNaN(this.png.tRNS.palette[idx])) data.push(0xFF);
                                    else data.push(this.png.tRNS.palette[idx]);
                                }

                                return data;
                            }

                            return [idx];
                        });
                        this.pixels.push(...line);
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.SUB:
                        {
                        const data = Array.from(this.data
                            .slice(index + 1, index + 1 + (this.png.IHDR.width * this.png.IHDR.bytesPerPixel)));

                        const line = data
                            .reduce((a, v, i) => {
                                if (i < this.png.IHDR.bytesPerPixel) {
                                    a.push(v);
                                } else {
                                    const val = v + a[i - this.png.IHDR.bytesPerPixel];
                                    a.push(val & 0xFF);
                                }

                                return a;
                            }, []);

                        this.pixels.push(...line);
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.UP:
                        {
                        for (let i = 0; i < this.lineSize; i += 1) {
                            const valueIndex = index + 1 + i;
                            const prior = this.pixels[this.pixels.length - this.lineSize];
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

                            let left = 0;
                            if (i >= this.png.IHDR.bytesPerPixel) {
                                const leftIndex = this.pixels.length - (this.bytesPerPixel);
                                left = this.pixels[leftIndex];
                            }

                            this.pixels.push((value + ((above + left) / 2)) & 0xFF);
                        }
                        index += this.lineSize;
                        }
                        continue;

                    case constants.FILTERS.PAETH:
                        {
                        const line = [];

                        for (let i = 0; i < this.lineSize; i += 1) {
                            const offset = index + 1 + i;
                            const value = this.data.readUInt8(offset);

                            if (i < this.bytesPerPixel) {
                                const aboveIndex = this.pixels.length - this.lineSize;
                                const above = this.pixels[aboveIndex];
                                this.pixels.push(helpers.rectify(value + above));
                                line.push(helpers.rectify(value + above));
                            } else {
                                // a = left
                                // b = above
                                // c = adjacent
                                const aboveIndex = this.pixels.length - this.lineSize;
                                const above = this.pixels[aboveIndex];
                                const leftIndex = this.pixels.length - (this.bytesPerPixel);
                                const left = this.pixels[leftIndex];
                                const adjacentIndex = aboveIndex - (this.bytesPerPixel);
                                const adjacent = this.pixels[adjacentIndex];

                                const paethResult = helpers.paethPredictor(left, above, adjacent, value);
                                const rectifyResult = helpers.rectify(paethResult);

                                this.pixels.push(rectifyResult);
                                line.push(rectifyResult);
                            }
                        }
                        index += this.lineSize;
                        }
                        continue;

                    default:
                        throw new Error(`Unknown filter ${mode} @ ${index}`);
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
        this.filtered = this.png.IHDR.filterMethod === 0;

        return this;
    }

    static parse(png, buffer, size) {
        const idat = new IDAT(png);

        return idat.parse(buffer, size);
    }
}