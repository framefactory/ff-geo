/**
 * FF Typescript Foundation Library
 * Copyright 2021 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Geometry from "./Geometry";

////////////////////////////////////////////////////////////////////////////////

export interface IPlaneParams {
    size: [ number, number ];
    tesselation: [ number, number ];
    back: boolean;
}

export default class Plane extends Geometry
{
    static readonly defaultParams: IPlaneParams = {
        size: [ 1, 1 ],
        tesselation: [ 1, 1 ],
        back: false,
    };

    readonly params: IPlaneParams;

    constructor(params?: IPlaneParams)
    {
        super();

        this.params = { ...Plane.defaultParams, ...params };
        this.layout.addP3N3T2();
        this.addParts("front", "back");

        this.layout.dump();
    }

    prepare()
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

    generate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer)
    {
        const params = this.params;
        const tess = params.tesselation;
        const size = params.size;

        const tx = tess[0];
        const ty = tess[1];
        const nx = tx + 1;

        const sx = size[0];
        const sy = size[1];
        const dx = 1 / tx;
        const dy = 1 / ty;

        let i = 0;
        for (let iy = 0; iy <= ty; ++iy) {
            const v = iy * dy;
            const y = v * sy;
            for (let ix = 0; ix <= tx; ++ix) {
                const u = ix * dx;
                vertexBuffer[i++] = u * sx;
                vertexBuffer[i++] = y;
                vertexBuffer[i++] = 0;
                vertexBuffer[i++] = 0;
                vertexBuffer[i++] = 0;
                vertexBuffer[i++] = 1;
                vertexBuffer[i++] = u;
                vertexBuffer[i++] = v;
            }    
        }

        i = 0;
        for (let iy = 0; iy < ty; ++iy) {
            const yy = iy * nx;
            for (let ix = 0; ix < tx; ++ix) {
                const x = yy + ix; 
                indexBuffer[i++] = x;
                indexBuffer[i++] = x + nx;
                indexBuffer[i++] = x + nx + 1;
                indexBuffer[i++] = x;
                indexBuffer[i++] = x + nx + 1;
                indexBuffer[i++] = x + 1;
            }
        }
    }
}