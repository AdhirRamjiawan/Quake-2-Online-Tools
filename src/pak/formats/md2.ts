module Quake2Tools {

    export class Md2Counts {
        public skinCount:number=0;
        public verticesCount:number = 0;
        public textCoordCount:number = 0;
        public trisCount:number = 0;
        public glCmdCount:number = 0;
        public frameCount:number =0;
    }

    export class Md2Offsets {
        public skinOffet:number = 0;
        public textCoordCount:number = 0;
        public trisOffset:number = 0;
        public frameOffset:number = 0;
        public glCmdOffset:number =0;
        public eofOffset:number =0;
    }

    export class Md2Header {
        public id:number = 0;
        public version:number = 0;
        public textWidth:number =0;
        public textHeight:number =0;
        public frameSize:number = 0;
        public counts:Md2Counts = new Md2Counts();
        public offsets:Md2Offsets = new Md2Offsets();
    }

    // should actually be 
    export class Md2Vector3 {
        public x: number = 0;
        public y: number = 0;
        public z: number = 0;
        public normalIndex:number = 0;

        constructor(x:number, y: number, z:number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }

    export class Md2TextureCoord {
        public x: number = 0;
        public y: number = 0;
    }

    export class Md2Triangle {
        public vertex:Md2Vector3 = new Md2Vector3(0,0,0);
        public textureCoord:Md2Vector3 = new Md2Vector3(0,0,0);
    }

    export class Md2Frame {
        public scale:Md2Vector3 = new Md2Vector3(0,0,0);
        public translate:Md2Vector3 = new Md2Vector3(0,0,0);
        public name: string = "";
        public vertices:Array<Md2Vector3> = new Array<Md2Vector3>();
    }

    export class Md2 {
        public header: Md2Header = new Md2Header();
        public frames:Array<Md2Frame> = new Array<Md2Frame>();
        public glCmds:Array<number> = new Array<number>();
        public skinTexture: string = "";

    }
}