import { Component } from '@angular/core';
import { getName } from './util';

@Component({
    templateUrl: './main.component.html',
    styleUrls: [ './main.component.css' ]
})
export class MainComponent {

    name = getName();
}