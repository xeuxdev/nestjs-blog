import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Request } from 'express';

const allowedOrigins = [process.env.FRONTEND_URL];

const corsOptions = (req: Request, callback: Function) => {
  let corsOptions: { origin: boolean };
  if (allowedOrigins.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api/v1');
  app.enableCors(corsOptions);
  await app.listen(3000);
}
bootstrap();
