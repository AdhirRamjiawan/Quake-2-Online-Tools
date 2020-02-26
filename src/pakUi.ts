module Quake2Tools {

    interface IUiLump {
        fileExtension: string;
        name: string;
        position: number;
        length: number;
    }

    interface IUiSummaryStats {
        extension: string;
        count: number;
    }

     export class PakUi {

        private extractor = new Quake2Tools.PakExtractor(false);
        private paginationSize = 30;
        private globalArchive: any;
        private filteredLumps: Array<IUiLump>;
        private summaryStats: Array<IUiSummaryStats>;
    
        constructor() {
            this.globalArchive = {};
            this.filteredLumps = new Array<IUiLump>();
            this.summaryStats = new Array<IUiSummaryStats>();
        }

        public setPakFile(event: Event) {
            this.extractor.setPakFile(event);
        }

        private getFileExtension(lumpPath:String) : string {
            var extension = '';
    
            for (var i = lumpPath.length-1; i > 0; i--) {
                if (lumpPath[i] === '.') {
                    for (var k = i + 1; ; k++) {
    
                        if (lumpPath.charCodeAt(k) === 0)
                        break;
    
                        extension += lumpPath[k];
                    }
                    break;
                }
            }
    
            return extension;
        }
    
        private resetUiState() {
            this.filteredLumps = new Array<IUiLump>();
            this.summaryStats = new Array<IUiSummaryStats>();
        }

        private updatePageSize() {
            let pageSize = <HTMLInputElement>document.getElementById("pageSize");
            this.paginationSize = parseInt(pageSize.value);
        }
    
        public displayArchive(archive: any) {
            this.resetUiState();
            this.globalArchive = archive;
    
            for (var i=0; i< archive.lumps.length; i++) {
                var fileExtension = this.getFileExtension(archive.lumps[i].name);
    
                this.filteredLumps.push(archive.lumps[i]);
                this.filteredLumps[i].fileExtension = fileExtension;
    
                this.summaryStats.push({
                    extension: fileExtension,
                    count: 0
                });
            }
    
            this.loadArchivePage(0);
            this.displayPaginationButtons();
        }
    
        public search() {
            let  searchTerm = <HTMLInputElement>document.getElementById("searchTerm");
            this.filteredLumps = [];
    
            console.log("searching: [" + searchTerm.value + "]");
    
            if (searchTerm.value.trim() === "") {
                this.filteredLumps = this.globalArchive.lumps;
            } else {
                for (var i=0; i < this.globalArchive.lumps.length; i++) {
                    if (this.globalArchive.lumps[i].name.indexOf(searchTerm.value) > -1)
                        this.filteredLumps.push(this.globalArchive.lumps[i]);
                }
            }
    
            this.loadArchivePage(0);
            this.displayPaginationButtons();
        }
    
        private displayPaginationButtons() {
            let paginationButtonList = <HTMLElement>document.getElementById("paginationButtonList");
            var paginationButtonListMarkup = "";
            
            var numberOfButtons = this.filteredLumps.length / this.paginationSize;
    
            for (var i =0 ; i< numberOfButtons; i++) {
                paginationButtonListMarkup += this.createPaginationButton(i);
            }
            paginationButtonList.innerHTML = paginationButtonListMarkup;
        }
    
        private getDistinct(list: Array<IUiSummaryStats>): Array<IUiSummaryStats>{
            let distinctList =new Array<IUiSummaryStats>();
    
            for (var i= 0; i < list.length; i++) {
                var found = false;
                for (var k = 0; k < distinctList.length; k++) {
                    
                    if (list[i].extension === distinctList[k].extension) {
                        found = true;
                        break;
                    }
                }
    
                if (!found) {
                    distinctList.push(list[i]);
                }
            }
    
            return distinctList;
        }
    
        private calculateSummaryCounts() {
            let distinctList = this.getDistinct(this.summaryStats);
            let summaryStatsTable = <HTMLElement>document.getElementById("summaryStatsTableBody");
            var tableDataMarkup = "";
            summaryStatsTable.innerHTML = tableDataMarkup;
    
            for (var i = 0; i < distinctList.length; i++) {
                var tempCount = 0;
    
                for (var k = 0; k < this.summaryStats.length; k++) {
                    if (distinctList[i].extension === this.summaryStats[k].extension) {
                        tempCount++;
                    }
                }
    
                distinctList[i].count = tempCount;
                tableDataMarkup += this.createTableRow(distinctList[i].extension, tempCount);
            }
    
            summaryStatsTable.innerHTML = tableDataMarkup;
            this.summaryStats = distinctList;
        }
    
        private loadArchivePage(pageNumber: number) {
            let pageNumberTextBox = <HTMLInputElement>document.getElementById("pageNumber");
            let lumpTable = <HTMLElement>document.getElementById("lumpTableBody");
            var tableDataMarkup = "";
            lumpTable.innerHTML = tableDataMarkup;
            
            var startIndex = (pageNumber * this.paginationSize);
            var endIndex = startIndex + this.paginationSize;
    
            for (var i = startIndex; i < endIndex; i++) {
                if (this.filteredLumps[i]) {
                    tableDataMarkup += this.createTableRow(
                            this.createPreviewLink(i),
                            this.createDownloadLink(i),
                            this.filteredLumps[i].name, 
                            (this.filteredLumps[i].length / 1024).toFixed(2)
                        );
                }
            }
    
            this.calculateSummaryCounts();
    
            lumpTable.innerHTML = tableDataMarkup;
            pageNumberTextBox.setAttribute("value", (pageNumber + 1).toString());
        }
    
        public previewFile(e: Event, filteredLumpIndex: number) {
            e.preventDefault();
            let previewPane = <HTMLElement>document.getElementById("previewPane");
            var htmlContent = "";
            let lump = this.filteredLumps[filteredLumpIndex];
    
            if (lump.fileExtension === "cfg") {
                var data = this.extractor.extractSpecificLumpAsString(lump.position, lump.length);
                htmlContent += '<textarea readonly>{0}</textarea>'
                    .replace("{0}", data);
            } else if (lump.fileExtension === "wav") {
                //let data = this.extractor.extractSpecificLumpAsBinary(lump.position, lump.length);
                this.playSound(lump.position, lump.length);
            }
    
            previewPane.innerHTML = htmlContent;
        }

        public downloadFile(e: Event, filteredLumpIndex: number) {
            e.preventDefault();
            let lump = this.filteredLumps[filteredLumpIndex];
            let lumpData = this.extractor.extractSpecificLumpAsBinary(lump.position, lump.length);
            let dataUri: string = URL.createObjectURL(new Blob([lumpData], { type: 'application/text'}));
            window.open(dataUri, "_blank");
            URL.revokeObjectURL(dataUri);
        }
    
        // need to document this playing of sound well.
        private playSound(position: number, length: number) {            
            let wav:Wav = this.extractor.getWavSound(position, length);
            var context = new AudioContext();

            var frameCount = wav.dataSubChunk.subChunk2Size 
                        / (wav.fmtSubChunk.numChannels
                            * wav.fmtSubChunk.blockAlign);

            var normalisedSampleRate =  0;
            var maxAmplitude = 0;

            if (wav.fmtSubChunk.bitsPerSample === 8) {
                normalisedSampleRate = wav.fmtSubChunk.sampleRate;

                // need the max amplitude to normal sound data between 0..1
                maxAmplitude = Math.max(...DataViewUtils.Uint8ArrayToNumberArray(wav.dataSubChunk.data));
            } else if (wav.fmtSubChunk.bitsPerSample === 16) {
                normalisedSampleRate = wav.fmtSubChunk.sampleRate * wav.fmtSubChunk.blockAlign;

                // 16 bit seems to have too much gain on it.
                // need the max amplitude to normal sound data between 0..1
                maxAmplitude = Math.max(...DataViewUtils.Uint16ArrayToNumberArray(wav.dataSubChunk.data));
            }

            var buffer = context.createBuffer(
                wav.fmtSubChunk.numChannels, 
                frameCount, 
                normalisedSampleRate);

            var currentBufferedData = buffer.getChannelData(0);

            for (var i = 0; i < frameCount; i++) {
                currentBufferedData[i] =  
                    (wav.dataSubChunk.data[i] / maxAmplitude);
            }

            console.log(currentBufferedData);

            var bufferSource = context.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(context.destination);
            bufferSource.start();
        }
    
        private createPreviewLink(filteredLumpIndex: number) {
            /* Referncing pakUi in this anchor tag isn't good.
             * We need to actually remove as much of JS from 
             * the markup and inject markup/variables from 
             * this class. Or make use of the window object */

            return  '<a href="#" onclick="pakUi.previewFile(event, {0})" >Preview</a>'
                    .replace("{0}", filteredLumpIndex.toString());
        }

        private createDownloadLink(filteredLumpIndex: number) {
            return  '<a href="#" onclick="pakUi.downloadFile(event, {0})" >Download</a>'
                    .replace("{0}", filteredLumpIndex.toString());
        }
    
        private createTableRow(...args:any[]) {
            var markup = "";
            for (var a=0; a < args.length; a++) {
                markup += this.createTableColumn(args[a]);
            }
            return "<tr>" + markup + "</tr>";
        }
    
        private createTableColumn(data: string) {
            return "<td>"+data+"</td>";
        }

        private createPaginationButton(pageNumber: number) {
            return '<button onclick="pakUi.loadArchivePage('+pageNumber+')">'+(pageNumber + 1)+'</button>';
        }

        public extractArchive() {
            /* We need to wrap this call back to extractArchive
             * into a arrow function to preserve the context of
             * `this`. */
            this.extractor.extractArchive(
                (data: any)=>{this.displayArchive(data);}
            );
        }
     }
}