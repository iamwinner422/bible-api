import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! We\'re live... Check docs (/docs)';
  }
}
