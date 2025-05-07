import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Form } from 'src/form/form.entity';
import { Invitation } from 'src/invitation/invitation.entity';
import { Guest } from 'src/guest/guest.entity';
import { EventCategory } from './event-category.enum';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  end_date: Date;

  @Column()
  is_public: boolean;

  @Column({
    type: 'enum',
    enum: EventCategory,
  })
  category: EventCategory;

  @Column({ nullable: true })
  image_path: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.events)
  @JoinColumn({ name: 'user_id' })  
  user: User;

  @OneToOne(() => Invitation, (invitation) => invitation.event)
  invitation: Invitation;

  @OneToMany(() => Guest, (guest) => guest.event)
  guests: Guest[];

  @OneToMany(() => Form, (form) => form.event)
  forms: Form[];
}

