import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Form } from 'src/form/form.entity';
import { Response } from 'src/response/response.entity';

@Entity()
export class FormField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  type: string;

  @Column()
  is_required: boolean;

  @Column({ nullable: true })
  options: string;

  @ManyToOne(() => Form, (form) => form.formFields)
  form: Form;

  @OneToMany(() => Response, (response) => response.formField)
  responses: Response[];
}
