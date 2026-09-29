import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Client } from 'pg';

@Controller()
export class AppController {
  private simulateFailure = false;

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
    if (this.simulateFailure) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'down' });
    }
    return res.status(HttpStatus.OK).json({ status: 'up' });
  }

  @Get('saude/down')
  down(@Res() res: Response) {
    this.simulateFailure = true;
    return res.status(HttpStatus.OK).json({ 
        message: 'Healthcheck configurado para falhar. O próximo /health/up retornará 500.' 
    });
  }
  
  @Get('health/recover')
  recover(@Res() res: Response) {
    this.simulateFailure = false;
    return res.status(HttpStatus.OK).json({ 
        message: 'Healthcheck recuperado. O próximo /health/up retornará 200.' 
    });
  }
}

