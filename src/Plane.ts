/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Geometry } from "./Geometry.js";

////////////////////////////////////////////////////////////////////////////////

export interface IPlaneParams {
    size: [ number, number ];
    tesselation: [ number, number ];
    back: boolean;
}

export class Plane extends Geometry
{
    static readonly defaultParams: IPlaneParams = {
        size: [ 1, 1 ],
        tesselation: [ 1, 1 ],
        back: false,
    };

    readonly params: IPlaneParams;

    constructor(params?: Partial<IPlaneParams>)
    {
        super();
        this.params = { ...Plane.defaultParams, ...params };
        this.addParts("front", "back");
    }

    onPrepare()
    {
        const params = this.params;
        const tx = params.tesselation[0];
        const ty = params.tesselation[1];

        const vertexCount = (tx + 1) * (ty + 1);
        const indexCount = tx * ty * 6;

        this.setPart(0, 0, indexCount);

        if (params.back) {
            this.setCount(vertexCount * 2, indexCount * 2);
            this.setPart(1, indexCount, indexCount);
        }
        else {
            this.setCount(vertexCount, indexCount);
        }
    }

    onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer)
    {
        const vertices = new Float32Array(vertexBuffer);
        const indices = new this.IndexArrayConstructor(indexBuffer);

        const params = this.params;
        const tess = params.tesselation;
        const size = params.size;

        const tx = tess[0];
        const ty = tess[1];
        const nx = tx + 1;

        const sx = size[0];
        const sy = size[1];
        const ax = -0.5 * sx;
        const ay = -0.5 * sy
        const dx = 1 / tx;
        const dy = 1 / ty;

        let i = 0;
        for (let iy = 0; iy <= ty; ++iy) {
            const fy = iy * dy;
            const y = ay + fy * sy;
            for (let ix = 0; ix <= tx; ++ix) {
                const fx = ix * dx;
                vertices[i++] = ax + fx * sx;
                vertices[i++] = y;
                vertices[i++] = 0;
                vertices[i++] = 0;
                vertices[i++] = 0;
                vertices[i++] = 1;
                vertices[i++] = fx;
                vertices[i++] = 1.0 - fy;
            }    
        }

        i = 0;
        for (let iy = 0; iy < ty; ++iy) {
            const yy = iy * nx;
            for (let ix = 0; ix < tx; ++ix) {
                const x = yy + ix; 
                indices[i++] = x;
                indices[i++] = x + nx;
                indices[i++] = x + nx + 1;
                indices[i++] = x;
                indices[i++] = x + nx + 1;
                indices[i++] = x + 1;
            }
        }
    }
}