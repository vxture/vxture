import { Module } from "@nestjs/common";
import { VxConfigModule, VxConfigService } from "@vxture/core-config";
import { Pool } from "pg";
import { MockAccountRepository, PgAccountRepository } from "../repository";
import { AccountAuthService } from "../service/account-auth.service";
import { ACCOUNT_REPOSITORY, IAM_PG_POOL } from "../tokens";

@Module({
  imports: [
    VxConfigModule.register({
      domains: ["database"],
    }),
  ],
  providers: [
    {
      provide: IAM_PG_POOL,
      inject: [VxConfigService],
      useFactory: (config: VxConfigService) => {
        const database = config.database;
        return new Pool(
          database.DATABASE_URL
            ? {
                connectionString: database.DATABASE_URL,
              }
            : {
                host: database.DB_HOST,
                port: database.DB_PORT,
                database: database.DB_NAME,
                user: database.DB_USER,
                password: database.DB_PASSWORD,
                max: database.DB_POOL_MAX,
                ssl:
                  database.DB_SSL === "require"
                    ? { rejectUnauthorized: false }
                    : undefined,
              },
        );
      },
    },
    PgAccountRepository,
    MockAccountRepository,
    {
      provide: ACCOUNT_REPOSITORY,
      inject: [VxConfigService, PgAccountRepository, MockAccountRepository],
      useFactory: (
        config: VxConfigService,
        pgRepository: PgAccountRepository,
        mockRepository: MockAccountRepository,
      ) => {
        const database = config.database;
        const hasDatabaseConfig = Boolean(
          database.DATABASE_URL || database.DB_PASSWORD,
        );
        return hasDatabaseConfig ? pgRepository : mockRepository;
      },
    },
    AccountAuthService,
  ],
  exports: [AccountAuthService],
})
export class IamModule {}
