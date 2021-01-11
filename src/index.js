import * as chunks from './chunks';

import * as helpers from './helpers';
import * as protocol from './protocol';
import * as constants from './constants';

import {Buffer} from 'buffer/';

export default class PNG {
    constructor(opts = {}) {
        this.opts = opts;

        console.dir(this);
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
    }

    imageData() {
        let {pixels} = this.IDAT;
        if (this.IHDR.bytesPerPixel === 3) {
            pixels = pixels.reduce((a, v, i, o) => {
                if (i % 3 === 0) {
                    a.push(...o.slice(i, i + 3), 0xFF);
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

import pngBuffer from './me.png';

const png = new PNG();
png.load(pngBuffer);

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.style.imageRendering = 'pixelated';
canvas.onclick = ({clientY}) => {
    console.log(clientY);
    console.log(png.IDAT.rows.slice(clientY));
}

canvas.width = png.IHDR.width;
canvas.height = png.IHDR.height;

context.putImageData(png.imageData(), 0, 0);

/*

const buffer = Buffer.from(pngImage);

let index = 0;




console.log('Got valid PNG!');


// Concat
const buff = Buffer.concat(png.IDAT.nodes
    .map(node => Buffer.from(node.data)));

// Decompress
const data = Buffer.from(pako.inflate(helpers.bufferToArrayBuffer(buff)));
const {width, height, bytesPerPixel} = png.IHDR.nodes[0].info;

console.log({width, height, bytesPerPixel});

const {pixels, rows: rowTypes} = protocol.parseWithFilter(
    data,
    width,
    bytesPerPixel
);

const filtered = ['SUB', 'PAETH', 'AVG', 'UP', 'NONE'];
// const filtered = ['SUB'];
// const filtered = ['PAETH'];
const rows = [];

for (let i = 0; i < pixels.length; i += width * bytesPerPixel) {
    rows.push({
        type: rowTypes[rows.length],
        data: pixels.slice(i, i + (width * bytesPerPixel))
    });
}
console.log(rowTypes);

// .reduce((a, v) => {
//     if (!a.includes(v)) a.push(v);

//     return a;
// }, []));

const dat = rows.reduce((a, {type, data}) => {
    if (filtered.includes(type)) {
        a.push(...data);
    } else {
        a.push(...Array.from({length: width * bytesPerPixel}).fill(0));
    }

    return a;
}, []);

// dat.push(...Array.from({length: (width * height * bytesPerPixel) - dat.length}))
let datAlpha = dat;
if (png.IHDR.nodes[0].info.bytesPerPixel === 3) {
    datAlpha = helpers.insertAlphaChannel(dat);
}

const imageData = new ImageData(
    new Uint8ClampedArray(datAlpha),
    width,
    height,
);


*/