import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { Q2AppComponent } from './q2-app/q2-app.component';

const routes: Routes = [
  { path: 'splash', component: SplashScreenComponent },
  { path: 'app', component: Q2AppComponent },
  { path: '**', component: SplashScreenComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
