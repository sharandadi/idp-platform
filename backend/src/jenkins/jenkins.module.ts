import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JenkinsService } from './jenkins.service';
import { JenkinsController } from './jenkins.controller';
import { AiModule } from '../ai/ai.module'; // Import AI Module

@Module({
    imports: [HttpModule, ConfigModule, AiModule], // Add to imports
    controllers: [JenkinsController],
    providers: [JenkinsService],
})
export class JenkinsModule { }