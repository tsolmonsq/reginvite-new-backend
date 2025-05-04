import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from './response.entity';
import { Guest } from 'src/guest/guest.entity';
import { FormField } from 'src/form-field/form-field.entity';

@Injectable()
export class ResponseService {
  constructor(
    @InjectRepository(Response)
    private readonly responseRepository: Repository<Response>,
  ) {}

  findAll(): Promise<Response[]> {
    return this.responseRepository.find();
  }

  create(response: Response): Promise<Response> {
    return this.responseRepository.save(response);
  }

  async createMany(responsesData: {
    guest: Guest;
    formField: FormField;
    value: string;
  }[]): Promise<Response[]> {
    const responses = responsesData.map((data) =>
      this.responseRepository.create({
        value: data.value,
        filled_date: new Date(),
        guest: data.guest,
        formField: data.formField,
      }),
    );
    return this.responseRepository.save(responses);
  }
}
