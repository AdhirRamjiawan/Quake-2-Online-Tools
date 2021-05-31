

import { Debugging } from "../../utils/debugging"


export class PcxHeader {
    public headerField: number = 0;
    public version: number = 0;
    public encoding: number = 0;
    public bitDepth: number = 0;
    public minX: number = 0;
    public minY: number = 0;
    public maxX: number = 0;
    public maxY: number = 0;
    public horizontalResolution: number = 0;
    public verticalResolution: number = 0;
    public egaPalette: Uint8Array = new Uint8Array(0);
    public numberOfColourPlanes: number = 0;
    public colorPlaneByteSize: number = 0;
    public colorPaletteMode: number = 0;
    public mainColorPallete: Uint8Array = new Uint8Array(0);

    constructor() {
    }
}


export class Pcx {
    public header: PcxHeader;
    public data: Uint8Array;

    constructor() {
        this.header = new PcxHeader();
        this.data = new Uint8Array(0);
    }
}