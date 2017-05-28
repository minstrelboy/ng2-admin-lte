import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../../models/user';
import { LoginModel } from '../../models/loginmodel';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  private error = '';

  private loginmodel: LoginModel = new LoginModel();

  constructor(
    private userServ: UserService,
    private router: Router
  ) {
  }

  public ngOnInit() {
    window.dispatchEvent(new Event('resize'));
    let token = sessionStorage.getItem("refreshtoken");
    if (token) {
      if (this.userServ.isTokenExpired(token)) {
        return;
      }
      this.error = '';
      let user = this.userServ.getUserInfoFromToken(token);
      user.connected = true;
      this.userServ.setCurrentUser(user);
      this.userServ.getMe();
      this.router.navigate(['/home']);
    }
  }

  private login() {
    this.userServ.login(this.loginmodel).subscribe(result => {
      if (result === true) {
        let token = sessionStorage.getItem("refreshtoken");
        this.error = '';
        let user = this.userServ.getUserInfoFromToken(token);
        user.connected = true;
        this.userServ.setCurrentUser(user);
        this.userServ.getMe();
        this.router.navigate(['/home']);
      } else {
        this.error = "用户名或者密码不正确!";
        // je recupere l'erreur du php
        // et on le place dans un label, ou un toaster
      }

    },
      error => this.error = "用户名或者密码不正确!");
  }


}
