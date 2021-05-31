import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { Q2AppComponent } from './q2-app/q2-app.component';
import { PakExtractorComponent } from './q2-app/pak-extractor/pak-extractor.component';
import {TableModule} from 'primeng/table';

@NgModule({
  declarations: [
    AppComponent,
    SplashScreenComponent,
    Q2AppComponent,
    PakExtractorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    TableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
