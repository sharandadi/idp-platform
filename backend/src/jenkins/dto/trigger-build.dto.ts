import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class TriggerBuildDto {
    @IsString()
    @IsNotEmpty()
    jenkinsUrl: string;

    @IsString()
    @IsNotEmpty()
    jenkinsUser: string;

    @IsString()
    @IsNotEmpty()
    jenkinsToken: string;

    @IsString()
    @IsOptional()
    jobName?: string;

    @IsString()
    @IsNotEmpty()
    sourceCode: string;

    @IsString()
    @IsNotEmpty()
    testCode: string;

    @IsString()
    @IsOptional()
    customRequirements?: string; // e.g. "Install AWS CLI"

    @IsBoolean()
    @IsOptional()
    provision?: boolean; // Force re-creation of the job
}