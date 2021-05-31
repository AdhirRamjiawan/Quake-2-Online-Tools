import { Component, OnInit } from '@angular/core';
import { PakExtractorService } from './pak-extractor-service.service';
import { Debugging } from './utils/debugging';
import { Md2 } from './pak/formats/md2';
import { Pcx } from './pak/formats/pcx';
import { Wal } from './pak/formats/wal';
import { Wav } from './pak/formats/wav';
import { DataViewUtils } from './utils/dataViewUtils';

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

@Component({
  selector: 'app-pak-extractor',
  templateUrl: './pak-extractor.component.html',
  styleUrls: ['./pak-extractor.component.scss']
})
export class PakExtractorComponent implements OnInit {
  filteredLumps: IUiLump[] = [];
  summaryStats: IUiSummaryStats[] = [];
  paginationSize: number = 0;
  globalArchive: any;
  lumpTablePaginationStartIndex: any;

  constructor(private pakExtractor: PakExtractorService) { }

  ngOnInit(): void {
  }

  setPakFile(event: Event): void {
    this.pakExtractor.setPakFile(event);
  }

  extractArchive() : void {
    this.setLogo(true);
    /* We need to wrap this call back to extractArchive
     * into a arrow function to preserve the context of
     * `this`. */
    this.pakExtractor.extractArchive((data: any) => {
      this.displayArchive(data);
      this.setLogo(false);
    });
  }

  saveAndDownloadArchive() : void {
    this.saveAndDownloadArchive();
  }

  search(): void {
    this.setLogo(true);
    let searchTerm = <HTMLInputElement>document.getElementById("searchTerm");
    this.filteredLumps = [];

    console.log("searching: [" + searchTerm.value + "]");

    if (searchTerm.value.trim() === "") {
        this.filteredLumps = this.globalArchive.lumps;
    } else {
        for (var i = 0; i < this.globalArchive.lumps.length; i++) {
            if (this.globalArchive.lumps[i].name.indexOf(searchTerm.value) > -1)
                this.filteredLumps.push(this.globalArchive.lumps[i]);
        }
    }

    this.loadArchivePage(0);
    this.displayPaginationButtons();
    this.setLogo(false);
  }

  updatePageSize() : void {
    let pageSize = <HTMLInputElement>document.getElementById("pageSize");
    this.paginationSize = parseInt(pageSize.value);
  }

  private getFileExtension(lumpPath: String): string {
    var extension = '';

    for (var i = lumpPath.length - 1; i > 0; i--) {
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

private setLogo(isLoading: boolean) {
  Debugging.debug("setting logo: " + isLoading);
  var logo: HTMLImageElement = <HTMLImageElement>document.getElementById("logo");

  if (isLoading) {
      logo.src = "img/loading.gif";
  } else {
      logo.src = "img/logo-gray.png";
  }
}

private resetUiState() {
    this.filteredLumps = new Array<IUiLump>();
    this.summaryStats = new Array<IUiSummaryStats>();
}

public displayArchive(archive: any) {
    this.resetUiState();
    this.globalArchive = archive;

    for (var i = 0; i < archive.lumps.length; i++) {
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

    for (let i = this.lumpTablePaginationStartIndex; i < this.lumpTablePaginationStartIndex + 3; i++) {
        paginationButtonListMarkup += this.createPaginationButton(i);
    }

    for (let i = 0; i < 3; i++) {
        paginationButtonListMarkup += "<span> . </span>";
    }

    for (let i = numberOfButtons - 3; i < numberOfButtons; i++) {
        paginationButtonListMarkup += this.createPaginationButton(Math.floor(i));
    }

    paginationButtonListMarkup += '<button onclick="pakUi.progressLumpTablePaginationStartIndex()">&gt;&gt;</button>';

    paginationButtonList.innerHTML = paginationButtonListMarkup;
    paginationButtonList2.innerHTML = paginationButtonListMarkup;
}

private getDistinct(list: Array<IUiSummaryStats>): Array<IUiSummaryStats> {
    let distinctList = new Array<IUiSummaryStats>();

    for (var i = 0; i < list.length; i++) {
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
        var data = this.pakExtractor.extractSpecificLumpAsString(lump.position, lump.length);
        previewPane.innerHTML = '<textarea readonly>{0}</textarea>'
            .replace("{0}", data);
    } else if (lump.fileExtension === "wav") {
        //let data = this.pakExtractor.extractSpecificLumpAsBinary(lump.position, lump.length);
        this.playSound(lump.position, lump.length);
    } else if (lump.fileExtension === "wal") {
        this.drawWalTexture(lump.position, lump.length);
    } else if (lump.fileExtension === "pcx") {
        this.drawPcxImage(lump.position, lump.length);
    } else if (lump.fileExtension === "md2") {
        //this.drawMd2Model(lump.position, lump.length);
        this.drawMd2Model3JS(lump.position, lump.length);
    }

    this.setLogo(false);
}

public downloadFile(filteredLumpIndex: number) {
    let lump = this.filteredLumps[filteredLumpIndex];
    let lumpData = this.pakExtractor.extractSpecificLumpAsBinary(lump.position, lump.length);
    let dataUri: string = URL.createObjectURL(new Blob([lumpData], { type: 'application/text' }));
    window.open(dataUri, "_blank");
    URL.revokeObjectURL(dataUri);
}

public onChangeLumpAction(filteredLumpIndex: number, select: HTMLSelectElement) {
    var action: string = select.value;

    if (action === 'download') {
        this.downloadFile(filteredLumpIndex);
    } else if (action === 'preview') {
        this.previewFile(filteredLumpIndex);
    } else if (action === 'delete') {
        alert('Not implemented!');
    }

    select.selectedIndex = 0;
}

private drawMd2Model3JS(position: number, length: number) {
   /* let md2: Md2 = this.pakExtractor.getMd2Model(position, length);

    // draw model using WebGL
    let previewPane = <HTMLElement>document.getElementById("previewPane");
    let modelCanvas: HTMLCanvasElement;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( 500, 500);

    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    var animate = function () {
        requestAnimationFrame( animate );

        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;

        renderer.render( scene, camera );
    };

    animate();
    previewPane.innerHTML = "";
    previewPane.appendChild(renderer.domElement);
*/
}

private drawMd2Model(position: number, length: number, recreateCanvas: boolean = true) {
   /* let md2: Md2 = this.pakExtractor.getMd2Model(position, length);

    // draw model using WebGL
    let previewPane = <HTMLElement>document.getElementById("previewPane");
    let modelCanvas: HTMLCanvasElement;
    let _this = this;

    if (recreateCanvas) {
        modelCanvas = <HTMLCanvasElement>document.createElement("canvas");
        modelCanvas.id = "modelCanvas";
        previewPane.innerHTML = "";
        modelCanvas.setAttribute("style", "border: 1px solid #000");

        let zoomPlusButton = <HTMLButtonElement>document.createElement("button");
        let zoomMinusButton = <HTMLButtonElement>document.createElement("button");


        zoomPlusButton.onclick = function (event) {
            _this.modelScale += 2.25;
            _this.drawMd2Model(position, length, false);
        };

        zoomMinusButton.onclick = function (event) {
            _this.modelScale -= 2.25;
            _this.drawMd2Model(position, length, false);
        };

        modelCanvas.width = 400;
        modelCanvas.height = 400;

        previewPane.appendChild(zoomPlusButton);
        previewPane.appendChild(zoomMinusButton);
        previewPane.appendChild(modelCanvas);


    } else {
        modelCanvas = <HTMLCanvasElement>document.getElementById("modelCanvas");
    }

    var gl: WebGLRenderingContext =
        <WebGLRenderingContext>modelCanvas.getContext("webgl") ||
        modelCanvas.getContext("experimental-webgl");

    var vertex_buffer = gl.createBuffer();
*/
    /*var vertices = [
        -0.5,0.5,0.0,
        0.0,0.5,0.0,
        -0.25,0.25,0.0, 
     ];*/

    /*var vertices = [
       0.75,0.75,0.0,
       0.0,0.75,0.0,
       0.91,0.91,0.0, 
    ];*/
/*
    var vertices = md2.frames[0].toArray(_this.modelScale);


    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var vertCode =
        'attribute vec3 coordinates;' +

        'void main(void) {' +
        ' gl_Position = vec4(coordinates, 1.0);' +
        'gl_PointSize = 2.0;' +
        '}';

    var vertShader = <WebGLShader>gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertShader, vertCode);
    gl.compileShader(vertShader);

    var fragCode =
        'void main(void) {' +
        ' gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);' +
        '}';

    var fragShader = <WebGLShader>gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, fragCode);
    gl.compileShader(fragShader);

    var shaderProgram = <WebGLProgram>gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);


    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, modelCanvas.width, modelCanvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, md2.header.counts.trisCount);

*/
}


private drawPcxImagePalette(data: Uint8Array) {
    var dataLength = data.length;
    let previewPane = <HTMLElement>document.getElementById("previewPane");
    let paletteCanvas = <HTMLCanvasElement>document.createElement("canvas");
    var context = <CanvasRenderingContext2D>paletteCanvas.getContext("2d");
    var imageData = <ImageData>context.createImageData(200, 200);
    var rawData = <Uint8ClampedArray>imageData.data;

    for (var i = 0; i < dataLength; i += 4) {
        rawData[i] = data[i];
        rawData[i + 1] = data[i + 1];
        rawData[i + 2] = data[i + 2];
        rawData[i + 3] = 255;
    }

    paletteCanvas.setAttribute("style", "border: 1px solid #000");
    context.putImageData(imageData, 0, 0);


    // just to make the palette more visible.
    for (var i = 0; i < 100; i++) {
        context.putImageData(context.getImageData(0, 0, 200, 2), 0, 2 + (i + 1));
    }

    previewPane.appendChild(paletteCanvas);
}

private drawPcxImage(position: number, length: number) {
    let pcx: Pcx = this.pakExtractor.getPcxImage(position, length);
    let previewPane = <HTMLElement>document.getElementById("previewPane");
    let pcxCanvas = <HTMLCanvasElement>document.createElement("canvas");
    var context = <CanvasRenderingContext2D>pcxCanvas.getContext("2d");
    var imageData = <ImageData>context.createImageData(pcx.header.maxX + 1, pcx.header.maxY + 1);
    var rawData = <Uint8ClampedArray>imageData.data;

    previewPane.innerHTML = "";

    var renderedImage = [];
    var imageSize = ((pcx.header.maxX + 1) * (pcx.header.maxY + 1));

    pcxCanvas.width = pcx.header.maxX + 1;
    pcxCanvas.height = pcx.header.maxY + 1;

    var canvasImageDataIndex = 0;

    /* Need to maintain a separate index for the canvas image
    *  else you will find that the image will appear smaller
    *  and be repeated. */

    for (var i = 0; i < imageSize; i++) {
        // To get the correct triplet, use multiple of 3's
        var paletteIndex = (pcx.data[i] + 1) * 3;

        /* Since we got the highest index in the relevant triplet
        *  we have to calculate as follows:
        *  R component will be -3, 
        *  G component will be -2,
        *  B component will be -1 */
        rawData[canvasImageDataIndex] = pcx.header.mainColorPallete[paletteIndex - 3];
        rawData[canvasImageDataIndex + 1] = pcx.header.mainColorPallete[paletteIndex - 2];
        rawData[canvasImageDataIndex + 2] = pcx.header.mainColorPallete[paletteIndex - 1];
        rawData[canvasImageDataIndex + 3] = 255;

        canvasImageDataIndex += 4;
    }

    if (Debugging.isDebug) {
        this.drawPcxImagePalette(pcx.header.mainColorPallete);
    }

    pcxCanvas.setAttribute("style", "border: 1px solid #000");
    context.putImageData(imageData, 0, 0);
    previewPane.appendChild(pcxCanvas);
}

private drawWalTexture(position: number, length: number) {
    let wal: Wal = this.pakExtractor.getWalTexture(position, length);
    let previewPane = <HTMLElement>document.getElementById("previewPane");
    let walCanvas = <HTMLCanvasElement>document.createElement("canvas");
    var context = <CanvasRenderingContext2D>walCanvas.getContext("2d");
    var imageData = <ImageData>context.createImageData(wal.header.width, wal.header.height);
    var rawData = <Uint8ClampedArray>imageData.data;
    var walSize = wal.header.width * wal.header.height;
    var colorMap: Pcx = this.pakExtractor.getPcxImage(
        this.pakExtractor.archive.colorMap.position,
        this.pakExtractor.archive.colorMap.length);

    walCanvas.width = wal.header.width;
    walCanvas.height = wal.header.height;

    /* Need to maintain a separate index for the canvas image
    *  else you will find that the image will appear smaller
    *  and be repeated. */
    var canvasImageDataIndex = 0;

    for (var i = 0; i < walSize; i++) {
        // To get the correct triplet, use multiple of 3's
        var paletteIndex = (wal.data[i] + 1) * 3;

        /* Since we got the highest index in the relevant triplet
        *  we have to calculate as follows:
        *  R component will be -3, 
        *  G component will be -2,
        *  B component will be -1 */

        /* Dont use the image data itself but use the main color palette on 
         * on the PCX file pic/colormap.pcx */
        rawData[canvasImageDataIndex] = colorMap.header.mainColorPallete[paletteIndex - 3];
        rawData[canvasImageDataIndex + 1] = colorMap.header.mainColorPallete[paletteIndex - 2];
        rawData[canvasImageDataIndex + 2] = colorMap.header.mainColorPallete[paletteIndex - 1];
        rawData[canvasImageDataIndex + 3] = 255; // zero alpha

        canvasImageDataIndex += 4;
    }

    walCanvas.setAttribute("style", "border: 1px solid #000");
    context.putImageData(imageData, 0, 0);

    previewPane.innerHTML = "";
    previewPane.appendChild(walCanvas);
}

// need to document this playing of sound well.
private playSound(position: number, length: number) {
    let wav: Wav = this.pakExtractor.getWavSound(position, length);
    var context = new AudioContext();

    var frameCount = wav.dataSubChunk.subChunk2Size
        / (wav.fmtSubChunk.numChannels
            * wav.fmtSubChunk.blockAlign);

    var maxAmplitude = 0;
    Debugging.debug("wav.fmtSubChunk.bitsPerSample", wav.fmtSubChunk.bitsPerSample);
    

    var buffer = context.createBuffer(
        wav.fmtSubChunk.numChannels,
        frameCount,
        wav.fmtSubChunk.sampleRate);

    var currentBufferedData = buffer.getChannelData(0);

    // need the max amplitude to normal sound data between 0..1
    if (wav.fmtSubChunk.bitsPerSample === 8) {
        maxAmplitude = Math.max(...DataViewUtils.Uint8ArrayToNumberArray(wav.dataSubChunk.data));
        Debugging.debug("maxAmplitude", maxAmplitude);

        for (var i = 0; i < frameCount; i++) {
            currentBufferedData[i] =
                (wav.dataSubChunk.data[i] / maxAmplitude);
        }
    } else if (wav.fmtSubChunk.bitsPerSample === 16) {
        // need the max amplitude to normal sound data between 0..1
        maxAmplitude = Math.max(...DataViewUtils.Int16ArrayToNumberArray(wav.dataSubChunk.data16));
        Debugging.debug("maxAmplitude", maxAmplitude);

        for (var i = 0; i < frameCount; i++) {
            currentBufferedData[i] =
                (wav.dataSubChunk.data16[i] / maxAmplitude);
        }
    }

    var bufferSource = context.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(context.destination);
    bufferSource.start();
}

private createLumpActionSelect(filteredLumpIndex: number) {
    var select = '<select onchange="pakUi.onChangeLumpAction(' + filteredLumpIndex + ', this)">';

    select += '<option value="">-- Select Action --</option>';
    select += '<option value="preview">Preview</option>';
    select += '<option value="download">Download</option>';
    select += '<option value="delete">Delete</option>';

    select += '</select>';

    return select;
}

private createTableRow(...args: any[]) {
    var markup = "";
    for (var a = 0; a < args.length; a++) {
        markup += this.createTableColumn(args[a]);
    }
    return "<tr>" + markup + "</tr>";
}

private createTableColumn(data: string) {
    return "<td>" + data + "</td>";
}

private createPaginationButton(pageNumber: number) {
    return '<button onclick="pakUi.loadArchivePage(' + pageNumber + ')">' + (pageNumber + 1) + '</button>';
}

public saveAndDownladArchive() {
    this.setLogo(true);
    /* We need to wrap this call back to extractArchive
     * into a arrow function to preserve the context of
     * `this`. */
    this.pakExtractor.saveAndDownladArchive(
        (data: any) => {
            this.setLogo(false);
        }
    );
}


public showToolTab(tab: string, element: HTMLElement) {
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
