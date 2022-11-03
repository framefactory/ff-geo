/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as generators from "./generators.js"
import { Geometry } from "./Geometry.js";

////////////////////////////////////////////////////////////////////////////////

export interface IPlaneParams {
    size: [ number, number ];
    tesselation: [ number, number ];
    front: boolean;
    back: boolean;
}

export class Plane extends Geometry
{
    static readonly defaultParams: IPlaneParams = {
        size: [ 1, 1 ],
        tesselation: [ 1, 1 ],
        front: true,
        back: true,
    };

    readonly params: IPlaneParams;

    constructor(params?: Partial<IPlaneParams>)
    {
        super();
        this.params = { ...Plane.defaultParams, ...params };
        this.defineParts("front", "back");
    }

    onPrepare()
    {
        const params = this.params;
        const [ tx, ty ] = params.tesselation;

        const vcFace = (tx + 1) * (ty + 1);
        const icFace = tx * ty * 6;
        let vcTotal = 0;
        let icTotal = 0;

        if (params.front) {
            this.setPart(0, icTotal, icFace);
            vcTotal += vcFace;
            icTotal += icFace;
        }

        if (params.back) {
            this.setPart(1, icTotal, icFace);
            vcTotal += vcFace;
            icTotal += icFace;
        }

        this.setCount(vcTotal, icTotal);
    }

    onGenerate(vertexBuffer: ArrayBuffer, indexBuffer: ArrayBuffer)
    {
        const vertices = new Float32Array(vertexBuffer);
        const indices = new this.IndexArrayConstructor(indexBuffer);

        const params = this.params;
        const center = [ 0, 0, 0 ];
        const size = [ params.size[0], params.size[1], 0 ];
        const tess = [ params.tesselation[0], params.tesselation[1], 0 ];

        let vi = 0, ii = 0;

        if (params.front) {
            ii = generators.generatePlaneIndices(indices, ii, vi/8, 0,
                tess);
            vi = generators.generatePlaneVertices(vertices, vi, 0,
                center, size, tess);
        }

        if (params.back) {
            ii = generators.generatePlaneIndices(indices, ii, vi/8, 1,
                tess);
            vi = generators.generatePlaneVertices(vertices, vi, 1,
                center, size, tess);
        }
    }
}