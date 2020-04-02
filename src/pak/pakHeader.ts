import { Dto } from "../dto"

export class PakHeader implements Dto {
    constructor(
        public id: number,
        public lumpCollectionPosition: number,
        public lumpCollectionLength: number) { }

    public toJson(): object {
        return {
            id: this.id,
            lumpCollectionPosition: this.lumpCollectionPosition,
            lumpCollectionLength: this.lumpCollectionLength
        }
    }
}