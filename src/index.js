import * as helpers from './helpers';
import * as protocol from './protocol';
import * as constants from './constants';

import pako from 'pako';
import {Buffer} from 'buffer/';
// import pngImage from './img.png';
import pngImage from './me.png';
// import pngImage from './share_twitter.png';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const buffer = Buffer.from(pngImage);

let index = 0;
const signature = buffer.slice(0, constants.SIGNATURE_SIZE); index += constants.SIGNATURE_SIZE;

if (signature.toString('hex') !== constants.SIGNATURE_PNG) {
    console.error('Invalid PNG file.');
    process.exit(1);
}

console.log('Got valid PNG!');

const png = {};

while (index < buffer.length) {
    const size = buffer.readUInt32BE(index); index += 4;

    const type = buffer.slice(index, index + 4).toString();
    console.log('Type', type, `${size} bytes`);

    const isAncillary = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 1;
    console.log('\tAncillary', isAncillary ? 'Yes' : 'No');

    const isPrivate = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 2;
    console.log('\tPrivate', isPrivate ? 'Yes' : 'No');

    const isSafeToCopy = (buffer.readUInt8(index) & constants.PROPERTY_BIT_MASK) > 0; index += 1;
    console.log('\tSafe To Copy', isSafeToCopy ? 'Yes' : 'No')

    let data = buffer.slice(index, index + size); index += size;
    console.log('\tData', data.toString('hex'));

    const crc = buffer.slice(index, index + 4); index += 4;
    console.log('\tCRC', crc.readUInt32LE(0).toString(2));

    let info = null;
    let original = null;
    let compressed = null;
    switch (type) {
        case 'IHDR':
            info = protocol.parseIHDR(data);
            break;

        case 'IDAT':
            break;

        case 'iCCP':
            info = {
                name: data.slice(0, data.indexOf(0x00)).toString(),
                // data: pako.inflate(data.slice(data.indexOf(0x00) + 2))
            };
            break;
    }
    console.log('\tInfo', info);

    png[type] = png[type] || {type, nodes: [], data: null};

    png[type].nodes.push({
        type,
        size,
        isAncillary,
        isPrivate,
        isSafeToCopy,
        data,
        original,
        compressed,
        info,
        crc
    });
}
console.log(png);

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

const filtered = ['SUB', 'PAETH', 'UP', 'AVG', 'NONE'];
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
        a.push(...Array.from({length: width * bytesPerPixel}).fill(255));
    }

    return a;
}, []);

// dat.push(...Array.from({length: (width * height * bytesPerPixel) - dat.length}))
let datAlpha = dat;
if (png.IHDR.nodes[0].info.bytesPerPixel === 3) {
    datAlpha = helpers.insertAlphaChannel(dat);
}
canvas.width = width;
canvas.height = height;
// canvas.style.width = `${png.IHDR.nodes[0].info.width}px`;
// canvas.style.height = `${png.IHDR.nodes[0].info.height}px`;

const imageData = new ImageData(
    new Uint8ClampedArray(datAlpha),
    width,
    height,
);

context.putImageData(imageData, 0, 0);

// setInterval(() => {}, 1000000);