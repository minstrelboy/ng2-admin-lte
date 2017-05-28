export class User {
    public userid:number;
    public username:string;
    public realname:string;
    public dept:number;
    public roles:Array<string> = [];
    public avatarUrl:string;
    public connected:boolean;

    public constructor( data: any = {}) {
        
    }

    public getName() {
        return this.realname;
    }
}
