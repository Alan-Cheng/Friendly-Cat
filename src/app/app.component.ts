import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'friendly-time';

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {
    this.dialog.open(MessageDialogComponent, {
      width: '420px',
      data: {
        title: '通知',
        message:
          '由於 711 資源變更，目前僅能查詢到全家的商品，造成不便敬請見諒QQ',
        imgPath: 'assets/S__222224406.jpg',
      },
    });
  }
}
