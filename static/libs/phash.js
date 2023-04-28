//const supportedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'image/bmp']

class Hash {
    constructor(bits) {
        this.value = bits.join('')
    }

    toBinary() {
        return this.value
    }

    toHex() {
        return this.toInt().toString(16)
    }

    toInt() {
        return parseInt(this.value, 2)
    }
}

const phash = {
    async hash(input) {
        //let image = await this._readFileAsArrayBuffer(input)
        let image = await this._resizeImage(input)
        const data = this._convertToObject(image)

        return this._calculateHash(data)
    },

    _readFileAsArrayBuffer(input) {
        if (input.constructor !== File) throw new Error('Input must be type of File')
        /*
        if (!supportedTypes.includes(input.type))
            throw new Error(
                `Input file must be of one of the supported types: ${supportedTypes.join(', ')}`
            )
        */
        return new Promise(resolve => {
            const reader = new FileReader()
            reader.onload = () => {
                if (reader.result) {
                    resolve(reader.result)
                }
            }
            reader.readAsArrayBuffer(input)
        })
    },

    async _resizeImage(file) {
        return new Promise(resolve => {
            resizeFile(file,32).then(imageData => {
                let data = imageData.data;
                let buffer = new ArrayBuffer(data.length);
                let binary = new Uint8Array(buffer);
                for (let i=0; i<binary.length; i++) {
                    binary[i] = data[i];
                }
                resolve(binary);
            });
        });
    },

    _convertToObject(buffer) {
        const data = {}
        let x = 0;
        let y = 0;
        let c = 0;
        for(let i = 0; i < buffer.length; i += 4) {
            if(i > 0 && i%(4*32) == 0){
                y++;
                x = 0;
            }
            const red = buffer[i];
            const green = buffer[i + 1];
            const blue = buffer[i + 2];
            //const alpha = data[i + 3];
            let o = {
                r: red,
                g: green,
                b: blue,
            }
            data[x+","+y] = o;
            c++;
            x++;

        }
        return data
    },

    _calculateHash(data) {
        if (typeof data !== 'object') throw new Error('Data must be type of object')

        const matrix = []
        const row = []
        const rows = []
        const col = []
        const size = 32
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const color = data[`${x},${y}`]
                if (!color) throw new Error(`There is no data for a pixel at [${x}, ${y}]`)
                row[x] = parseInt(Math.floor(color.r * 0.299 + color.g * 0.587 + color.b * 0.114))
            }
            rows[y] = this._calculateDCT(row)
        }

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                col[y] = rows[y][x]
            }
            matrix[x] = this._calculateDCT(col)
        }

        // Extract the top 8x8 pixels.
        const pixels = []
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                pixels.push(matrix[y][x])
            }
        }

        // Calculate hash.
        const bits = []
        const compare = this._average(pixels)
        for (const pixel of pixels) {
            bits.push(pixel > compare ? 1 : 0)
        }

        return new Hash(bits)
    },

    async compare(file1, file2) {
        const hash1 = await this.hash(file1)
        const hash2 = await this.hash(file2)

        return this.distance(hash1.value, hash2.value)
    },

    distance(value1, value2) {
        let bits1 = value1
        let bits2 = value2
        const length = Math.max(bits1.length, bits2.length)

        // Add leading zeros so the bit strings are the same length.
        bits1 = bits1.padStart(length, '0')
        bits2 = bits2.padStart(length, '0')
        return Object.keys(this._arrayDiffAssoc(bits1.split(''), bits2.split(''))).length
    },



    _arrayDiffAssoc(arr1) {
        const retArr = {}
        const argl = arguments.length
        let k1 = ''
        let i = 1
        let k = ''
        let arr = {}
        for (k1 in arr1) {
            for (i = 1; i < argl; i++) {
                arr = arguments[i]
                for (k in arr) {
                    if (arr[k] === arr1[k1] && k === k1) {
                        retArr[k1] = arr1[k1]
                        //continue
                    }
                }
            }
        }
        return retArr
    },

    /**
     * Perform a 1 dimension Discrete Cosine Transformation.
     */
    _calculateDCT(matrix) {
        const transformed = []
        const size = matrix.length

        for (let i = 0; i < size; i++) {
            let sum = 0
            for (let j = 0; j < size; j++) {
                sum += matrix[j] * Math.cos((i * Math.PI * (j + 0.5)) / size)
            }
            sum *= Math.sqrt(2 / size)
            if (i === 0) {
                sum *= 1 / Math.sqrt(2)
            }
            transformed[i] = sum
        }

        return transformed
    },

    /**
     * Get the average of the pixel values.
     */
    _average(pixels) {
        // Calculate the average value from top 8x8 pixels, except for the first one.
        const n = pixels.length - 1

        return pixels.slice(1, n).reduce((a, b) => a + b, 0) / n
    },

}
