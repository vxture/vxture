export class LoginDto {
  identifier = "";
  password = "";
  captchaToken = "";
  captchaPosition = 0;
}

export class SendPhoneCodeDto {
  phone = "";
}

export class PhoneLoginDto {
  phone = "";
  code = "";
}

export class CaptchaChallengeDto {
  token = "";
  targetRatio = 0;
}

export class AuthResultDto {
  userId = "";
  status = "authenticated";
}
