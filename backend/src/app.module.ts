import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { OrdersModule } from './modules/orders/orders.module';
import { MealsModule } from './modules/meals/meals.module';
import { DietaryModule } from './modules/dietary/dietary.module';
import { CreditsModule } from './modules/credits/credits.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { CustomerModule } from './modules/customer/customer.module';
import { BillingModule } from './modules/billing/billing.module';
import { ReferralModule } from './modules/referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    SubscriptionModule,
    OrdersModule,
    MealsModule,
    DietaryModule,
    CreditsModule,
    GamificationModule,
    FeedbackModule,
    CustomerModule,
    BillingModule,
    ReferralModule,
  ],
})
export class AppModule {}
