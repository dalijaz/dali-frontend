import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { CertificateComponent } from './certificate/certificate.component';
import { VerifyAccountComponent } from './verify-account/verify-account.component';
import { QuizComponent } from './quiz/quiz.component';

import { AppRoutingModule } from './app-routing.module';

// ✅ admin components
import { AdminCertificatesComponent } from './admin/admin-certificates.component';
import { AdminQuestionsComponent } from './admin/admin-questions.component';

import { JwtInterceptor } from './jwt-interceptor';

// NEW: user history/detail components
import { MySubmissionsComponent } from './my-submissions/my-submissions.component';
import { SubmissionDetailComponent } from './submission-detail/submission-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CertificateComponent,
    VerifyAccountComponent,
    QuizComponent,
    AdminCertificatesComponent,
    AdminQuestionsComponent,
    // NEW
    MySubmissionsComponent,
    SubmissionDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
