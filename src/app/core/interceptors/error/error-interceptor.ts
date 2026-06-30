import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastrService = inject(ToastrService);

  return next(req).pipe(
    catchError((err) => {
      console.log("inter", err);

      const message =
        err.error?.messages?.[0]?.text ??
        err.error?.title ??
        'حدث خطأ غير متوقع';

      toastrService.error(message, 'خطأ');

      return throwError(() => err);
    })
  );
};
