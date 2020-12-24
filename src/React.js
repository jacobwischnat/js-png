import PNG from './';
import React, { useEffect, useState, useRef } from 'react';

const Png = ({src, style, options}) => {
    const refCanvas = useRef();
    const [data, setData] = useState(null);

    const fetchImageData = async () => setData(
        await fetch(src).then(response => response.arrayBuffer()));

    useEffect(() => { fetchImageData(); }, [src]);
    useEffect(() => {
        if (data && refCanvas.current) {
            const context = refCanvas.current.getContext('2d');
            const png = new PNG(options);
            png.load(data);
            context.putImageData(png.imageData(), png.IHDR.width, png.IHDR.height);
        }
    }, [data, refCanvas]);

    return <canvas ref={refCanvas} style={style}></canvas>;
};

export default Png;