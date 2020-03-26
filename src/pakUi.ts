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

        private extractor = new Quake2Tools.PakExtractor(true);
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
            let lump = this.filteredLumps[filteredLumpIndex];
    
            if (lump.fileExtension === "cfg") {
                var data = this.extractor.extractSpecificLumpAsString(lump.position, lump.length);
                previewPane.innerHTML =  '<textarea readonly>{0}</textarea>'
                    .replace("{0}", data);
            } else if (lump.fileExtension === "wav") {
                //let data = this.extractor.extractSpecificLumpAsBinary(lump.position, lump.length);
                this.playSound(lump.position, lump.length);
            } else if (lump.fileExtension === "wal") {
                this.drawWalTexture(lump.position, lump.length);
            } else if (lump.fileExtension === "pcx") {
                this.drawPcxImage(lump.position, lump.length);
            }

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


        private drawPcxImagePalette(data:Uint8Array) {
            var dataLength = data.length;
            let previewPane = <HTMLElement>document.getElementById("previewPane");
            let paletteCanvas = <HTMLCanvasElement>document.createElement("canvas");
            var context =  <CanvasRenderingContext2D>paletteCanvas.getContext("2d");
            var imageData = <ImageData>context.createImageData(200, 200);
            var rawData = <Uint8ClampedArray>imageData.data;

            for (var i =0; i < dataLength; i+=4) {
                rawData[i] = data[i];
                rawData[i + 1] = data[i + 1];
                rawData[i + 2] = data[i + 2];
                rawData[i + 3] = 255;
            }

            paletteCanvas.setAttribute("style", "border: 1px solid #000");
            context.putImageData(imageData, 0, 0);


            // just to make the palette more visible.
            for (var i = 0; i < 100; i++) {
                context.putImageData(context.getImageData(0, 0, 200, 2), 0, 2 + (i +1));
            }

            previewPane.appendChild(paletteCanvas);
        }

        private drawPcxImage(position: number, length: number) {
            let pcx:Pcx = this.extractor.getPcxImage(position, length);
            let previewPane = <HTMLElement>document.getElementById("previewPane");
            let pcxCanvas = <HTMLCanvasElement>document.createElement("canvas");
            var context =  <CanvasRenderingContext2D>pcxCanvas.getContext("2d");
            var imageData = <ImageData>context.createImageData(pcx.header.maxX + 1, pcx.header.maxY + 1);
            var rawData = <Uint8ClampedArray>imageData.data;

            previewPane.innerHTML = "";

            var renderedImage = [];
            var imageSize = ((pcx.header.maxX + 1) * (pcx.header.maxY + 1));

            pcxCanvas.width = pcx.header.maxX + 1;
            pcxCanvas.height = pcx.header.maxY + 1;

            var canvasImageDataIndex = 0;

            for (var i =0; i < imageSize; i++) {
                var paletteIndex = (pcx.data[i] + 1) * 3;

                rawData[canvasImageDataIndex] = pcx.header.mainColorPallete[paletteIndex - 3];
                rawData[canvasImageDataIndex + 1] = pcx.header.mainColorPallete[paletteIndex - 2];
                rawData[canvasImageDataIndex + 2] = pcx.header.mainColorPallete[paletteIndex - 1];
                rawData[canvasImageDataIndex + 3] = 255;

                canvasImageDataIndex+=4;
            }

            if (Debugging.isDebug) {
                this.drawPcxImagePalette(pcx.header.mainColorPallete);
            }
            
            pcxCanvas.setAttribute("style", "border: 1px solid #000");
            context.putImageData(imageData, 0, 0);
            previewPane.appendChild(pcxCanvas);
        }

        private drawWalTexture(position: number, length: number) {
            let wal:Wal = this.extractor.getWalTexture(position, length);
            let previewPane = <HTMLElement>document.getElementById("previewPane");
            let walCanvas = <HTMLCanvasElement>document.createElement("canvas");
            var context =  <CanvasRenderingContext2D>walCanvas.getContext("2d");
            var imageData = <ImageData>context.createImageData(wal.header.width, wal.header.height);
            var rawData = <Uint8ClampedArray>imageData.data;
            var clampedWalData = Uint8ClampedArray.from(wal.data);

            var walSize = wal.header.width * wal.header.height * 3;

            Debugging.debug("Clamped wal data", clampedWalData);

            for (var i =0; i < walSize; i+=4) {
                rawData[i] = clampedWalData[i];
                rawData[i + 1] = clampedWalData[i + 1];
                rawData[i + 2] = clampedWalData[i + 2];
                rawData[i + 3] = 255; // zero alpha
            }

            walCanvas.setAttribute("style", "border: 1px solid #000");
            walCanvas.width = wal.header.width;
            walCanvas.height = wal.header.height;
            context.putImageData(imageData, 0, 0);

            previewPane.innerHTML = "";
            previewPane.appendChild(walCanvas);
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

        public saveAndDownladArchive() {
            this.setLogo(true);
            /* We need to wrap this call back to extractArchive
             * into a arrow function to preserve the context of
             * `this`. */
            this.extractor.saveAndDownladArchive(
                (data: any)=>{
                    this.setLogo(false);
                }
            );
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