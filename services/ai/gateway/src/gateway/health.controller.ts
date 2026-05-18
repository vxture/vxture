import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("healthz")
  check(): { status: string } {
    return { status: "ok" };
  }
}
