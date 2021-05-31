import { DataViewUtils } from "../../utils/dataViewUtils"
import { Md2 } from "../formats/md2"
import { Debugging } from "../../utils/debugging"
import { Md2Header, Md2TextureCoord, Md2Triangle, Md2Frame, Md2Vector3 } from "../formats/md2"

export class Md2Extractor {

    // header value should be 844121161 (IDP2)
    private MD2_HEADER: number = (('2'.charCodeAt(0) << 24) + ('P'.charCodeAt(0) << 16) + ('D'.charCodeAt(0) << 8) + 'I'.charCodeAt(0));

    private seekIndex: number = 0;

    public dataView: DataView = new DataView(new ArrayBuffer(0));
    public position: number = 0;
    public length: number = 0;

    constructor() {

    }

    public extract(): Md2 {
        let result: Md2 = new Md2();
        this.seekIndex = this.position;

        result.header = this.extractHeader();
        result.skins = this.extractSkins(result.header);
        result.textureCoords = this.extractTextureCoords(result.header);
        result.tris = this.extractTris(result.header);
        result.glCmds = this.extractGlCommands(result.header);
        result.frames = this.extractFrames(result.header);

        Debugging.debug("MD2 data", result);

        return result;
    }

    private extractSkins(header: Md2Header): Array<string> {
        let result: Array<string> = [];

        return result;
    }

    private extractTextureCoords(header: Md2Header): Array<Md2TextureCoord> {
        let result: Array<Md2TextureCoord> = [];

        return result;
    }

    private extractTris(header: Md2Header): Array<Md2Triangle> {
        let result: Array<Md2Triangle> = [];

        return result;
    }


    private extractGlCommands(header: Md2Header): Array<number> {
        let result: Array<number> = [];

        this.seekIndex = header.offsets.glCmdOffset;

        for (var i = 0; i < header.counts.glCmdCount; i++) {
            result.push(DataViewUtils.getInt32(this.dataView, this.seekIndex));
            this.seekIndex += 4;
        }

        return result;
    }

    private extractFrames(header: Md2Header): Array<Md2Frame> {
        let result: Array<Md2Frame> = new Array<Md2Frame>();

        this.seekIndex = header.offsets.frameOffset;

        for (var i = 0; i < header.counts.frameCount; i++) {
            let frame: Md2Frame = new Md2Frame();

            // scale
            Debugging.debug("scale", this.seekIndex);
            frame.scale.x = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            frame.scale.y = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            frame.scale.z = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            // translate
            Debugging.debug("translate", this.seekIndex);
            frame.translate.x = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            frame.translate.y = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            frame.translate.z = DataViewUtils.getFloat32(this.dataView, this.seekIndex);
            this.seekIndex += 4;

            // name
            Debugging.debug("name", this.seekIndex);
            frame.name = DataViewUtils.getString(this.dataView, this.seekIndex, 16);
            this.seekIndex += 16;

            // vertices
            for (var v = 0; v < header.counts.verticesCount; v++) {
                var vertex: Md2Vector3 = new Md2Vector3(0, 0, 0);

                vertex.x = DataViewUtils.getUint8(this.dataView, this.seekIndex);
                this.seekIndex += 1;

                vertex.y = DataViewUtils.getUint8(this.dataView, this.seekIndex);
                this.seekIndex += 1;

                vertex.z = DataViewUtils.getUint8(this.dataView, this.seekIndex);
                this.seekIndex += 1;

                frame.vertices.push(vertex);
            }

            result.push(frame);
        }

        return result;
    }

    private extractHeader(): Md2Header {
        let result: Md2Header = new Md2Header();

        result.id = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        // TODO: perform id validation using magic number in the header.

        result.version = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.textWidth = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.textHeight = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.frameSize = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.skinCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.verticesCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.textCoordCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.trisCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.glCmdCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.counts.frameCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.skinOffet = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.textCoordCount = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.trisOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.frameOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.glCmdOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        result.offsets.eofOffset = DataViewUtils.getInt32(this.dataView, this.seekIndex);
        this.seekIndex += 4;

        return result;
    }
}