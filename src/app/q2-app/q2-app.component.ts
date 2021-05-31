import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-q2-app',
  templateUrl: './q2-app.component.html',
  styleUrls: ['./q2-app.component.scss']
})
export class Q2AppComponent implements OnInit {
  ToolType = Quake2Tools;
  showPakExtractor: boolean;

  constructor() { 
    this.showPakExtractor = false;
  }

  ngOnInit(): void {
  }

  showTool(tool:Quake2Tools): void {
    this.hideAllTools();
    switch (tool) {
      case this.ToolType.PakExtractor:
        this.showPakExtractor = true;
        break;
    }
  }

  private hideAllTools() : void {
    this.showPakExtractor = false;
  }
}

enum Quake2Tools {
  PakExtractor = 0
}