module Quake2Tools {

    export class WalHeader {
        public name: string = '';
        public width: number = 0;
        public height: number = 0;
        public offset: Array<number>;
        public nextName: string = '';
        public flags: number = 0;
        public contents: number = 0;
        public value: number = 0;

        constructor() {
            this.offset = [];
        }
    }


    export class Wal {
        public header: WalHeader;
        public data: Uint8Array;

        constructor() {
            this.header = new WalHeader();
            this.data = new Uint8Array(0);
        }
    }
}