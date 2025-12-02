import { IsString, IsOptional } from 'class-validator';

export class GenerateAiDto {
    @IsString()
    @IsOptional()
    prompt?: string;

    @IsString()
    @IsOptional()
    contextCode?: string;

    @IsString()
    @IsOptional()
    language?: string;

    @IsString()
    @IsOptional()
    customRequirements?: string; // New field for DevOps prompts
}