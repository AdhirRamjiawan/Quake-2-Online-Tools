import { Dto } from "../dto"

export class PakLump implements Dto {
    constructor(
        public name: string,
        public position: number,
        public length: number) { }

    public toJson(): object {
        return {
            name: this.name,
            position: this.position,
            length: this.length
        }
    }
}