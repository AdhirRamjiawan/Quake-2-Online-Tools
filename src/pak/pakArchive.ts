

module Quake2Tools{
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
}