import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Http, Headers, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response, HttpModule } from "@angular/http";
import { JwtHelper } from "angular2-jwt";
import { SysConfig } from "./SysConfig";



@Injectable()
export class AuthHttp {
    public static DEFAULT_HEAD_AUTHORIZATION = "X-Authorization";
    public static HEAD_PREFIX_BEARER = 'Bearer ';
    public static HEAD_CACHE_CONTROL = "no cache";

    constructor(private http: Http) {
    }

    private getHeader(token: string):Headers {
        let header = new Headers();
        header.append(AuthHttp.DEFAULT_HEAD_AUTHORIZATION, AuthHttp.HEAD_PREFIX_BEARER + token);
        header.append("Cache-Control", AuthHttp.HEAD_CACHE_CONTROL);
        return header;
    }
    
    //刷新Token
    private refreshToken():Observable<boolean>{
        let refreshtoken = sessionStorage.getItem('refreshtoken');
        let header = this.getHeader(refreshtoken);
        let url = SysConfig.LoginServerAddress + ":" + SysConfig.LoginPort + "/api/auth/token";
        return this.http.get(url,{headers:header}).map((resp:Response)=>{
            let token = resp.json && resp.json().token;
            if(token){
                sessionStorage.setItem('token',token);
                return true;
            }
            return false;
        });
    }

    //计算第一个时间-第二个时间的秒数
    private calcDistanceTime(d1:Date,d2:Date):number{
        let d1m = d1.getTime();
        let d2m = d2.getTime();
        return Math.round((d1m-d2m)/1000);
    }

    private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions?: RequestOptionsArgs): Observable<Response> {
        let helper = new JwtHelper();
        let refreshtoken = sessionStorage.getItem('refreshtoken');
        if(helper.isTokenExpired(refreshtoken)){ //refreshtoken Expired 
            throw new Error("refresh token is Expired!");
        }
        
        let token = sessionStorage.getItem('token');
        if(helper.isTokenExpired(token)){
            throw new Error("token is Expired!");
        }
        let tokenexpried = helper.getTokenExpirationDate(token);
        let dis = this.calcDistanceTime(tokenexpried,(new Date()));
        if(dis < 1800)
        {
            this.refreshToken().subscribe(result=>{
                if (result) {
                    token = sessionStorage.getItem('token');     
                }else{
                    throw new Error("get refresh token fail!");
                }
            });
        }
                
        requestArgs.headers = this.getHeader(token);
        let options = new RequestOptions(requestArgs);
        if(additionalOptions){
            options = options.merge(additionalOptions);   
        }
        return this.http.request(new Request(options));
    }

    public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        let req =this.requestHelper({ body: '', method: RequestMethod.Get, url: url }, options);
        return req;
    }

    public post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Post, url: url }, options);
    }

    public put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Put, url: url }, options);
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Delete, url: url }, options);
    }

    public patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: body, method: RequestMethod.Patch, url: url }, options);
    }

    public head(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Head, url: url }, options);
    }

    public options(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.requestHelper({ body: '', method: RequestMethod.Options, url: url }, options);
    }

}