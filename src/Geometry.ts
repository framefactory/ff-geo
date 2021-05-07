/**
 * FF Typescript/React Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import BufferLayout from "./BufferLayout";

////////////////////////////////////////////////////////////////////////////////

export enum ETopology
{
    PointList = "point-list",
    LineList = "line-list",
    LineStrip = "line-strip",
    TriangleList = "triangle-list",
    TriangleStrip = "triangle-strip",
}

export interface IGeometryPart
{
    name: string;
    offset: number;
    count: number;
    topology: ETopology;
}

export default abstract class Geometry
{
    readonly parts: IGeometryPart[] = [];
    readonly layout = new BufferLayout();

    vertexBuffer: ArrayBuffer = null;
    indexBuffer: ArrayBuffer = null;

    needsUpdate = false;

    private _vertexBufferSize = 0;
    private _indexBufferSize = 0;


    get vertexBufferSize(): number {
        return this._vertexBufferSize;
    }

    get indexBufferSize(): number {
        return this._indexBufferSize;
    }

    update()
    {
        if (this.needsUpdate) {
            this.needsUpdate = false;
            this.prepare();
        }
    }

    protected abstract prepare();

    generateCached()
    {
        if (!this.vertexBuffer || this.vertexBuffer.byteLength !== this._vertexBufferSize) {
            this.vertexBuffer = new ArrayBuffer(this._vertexBufferSize);
        }
        if (!this.indexBuffer || this.indexBuffer.byteLength !== this._indexBufferSize) {
            this.indexBuffer = new ArrayBuffer(this._indexBufferSize);
        }

        this.generate(this.vertexBuffer, this.indexBuffer);
    }

    abstract generate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer);

    protected setCount(vertexCount: number, indexCount: number)
    {
        this.layout.vertexCount = vertexCount;
        this._vertexBufferSize = this.layout.byteSize;
        this._indexBufferSize = BufferLayout.indexBufferSize(indexCount);

    }
    
    protected addParts(...names: string[])
    {
        names.forEach(name => this.addPart(name));
    }

    protected addPart(name: string, offset = 0, count = -1, topology: ETopology = ETopology.TriangleList)
    {
        this.parts.push({
            name,
            offset,
            count,
            topology,
        });
    }

    protected setPart(index: number, offset: number, count: number)
    {
        const part = this.parts[index];
        part.offset = offset;
        part.count = count;
    }
}