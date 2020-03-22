module Quake2Tools {
    export class PcxExtractor {
        private seekIndex: number = 0;

        public dataView: DataView = new DataView(new ArrayBuffer(0));
        public position: number = 0;
        public length: number = 0;

        constructor() {}

        public extract() : Pcx {
            let result:Pcx = new Pcx();

            this.seekIndex = this.position;

            result.header = this.extractPcxHeader();
            
            var sizeOfImageData = result.header.horizontalResolution 
                * result.header.verticalResolution 
                * result.header.numberOfColourPlanes;
             
            result.data = DataViewUtils.getBinaryData(this.dataView, this.position + 128, sizeOfImageData);

            Debugging.debug("Pcx data", result.data);
            
            return result;
        }

        private extractPcxHeader() : PcxHeader {
            let result: PcxHeader = new PcxHeader();

            result.headerField = DataViewUtils.getUint8(this.dataView, this.seekIndex);
            this.seekIndex += 1;

            result.version = DataViewUtils.getUint8(this.dataView, this.seekIndex);
            this.seekIndex += 1;

            result.encoding = DataViewUtils.getUint8(this.dataView, this.seekIndex);
            this.seekIndex += 1;

            result.bitDepth = DataViewUtils.getUint8(this.dataView, this.seekIndex);
            this.seekIndex += 1;

            result.minX = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.minY = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.maxX = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.maxY = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.horizontalResolution = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.verticalResolution = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.egaPalette = DataViewUtils.getBinaryData(this.dataView, this.seekIndex, 48);
            this.seekIndex += 48;

            this.seekIndex += 1; // first reserved field

            result.numberOfColourPlanes = DataViewUtils.getUint8(this.dataView, this.seekIndex);
            this.seekIndex += 1;

            result.colorPlaneByteSize = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            result.colorPaletteMode = DataViewUtils.getInt16(this.dataView, this.seekIndex);
            this.seekIndex += 2;

            Debugging.debug("Pcx Header: ", result);

            return result;
        }
    }
}