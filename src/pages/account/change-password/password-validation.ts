import { AbstractControl } from '@angular/forms';
export class PasswordValidation {

    static MatchPassword(abstractControl: AbstractControl) {
        let newPassword = abstractControl.get('new_password').value;
        let confirmPassword = abstractControl.get('confirm_password').value;
        if (newPassword !== confirmPassword) {
            abstractControl.get('confirm_password').setErrors({ MatchPassword: true })
        } else {
            return true;
        }
    }
}