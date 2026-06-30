import { Service } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Service()
export class Color {
  private backgroundColor = new BehaviorSubject<string>('#3498db'); // اللون الافتراضي
  color$ = this.backgroundColor.asObservable();

  setColor(color: string): void {
    this.backgroundColor.next(color);
  }
}
