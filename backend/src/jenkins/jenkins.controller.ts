import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { JenkinsService } from './jenkins.service';
import { TriggerBuildDto } from './dto/trigger-build.dto';

@Controller('jenkins')
export class JenkinsController {
    constructor(private readonly jenkinsService: JenkinsService) { }

    // New Endpoint for fetching jobs
    @Get('jobs')
    async getJobs(
        @Query('url') url: string,
        @Query('user') user: string,
        @Query('token') token: string,
    ) {
        return this.jenkinsService.fetchJobs(url, user, token);
    }

    @Post('build')
    async build(@Body() dto: TriggerBuildDto) {
        return this.jenkinsService.triggerBuild(dto);
    }
}