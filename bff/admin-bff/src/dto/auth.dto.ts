export class LoginDto {
  identifier = '';
  password = '';
  captchaToken = '';
  captchaPosition = 0;
}

export class CaptchaChallengeDto {
  token = '';
  targetRatio = 0;
}

export class AuthResultDto {
  userId = '';
  status = 'authenticated';
}
