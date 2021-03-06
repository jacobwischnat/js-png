module.exports.crc32 = value => {
    let crc = value ^ 0xFFFFFFFF;
    crc = (crc ^ (value >> 16) & 0xFF) ^ (crc >> 8);
    crc = (crc ^ (value >> 8) & 0xFF) ^ (crc >> 8);

    return ((crc ^ value) & 0xFF) ^ (crc >> 8);
}

module.exports.bufferToArrayBuffer = buffer => {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; i += 1) {
        uint8Array[i] = buffer.readUInt8(i);
    }

    return arrayBuffer;
}

module.exports.adam7 = (Buffer, buffer, width, height, pixelSize) => {
    const expanded = Buffer.alloc(width * height * pixelSize);
    for (let i = 0; i < 7; i += 1) {
        switch (i) {
            case 0: // 1/2;
                let x = 0, y = 0;
                const pixel = buffer.readUInt8(i);
                expanded.writeUInt8(pixel, x * y);
                x = Math.ceil(width / 2);
                expanded.writeUInt8(pixel, x * y);
                y = Math.ceil(height / 2);
                expanded.writeUInt8(pixel, x * y);
                x = 0;
                expanded.writeUInt8(pixel, x * y);
                break;
        }
    }

    return expanded;
}

module.exports.insertAlphaChannel = (data, alpha = 255) => {
    return data.reduce((a, _, i, o) => {
        if (i % 3 === 0) {
            a.push(...o.slice(i, i + 3), alpha);
        }

        return a;
    }, []);
}

module.exports.rectify = value => {
    return value & 0xFF;
}

module.exports.paethPredictor = (a, b, c, curValue = 0) => {
    let p, pa, pb, pc;
    p = b - c;
    pc = a - c;

    pa = Math.abs(p);
    pb = Math.abs(pc);
    pc = Math.abs(p + pc);

    let value = a;

    if (pb < pa) {
        pa = pb;
        value = b;
    }
    if (pc < pa) value = c;

    return value + curValue;
}