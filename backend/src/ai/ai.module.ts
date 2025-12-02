import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
    imports: [ConfigModule],
    controllers: [AiController],
    providers: [AiService],
    exports: [AiService], // <--- CRITICAL FIX: Make AiService public
})
export class AiModule { }