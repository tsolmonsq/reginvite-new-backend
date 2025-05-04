import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Event } from 'src/event/event.entity';
import { Template } from 'src/template/template.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  color: string;

  @Column()
  text_font: string;

  @Column()
  has_qr: boolean;

  @Column()
  has_rsvp: boolean;

  @OneToOne(() => Event, (event) => event.invitation)
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => Template, (template) => template.invitations)
  @JoinColumn({ name: 'template_id' })
  template: Template;
}

