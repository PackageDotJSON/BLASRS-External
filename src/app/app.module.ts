import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { FooterComponent } from './components/footer/footer.component';
import { BrokersSubmissionsTableComponent } from './components/brokers-submissions-table/brokers-submissions-table.component';
import { UploadSheetModalComponent } from './components/upload-sheet-modal/upload-sheet-modal.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { HeaderComponent } from './components/header/header.component';
import { LoaderComponent } from './components/loader/loader.component';
import { LoginComponent } from './pages/login/login.component';
import { appRoutes } from './routes/routes';
import { LoginCardComponent } from './components/login-card/login-card.component';
import { ToastComponent } from './components/toast/toast.component';
import { HTTP_INTERCEPTOR_SETTINGS, LOCATION_STRATEGY } from './settings/app.settings';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    BrokersSubmissionsTableComponent,
    UploadSheetModalComponent,
    LandingPageComponent,
    HeaderComponent,
    LoaderComponent,
    LoginComponent,
    LoginCardComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    HTTP_INTERCEPTOR_SETTINGS,
    LOCATION_STRATEGY
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
