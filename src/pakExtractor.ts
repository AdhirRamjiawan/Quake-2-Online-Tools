
import { Debugging } from "./utils/debugging"
import { PakArchive } from "./pak/pakArchive"
import { PakLump } from "./pak/pakLump"
import { PcxExtractor } from "./pak/extractors/pcxExtractor"
import { WalExtractor } from "./pak/extractors/walExtractor"
import { WavExtractor } from "./pak/extractors/wavExtractor"
import { Md2Extractor } from "./pak/extractors/md2Extractor"
import { Pcx } from "./pak/formats/pcx"
import { Md2 } from "./pak/formats/md2"
import { Wal } from "./pak/formats/wal"
import { Wav } from "./pak/formats/wav"

enum PakExtractorErrorCodes {
    InvalidHeader = 1
}

export class PakExtractor {

    // 1. pak header declaration
    // header value should be 1262698832 (PACK)
    private PAK_HEADER: number = (('K'.charCodeAt(0) << 24) + ('C'.charCodeAt(0) << 16) + ('A'.charCodeAt(0) << 8) + 'P'.charCodeAt(0));
    private pakFile: File = new File(new Array<BlobPart>(), "");
    private littleEndian: boolean = true;
    private seekIndex: number = 0;
    private reader = new FileReader();
    public dataView: DataView = new DataView(new ArrayBuffer(0));
    private colorMapLumpName: string = "pics/colormap.pcx";

    public archive: PakArchive;
    public wavExtractor: WavExtractor = new WavExtractor();
    public walExtractor: WalExtractor = new WalExtractor();

    // 2. get file stream of pak archive
    constructor(private isDebug: boolean) {
        Debugging.isDebug = isDebug;
        this.archive = new PakArchive();
    }

    public setPakFile(event: any) {
        this.pakFile = event.target.files[0];
    }

    public readPakFile(callback: Function) {

        this.reader.readAsArrayBuffer(this.pakFile);


        this.reader.onload = () => {
            // 3. a. read header of pak archive
            this.dataView = new DataView(<ArrayBuffer>this.reader.result);

            // 3. b. read int at current position for ident. Move stream by int byte size
            let id = this.getInt32AndMove(this.dataView);

            Debugging.debug("Header id", id);

            if (id !== this.PAK_HEADER) {
                console.error('Invalid PAK file');
                return PakExtractorErrorCodes.InvalidHeader;
            }

            // 3. c. read int at current position for dirofs. Move stream by int byte size
            let lumpCollectionOffset = this.getInt32AndMove(this.dataView);
            Debugging.debug("lump collection offset", lumpCollectionOffset);

            // 3. d. read int at current position for dirlen. move stream by int byte size.
            let lumpCollectionLength = this.getInt32AndMove(this.dataView);
            Debugging.debug("lump collection length", lumpCollectionLength);

            // 3. e.  move the file stream passed header (dirOfs - 12 bytes)
            this.seekIndex += (lumpCollectionOffset - 12);
            Debugging.debug("seek index 3.e.", this.seekIndex);

            // 4. work out number of lumps. dirLen / 64. 
            let lumpCount = lumpCollectionLength / 64;
            Debugging.debug("lump count", lumpCount);

            this.archive.header.id = id;
            this.archive.header.lumpCollectionPosition = lumpCollectionOffset;
            this.archive.header.lumpCollectionLength = lumpCollectionLength;

            // 5. for each lump
            for (var lumpIndex = 0; lumpIndex < lumpCount; lumpIndex++) {
                // 5. a. read lump name, name is 56 bytes.
                let lumpName: string = this.getStringAndMove(this.dataView, 56);
                Debugging.debug("lump", lumpName);

                // VVVV--(TODO) We just want the file names for now--VVVV
                // 5. b. read int at current position which is the file position (move ahead by int size in bytes). Swap ints?
                let lumpFilePosition: number = this.getInt32AndMove(this.dataView);

                // 5. c. read int at current position which is the file length (move ahead by int size in bytes) Swap ints?
                let lumpFileLength: number = this.getInt32AndMove(this.dataView);


                // VVVV -- (TODO) generate local/embedded hyperlinks to download each file -- VVVV
                // 5. d. using a new file stream, use the file position (from 5.b) to go to that position in the main pak stream
                // 5. e. read file length bytes from current position as determined from (5.c).
                // 5. f. write new file stream for lump as a new file and go back to 5.a. to repeat the process for all lumps.

                this.archive.lumpCollection.lumps.push(new PakLump(lumpName, lumpFilePosition, lumpFileLength));

                if (lumpName.indexOf(this.colorMapLumpName) !== -1) {
                    this.archive.colorMap = new PakLump(lumpName, lumpFilePosition, lumpFileLength);
                }

            }
            callback(this.archive.toJson());
        };
    }

    public saveAndDownladArchive(callback: Function) {
        alert('Not implemented');
    }

    public extractArchive(callback: Function) {
        this.resetState();
        this.readPakFile(callback);
    }

    // convert to using generics instead of "AsString"
    public extractSpecificLumpAsString(lumpPosition: number, lumpLength: number): string {
        let dataView: DataView = new DataView(<ArrayBuffer>this.reader.result);
        let bufView: Uint8Array = new Uint8Array(dataView.buffer, lumpPosition, lumpLength);
        let numberArray: number[] = this.Uint8ArrayToNumberArray(bufView);
        let result = String.fromCharCode.apply(null, numberArray);
        return result;
    }

    // convert to using generics instead of "AsString"
    public extractSpecificLumpAsBinary(lumpPosition: number, lumpLength: number): Uint8Array {
        let dataView: DataView = new DataView(<ArrayBuffer>this.reader.result);
        let bufView: Uint8Array = new Uint8Array(dataView.buffer, lumpPosition, lumpLength);
        return bufView;
    }

    // all these extract functions can be abstracted into interfaces
    public getWavSound(position: number, length: number): Wav {
        let wavExtractor = new WavExtractor();
        wavExtractor.dataView = this.dataView;
        wavExtractor.position = position;
        wavExtractor.length = length;
        return wavExtractor.extract();
    }

    public getMd2Model(position: number, length: number): Md2 {
        let md2Extractor = new Md2Extractor();
        md2Extractor.dataView = this.dataView;
        md2Extractor.position = position;
        md2Extractor.length = length;
        return md2Extractor.extract();
    }

    public getWalTexture(position: number, length: number): Wal {
        let walExtractor = new WalExtractor();
        walExtractor.dataView = this.dataView;
        walExtractor.position = position;
        walExtractor.length = length;
        return walExtractor.extract();
    }

    public getPcxImage(position: number, length: number): Pcx {
        let pcxExtractor = new PcxExtractor();
        pcxExtractor.dataView = this.dataView;
        pcxExtractor.position = position;
        pcxExtractor.length = length;
        return pcxExtractor.extract();
    }

    // make use of DataViewUtils.ts
    private getStringAndMove(dataView: DataView, offset: number): string {
        let bufView: Uint8Array = new Uint8Array(dataView.buffer, this.seekIndex, offset);
        let numberArray: number[] = this.Uint8ArrayToNumberArray(bufView);
        let result = String.fromCharCode.apply(null, numberArray);
        this.seekIndex += offset;
        return result;
    }

    // make use of DataViewUtils.ts
    private Uint8ArrayToNumberArray(array: Uint8Array): number[] {
        let result: number[] = [];

        for (var index = 0; index < array.length; index++)
            result.push(array[index]);

        return result;
    }

    // make use of DataViewUtils.ts
    private getInt32AndMove(dataView: DataView, littleEndian: boolean = this.littleEndian): number {
        let result = dataView.getInt32(this.seekIndex, littleEndian);
        this.seekIndex += 4;
        return result;
    }

    private resetState() {
        this.seekIndex = 0;
        this.archive = new PakArchive();
    }
}