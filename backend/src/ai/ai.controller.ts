import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { GenerateAiDto } from './dto/generate-ai.dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('generate-code')
    async generateCode(@Body() dto: GenerateAiDto) {
        const language = dto.language || 'javascript';
        return { code: await this.aiService.generateCode(dto.prompt || '', language) };
    }

    @Post('generate-tests')
    async generateTests(@Body() dto: GenerateAiDto) {
        const language = dto.language || 'javascript';
        return { code: await this.aiService.generateTests(dto.contextCode || '', language) };
    }

    // Restored this endpoint for the Frontend "Pipeline" tab
    @Post('generate-jenkinsfile')
    async generateJenkinsfile(@Body() dto: GenerateAiDto) {
        const language = dto.language || 'javascript';
        return {
            code: await this.aiService.generateJenkinsfile(
                dto.contextCode || '',
                dto.customRequirements || '',
                language
            )
        };
    }
}