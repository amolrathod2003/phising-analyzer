import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  counter = 0;

  handleAdd() {
    this.counter += 1;
  }

  handleSubtract() {
    if (this.counter > 0) {
      this.counter -= 1;
    }
  }

  handleReset() {
    this.counter = 0;
  }
}
