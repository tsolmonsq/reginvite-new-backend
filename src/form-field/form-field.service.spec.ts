import { Test, TestingModule } from '@nestjs/testing';
import { FormFieldService } from './form-field.service';

describe('FormFieldService', () => {
  let service: FormFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormFieldService],
    }).compile();

    service = module.get<FormFieldService>(FormFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
