import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  returnUrl: any;

  loginData = [
    {name: 'admin' , password: 'admin'},
    {name: 'admin1', password: 'admin1'},
    {name: 'admin2', password: 'admin2'},
    {name: 'admin3', password: 'admin3'}
  ];

  constructor(private _fb: FormBuilder,
              private _router: Router,
              private _loginService: LoginService) { }

  ngOnInit() {
    this.buildForm();
    this.returnUrl = '/dashboard';
    // this._loginService.logout();
  }

  public buildForm() {
    this.loginForm = this._fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  public login() {

    this.loginData.forEach(res => {

      if (res.name === this.loginForm.value.email && res.password === this.loginForm.value.password) {
        console.log('Login', this.loginForm.value);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('token', this.loginForm.value.email);
        this._router.navigate([this.returnUrl]);
      }
    });

  }

}
