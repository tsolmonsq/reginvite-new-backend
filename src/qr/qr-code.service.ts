import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QRCodeService {
  async generateImageFile(text: string, filename: string): Promise<string> {
    const qrDir = path.join(__dirname, '..', '..', 'uploads', 'qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    const filePath = path.join(qrDir, filename);
    await QRCode.toFile(filePath, text);
    return `/qr/${filename}`;
  }
}
