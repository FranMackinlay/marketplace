import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../orders/orders.service';
import { Invoice } from './schemas/invoice.schema';
import { InvoiceService } from './invoice.service';
import { Order, OrderStatus } from '../orders/schemas/order.schema';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceModel: any;
  let orderService: jest.Mocked<OrderService>;

  const mockOrderService = {
    getOrderDetails: jest.fn(),
  } as unknown as jest.Mocked<OrderService>;

  const createMockInvoiceInstance = (data: any) => {
    const instance = {
      ...data,
      sentAt: null,
      save: jest.fn().mockImplementation(function () {
        return Promise.resolve(this);
      }),
    };
    return instance;
  };

  let mockInvoiceModel: any;

  beforeEach(async () => {
    mockInvoiceModel = jest.fn((data) => createMockInvoiceInstance(data));

    mockInvoiceModel.findOne = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getModelToken(Invoice.name), useValue: mockInvoiceModel },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    invoiceModel = module.get(getModelToken(Invoice.name));
    orderService = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadInvoice', () => {
    it('should throw NotFoundException if orderId is missing', async () => {
      await expect(service.uploadInvoice({})).rejects.toThrow(
        new NotFoundException('No orderId found for orderId: undefined'),
      );
    });

    it('should throw BadRequestException if order does not exist', async () => {
      orderService.getOrderDetails.mockResolvedValue(null);

      await expect(
        service.uploadInvoice({ orderId: '12345' }),
      ).rejects.toThrow(new BadRequestException('Order with ID 12345 does not exist'));
    });

    it('should save and return the invoice if order exists', async () => {
      const mockOrder = {
        orderId: '12345',
        status: OrderStatus.CREATED,
      } as Order;

      orderService.getOrderDetails.mockResolvedValue(mockOrder);

      const result = await service.uploadInvoice({ orderId: '12345' });

      expect(orderService.getOrderDetails).toHaveBeenCalledWith('12345');
      expect(invoiceModel).toHaveBeenCalledWith({ orderId: '12345' });
      expect(result.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ orderId: '12345', sentAt: null }));
    });

    it('should set sentAt if order status is SHIPPED', async () => {
      const mockOrder = {
        orderId: '12345',
        status: OrderStatus.SHIPPED,
      } as Order;

      orderService.getOrderDetails.mockResolvedValue(mockOrder);

      const result = await service.uploadInvoice({ orderId: '12345' });

      expect(orderService.getOrderDetails).toHaveBeenCalledWith('12345');
      expect(result.sentAt).toBeInstanceOf(Date);
      expect(result.save).toHaveBeenCalledTimes(2);
    });
  });

  describe('getInvoiceDetails', () => {
    it('should return the invoice if it exists', async () => {
      const mockInvoice = {
        invoiceId: '12345',
        orderId: '7635b181',
        sentAt: '2025-07-07T16:43:44.427Z',
      };

      invoiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvoice),
      });

      const result = await service.getInvoiceDetails('12345');

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ invoiceId: '12345' });
      expect(result).toEqual(mockInvoice);
    });

    it('should return null if the invoice does not exist', async () => {
      invoiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getInvoiceDetails('12345');

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ invoiceId: '12345' });
      expect(result).toBeNull();
    });
  });

  describe('processOrderShippedEvent', () => {
    it('should throw NotFoundException if invoice does not exist', async () => {
      invoiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.processOrderShippedEvent('12345'),
      ).rejects.toThrow(new NotFoundException('No invoice found for order ID 12345.'));
    });

    it('should set sentAt and save the invoice if it exists', async () => {
      const mockInvoiceInstance = createMockInvoiceInstance({
        orderId: '12345',
      });

      invoiceModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockInvoiceInstance),
      });

      await service.processOrderShippedEvent('12345');

      expect(invoiceModel.findOne).toHaveBeenCalledWith({ orderId: '12345' });
      expect(mockInvoiceInstance.sentAt).toBeInstanceOf(Date);
      expect(mockInvoiceInstance.save).toHaveBeenCalled();
    });
  });
});
