module Quake2Tools {
    export class PakLumpCollection implements Dto {
        public lumps:Array<PakLump>;

        constructor(){
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
}