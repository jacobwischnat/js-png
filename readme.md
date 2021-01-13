# PURE JS PNG DECODER

## Example

```javascript
const buffer = await fetch('tux.png').then(r => r.arrayBuffer());
const png = new PNG();
png.load(buffer);

const canvas = document.querySelector('canvas');
canvas.width = png.IHDR.width;
canvas.height = png.IHDR.height;
const context = canvas.getContext('2d');
context.putImageData(png.imageData(), 0, 0);
```