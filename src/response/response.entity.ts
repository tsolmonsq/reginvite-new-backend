import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Guest } from 'src/guest/guest.entity';
import { FormField } from 'src/form-field/form-field.entity';

@Entity()
export class Response {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({ type: 'timestamp' })
  filled_date: Date;

  @ManyToOne(() => Guest, (guest) => guest.responses, { onDelete: 'CASCADE' })
  guest: Guest;

  @ManyToOne(() => FormField, (formField) => formField.responses, { onDelete: 'CASCADE' })
  formField: FormField;
}
