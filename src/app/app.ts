import { isPlatformBrowser } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('SurveyBasketClient');
  private readonly translate = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);


  ngOnInit() {
    const savedLang = isPlatformBrowser(this.platformId)
      ? (localStorage.getItem('lang') ?? 'en')
      : 'en';
    this.translate.use(savedLang);
  }
}