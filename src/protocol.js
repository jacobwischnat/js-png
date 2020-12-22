import * as helpers from './helpers';
import * as constants from './constants';

export const parseIHDR = data => {
    let index = 0;

    const width = data.readUInt32BE(index); index += 4;
    const height = data.readUInt32BE(index); index += 4;
    const bitDepth = data.readUInt8(index); index += 1;
    const colorType = data.readUInt8(index); index += 1;
    const compressionMethod = data.readUInt8(index); index += 1;
    const filterMethod = data.readUInt8(index); index += 1;
    const interlaceMethod = data.readUInt8(index); index += 1;
    const bytesPerPixel = constants.PIXEL_SIZE[colorType][bitDepth];

    return {
        width,
        height,
        bitDepth,
        bytesPerPixel,
        colorType: {
            code: colorType,
            info: constants.COLOR_TYPE[colorType]
        },
        compressionMethod,
        filterMethod,
        interlaceMethod
    };
}

export const parseWithFilter = (data, width, bytesPerPixel = 3) => {
    const lineSize = width * bytesPerPixel;
    const rows = [];
    const pixels = [];

    console.log(data);

    let mode = null;
    let index = 0;
    let ix = 0;
    for (index = 0; index < data.length; index += 1) {
        if (index % (lineSize + 1) === 0) {
            mode = data.readUInt8(index);
            console.log(constants.FILTERS[mode] || mode, index, ++ix);
            rows.push(constants.FILTERS[mode]);
        }

        switch (mode) {
            case constants.FILTERS.NONE:
                {
                const sourceLine = data.slice(index + 1, index + 1 + lineSize);
                const line = sourceLine.map((_, i) => sourceLine.readUInt8(i));
                pixels.push(...line);
                index += lineSize;
                }
                continue;

            case constants.FILTERS.SUB:
                {
                const line = [];
                for (let i = 0; i < lineSize; i += 1) {
                    const diffIndex = index + 1 + i;
                    const value = data.readUInt8(diffIndex);
                    const lastPixel = line.length - bytesPerPixel;
                    if (line.length < bytesPerPixel) line.push(value);
                    else {
                        const refPixel = line[lastPixel];
                        line.push(helpers.rectify(value + refPixel));
                    }
                }
                pixels.push(...line);
                index += lineSize;
                }
                continue;

            case constants.FILTERS.UP:
                {
                for (let i = 0; i < lineSize; i += 1) {
                    const valueIndex = index + 1 + i;
                    const prior = pixels[pixels.length - lineSize];
                    const value = data.readUInt8(valueIndex);
                    pixels.push(helpers.rectify(value + prior));
                }
                index += lineSize;
                }
                continue;

            case constants.FILTERS.AVG:
                {
                for (let i = 0; i < lineSize; i += 1) {
                    const value = data.readUInt8(index + 1 + i);
                    const above = (pixels.length < lineSize)
                        ? 0
                        : pixels[pixels.length - lineSize];
                    const left = i < bytesPerPixel
                        ? 0
                        : pixels[pixels.length - bytesPerPixel];
                    pixels.push(helpers.rectify(value + Math.floor((left + above) / 2)));
                }
                index += lineSize;
                }
                continue;

            case constants.FILTERS.PAETH:
                {
                for (let i = 0; i < lineSize; i += 1) {
                    const value = data.readUInt8(index + 1 + i);
                    const aboveIndex = pixels.length - lineSize;
                    const above = pixels[aboveIndex];
                    const leftIndex = pixels.length - bytesPerPixel;
                    const left = pixels[leftIndex];
                    const adjacentIndex = pixels.length - (lineSize + bytesPerPixel);
                    const adjacent = pixels[adjacentIndex];

                    pixels.push(helpers.rectify(value + helpers.paethPredictor(left, above, adjacent)));
                }
                index += lineSize;
                }
                continue;
        }
    }

    return {pixels, rows};
}