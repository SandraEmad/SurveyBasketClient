import { Component, inject } from '@angular/core';
import { Color } from '../../../core/services/color/color';

@Component({
  selector: 'app-custom',
  imports: [],
  templateUrl: './custom.html',
  styleUrl: './custom.scss',
})
export class Custom {
  private colorService = inject(Color); // استدعاء الخدمة
  isPaletteVisible: boolean = false; // حالة ظهور لوحة الألوان

  togglePalette(): void {
    this.isPaletteVisible = !this.isPaletteVisible;
  }

  changeColor(color: string):  {
    this.colorService.setColor(color); // نبعث اللون للخدمة
    this.isPaletteVisible = false;
  }
}
