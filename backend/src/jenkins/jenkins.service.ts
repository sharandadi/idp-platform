import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TriggerBuildDto } from './dto/trigger-build.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class JenkinsService {
    private readonly logger = new Logger(JenkinsService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly aiService: AiService,
    ) { }

    async fetchJobs(url: string, user: string, token: string) {
        if (!url || !user || !token) throw new HttpException('Missing Credentials', HttpStatus.BAD_REQUEST);
        const cleanUrl = url.replace(/\/$/, '');
        const authHeader = 'Basic ' + Buffer.from(`${user}:${token}`).toString('base64');
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${cleanUrl}/api/json?tree=jobs[name]`, { headers: { Authorization: authHeader } }),
            );
            return data.jobs.map((j: any) => j.name);
        } catch (error) {
            this.logger.error(`Failed to fetch jobs: ${error.message}`);
            throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
        }
    }

    // NOTE: Local generateJobXml helper removed as AiService now provides the full XML

    async triggerBuild(data: TriggerBuildDto) {
        const { jenkinsUrl, jenkinsUser, jenkinsToken, sourceCode, testCode, customRequirements } = data;
        const defaultJobName = this.configService.get<string>('JENKINS_JOB_NAME') || 'default-pipeline';
        const jobName = data.jobName || defaultJobName;

        if (!jenkinsUrl || !jenkinsToken || !jobName) {
            throw new HttpException('Missing Jenkins Configuration', HttpStatus.BAD_REQUEST);
        }

        const cleanUrl = jenkinsUrl.replace(/\/$/, '');
        const authHeader = 'Basic ' + Buffer.from(`${jenkinsUser}:${jenkinsToken}`).toString('base64');
        const buildUrl = `${cleanUrl}/job/${jobName}/buildWithParameters`;

        const params = new URLSearchParams();
        params.append('SOURCE_CODE', sourceCode);
        params.append('TEST_CODE', testCode);

        try {
            this.logger.log(`Attempting build for: ${jobName}`);
            const response = await firstValueFrom(
                this.httpService.post(buildUrl, params, {
                    headers: { Authorization: authHeader, 'Content-Type': 'application/x-www-form-urlencoded' },
                }),
            );
            return { success: true, message: `Build triggered for ${jobName}`, queueLocation: response.headers['location'] };

        } catch (error) {
            // 404: Job Not Found -> AI Creates the FULL XML
            if (error.response?.status === 404) {
                this.logger.log(`Job '${jobName}' not found. Generating Full Config with AI...`);

                try {
                    // 1. AI Generates the entire config.xml
                    // This replaces the old call to generateJenkinsfile
                    const fullJobXml = await this.aiService.generateJobXml(
                        sourceCode,
                        customRequirements || "Standard CI pipeline."
                    );

                    this.logger.debug(`AI Generated XML Preview: ${fullJobXml.substring(0, 200)}...`);

                    // 2. Create Job in Jenkins using the AI's XML
                    await firstValueFrom(
                        this.httpService.post(`${cleanUrl}/createItem?name=${jobName}`, fullJobXml, {
                            headers: {
                                Authorization: authHeader,
                                'Content-Type': 'application/xml'
                            },
                        }),
                    );

                    this.logger.log(`Job '${jobName}' created successfully. Retrying build...`);

                    // 3. Retry Build
                    return this.triggerBuild(data);

                } catch (createError) {
                    this.logger.error(`Failed to auto-provision job: ${createError.message}`);
                    throw new HttpException(`Failed to create pipeline for '${jobName}'. The AI XML was likely invalid.`, HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }

            this.logger.error(`Jenkins Error: ${error.message}`);
            throw new HttpException(error.response?.statusText || 'Connection Failed', HttpStatus.BAD_GATEWAY);
        }
    }
}