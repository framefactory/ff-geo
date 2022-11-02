/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { BufferLayout, EElementType, elementSizes } from "./BufferLayout.js";

////////////////////////////////////////////////////////////////////////////////

export enum ETopology {
    PointList,
    LineList,
    LineStrip,
    TriangleList,
    TriangleStrip,
}

export interface IGeometryPart {
    name: string;
    offset: number;
    count: number;
}

export abstract class Geometry
{
    parts: IGeometryPart[];
    layout: BufferLayout;
    topology: ETopology;

    vertexBuffer: ArrayBuffer = null;
    indexBuffer: ArrayBuffer = null;

    needsUpdate = false;

    private _vertexBufferSize = 0;
    private _indexBufferSize = 0;
    private _indexElementType: EElementType = EElementType.UInt32;
    private _indexCount = 0;

    constructor(layout = BufferLayout.P3N3T2, topology = ETopology.TriangleList)
    {
        this.parts = [];
        this.layout = layout;
        this.topology = topology;
    }

    get vertexBufferSize(): number {
        return this._vertexBufferSize;
    }

    get indexBufferSize(): number {
        return this._indexBufferSize;
    }

    get indexElementType(): EElementType {
        return this._indexElementType;
    }

    get indexCount() {
        return this._indexCount;
    }

    get IndexArrayConstructor(): Uint16ArrayConstructor | Uint32ArrayConstructor {
        return this._indexElementType === EElementType.UInt16 ? Uint16Array : Uint32Array;
    }

    update(force = true)
    {
        if (this.needsUpdate || force) {
            this.needsUpdate = false;
            this.onPrepare();
        }
    }

    generate(vertexBuffer?: ArrayBuffer, indexBuffer?: ArrayBuffer)
    {
        if (vertexBuffer) {
            this.vertexBuffer = null;
        }
        else if (!this.vertexBuffer || this.vertexBuffer.byteLength !== this._vertexBufferSize) {
            vertexBuffer = this.vertexBuffer = new ArrayBuffer(this._vertexBufferSize);
        }

        if (indexBuffer) {
            this.indexBuffer = null;
        }
        else if (!this.indexBuffer || this.indexBuffer.byteLength !== this._indexBufferSize) {
            indexBuffer = this.indexBuffer = new ArrayBuffer(this._indexBufferSize);
        }

        this.onGenerate(vertexBuffer, indexBuffer);
    }

    protected abstract onPrepare(): void;

    protected abstract onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer): void;

    protected setCount(vertexCount: number, indexCount: number)
    {
        this.layout.vertexCount = vertexCount;
        this._vertexBufferSize = this.layout.byteSize;
        this._indexBufferSize = indexCount * elementSizes[this._indexElementType];
        this._indexCount = indexCount;
    }
    
    protected addParts(...names: string[])
    {
        this.parts = names.map(name => ({
            name,
            offset: 0, 
            count: 0, 
        }));
    }

    protected setPart(index: number, offset: number, count: number)
    {
        const part = this.parts[index];
        part.offset = offset;
        part.count = count;
    }
}