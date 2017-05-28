export class SysConfig {
    public static LoginServerAddress:string = 'http://localhost';
    public static LoginPort:string = '9966';
    public static DataServerAddress:string = "http://localhost";
    public static DataServerPort:string = "9966";
    public static getUrl(path:string):string {
        return this.DataServerAddress + ":" + this.DataServerPort + path;
    }
}