import { Wal, WalHeader } from "../formats/wal"
import { Debugging } from "../../utils/debugging"
import { DataViewUtils } from "../../utils/dataViewUtils"

export class WalExtractor {
    private seekIndex: number = 0;

    public dataView: DataView = new DataView(new ArrayBuffer(0));
    public position: number = 0;
    public length: number = 0;

    constructor() { }

    public extract(): Wal {
        let result: Wal = new Wal();

        this.seekIndex = this.position;

        result.header = this.extractWalHeader();
        result.data = DataViewUtils.getBinaryData(this.dataView,
            this.position + result.header.offset[0], result.header.width * result.header.height);

        Debugging.debug("Wal data", result.data);

        return result;
    }

    private extractWalHeader(): WalHeader {
        let result: WalHeader = new WalHeader();

        result.name = DataViewUtils.getString(this.dataView, this.seekIndex, 32);
        this.seekIndex += 32;

        result.width = DataViewUtils.getUint32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.height = DataViewUtils.getUint32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        for (var i = 0; i < 4; i++) {
            result.offset[i] = DataViewUtils.getUint32(this.dataView, this.seekIndex);
            this.seekIndex += 4;
        }

        result.nextName = DataViewUtils.getString(this.dataView, this.seekIndex, 32);
        this.seekIndex += 32;

        Debugging.debug("Wal Header: ", result);

        return result;
    }
}