import { Controller, Get } from '@nestjs/common';

@Controller('api/subscription')
export class SubscriptionRouter {
  @Get('overview')
  getOverview() {
    return {
      activePlans: 14,
      renewalsIn30Days: 3,
      overages: 2,
    };
  }
}
