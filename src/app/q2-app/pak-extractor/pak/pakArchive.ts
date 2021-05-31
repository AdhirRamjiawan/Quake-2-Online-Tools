
import { Dto } from "../dto"
import { PakHeader } from "./pakHeader"
import { PakLumpCollection } from "./pakLumpCollection"
import { PakLump } from "./pakLump"

    export class PakArchive implements Dto {
        public header:PakHeader;
        public lumpCollection: PakLumpCollection;
        public colorMap: PakLump;
        
        constructor() {
            this.header = new PakHeader(0, 0, 0);
            this.lumpCollection = new PakLumpCollection();
            this.colorMap = new PakLump("", 0, 0);
        }

        public toJson(): object {
            return {
                header: this.header.toJson(),
                lumps: this.lumpCollection.toJson(),
                colorMap: this.colorMap.toJson()
            }
        }
    }