import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Event } from 'src/event/event.entity';
import { Response } from 'src/response/response.entity';

@Entity()
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column()
  phone_number: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  qr_token: string;

  @Column()
  is_attended: boolean;

  @ManyToOne(() => Event, (event) => event.guests)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @OneToMany(() => Response, (response) => response.guest)
  responses: Response[];
}
