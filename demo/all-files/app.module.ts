import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouterModule } from './app-router.module';
import { AppComponent } from './app.component';
import { MainComponent } from './main.component';
import { StyleComponent } from './external/style.component';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRouterModule
    ],
    declarations: [
        AppComponent,
        MainComponent,
        StyleComponent
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}