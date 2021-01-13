module.exports.SIGNATURE_SIZE = 8;
module.exports.SIGNATURE_PNG = '89504e470d0a1a0a';
module.exports.PROPERTY_BIT_MASK = 0b00100000
module.exports.COLOR_TYPE = {
    [0]: {
        code: 0,
        type: 'GREYSCALE',
        bitDepths: [1, 2, 4, 8, 16]
    },
    [2]: {
        code: 2,
        type: 'RGB',
        bitDepths: [8, 16]
    },
    [3]: {
        code: 3,
        type: 'PALETTE',
        bitDepths: [1, 2, 4, 8]
    },
    [4]: {
        code: 4,
        type: 'GREYSCALE+ALPHA',
        bitDepths: [8, 16]
    },
    [6]: {
        code: 6,
        type: 'RGBA',
        bitDepths: [8, 16]
    },
};
module.exports.PIXEL_SIZE = {
    [0]: {
        [1]: 0b1,
        [2]: 0b11,
        [4]: 0b1111,
        [8]: 1,
        [16]: 2
    },
    [2]: {
        [8]: 3,
        [16]: 6,
    },
    [6]: {
        [8]: 4,
        [16]: 8
    },
    GREYSCALE: {
        [1]: 0b1,
        [2]: 0b11,
        [4]: 0b1111,
        [8]: 1,
        [16]: 2
    },
    RGB: {
        [8]: 3,
        [16]: 6,
    },
    RGBA: {
        [8]: 4,
        [16]: 8
    },
    PALETTE: {
        [8]: 3,
    }
};

module.exports.FILTERS = {
    NONE: 0,
    SUB: 1,
    UP: 2,
    AVG: 3,
    PAETH: 4,
    [0]: 'NONE',
    [1]: 'SUB',
    [2]: 'UP',
    [3]: 'AVG',
    [4]: 'PAETH'
};

module.exports.RENDERING_INTENT = {
    0: 'PERCEPTUAL',
    1: 'RELATIVE_COLORIMETRIC',
    2: 'SATURATION',
    3: 'ABSOLUTE_COLORIMETRIC',
    PERCEPTUAL: 0,
    RELATIVE_COLORIMETRIC: 1,
    SATURATION: 2,
    ABSOLUTE_COLORIMETRIC: 3,
}