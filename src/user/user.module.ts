import { Module } from '@nestjs/common';
import { DrizzleModule } from '@app/common/drizzle/drizzle.module';
import { UserService } from './user.service';

@Module({
  imports: [DrizzleModule],
  providers: [UserService],
  controllers: [],
  exports: [UserService],
})
export class UserModule {}
