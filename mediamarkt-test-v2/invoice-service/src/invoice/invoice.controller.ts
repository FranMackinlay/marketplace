import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoiceService } from './invoice.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { UserRoles } from 'src/common/roles.enum';

interface RabbitPayload {
  orderId: string
}

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.SELLER)
  @Post(':orderId/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(new BadRequestException('Only PDF files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadInvoice(
    @Param('orderId') orderId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const pdfUrl = `/uploads/${file.filename}`;
    return this.invoiceService.uploadInvoice({ orderId, pdfUrl });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.SELLER)
  @Get(':invoiceId')
  async getOrderDetails(@Param('invoiceId') invoiceId: string) {
    return this.invoiceService.getInvoiceDetails(invoiceId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRoles.SELLER)
  @Get('')
  async getInvoices() {
    return this.invoiceService.listInvoices();
  }

  @EventPattern('ORDER_SHIPPED')
  async handleOrderShippedEvent(@Payload() rabbitPayload: RabbitPayload ) {
    console.log('rabbitPayload', rabbitPayload)
    await this.invoiceService.processOrderShippedEvent(rabbitPayload.orderId);
  }
}
