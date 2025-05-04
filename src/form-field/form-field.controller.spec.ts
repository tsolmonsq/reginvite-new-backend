import { Test, TestingModule } from '@nestjs/testing';
import { FormFieldController } from './form-field.controller';

describe('FormFieldController', () => {
  let controller: FormFieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormFieldController],
    }).compile();

    controller = module.get<FormFieldController>(FormFieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
