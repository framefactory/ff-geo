/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
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

/**
 * Base class for mesh geometry. Derived classes override {@link Geometry.onPrepare}
 * and {@link Geometry.onGenerate} to prepare and compute the mesh's vertices and
 * indices.
 */
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

    /**
     * Based on the last call to {@link Geometry.prepare}, returns the required
     * size of the vertex buffer in bytes.
     */
    get vertexBufferSize(): number {
        return this._vertexBufferSize;
    }

    /**
     * Based on the last call to {@link Geometry.prepare}, returns the required
     * size of the index buffer in bytes.
     */
     get indexBufferSize(): number {
        return this._indexBufferSize;
    }

    /**
     * Returns the type of index elements. The type depends on the number of
     * vertices to be addressed and is either UInt16 or UInt32.
     */
    get indexElementType(): EElementType {
        return this._indexElementType;
    }

    /**
     * Returns the total number of indices of all parts of the geometry.
     */
    get indexCount() {
        return this._indexCount;
    }

    /**
     * Returns the constructor for a typed array matching the index
     * element type.
     */
    get IndexArrayConstructor(): Uint16ArrayConstructor | Uint32ArrayConstructor {
        return this._indexElementType === EElementType.UInt16 ? Uint16Array : Uint32Array;
    }

    /**
     * Calculates the required size of the vertex and index buffers to hold the
     * mesh data and updates part information.
     * @param force 
     */
    prepare(force = true)
    {
        if (this.needsUpdate || force) {
            this.needsUpdate = false;
            this.onPrepare();
        }
    }

    /**
     * Fills the provided vertex and index buffers with vertex and index data.
     * The buffers must be properly allocated and sized. If no buffers are provided,
     * the internal buffers are used.
     * @param vertexBuffer 
     * @param indexBuffer 
     */
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

    /**
     * Override to calculate the required numbers of vertices and indices, and define
     * part meta data. Use {@link Geometry.setCount} and {@link Geometry.setPart}
     * to store the results.
     */
    protected abstract onPrepare(): void;

    /**
     * Override to fill the provided buffers with vertex and index data.
     */
    protected abstract onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer): void;

    protected setCount(vertexCount: number, indexCount: number)
    {
        this.layout.vertexCount = vertexCount;
        this._vertexBufferSize = this.layout.byteSize;
        this._indexBufferSize = indexCount * elementSizes[this._indexElementType];
        this._indexCount = indexCount;
    }
    
    /**
     * Called from the constructor of derived classes to define the individual
     * parts of this geometry.
     * @param names 
     */
    protected defineParts(...names: string[])
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