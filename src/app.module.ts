import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VerseModule } from './verse/verse.module';

@Module({
	imports: [VerseModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
