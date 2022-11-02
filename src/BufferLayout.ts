/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

const _roundToNext = (v, m) => v + m - ((v + m - 1) % m) - 1;

export enum EAttributeSemantic {
    Position = "position",
    Normal = "normal",
    TexCoord = "texCoord",
    Color = "color",
    Tangent = "tangent",
    Bitangent = "bitangent",
}

export enum EElementType {
    Int8,
    UInt8,
    Norm8,
    UNorm8,
    Int16,
    UInt16,
    Norm16,
    UNorm16,
    Int32,
    UInt32,
    Float16,
    Float32,
}

export const elementSizes = {
    [EElementType.Int8]: 1,
    [EElementType.UInt8]: 1,
    [EElementType.Norm8]: 1,
    [EElementType.UNorm8]: 1,
    [EElementType.Int16]: 2,
    [EElementType.UInt16]: 2,
    [EElementType.Norm16]: 2,
    [EElementType.UNorm16]: 2,
    [EElementType.Int32]: 4,
    [EElementType.UInt32]: 4,
    [EElementType.Float16]: 2,
    [EElementType.Float32]: 4,
}

export interface IBufferAttribute {
    name: string;
    type: EElementType;
    elementCount: number;
    elementSize: number;
    byteSize: number;
    offset: number;
    stride: number;
    interleaved: boolean;
}

export class BufferLayout
{
    static P2T2 = new BufferLayout().addP2T2();
    static P3N3T2 = new BufferLayout().addP3N3T2();

    private _attribList: IBufferAttribute[] = [];
    private _attribDict: Record<string, IBufferAttribute> = {};

    private _byteSize = 0;
    private _vertexCount = 0;

    /**
     * The number of vertices in the buffer. This is required to calculate the
     * stride for buffers with multiple non-interleaved attributes.
     */
     set vertexCount(value: number) {
        this._vertexCount = value;
        this.updateLayout();
     }
     get vertexCount() {
         return this._vertexCount;
     }

     get attributes(): IBufferAttribute[] {
        return this._attribList;
     }

    /**
     * The total size of the buffer in bytes.
     */
    get byteSize() {
        return this._byteSize;
    }

    /**
     * Adds an attribute to the layout.
     * @param name The attribute's name.
     * @param type The individual type of an attribute's element.
     * @param elementCount The number of elements of this attribute.
     * @param interleaved If true, the attribute is interleaved with the previous one(s).
     */
    addAttribute(
        name: string,
        type: EElementType,
        elementCount: number,
        interleaved = true,
        skipUpdate = false
    ): this {

        const attrib: IBufferAttribute = {
            name,
            type,
            elementCount,
            elementSize: elementSizes[type],
            byteSize: elementCount * elementSizes[type],
            interleaved,
            stride: 0,
            offset: 0,
        };

        this._attribDict[name] = attrib;
        this._attribList.push(attrib);

        if (!skipUpdate) {
            this.updateLayout();
        }

        return this;
    }

    addP2T2(): this
    {
        this.addAttribute(EAttributeSemantic.Position, EElementType.Float32, 2, true, true);
        this.addAttribute(EAttributeSemantic.TexCoord, EElementType.Float32, 2);
        return this;
    }

    addP3N3T2(): this
    {
        this.addAttribute(EAttributeSemantic.Position, EElementType.Float32, 3, true, true);
        this.addAttribute(EAttributeSemantic.Normal, EElementType.Float32, 3, true, true);
        this.addAttribute(EAttributeSemantic.TexCoord, EElementType.Float32, 2);
        return this;
    }

    /**
     * Removes all attributes from this layout.
     */
    clear(): this
    {
        this._attribDict = {};
        this._attribList = [];
        return this;
    }

    /**
     * Returns a text description of this layout.
     */
    toString(): string
    {
        return this._attribList.reduce((text: string, a: IBufferAttribute) => {
            return `${text}\n${a.interleaved ? '  interleaved ' : '  '}attribute '${a.name}', offset = ${a.offset}, stride = ${a.stride}, ${a.elementCount} x ${EElementType[a.type]}`;
        }, `[BufferLayout] item count = ${this._vertexCount}, size (bytes) = ${this._byteSize}`);
    }

    dump(): void
    {
        console.log(this.toString());
    }

    protected updateLayout()
    {
        const attribs = this._attribList;
        const count = this._vertexCount;

        let offset = 0;
        let stride = 0;

        for (let i = 0; i < attribs.length; ++i) {
            const attr = attribs[i];
            offset = attr.offset = _roundToNext(offset + stride * count, attr.elementSize);
            stride = attr.byteSize;

            let j = i;
            let maxSize = attr.elementSize;
            while (++j < attribs.length && attribs[j].interleaved) {
                maxSize = Math.max(maxSize, attribs[j].elementSize);
            }

            for (let k = i + 1; k < j; ++k) {
                const attr = attribs[k];
                attr.offset = _roundToNext(offset + stride, attr.elementSize);
                stride += attr.byteSize;
            }

            stride = _roundToNext(stride, maxSize);

            for (let k = i; k < j; ++k) {
                attribs[k].stride = stride;
            }

            i = j - 1;
        }

        this._byteSize = offset + stride * count;
    }
}