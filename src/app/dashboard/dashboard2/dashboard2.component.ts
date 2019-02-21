import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';
import { TouchSequence } from 'selenium-webdriver';

const MINUTES_UNITL_AUTO_LOGOUT = 2; // in mins
const CHECK_INTERVAL = 2000; // in ms
const STORE_KEY = 'lastAction';

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.scss']
})
export class Dashboard2Component implements OnInit {

  interfacePanelForm: FormGroup;
  searchGrid: FormGroup;
  public token: any;
  public objectPanel: any;
  new = false;
  searchObject: any;
  proArray = [];
  pagination = [1];

  protocols = ['tcp', 'udp', 'ip'];
  accesstype = ['permit', 'deny'];
  getItem: any;

  public getLastAction() {
    // tslint:disable-next-line:radix
    return parseInt(localStorage.getItem(STORE_KEY));
  }
  public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _loginService: LoginService
  ) { }

  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.buildForm();

    this.check();
    this.initListener();
    this.initInterval();
    localStorage.setItem(STORE_KEY, Date.now().toString());

    this.getItem = JSON.parse(localStorage.getItem('id'));
    console.log(this.getItem);
    if (this.getItem.protocolArr.length > 0) {
      this.proArray = this.getItem.protocolArr;
    }
  }

  public buildForm() {
    this.interfacePanelForm = this._fb.group({
      protocol: ['tcp', Validators.required],
      // tslint:disable-next-line:max-line-length
      sourceIp: ['', [Validators.required, Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')]],
      // tslint:disable-next-line:max-line-length
      destinationIp: ['', [Validators.required, Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')]],
      accessType: ['', Validators.required]
    });

    this.searchGrid = this._fb.group({
      search: ['']
    });
  }

  public logout(): void {
    console.log('Logout');
    const confir = confirm('Want t0 logout');
    if (confir) {
      this._loginService.logout();
      localStorage.removeItem('token');
      this._router.navigate(['/login']);
    }
  }

  public addPanel() {

    if (this.proArray.length > 2) {
      const arr = this.proArray;
      console.log(arr);
      this.proArray = [];
      console.log(this.interfacePanelForm.value);
      this.proArray.unshift(this.interfacePanelForm.value);
      const object = {
        token: this.token,
        protocolArr: arr,
      };
      // this.searchObject = object;
      localStorage.setItem('id', JSON.stringify(object));
      this.interfacePanelForm.reset();
    } else {
      console.log(this.interfacePanelForm.value);
      this.proArray.unshift(this.interfacePanelForm.value);
      const object = {
        token: this.token,
        protocolArr: this.proArray,
      };
      // this.searchObject = object;
      localStorage.setItem('id', JSON.stringify(object));
      this.interfacePanelForm.reset();
    }
  }


  initListener() {
    document.body.addEventListener('click', () => this.reset());
    document.body.addEventListener('mouseover', () => this.reset());
    document.body.addEventListener('mouseout', () => this.reset());
  }

  public reset() {
    // console.log('INside rst');
    this.setLastAction(Date.now());
  }

  public removePanel(i) {
    this.proArray.splice(i, 1);
    const removeItem = JSON.parse(localStorage.getItem('id'));
    removeItem.protocolArr.splice(i, 1);
    console.log(removeItem);
    localStorage.setItem('id', JSON.stringify(removeItem));
  }

  public initInterval() {
    setInterval(() => {
      this.check();
    }, CHECK_INTERVAL);
  }

  public check() {
    const now = Date.now();
    const timeleft = this.getLastAction() + MINUTES_UNITL_AUTO_LOGOUT * 60 * 1000;
    const diff = timeleft - now;
    const isTimeout = diff < 0;
    const isTimeOut = diff < 40;

    console.log(isTimeout);

    if (isTimeout) {
      const conf = confirm(`You will be logged Out`);
      if (conf === true) {
        this._loginService.logout();
        this._router.navigate(['./login']);
      }
    }
  }

}
