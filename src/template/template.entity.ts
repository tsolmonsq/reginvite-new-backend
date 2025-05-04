import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Invitation } from 'src/invitation/invitation.entity';

@Entity()
export class Template {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  html: string;

  @OneToMany(() => Invitation, (invitation) => invitation.template)
  invitations: Invitation[];
}
