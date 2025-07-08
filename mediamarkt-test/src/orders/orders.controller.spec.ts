import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './orders.service';
import { OrderStatus } from './schemas/order.schema';
import { OrderController } from './orders.controller';
import { OrderDto } from './orders.dto';

const mockOrderService = {
  createOrder: jest.fn(),
  listOrders: jest.fn(),
  getOrderDetails: jest.fn(),
  updateOrderStatus: jest.fn(),
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: typeof mockOrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order and return the result', async () => {
      const mockOrderData = { productId: 'prod-001', quantity: 2, price: 100 } as OrderDto;
      const mockResponse = { ...mockOrderData, orderId: 'order-12345' };

      service.createOrder.mockResolvedValue(mockResponse);

      const result = await controller.createOrder(mockOrderData);

      expect(service.createOrder).toHaveBeenCalledWith(mockOrderData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders', async () => {
      const mockOrders = [
        { orderId: 'order-12345', productId: 'prod-001', quantity: 2, price: 100 },
        { orderId: 'order-67890', productId: 'prod-002', quantity: 1, price: 50 },
      ];

      service.listOrders.mockResolvedValue(mockOrders);

      const result = await controller.listOrders();

      expect(service.listOrders).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details if the order exists', async () => {
      const mockOrderId = 'order-12345';
      const mockOrder = { orderId: mockOrderId, productId: 'prod-001', quantity: 2, price: 100 };

      service.getOrderDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrderDetails(mockOrderId);

      expect(service.getOrderDetails).toHaveBeenCalledWith(mockOrderId);
      expect(result).toEqual(mockOrder);
    });

    it('should return null if the order does not exist', async () => {
      const mockOrderId = 'order-12345';

      service.getOrderDetails.mockResolvedValue(null);

      const result = await controller.getOrderDetails(mockOrderId);

      expect(service.getOrderDetails).toHaveBeenCalledWith(mockOrderId);
      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status and return the updated order', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.SHIPPED;
      const mockUpdatedOrder = { orderId: mockOrderId, status: mockStatus };

      service.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.updateOrderStatus(mockOrderId, mockStatus);

      expect(service.updateOrderStatus).toHaveBeenCalledWith(mockOrderId, mockStatus);
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should throw an error if the update fails', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.SHIPPED;

      service.updateOrderStatus.mockRejectedValue(new Error('Failed to update order status'));

      await expect(controller.updateOrderStatus(mockOrderId, mockStatus)).rejects.toThrow(
        'Failed to update order status',
      );
    });
  });
});
