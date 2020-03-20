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
        private lumpTablePaginationStartIndex: number = 0;

        constructor() {
            this.globalArchive = {};
            this.filteredLumps = new Array<IUiLump>();
            this.summaryStats = new Array<IUiSummaryStats>();

            setTimeout(this.hideSplashScreen, 3000);
        }

        public setPakFile(event: Event) {
            this.extractor.setPakFile(event);
        }

        private setLogo(isLoading: boolean) {
            Debugging.debug("setting logo: " + isLoading);
            var logo: HTMLImageElement = <HTMLImageElement>document.getElementById("logo");

            if (isLoading) {
                logo.src = "img/loading.gif";
            } else {
                logo.src = "img/logo-gray.png";
            }
        }

        private hideSplashScreen() {
            Debugging.debug("Hiding splash screen...");
            var splashScreen: HTMLElement = <HTMLElement>document.getElementById("splash-screen");
            splashScreen.setAttribute("class", "splash-screen-hide");

            setTimeout(()=>{
                splashScreen.setAttribute("style", "display:none");
            }, 1000);
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
            this.setLogo(true);
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
            this.setLogo(false);
        }

        public progressLumpTablePaginationStartIndex() {
            this.lumpTablePaginationStartIndex++;
            this.loadArchivePage(this.lumpTablePaginationStartIndex);
        }

        public regressLumpTablePaginationStartIndex() {
            this.lumpTablePaginationStartIndex--;
            this.loadArchivePage(this.lumpTablePaginationStartIndex);
        }
    
        private displayPaginationButtons() {
            let paginationButtonList = <HTMLElement>document.getElementById("paginationButtonList");
            let paginationButtonList2 = <HTMLElement>document.getElementById("paginationButtonList2");
            var paginationButtonListMarkup = "";
            
            var numberOfButtons = this.filteredLumps.length / this.paginationSize;
    
            paginationButtonListMarkup += '<button onclick="pakUi.regressLumpTablePaginationStartIndex()">&lt;&lt;</button>';

            for (var i = this.lumpTablePaginationStartIndex ; i < this.lumpTablePaginationStartIndex + 3; i++) {
                paginationButtonListMarkup += this.createPaginationButton(i);
            }

            for (var i = 0; i < 3; i++) {
                paginationButtonListMarkup += "<span> . </span>";
            }

            for (var i = numberOfButtons - 3 ; i <  numberOfButtons; i++) {
                paginationButtonListMarkup += this.createPaginationButton(Math.floor(i));
            }

            paginationButtonListMarkup += '<button onclick="pakUi.progressLumpTablePaginationStartIndex()">&gt;&gt;</button>';

            paginationButtonList.innerHTML = paginationButtonListMarkup;
            paginationButtonList2.innerHTML = paginationButtonListMarkup;
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
                            this.createLumpActionSelect(i),
                            this.filteredLumps[i].name, 
                            (this.filteredLumps[i].length / 1024).toFixed(2)
                        );
                }
            }
    
            this.calculateSummaryCounts();
    
            lumpTable.innerHTML = tableDataMarkup;
            pageNumberTextBox.setAttribute("value", (pageNumber + 1).toString());

            this.displayPaginationButtons();
        }
    
        public previewFile(filteredLumpIndex: number) {
            this.setLogo(true);
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
            this.setLogo(false);
        }

        public downloadFile(filteredLumpIndex: number) {
            let lump = this.filteredLumps[filteredLumpIndex];
            let lumpData = this.extractor.extractSpecificLumpAsBinary(lump.position, lump.length);
            let dataUri: string = URL.createObjectURL(new Blob([lumpData], { type: 'application/text'}));
            window.open(dataUri, "_blank");
            URL.revokeObjectURL(dataUri);
        }
    
        public onChangeLumpAction(filteredLumpIndex: number, select:HTMLSelectElement) {
            var action:string = select.value;

            if (action === 'download') {
                this.downloadFile(filteredLumpIndex);
            } else if (action === 'preview') {
                this.previewFile(filteredLumpIndex);
            } else if (action === 'delete') {
                alert('Not implemented!');
            }

            select.selectedIndex = 0;
        }

        // need to document this playing of sound well.
        private playSound(position: number, length: number) {            
            let wav:Wav = this.extractor.getWavSound(position, length);
            var context = new AudioContext();

            var frameCount = wav.dataSubChunk.subChunk2Size 
                        / (wav.fmtSubChunk.numChannels
                            * wav.fmtSubChunk.blockAlign);

            var maxAmplitude = 0;

            // need the max amplitude to normal sound data between 0..1
            if (wav.fmtSubChunk.bitsPerSample === 8) {
                maxAmplitude = Math.max(...DataViewUtils.Uint8ArrayToNumberArray(wav.dataSubChunk.data));
            } else if (wav.fmtSubChunk.bitsPerSample === 16) {
                // need the max amplitude to normal sound data between 0..1
                maxAmplitude = Math.max(...DataViewUtils.Int16ArrayToNumberArray(wav.dataSubChunk.data));
            }
            Debugging.debug("wav.fmtSubChunk.bitsPerSample", wav.fmtSubChunk.bitsPerSample);
            Debugging.debug("maxAmplitude", maxAmplitude);

            var buffer = context.createBuffer(
                wav.fmtSubChunk.numChannels, 
                frameCount, 
                wav.fmtSubChunk.sampleRate);

            var currentBufferedData = buffer.getChannelData(0);

            for (var i = 0; i < frameCount; i++) {
                currentBufferedData[i] =  
                    (wav.dataSubChunk.data[i] / maxAmplitude);
            }

            var bufferSource = context.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(context.destination);
            bufferSource.start();
        }

        private createLumpActionSelect(filteredLumpIndex: number) {
            var select = '<select onchange="pakUi.onChangeLumpAction('+filteredLumpIndex+', this)">';

            select += '<option value="">-- Select Action --</option>';
            select += '<option value="preview">Preview</option>';
            select += '<option value="download">Download</option>';
            select += '<option value="delete">Delete</option>';

            select += '</select>';

            return select;
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
            this.setLogo(true);
            /* We need to wrap this call back to extractArchive
             * into a arrow function to preserve the context of
             * `this`. */
            this.extractor.extractArchive(
                (data: any)=>{
                    this.displayArchive(data);
                    this.setLogo(false);
                }
            );
        }

        public showToolTab(tab: string, element:HTMLElement) {
            this.resetAllMenuButtons();
            this.hideAllTabs();
            var tabPak: HTMLElement = <HTMLElement>document.getElementById("tool-tab-" + tab);
            tabPak.setAttribute("style", "display: block");
            element.setAttribute("class", "selected");
        }

        private hideAllTabs() {
            var elements = document.getElementsByClassName("tool-tab");

            for (var i = 0; i < elements.length; i++) {
                var item = <Element>elements.item(i);
                item.setAttribute("style", "display:none;");
            }
        }

        private resetAllMenuButtons() {
            var elements = document.getElementsByClassName("menu-button");

            for (var i = 0; i < elements.length; i++) {
                var item = <Element>elements.item(i);
                item.setAttribute("class", "");
            }
        }
     }
}