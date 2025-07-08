import { IsInt, IsString, IsEnum, IsPositive } from 'class-validator';

export class OrderDto {
  @IsInt()
  @IsPositive()
  price: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsString()
  productId: string;

  @IsString()
  customerId: string;

  @IsString()
  sellerId: string;

  @IsEnum(['CREATED', 'ACCEPTED', 'SHIPPING_IN_PROGRESS', 'REJECTED', 'SHIPPED'])
  status: string;
}
