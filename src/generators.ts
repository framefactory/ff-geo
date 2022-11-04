/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

export function generateTorus(vb: Float32Array, i: number,
    radii: number[], tesselation: number[]): number
{
    const [ r0, r1 ] = radii;
    const [ tx, ty ] = tesselation;
    const dx = 1.0 / tx;
    const dy = 1.0 / ty;
    const pi2 = Math.PI * 2.0;

    for (let ix = 0; ix <= tx; ++ix) {
        const fx = ix * dx;
        const y0 = -Math.cos(fx * pi2);
        const x0 = -Math.sin(fx * pi2);
        for (let iy = 0; iy <= ty; ++iy) {
            const fy = iy * dy;
            const x1 = -Math.cos(fy * pi2);
            const y1 = Math.sin(fy * pi2);
            const xx1 = r0 + r1 * x1;
            vb[i++] = x0 * xx1;
            vb[i++] = r1 * y1;
            vb[i++] = y0 * xx1;
            vb[i++] = x0 * x1;
            vb[i++] = y1;
            vb[i++] = y0 * x1;
            vb[i++] = fx;
            vb[i++] = fy;
        }    
    }

    return i;
}

const _uIdx = [ 0, 0, 2, 2, 0, 0 ];
const _vIdx = [ 1, 1, 1, 1, 2, 2 ];
const _wIdx = [ 2, 2, 0, 0, 1, 1 ];
const _uSgn = [ 1,-1, 1,-1, 1,-1 ];
const _vSgn = [ 1, 1, 1, 1,-1,-1 ];
const _wSgn = [ 1,-1,-1, 1, 1,-1 ];
const _p = [ 0, 0, 0 ];
const _normal = [
    [  0,  0,  1 ], [ 0,  0, -1 ],
    [ -1,  0,  0 ], [ 1,  0,  0 ],
    [  0,  1,  0 ], [ 0, -1,  0 ],
];

export function generatePlaneVertices(vb: Float32Array, i: number,
    side: number, center: number[], size: number[], tesselation: number[]): number
{
    const uIdx = _uIdx[side];
    const vIdx = _vIdx[side];
    const wIdx = _wIdx[side];
    const uSgn = _uSgn[side];
    const vSgn = _vSgn[side];
    const wSgn = _wSgn[side];
    const normal = _normal[side];
    const su = size[uIdx];
    const sv = size[vIdx];
    const sw = size[wIdx];

    const u0 = center[uIdx] - su * 0.5 * uSgn;
    const v0 = center[vIdx] - sv * 0.5 * vSgn;
    const tu = tesselation[uIdx];
    const tv = tesselation[vIdx];
    const du = 1 / tu;
    const dv = 1 / tv;

    _p[wIdx] = center[wIdx] + sw * 0.5 * wSgn;;

    for (let iv = 0; iv <= tv; ++iv) {
        const fv = iv * dv;
        _p[vIdx] = v0 + fv * sv * vSgn;
        for (let iu = 0; iu <= tu; ++iu) {
            const fu = iu * du;
            _p[uIdx] = u0 + fu * su * uSgn;
            vb[i++] = _p[0];
            vb[i++] = _p[1];
            vb[i++] = _p[2];
            vb[i++] = normal[0];
            vb[i++] = normal[1];
            vb[i++] = normal[2];
            vb[i++] = fu;
            vb[i++] = 1.0 - fv;
        }
    }

    return i;
}

export function generatePlaneIndices(ib: Uint16Array | Uint32Array,
    i: number, vi: number, side: number, tesselation: number[]): number
{
    const uIdx = _uIdx[side];
    const vIdx = _vIdx[side];
    const tu = tesselation[uIdx];
    const tv = tesselation[vIdx];
    const nu = tu + 1;

    for (let iv = 0; iv < tv; ++iv) {
        const vv = vi + iv * nu;
        for (let iu = 0; iu < tu; ++iu) {
            const b = vv + iu; 
            ib[i++] = b;
            ib[i++] = b + nu + 1;
            ib[i++] = b + nu;
            ib[i++] = b;
            ib[i++] = b + 1;
            ib[i++] = b + nu + 1;
        }
    }

    return i;
}
