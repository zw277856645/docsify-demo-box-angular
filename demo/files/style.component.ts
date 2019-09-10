import { Component } from '@angular/core';

@Component({
    selector: 'style-ele',
    templateUrl: './style.component.html',
    styleUrls: [ 'style.component.css' ]
})
export class StyleComponent {

    list = [ { age: 1 }, { age: 2 }, { age: 3 } ];
}