module Quake2Tools {
    export class WavExtractor {
        private seekIndex: number = 0;

        public dataView: DataView = new DataView(new ArrayBuffer(0));
        public position: number = 0;
        public length: number = 0;

        constructor() {}

        public extract() : Wav {
            let result:Wav = new Wav();

            this.seekIndex = this.position;

            result.header = this.extractWavRiffHeader();
            result.fmtSubChunk = this.extractWavFmtSubChuck();
            result.dataSubChunk = this.extractorWavDataSubChunk(result.fmtSubChunk.bitsPerSample);
            return result;
        }

        private extractWavRiffHeader() : WavRiffHeader {
            let result: WavRiffHeader = new WavRiffHeader();

            result.chunkId = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex +=4;

            result.chunkSize = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.format = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex +=4;

            Debugging.debug("Wav Riff Header: ", result.chunkId, result.chunkSize, result.format);

            return result;
        }

        private extractWavFmtSubChuck(): WavFmtSubChunk {
            let result: WavFmtSubChunk = new WavFmtSubChunk();

            result.subChunkId = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex +=4;

            result.subChunkSize = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.audioFormat = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex +=2;

            result.numChannels = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex +=2;

            result.sampleRate = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.byteRate = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.blockAlign = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex +=2;

            result.bitsPerSample = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            Debugging.debug("Wav fmt sub chunk: ", 
                result.subChunkId,
                result.subChunkSize,
                result.audioFormat,
                result.numChannels,
                result.sampleRate,
                result.byteRate,
                result.blockAlign,
                result.bitsPerSample);

            return result;
        }

        private extractorWavDataSubChunk(bitsPerSample: number): WavDataSubChunk {
            let result: WavDataSubChunk = new WavDataSubChunk();

            result.subChunk2Id = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex +=4;

            result.subChunk2Size = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            if (bitsPerSample === 8) {
                result.data = DataViewUtils.getBinaryData(this.dataView, this.seekIndex, result.subChunk2Size);
            } else if (bitsPerSample === 16) {
                result.data = DataViewUtils.getBinaryData16(this.dataView, this.seekIndex, result.subChunk2Size);
            }

            Debugging.debug("Wav data sub chunk",
                result.subChunk2Id,
                result.subChunk2Size,
                result.data.length,
                result.data);

            return result;
        }
    }
}