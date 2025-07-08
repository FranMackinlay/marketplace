import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './orders.service';
import { getModelToken } from '@nestjs/mongoose';
import { Order, OrderStatus } from './schemas/order.schema';

describe('OrderService', () => {
  let service: OrderService;
  let orderModel: any;
  let clientProxy: any;

  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const mockOrderModelConstructor = jest.fn().mockImplementation((orderData) => ({
      ...orderData,
      save: jest.fn().mockResolvedValue({
        ...orderData,
      }),
    })) as any;

    mockOrderModelConstructor.find = jest.fn();
    mockOrderModelConstructor.findOne = jest.fn();
    mockOrderModelConstructor.findOneAndUpdate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getModelToken(Order.name), useValue: mockOrderModelConstructor },
        { provide: 'ORDER_SERVICE', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderModel = module.get(getModelToken(Order.name));
    clientProxy = module.get('ORDER_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create and save an order', async () => {
      const mockOrderData = { productId: 'prod-001', quantity: 2, price: 100 };
      const mockSavedOrder = { ...mockOrderData, status: OrderStatus.CREATED };

      const result = await service.createOrder(mockOrderData);

      expect(orderModel).toHaveBeenCalledWith({
        ...mockOrderData,
        status: OrderStatus.CREATED,
      });
      expect(result).toEqual(mockSavedOrder);
    });
  });

  describe('listOrders', () => {
    it('should return a list of orders', async () => {
      const mockOrders = [
        { orderId: 'order-12345', productId: 'prod-001', quantity: 2, price: 100 },
        { orderId: 'order-67890', productId: 'prod-002', quantity: 1, price: 50 },
      ];

      orderModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });

      const result = await service.listOrders();

      expect(orderModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('getOrderDetails', () => {
    it('should return order details if the order exists', async () => {
      const mockOrderId = 'order-12345';
      const mockOrder = { orderId: mockOrderId, productId: 'prod-001', quantity: 2, price: 100 };

      orderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.getOrderDetails(mockOrderId);

      expect(orderModel.findOne).toHaveBeenCalledWith({ orderId: mockOrderId });
      expect(result).toEqual(mockOrder);
    });

    it('should return null if the order does not exist', async () => {
      const mockOrderId = 'order-12345';

      orderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getOrderDetails(mockOrderId);

      expect(orderModel.findOne).toHaveBeenCalledWith({ orderId: mockOrderId });
      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update the order status and return the updated order', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.SHIPPED;
      const mockUpdatedOrder = { orderId: mockOrderId, status: mockStatus };

      orderModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedOrder),
      });

      const result = await service.updateOrderStatus(mockOrderId, mockStatus);

      expect(orderModel.findOneAndUpdate).toHaveBeenCalledWith(
        { orderId: mockOrderId },
        { status: mockStatus },
        { new: true },
      );
      expect(result).toEqual(mockUpdatedOrder);
    });

    it('should emit ORDER_SHIPPED event if the status is SHIPPED', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.SHIPPED;
      const mockUpdatedOrder = { orderId: mockOrderId, status: mockStatus };

      orderModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedOrder),
      });

      await service.updateOrderStatus(mockOrderId, mockStatus);

      expect(clientProxy.emit).toHaveBeenCalledWith('ORDER_SHIPPED', { orderId: mockOrderId });
    });

    it('should not emit ORDER_SHIPPED event if the status is not SHIPPED', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.CREATED;
      const mockUpdatedOrder = { orderId: mockOrderId, status: mockStatus };

      orderModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedOrder),
      });

      await service.updateOrderStatus(mockOrderId, mockStatus);

      expect(clientProxy.emit).not.toHaveBeenCalled();
    });

    it('should return null if the order does not exist', async () => {
      const mockOrderId = 'order-12345';
      const mockStatus = OrderStatus.SHIPPED;

      orderModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateOrderStatus(mockOrderId, mockStatus);

      expect(orderModel.findOneAndUpdate).toHaveBeenCalledWith(
        { orderId: mockOrderId },
        { status: mockStatus },
        { new: true },
      );
      expect(result).toBeNull();
    });
  });
});
