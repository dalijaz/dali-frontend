import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CertificateComponent } from './certificate/certificate.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';
import { QuizComponent } from './quiz/quiz.component';             // <-- make sure path & export match
import { MySubmissionsComponent } from './my-submissions/my-submissions.component';
import { SubmissionDetailComponent } from './submission-detail/submission-detail.component';

import { AppRoutingModule } from './app-routing.module';
import { JwtInterceptor } from './jwt-interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CertificateComponent,
    VerifyAccountComponent,
    QuizComponent,
    MySubmissionsComponent,
    SubmissionDetailComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,          // <-- date/number pipes + ngClass
    FormsModule,           // <-- ngModel
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule       // <-- exports RouterModule for routerLink
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
