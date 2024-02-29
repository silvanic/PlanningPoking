import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() value: string = '';
  @Output() voted = new EventEmitter<string>();

  vote(){
    this.voted.emit(this.value);
  }

}
