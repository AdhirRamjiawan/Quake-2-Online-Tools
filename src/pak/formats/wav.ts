module Quake2Tools {

    export class WavRiffHeader {
        public chunkId: string = '';
        public chunkSize: number = 0;
        public format: string = '';
        constructor() {

        }
    }

    export class WavFmtSubChunk {
        public subChunkId: string = '';
        public subChunkSize: number = 0;
        public audioFormat: number = 0;
        public numChannels: number = 0;
        public sampleRate: number = 0;
        public byteRate: number =0;
        public blockAlign: number = 0;
        public bitsPerSample:number = 0;

        constructor() {}
    }

    export class WavDataSubChunk {
        public subChunk2Id: string = '';
        public subChunk2Size: number = 0;
        public data: Uint8Array;

        constructor() {
            this.data = new Uint8Array(0);
        }
    }


    export class Wav {
        public header: WavRiffHeader;
        public fmtSubChunk: WavFmtSubChunk;
        public dataSubChunk: WavDataSubChunk;

        constructor() {
            this.header = new WavRiffHeader();
            this.fmtSubChunk = new WavFmtSubChunk();
            this.dataSubChunk = new WavDataSubChunk();
        }
    }
}