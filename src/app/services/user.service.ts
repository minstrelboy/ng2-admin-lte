import { User } from '../models/user';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Router } from '@angular/router';

import { Http, HttpModule, Headers, Response } from "@angular/http";
import { LoginModel } from '../models/loginmodel';
import { SysConfig } from './SysConfig';
import 'rxjs/add/operator/map';
import { JwtHelper } from 'angular2-jwt';
import { AuthHttp } from './AuthHttp';


@Injectable()
export class UserService {
    public currentUser: ReplaySubject<User> = new ReplaySubject<User>( 1 );

    constructor(
      private router: Router,private http:Http,private authhttp:AuthHttp
    ) {
      // TODO
    }

    private jwtHelper:JwtHelper = new JwtHelper();

    public login(loginmodel: LoginModel): Observable<boolean> {
        let myHeaders = new Headers();
        myHeaders.append('Accept', '*/*');
        myHeaders.append('Cache-Control', 'no-cache');
        myHeaders.append('Content-Type', 'application/json');
        myHeaders.append('X-Requested-With', 'XMLHttpRequest');
        return this.http.post(SysConfig.LoginServerAddress + ":" + SysConfig.LoginPort + "/api/auth/login", loginmodel, { headers: myHeaders })
            .map((resp: Response) => {
                console.debug(resp.json());
                let token = resp.json() && resp.json().token;
                let refreshtoken = resp.json() && resp.json().refreshToken;
                if (token) {
                    sessionStorage.setItem("token",token)
                    sessionStorage.setItem("refreshtoken",refreshtoken);
                    return true;
                } else {
                    return false;
                }
            });//.catch((error:any)=> Observable.throw(error.json().error || ''));
    }

    public getUserInfoFromToken(token:string):User{
        let simpleuser = this.jwtHelper.decodeToken(token);
        let user = new User();
        user.userid = simpleuser.sub;
        user.username = simpleuser.name;
        user.dept = simpleuser.dept;
        user.roles = simpleuser.scopes;
        user.avatarUrl= 'public/assets/img/user2-160x160.jpg';
        user.realname = "Neo";
        user.connected = false;
        return user;
    }

    public getMe():any{
        let url = SysConfig.getUrl("/api/me");
        console.debug(url);
        this.authhttp.get(url).map((resp:Response)=>{
            console.log(resp);
            return resp;
        }).subscribe(result=>{
            return result;
        });
        return "";
    }

    public isTokenExpired(token:string):boolean{
      return this.jwtHelper.isTokenExpired(token);
    }

    public setCurrentUser( user: User ) {
      this.currentUser.next( user );
    }

    public logout() {
      let user = new User();
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("refreshtoken");
      this.setCurrentUser( user );
      this.router.navigate(['login']);
    }
}
