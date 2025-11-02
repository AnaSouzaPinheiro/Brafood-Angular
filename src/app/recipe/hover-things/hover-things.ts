import { Component, input } from '@angular/core';

@Component({
  selector: 'bra-hover-things',
  imports: [],
  templateUrl: './hover-things.html',
  styleUrl: './hover-things.scss',
})
export class HoverThings {
  hoverText = input('');
}
