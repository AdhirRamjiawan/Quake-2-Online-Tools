import { Dto } from "../dto"
import { PakLump } from "./pakLump"

export class PakLumpCollection implements Dto {
    public lumps: Array<PakLump>;

    constructor() {
        this.lumps = new Array<PakLump>();
    }

    public toJson(): object {
        var result = new Array<object>();

        this.lumps.forEach((lump: PakLump) => {
            result.push(lump.toJson())
        });

        return result;
    }
}