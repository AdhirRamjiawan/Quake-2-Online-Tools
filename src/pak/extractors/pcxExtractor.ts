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
            
            
            if (result.header.version === 5 && result.header.numberOfColourPlanes === 1) {
                var paletteStart = (this.position + this.length) - 768;
                result.header.mainColorPallete = 
                    DataViewUtils.getBinaryData(this.dataView, paletteStart, 768);

                Debugging.debug("PCX color palette", this.length - 768, result.header.mainColorPallete);
            }

            if (result.header.encoding === 1) { // Run Length Encoding
                result.data = this.extractRLEData(
                    this.dataView, 
                    this.position + 128, 
                    this.length - 769);
            } else {
                result.data = DataViewUtils.getBinaryData(this.dataView, this.position + 128, this.length - 769);
            }

            Debugging.debug("Pcx data", result.data);
            
            return result;
        }

        private extractRLEData(dataView: DataView, position:number, length:number) : Uint8Array {
            var result: Array<number> = [];
            var dataLength = position + length;

            for (var i = position; i < dataLength; i++) {
                var metaByte = dataView.getUint8(i);

                if (metaByte >= 192) {
                    var colorByte = dataView.getUint8(i + 1);
                    var rleDiff = metaByte & 0x3F;

                    for (var rleIndex = 0; rleIndex < rleDiff; rleIndex++) {
                        result.push(colorByte);
                    }
                    i++; // we've already read the colour byte
                } else {
                    result.push(metaByte);
                }
            }

            return Uint8Array.from(result);
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