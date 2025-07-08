import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { BadRequestException } from '@nestjs/common';

const mockInvoiceService = {
  uploadInvoice: jest.fn(),
  getInvoiceDetails: jest.fn(),
  processOrderShippedEvent: jest.fn(),
};

describe('InvoiceController', () => {
  let controller: InvoiceController;
  let service: typeof mockInvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        { provide: InvoiceService, useValue: mockInvoiceService },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    service = module.get(InvoiceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadInvoice', () => {
    it('should upload an invoice and return the result', async () => {
      const mockFile = { filename: 'file-12345.pdf' } as Express.Multer.File;
      const mockOrderId = '12345';
      const mockResponse = { orderId: mockOrderId, pdfUrl: '/uploads/file-12345.pdf' };

      service.uploadInvoice.mockResolvedValue(mockResponse);

      const result = await controller.uploadInvoice(mockOrderId, mockFile);

      expect(service.uploadInvoice).toHaveBeenCalledWith({
        orderId: mockOrderId,
        pdfUrl: '/uploads/file-12345.pdf',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw BadRequestException if the file is not a PDF', async () => {
      const mockFile = { originalname: 'file.txt' } as Express.Multer.File;
      const mockOrderId = '12345';

      const fileFilter = (req, file, callback) => {
        if (!file.originalname.match(/\.(pdf)$/)) {
          return callback(new BadRequestException('Only PDF files are allowed!'), false);
        }
        callback(null, true);
      };

      const callback = jest.fn();
      fileFilter(null, mockFile, callback);

      expect(callback).toHaveBeenCalledWith(
        new BadRequestException('Only PDF files are allowed!'),
        false,
      );
    });
  });

  describe('getOrderDetails', () => {
    it('should return invoice details if the invoice exists', async () => {
      const mockInvoiceId = 'invoice-12345';
      const mockInvoice = { invoiceId: mockInvoiceId, orderId: 'order-12345' };

      service.getInvoiceDetails.mockResolvedValue(mockInvoice);

      const result = await controller.getOrderDetails(mockInvoiceId);

      expect(service.getInvoiceDetails).toHaveBeenCalledWith(mockInvoiceId);
      expect(result).toEqual(mockInvoice);
    });

    it('should return null if the invoice does not exist', async () => {
      const mockInvoiceId = 'invoice-12345';

      service.getInvoiceDetails.mockResolvedValue(null);

      const result = await controller.getOrderDetails(mockInvoiceId);

      expect(service.getInvoiceDetails).toHaveBeenCalledWith(mockInvoiceId);
      expect(result).toBeNull();
    });
  });

  describe('handleOrderShippedEvent', () => {
    it('should process the ORDER_SHIPPED event', async () => {
      const mockPayload = { orderId: 'order-12345' };

      service.processOrderShippedEvent.mockResolvedValue(undefined);

      await controller.handleOrderShippedEvent(mockPayload);

      expect(service.processOrderShippedEvent).toHaveBeenCalledWith(mockPayload.orderId);
    });

    it('should throw an error if processOrderShippedEvent fails', async () => {
      const mockPayload = { orderId: 'order-12345' };

      service.processOrderShippedEvent.mockRejectedValue(
        new Error('Failed to process order shipped event'),
      );

      await expect(controller.handleOrderShippedEvent(mockPayload)).rejects.toThrow(
        'Failed to process order shipped event',
      );
    });
  });
});
