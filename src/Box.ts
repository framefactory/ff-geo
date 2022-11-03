/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as generators from "./generators.js"
import { Geometry } from "./Geometry.js";

////////////////////////////////////////////////////////////////////////////////

export interface IBoxParams {
    size: [ number, number, number ];
    center: [ number, number, number ];
    tesselation: [ number, number, number ];
}

export class Box extends Geometry
{
    static readonly defaultParams: IBoxParams = {
        size: [ 1, 1, 1 ],
        center: [ 0, 0, 0 ],
        tesselation: [ 1, 1, 1 ],
    };

    readonly params: IBoxParams;

    constructor(params?: Partial<IBoxParams>)
    {
        super();
        this.params = { ...Box.defaultParams, ...params };
        this.defineParts("all");
    }

    protected onPrepare()
    {
        const params = this.params;
        const [ tx, ty, tz ] = params.tesselation;

        const nx = tx + 1, ny = ty + 1, nz = tz + 1;
        const vc = 2 * (nx * ny + ny * nz + nx * nz);
        const ic = vc * 6;

        this.setPart(0, 0, ic);
        this.setCount(vc, ic);
    }

    protected onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer)
    {
        const vertices = new Float32Array(vertexBuffer);
        const indices = new this.IndexArrayConstructor(indexBuffer);

        const { size, center, tesselation } = this.params;

        let vi = 0, ii = 0;

        for (let s = 0; s < 6; ++s) {
            ii = generators.generatePlaneIndices(indices, ii, vi/8, s,
                tesselation);
            vi = generators.generatePlaneVertices(vertices, vi, s,
                center, size, tesselation);
        }
    }
}

