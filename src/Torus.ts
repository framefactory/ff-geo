/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as generators from "./generators.js"
import { Geometry } from "./Geometry.js";

////////////////////////////////////////////////////////////////////////////////

export interface ITorusParams {
    radius: [ number, number ],
    tesselation: [ number, number ]
}

export class Torus extends Geometry
{
    static readonly defaultParams: ITorusParams = {
        radius: [ 1.5, 0.5 ],
        tesselation: [ 128, 64 ]
    };

    readonly params: ITorusParams;

    constructor(params?: Partial<ITorusParams>)
    {
        super();
        this.params = { ...Torus.defaultParams, ...params };
        this.defineParts("all");
    }

    protected onPrepare()
    {
        const params = this.params;
        const [ tx, ty ] = params.tesselation;

        const vc = (tx + 1) * (ty + 1);
        const ic = tx * ty * 6;

        this.setPart(0, 0, ic);
        this.setCount(vc, ic);
    }

    protected onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer)
    {
        const vertices = new Float32Array(vertexBuffer);
        const indices = new this.IndexArrayConstructor(indexBuffer);

        const { radius, tesselation } = this.params;

        generators.generatePlaneIndices(indices, 0, 0, 0, tesselation);
        generators.generateTorus(vertices, 0, radius, tesselation);
    }
}