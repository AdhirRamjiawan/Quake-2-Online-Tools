

module Quake2Tools {
    

    enum PakExtractorErrorCodes {
        InvalidHeader=1
    }

    export class PakExtractor implements IQuakeTool {

        // 1. pak header declaration
        // header value should be 1262698832 (PACK)
        private PAK_HEADER:number = (('K'.charCodeAt(0)<<24)+('C'.charCodeAt(0)<<16)+('A'.charCodeAt(0)<<8)+'P'.charCodeAt(0));
        private pakFile:File = new File(new Array<BlobPart>(), "");
        private littleEndian: boolean = true;
        private seekIndex : number = 0;
        public archive: PakArchive;

        // 2. get file stream of pak archive
        constructor(private isDebug: boolean) {
            this.archive = new PakArchive();
        }

        public setPakFile(event:any) {
            this.pakFile = event.target.files[0];
        }

        public readPakFile(callback: Function) {
            
            let reader = new FileReader();
            reader.readAsArrayBuffer(this.pakFile);
            

            reader.onload = () => {
                // 3. a. read header of pak archive
                let dataView:DataView = new DataView(<ArrayBuffer>reader.result);

                // 3. b. read int at current position for ident. Move stream by int byte size
                let id = this.getInt32AndMove(dataView);

                this.debug("Header id", id);

                if (id !== this.PAK_HEADER) {
                    console.error('Invalid PAK file');
                    return PakExtractorErrorCodes.InvalidHeader;
                }

                // 3. c. read int at current position for dirofs. Move stream by int byte size
                let lumpCollectionOffset = this.getInt32AndMove(dataView);
                this.debug("lump collection offset", lumpCollectionOffset);

                // 3. d. read int at current position for dirlen. move stream by int byte size.
                let lumpCollectionLength = this.getInt32AndMove(dataView);
                this.debug("lump collection length", lumpCollectionLength);

                // 3. e.  move the file stream passed header (dirOfs - 12 bytes)
                this.seekIndex += (lumpCollectionOffset - 12);
                this.debug("seek index 3.e.", this.seekIndex);

                // 4. work out number of lumps. dirLen / 64. 
                let lumpCount = lumpCollectionLength / 64;
                this.debug("lump count", lumpCount);
                
                this.archive.header.id = id;
                this.archive.header.lumpCollectionPosition = lumpCollectionOffset;
                this.archive.header.lumpCollectionLength = lumpCollectionLength;

                // 5. for each lump
                for (var lumpIndex = 0; lumpIndex < lumpCount; lumpIndex++) {
                    // 5. a. read lump name, name is 56 bytes.
                    let lumpName:string = this.getStringAndMove(dataView, 56);
                    this.debug("lump", lumpName);
                    
                    // VVVV--(TODO) We just want the file names for now--VVVV
                    // 5. b. read int at current position which is the file position (move ahead by int size in bytes). Swap ints?
                    let lumpFilePosition: number = this.getInt32AndMove(dataView);

                    // 5. c. read int at current position which is the file length (move ahead by int size in bytes) Swap ints?
                    let lumpFileLength: number = this.getInt32AndMove(dataView);


                    // VVVV -- (TODO) generate local/embedded hyperlinks to download each file -- VVVV
                    // 5. d. using a new file stream, use the file position (from 5.b) to go to that position in the main pak stream
                    // 5. e. read file length bytes from current position as determined from (5.c).
                    // 5. f. write new file stream for lump as a new file and go back to 5.a. to repeat the process for all lumps.

                    this.archive.lumpCollection.lumps.push(new PakLump(lumpName, lumpFilePosition, lumpFileLength));
                }
                callback(this.archive.toJson());
            };
        }

        public extractArchive(callback: Function) {
            this.readPakFile(callback);
        }

        private debug(message: string, value: any) {
            if (this.isDebug) {
                console.log(message, value);
            }
        }

        private getStringAndMove(dataView: DataView, offset: number) : string {
            let bufView:Uint8Array = new Uint8Array(dataView.buffer, this.seekIndex, offset);
            let numberArray: number[] = this.Uint8ArrayToNumberArray(bufView);
            let result = String.fromCharCode.apply(null, numberArray);
            this.seekIndex += offset;
            return result;
        }

        private Uint8ArrayToNumberArray(array:Uint8Array) : number[]{
            let result : number[] = [];

            for (var index = 0; index < array.length; index++)
                result.push(array[index]);

            return result;
        }
        private getInt32AndMove(dataView: DataView) :number {
            let result = dataView.getInt32(this.seekIndex, this.littleEndian);
            this.seekIndex += 4;
            return result;
        }
    }
}