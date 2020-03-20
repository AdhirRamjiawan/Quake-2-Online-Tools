module Quake2Tools {
    export class WalExtractor {
        private seekIndex: number = 0;

        public dataView: DataView = new DataView(new ArrayBuffer(0));
        public position: number = 0;
        public length: number = 0;

        constructor() {}

        public extract() : Wal {
            let result:Wal = new Wal();

            this.seekIndex = this.position;

            result.header = this.extractWalHeader();
            result.data = DataViewUtils.getBinaryData(this.dataView, 
                this.seekIndex, result.header.width * result.header.height);
            return result;
        }

        private extractWalHeader() : WalHeader {
            let result: WalHeader = new WalHeader();

            result.name = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex +=4;

            result.width = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.height = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.offset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
            this.seekIndex +=4;

            result.nextName = DataViewUtils.getString(this.dataView, this.seekIndex, 4);
            this.seekIndex += 4;

            Debugging.debug("Wal Header: ", result.name, result.width, result.height, result.offset, result.nextName);

            return result;
        }
    }
}