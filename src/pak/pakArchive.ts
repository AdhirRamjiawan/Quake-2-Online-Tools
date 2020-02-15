

module Quake2Tools{
    export class PakArchive implements Dto {
        public header:PakHeader;
        public lumpCollection: PakLumpCollection;
        
        constructor() {
            this.header = new PakHeader(0, 0, 0);
            this.lumpCollection = new PakLumpCollection();
        }

        public toJson(): object {
            return {
                header: this.header.toJson(),
                lumps: this.lumpCollection.toJson()
            }
        }
    }
}