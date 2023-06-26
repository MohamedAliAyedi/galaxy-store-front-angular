import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup | any;
  backEndValidation: string | any;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', {validators:[Validators.required,Validators.email]}),
      password: new FormControl('', [Validators.required])
    });

  }

  submitLogin() {
    //if (!this.form.invalid) {
      this.isLoading = true;
      
      const email = this.form.value.email;
      const password = this.form.value.password;
      this.authService.login(email, password)
        .subscribe( (result:boolean) => {    
              if (result) this.router.navigate(['/chat/message']);
        }, (error) => {
          this.isLoading = false;
          this.backEndValidation = error.error.data[0].msg;
        });
    //}


  }
}
