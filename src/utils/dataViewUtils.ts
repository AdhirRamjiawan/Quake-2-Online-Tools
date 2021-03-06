export class DataViewUtils {
    constructor() {

    }

    public static getString(dataView: DataView, seekIndex: number, offset: number, littleEndian: boolean = true): string {
        let bufView: Uint8Array = new Uint8Array(dataView.buffer, seekIndex, offset);
        let numberArray: number[] = this.Uint8ArrayToNumberArray(bufView);
        let result = String.fromCharCode.apply(null, numberArray);
        return result;
    }

    public static getString16(dataView: DataView, seekIndex: number, offset: number, littleEndian: boolean = true): string {
        let bufView: Uint16Array = new Uint16Array(dataView.buffer, seekIndex, offset);
        let numberArray: number[] = this.Int16ArrayToNumberArray(bufView);
        let result = String.fromCharCode.apply(null, numberArray);
        return result;
    }

    public static Uint8ArrayToNumberArray(array: Uint8Array): number[] {
        let result: number[] = [];

        for (var index = 0; index < array.length; index++)
            result.push(array[index]);

        return result;
    }

    public static Int16ArrayToNumberArray(array: Int16Array): number[] {
        let result: number[] = [];

        for (var index = 0; index < array.length; index++)
            result.push(Math.abs(array[index]));

        return result;
    }

    public static getBinaryData(dataView: DataView, seekIndex: number, offset: number): Uint8Array {
        return new Uint8Array(dataView.buffer, seekIndex, offset);
    }

    public static getBinaryData16(dataView: DataView, seekIndex: number, offset: number): Int16Array {
        return new Int16Array(dataView.buffer, seekIndex, offset);
    }

    public static getFloat32(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getFloat32(seekIndex, littleEndian);
    }

    public static getFloat64(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getFloat64(seekIndex, littleEndian);
    }

    public static getInt32(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getInt32(seekIndex, littleEndian);
    }

    public static getUint32(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getUint32(seekIndex, littleEndian);
    }

    public static getInt16(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getInt16(seekIndex, littleEndian);
    }

    public static getUint8(
        dataView: DataView, seekIndex: number,
        littleEndian: boolean = true): number {
        return dataView.getUint8(seekIndex);
    }
}