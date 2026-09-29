import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Client } from 'pg';

@Controller()
export class AppController {
  @Get('api/status')
  async status(@Res() res: Response) {
    let dbStatus = 'disconnected';
    let details: string | null = null;
    
    if (process.env.DATABASE_URL) {
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      try {
        await client.connect();
        await client.query('SELECT 1');
        dbStatus = 'connected';
      } catch (error) {
        details = error.message;
      } finally {
        await client.end().catch(() => {});
      }
    } else {
      details = "DATABASE_URL not set";
    }

    return res.status(HttpStatus.OK).json({ status: 'ok', db: dbStatus, details });
  }

  @Get('saude/up')
  up(@Res() res: Response) {
    return res.status(HttpStatus.OK).json({ status: 'up' });
  }

  @Get('saude/down')
  down(@Res() res: Response) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Falha intencional no healthcheck.' 
    });
  }
}

