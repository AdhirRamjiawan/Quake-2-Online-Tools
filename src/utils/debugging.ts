module Quake2Tools {
    export class Debugging {
        public static isDebug:boolean;

        public static debug(...args:any[]) {
            if (Debugging.isDebug) {
                var data = [];
                for (var i =0; i < args.length; i++)
                    data.push(args[i]);
                    
                console.log(data);
            }
        }
    }
}