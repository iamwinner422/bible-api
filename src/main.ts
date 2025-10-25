import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const config = new DocumentBuilder()
		.setTitle('Bible Verses API')
		.setDescription('This API returns Bible verses')
		.setVersion('1.0')
		.addTag('bible-api')
		.build();

	const documentFactory = () => SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('/', app, documentFactory);

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	app.enableCors();
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
