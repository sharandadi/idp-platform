import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JenkinsModule } from './jenkins/jenkins.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JenkinsModule,
    AiModule, // <--- Added AI Module here
  ],
})
export class AppModule { }