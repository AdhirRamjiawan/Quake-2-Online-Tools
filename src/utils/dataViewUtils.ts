module Quake2Tools {
    export class DataViewUtils {
        constructor() {

        }

        public static getString(dataView: DataView, seekIndex:number, offset: number, littleEndian: boolean = true) : string {
            let bufView:Uint8Array = new Uint8Array(dataView.buffer, seekIndex, offset);
            let numberArray: number[] = this.Uint8ArrayToNumberArray(bufView);
            let result = String.fromCharCode.apply(null, numberArray);
            return result;
        }

        public static Uint8ArrayToNumberArray(array:Uint8Array) : number[]{
            let result : number[] = [];

            for (var index = 0; index < array.length; index++)
                result.push(array[index]);

            return result;
        }

        public static getBinaryData(dataView:DataView, seekIndex: number, offset: number) : Uint8Array {
            return new Uint8Array(dataView.buffer, seekIndex, offset);
        }

        public static getInt32(
            dataView: DataView, seekIndex:number, 
            littleEndian: boolean = true) :number {
            return dataView.getInt32(seekIndex, littleEndian);
        }

        public static getInt16(
            dataView: DataView, seekIndex:number, 
            littleEndian: boolean = true) :number {
            return dataView.getInt16(seekIndex, littleEndian);
        }
    }
}