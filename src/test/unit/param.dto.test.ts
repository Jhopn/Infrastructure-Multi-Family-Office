import { uuidParamSchema } from '../../common/dto/param.dto';

describe('uuidParamSchema', () => {
  it('should validate a valid UUID', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    const result = uuidParamSchema.safeParse({ id: validUuid });
    expect(result.success).toBe(true);
    expect(result.data?.id).toBe(validUuid);
  });

  it('should invalidate an invalid UUID', () => {
    const invalidUuid = 'invalid-uuid';
    const result = uuidParamSchema.safeParse({ id: invalidUuid });
    expect(result.success).toBe(false);
  });

  it('should invalidate if id is missing', () => {
    const result = uuidParamSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should invalidate if id is not a string', () => {
    const result = uuidParamSchema.safeParse({ id: 123 });
    expect(result.success).toBe(false);
  });
});

