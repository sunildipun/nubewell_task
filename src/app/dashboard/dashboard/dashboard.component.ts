import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LoginService } from 'src/app/login/login.service';

const MINUTES_UNITL_AUTO_LOGOUT = 2; // in mins
const CHECK_INTERVAL = 2000; // in ms
const STORE_KEY =  'lastAction';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  interfacePanelForm: FormGroup;
  searchGrid: FormGroup;
  public token: any;
  public objectPanel: any;
  new = false;
  searchObject: any;

  protocols = ['tcp', 'udp', 'ip'];
  accesstype = ['permit', 'deny'];

  public getLastAction() {
    // tslint:disable-next-line:radix
    return parseInt(localStorage.getItem(STORE_KEY));
  }
 public setLastAction(lastAction: number) {
    localStorage.setItem(STORE_KEY, lastAction.toString());
  }

  constructor(private _fb: FormBuilder,
    private _router: Router,
    private _loginService: LoginService) { }

  ngOnInit() {
    this.buildForm();
    this.token = localStorage.getItem('token');
    // console.log(this.token);
    if (JSON.parse(localStorage.getItem('id'))) {
      this.objectPanel = JSON.parse(localStorage.getItem('id'));
      if (this.token === this.objectPanel.token) {
        this.new = true;
        console.log('true');
        this.getPanelForm();
      }
    }


    this.searchGrid.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(search => {
      search = search.toLowerCase();

      return this.searchObject.protocolArr.filter(itemObj => {
        return this.searchInArray(itemObj, search);
      });
    });


    this.check();
    this.initListener();
    this.initInterval();
    localStorage.setItem(STORE_KEY, Date.now().toString());
  }


  public buildForm() {
    this.interfacePanelForm = this._fb.group({
      protocolArr: this._fb.array([this.protocolFormArray()]),
    });

    this.searchGrid = this._fb.group({
      search: ['']
    });
  }

  public protocolFormArray(): FormGroup {
    return this._fb.group({
      protocol: [ 'tcp', Validators.required],
      // tslint:disable-next-line:max-line-length
      sourceIp: ['', [Validators.required, Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')]],
      // tslint:disable-next-line:max-line-length
      destinationIp: ['', [Validators.required, Validators.pattern('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$')]],
      accessType: ['', Validators.required]
    });
  }

  getPanelInfo(form) {
    return form.controls.protocolArr.controls;
  }

  public getPanelForm() {
    console.log(this.objectPanel.protocolArr);
    for (let i = 0; i < (this.objectPanel.protocolArr.length - 1); i++) {
      this.addPanel();
    }
    this.interfacePanelForm.patchValue(this.objectPanel);
  }

  logout(): void {
    console.log('Logout');
    const confir = confirm('Want tp lofout');
    if (confir) {
      this._loginService.logout();
      localStorage.removeItem('token');
      this._router.navigate(['/login']);
    }
  }

  public addPanel() {
    let panelArr = [];
    const panel = this.interfacePanelForm.get('protocolArr') as FormArray;
    panel.push(this.protocolFormArray());
    console.log('panel', panel);
    console.log(panel.value);

    if (this.new) {
      panelArr = this.objectPanel.protocolArr;
      panel.value.forEach(val => {
        if (val.protocol && val.sourceIp) {
          panelArr.push(val);
        }
      });
      const object = {
        token: this.token,
        protocolArr: panelArr
      };
      this.searchObject = object;
      localStorage.setItem('id', JSON.stringify(object));
      this.new = false;
    } else {
      panel.value.forEach(val => {
        if (val.protocol && val.sourceIp) {
          panelArr.push(val);
        }
      });
      const object = {
        token: this.token,
        protocolArr: panelArr
      };
      this.searchObject = object;
      localStorage.setItem('id', JSON.stringify(object));
    }
  }

  public removePanel(i) {
    const panel = this.interfacePanelForm.get('protocolArr') as FormArray;
    panel.removeAt(i);
    const removeItem = JSON.parse(localStorage.getItem('id'));
    removeItem.protocolArr.splice(i, 1);
    console.log(removeItem);
    localStorage.setItem('id', JSON.stringify(removeItem));
  }

  public searchInArray(arr, searchText): boolean {
    for (const value of arr) {
      if (typeof value === 'string') {
        if (this.searchInString(value, searchText)) {
          return true;
        }
      }
    }
  }

  public searchInString(value, searchText): any {
    return value.toLowerCase().includes(searchText);
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


    if (isTimeout)  {
      const conf = confirm(`You will be logged Out`);
      if (conf === true) {
        this._loginService.logout();
        this._router.navigate(['./login']);
      }
    }
  }

}
