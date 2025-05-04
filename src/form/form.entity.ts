import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Event } from 'src/event/event.entity';
import { FormField } from 'src/form-field/form-field.entity';

@Entity()
export class Form {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  is_open: boolean;

  @Column()
  max_guests: number;

  @Column()
  close_at: Date;

  @Column({ default: 0 })
  total_registrations: number;

  @Column({ default: 0 })
  total_submissions: number;

  @ManyToOne(() => Event, (event) => event.forms)
  event: Event;

  @OneToMany(() => FormField, (formField) => formField.form)
  formFields: FormField[];
}
