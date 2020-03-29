module Quake2Tools {
    export class Md2Extractor {

        // header value should be 844121161 (IDP2)
        private MD2_HEADER:number = (('2'.charCodeAt(0)<<24)+('P'.charCodeAt(0)<<16)+('D'.charCodeAt(0)<<8)+'I'.charCodeAt(0));

        private seekIndex: number = 0;

        public dataView: DataView = new DataView(new ArrayBuffer(0));
        public position: number = 0;
        public length: number = 0;

        constructor() {
            
        }

        public extract(): Md2 {
            let result:Md2 = new Md2();

            this.seekIndex = this.position;

            result.header = this.extractHeader();

            Debugging.debug("MD2 data", result);

            return result;
        }

        private extractHeader(): Md2Header {
            let result:Md2Header = new Md2Header();

            result.id = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.version = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.textWidth = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.textHeight = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.frameSize = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.skinCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.verticesCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.textCoordCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.trisCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.glCmdCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.counts.frameCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.skinOffet = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.textCoordCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.trisOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.frameOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.glCmdOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            result.offsets.eofOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            return result;
        }
    }
}